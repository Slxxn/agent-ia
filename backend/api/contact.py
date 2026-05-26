"""
POST /api/contact/send
Endpoint générique pour les formulaires de contact des sites clients.
Reçoit nom/email/tel/message + site_id, envoie un email à l'admin du site.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from backend.db.database import get_setting
from backend.site_guardian.notifier import send_email

router = APIRouter(prefix="/contact", tags=["contact"])


class ContactPayload(BaseModel):
    nom: str
    email: str
    tel: Optional[str] = ""
    message: str
    site_id: str          # ex: "ixshel-co" — pour identifier le site émetteur
    site_name: Optional[str] = ""  # nom lisible ex: "IXSHEL & CO."
    recipient: Optional[str] = ""  # email destinataire optionnel (sinon ADMIN_EMAIL)


@router.post("/send")
async def send_contact(data: ContactPayload):
    admin_email = data.recipient or await get_setting("ADMIN_EMAIL") or "sloan.dlrz@gmail.com"
    site_label = data.site_name or data.site_id

    subject = f"[{site_label}] Nouveau message de {data.nom}"
    body = (
        f"Nouveau message via le formulaire de contact de {site_label}.\n\n"
        f"Nom    : {data.nom}\n"
        f"Email  : {data.email}\n"
        f"Tél    : {data.tel or '—'}\n\n"
        f"Message :\n{data.message}"
    )

    html = f"""<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0d0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f1a;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

      <tr><td align="center" style="background:#13162a;border-radius:16px 16px 0 0;padding:28px 40px 20px;border-bottom:1px solid #2a2d45;">
        <div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">{site_label}</div>
        <div style="margin-top:6px;font-size:11px;font-weight:600;letter-spacing:0.12em;color:#6366f1;text-transform:uppercase;">Nouveau message</div>
      </td></tr>

      <tr><td style="background:#13162a;border-radius:0 0 16px 16px;padding:28px 40px 36px;">
        <div style="background:#1a1d2e;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:7px 0;font-size:13px;color:#6b7280;width:40%;vertical-align:top;">Nom</td>
              <td style="padding:7px 0;font-size:13px;color:#e5e7eb;font-weight:500;">{data.nom}</td>
            </tr>
            <tr>
              <td style="padding:7px 0;font-size:13px;color:#6b7280;vertical-align:top;">Email</td>
              <td style="padding:7px 0;font-size:13px;"><a href="mailto:{data.email}" style="color:#6366f1;text-decoration:none;">{data.email}</a></td>
            </tr>
            <tr>
              <td style="padding:7px 0;font-size:13px;color:#6b7280;vertical-align:top;">Téléphone</td>
              <td style="padding:7px 0;font-size:13px;color:#e5e7eb;">{data.tel or '—'}</td>
            </tr>
          </table>
        </div>

        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Message</p>
        <div style="background:#1a1d2e;border-left:3px solid #6366f1;border-radius:0 8px 8px 0;padding:16px 20px;font-size:14px;color:#e5e7eb;line-height:1.7;">
          {data.message.replace(chr(10), '<br>')}
        </div>

        <table cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
          <tr>
            <td align="center" style="background:#6366f1;border-radius:10px;">
              <a href="mailto:{data.email}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                Répondre à {data.nom} →
              </a>
            </td>
          </tr>
        </table>
      </td></tr>

      <tr><td align="center" style="padding:20px 0 0;">
        <div style="font-size:12px;color:#3d4166;">builderz.shop · formulaire de {site_label}</div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>"""

    sent = await send_email(to=admin_email, subject=subject, body=body, html=html)
    if not sent:
        return {"success": False, "error": "Email non envoyé"}
    return {"success": True}
