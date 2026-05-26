"""
POST /api/payment/confirm
Appelé par la page /success après redirection Stripe.
Met à jour le statut projet et envoie les emails client + admin.
"""

import json
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.db.database import get_db, get_setting, generate_portal_token
from backend.site_guardian.notifier import send_email
from backend.utils.email_templates import client_payment_confirmed_html, admin_payment_confirmed_html

GUARDIAN_PLAN = "standard"

router = APIRouter(prefix="/payment", tags=["payment"])

ADMIN_FALLBACK = "sloan.dlrz@gmail.com"


class ConfirmPayload(BaseModel):
    project_id: int


@router.post("/confirm")
async def confirm_payment(data: ConfirmPayload):
    now = datetime.now(timezone.utc).isoformat()

    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM projects WHERE id = ?", (data.project_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Projet introuvable.")
        project = dict(row)

        already_paid = project.get("form_status") == "paid"

        cursor2 = await db.execute(
            "SELECT token FROM portal_orders WHERE project_id = ? LIMIT 1",
            (data.project_id,),
        )
        token_row = await cursor2.fetchone()

        if token_row:
            portal_token = token_row["token"]
        else:
            # Aucun token portal — en créer un lié à ce projet
            portal_token = uuid.uuid4().hex[:16]
            client_email_tmp = project.get("client_email", "")
            business_name_tmp = project.get("name", "")
            await db.execute(
                """INSERT INTO portal_orders
                   (token, client_email, business_name, status, project_id, created_at, updated_at)
                   VALUES (?, ?, ?, 'pending', ?, ?, ?)""",
                (portal_token, client_email_tmp, business_name_tmp, data.project_id, now, now),
            )

        # Rendre le projet visible dans Web Platform
        await db.execute(
            "UPDATE projects SET form_status = 'paid', updated_at = ? WHERE id = ?",
            (now, data.project_id),
        )

        # Auto-register in Site Guardian if not already there
        cursor3 = await db.execute(
            "SELECT id FROM guardian_sites WHERE project_id = ? LIMIT 1",
            (data.project_id,),
        )
        guardian_exists = await cursor3.fetchone()
        if not guardian_exists:
            guardian_id = uuid.uuid4().hex
            client_name_g = project.get("name", "")
            client_email_g = project.get("client_email", "")
            site_url_g = project.get("deploy_url", "") or ""
            await db.execute(
                """INSERT INTO guardian_sites
                   (id, project_id, client_name, client_email, site_url, plan, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (guardian_id, data.project_id, client_name_g, client_email_g, site_url_g, GUARDIAN_PLAN, now),
            )

        await db.commit()
    finally:
        await db.close()

    if already_paid:
        return {"success": True, "skipped": True, "reason": "already_paid"}

    # ── Données du projet ──────────────────────────────────────────────────
    client_email = project.get("client_email", "")
    deploy_url   = project.get("deploy_url", "") or ""
    final_price  = float(project.get("final_price") or project.get("suggested_price") or 0)

    brief: dict = {}
    if project.get("brief"):
        try:
            brief = json.loads(project["brief"])
        except Exception:
            pass

    business_name = brief.get("businessName") or project.get("name", "")
    sector        = brief.get("sector", "")
    site_type     = brief.get("siteType", "standard")
    pages         = ", ".join(brief.get("pages", [])) or "—"
    features      = ", ".join(brief.get("features", [])) or "—"
    description   = brief.get("description", "")
    target        = brief.get("targetAudience", "")
    style         = brief.get("visualStyle", "")

    portal_link = f"https://builderz.shop/p/{portal_token}" if portal_token else "https://builderz.shop"

    # Générer un token d'accès direct au portail client
    access_token = ""
    if client_email:
        access_token = await generate_portal_token(client_email)
        portal_link = f"https://builderz.shop/mon-espace?token={access_token}"

    # ── Email client HTML ─────────────────────────────────────────────────
    if client_email:
        client_text = (
            f"Bonjour {business_name},\n\n"
            f"Votre paiement de {int(final_price)}€ a bien été reçu. "
            "Notre équipe commence à travailler sur votre site sous 24–48h.\n\n"
            f"Accédez à votre espace client : {portal_link}\n\n"
            "L'équipe builderz"
        )
        sent = await send_email(
            to=client_email,
            subject="Votre commande builderz est confirmée",
            body=client_text,
            html=client_payment_confirmed_html(
                prenom=business_name,
                nom_projet=project.get("name", business_name),
                montant=final_price,
                portal_token=access_token,
            ),
        )
        if not sent:
            print(f"[payment/confirm] Email client non envoyé — {client_email}")

    # ── Email admin HTML ──────────────────────────────────────────────────
    admin = await get_setting("ADMIN_EMAIL") or ADMIN_FALLBACK
    admin_text = (
        f"Nouvelle commande — {business_name}\n"
        f"Email : {client_email}\nMontant : {int(final_price)}€\n"
        f"Portal : {portal_link}"
    )
    await send_email(
        to=admin,
        subject=f"Nouvelle commande — {business_name}",
        body=admin_text,
        html=admin_payment_confirmed_html(
            nom_projet=project.get("name", business_name),
            montant=final_price,
            client_email=client_email,
            secteur=sector,
            type_site=site_type,
            brief_resume=description,
            dashboard_url="https://builderz.shop/app/platform",
        ),
    )

    return {"success": True, "project_id": data.project_id, "client_email": client_email, "portal_token": access_token}
