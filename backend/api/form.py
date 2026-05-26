"""
Routes formulaire conversationnel builderz.shop.
POST /api/form/submit         — crée le projet, calcule le prix, notifie admin
POST /api/form/calculate-price — calcule le prix sans sauvegarder
"""

import json
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request

from backend.db.database import get_db
from backend.tools.pricing import calculate_price, get_site_type_from_answers
from backend.tools.question_tree import get_goal_choices

router = APIRouter(prefix="/form", tags=["form"])


@router.post("/calculate-price")
async def calc_price(request: Request):
    answers = await request.json()
    site_type = get_site_type_from_answers(answers)
    answers["site_type"] = site_type
    pricing = calculate_price(answers)
    return pricing


@router.post("/submit")
async def submit_form(request: Request):
    answers = await request.json()

    site_type = get_site_type_from_answers(answers)
    answers["site_type"] = site_type
    pricing = calculate_price(answers)

    project_id = str(uuid.uuid4())
    business_name = answers.get("business_name", "Nouveau projet")
    slug = business_name.lower().replace(" ", "-").replace("'", "")[:40]
    now = datetime.now(timezone.utc).isoformat()

    # L'email est dans contact_info (objet imbriqué)
    contact_info = answers.get("contact_info", {}) or {}
    if isinstance(contact_info, str):
        try:
            contact_info = json.loads(contact_info)
        except Exception:
            contact_info = {}
    client_email = contact_info.get("email", "") or answers.get("email", "")
    client_phone = contact_info.get("phone", "") or answers.get("phone", "")

    db = await get_db()
    try:
        # Insert into projects table (status='idle', form_status='pending_validation')
        await db.execute(
            """INSERT INTO projects
               (name, description, status, progress, workspace_path,
                brief, generation_mode, is_client, client_email, client_phone,
                suggested_price, final_price, form_status,
                slug, created_at, updated_at)
               VALUES (?, ?, 'idle', 0, '', ?, 'pending', 1, ?, ?,
                       ?, ?, 'crm_pending', ?, ?, ?)""",
            (
                business_name,
                answers.get("description", ""),
                json.dumps(answers),
                client_email,
                client_phone,
                pricing["suggested"],
                pricing["suggested"],
                slug,
                now,
                now,
            ),
        )
        await db.commit()
        cursor = await db.execute("SELECT last_insert_rowid()")
        row = await cursor.fetchone()
        db_id = row[0]
    finally:
        await db.close()

    # Notifier l'admin
    try:
        from backend.db.database import get_setting
        from backend.site_guardian.notifier import send_email
        admin_email = await get_setting("ADMIN_EMAIL") or "sloan.dlrz@gmail.com"
        business_name_display = answers.get("business_name", "Nouveau projet")
        sector = answers.get("sector", "—")
        suggested = pricing.get("suggested", 0)
        html = _admin_notification_html(business_name_display, client_email, client_phone, sector, site_type, suggested, db_id)
        await send_email(
            to=admin_email,
            subject=f"[builderz] Nouvelle demande — {business_name_display}",
            body=f"Nouvelle demande de {business_name_display} ({client_email})\nSecteur: {sector} | Prix suggéré: {suggested}€\nVoir le CRM: https://builderz.shop/app/crm",
            html=html,
        )
    except Exception:
        pass

    return {
        "project_id": db_id,
        "slug": slug,
        "pricing": pricing,
        "site_type": site_type,
        "message": "Votre demande a été reçue. Nous vous contacterons sous 24h.",
    }


def _admin_notification_html(business_name: str, client_email: str, client_phone: str,
                              sector: str, site_type: str, suggested: float, project_id: int) -> str:
    def row(label: str, value: str) -> str:
        if not value or value == "—":
            return ""
        return f"""<tr>
          <td style="padding:8px 16px;font-size:12px;color:#94a3b8;width:130px;background:#0d0d18;border-right:1px solid #1e1e2e;border-bottom:1px solid #1e1e2e;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">{label}</td>
          <td style="padding:8px 16px;font-size:13px;color:#e2e8f0;border-bottom:1px solid #1e1e2e;">{value}</td>
        </tr>"""

    crm_url = "https://builderz.shop/app/crm"
    return f"""<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#111118;border:1px solid #1e1e2e;border-radius:16px;overflow:hidden;max-width:520px;width:100%;">

        <tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:24px 32px;">
          <div style="font-size:11px;color:#a5b4fc;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:6px;">Nouvelle demande</div>
          <div style="font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.025em;">{business_name}</div>
        </td></tr>

        <tr><td style="padding:24px 32px;">
          <table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #1e1e2e;border-radius:10px;overflow:hidden;margin-bottom:20px;">
            {row("Email", f'<a href="mailto:{client_email}" style="color:#6366f1;text-decoration:none;">{client_email}</a>' if client_email else "—")}
            {row("Téléphone", client_phone or "—")}
            {row("Secteur", sector)}
            {row("Type de site", site_type)}
            {row("Prix suggéré", f'<strong style="color:#22c55e;">{int(suggested)}€</strong>')}
          </table>

          <div style="text-align:center;">
            <a href="{crm_url}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:13px;font-weight:600;text-decoration:none;padding:11px 28px;border-radius:8px;">
              Voir dans le CRM →
            </a>
          </div>
        </td></tr>

        <tr><td style="border-top:1px solid #1e1e2e;padding:16px 32px;text-align:center;">
          <p style="color:#475569;font-size:11px;margin:0;">builderz.shop · Projet #{project_id}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


@router.get("/goal-choices/{sector}")
async def goal_choices(sector: str):
    return get_goal_choices(sector)
