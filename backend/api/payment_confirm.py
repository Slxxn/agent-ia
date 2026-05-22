"""
POST /api/payment/confirm
Appelé par la page /success après redirection Stripe.
Met à jour le statut projet et envoie les emails client + admin.
"""

import json
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.db.database import get_db, get_setting
from backend.site_guardian.notifier import send_email

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

        # Idempotent : ne pas re-envoyer si déjà confirmé
        already_paid = project.get("form_status") == "paid"

        await db.execute(
            "UPDATE projects SET form_status = 'paid', updated_at = ? WHERE id = ?",
            (now, data.project_id),
        )

        # Récupérer le token portal lié au projet
        cursor2 = await db.execute(
            "SELECT token FROM portal_orders WHERE project_id = ? LIMIT 1",
            (data.project_id,),
        )
        token_row = await cursor2.fetchone()
        portal_token = token_row["token"] if token_row else None

        await db.commit()
    finally:
        await db.close()

    if already_paid:
        return {"success": True, "skipped": True, "reason": "already_paid"}

    # ── Données du projet ──────────────────────────────────────────────────
    client_email = project.get("client_email", "")
    deploy_url   = project.get("deploy_url", "")
    final_price  = project.get("final_price") or project.get("suggested_price") or 0

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

    # ── Email client ──────────────────────────────────────────────────────
    if client_email:
        deploy_line = (
            f"\nVous recevrez votre site à cette adresse : {deploy_url}"
            if deploy_url else ""
        )
        client_body = f"""Bonjour {business_name},

Votre paiement a bien été reçu. Notre équipe commence à travailler sur votre site.
{deploy_line}

Suivez l'avancement en temps réel ici :
{portal_link}

À très bientôt,
L'équipe builderz"""

        sent = await send_email(
            to=client_email,
            subject="✓ Votre commande builderz.shop est confirmée",
            body=client_body,
        )
        if not sent:
            print(f"[payment/confirm] Email client non envoyé (RESEND manquant ou erreur) — {client_email}")

    # ── Email admin ───────────────────────────────────────────────────────
    admin = await get_setting("ADMIN_EMAIL") or ADMIN_FALLBACK
    admin_body = f"""Nouvelle commande reçue 🎉

Entreprise : {business_name}
Email client : {client_email or '—'}
Montant : {final_price}€

— Brief —
Secteur : {sector}
Type de site : {site_type}
Description : {description}
Cible : {target}
Style : {style}
Pages : {pages}
Fonctionnalités : {features}

Lien portal : {portal_link}
"""

    await send_email(
        to=admin,
        subject=f"🔔 Nouvelle commande — {business_name}",
        body=admin_body,
    )

    return {"success": True, "project_id": data.project_id, "client_email": client_email}
