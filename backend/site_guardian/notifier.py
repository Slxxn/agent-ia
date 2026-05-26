"""Notifications email via Resend API."""
import httpx
from typing import Optional
from backend.db.database import get_setting


async def send_email(to: str, subject: str, body: str, html: Optional[str] = None) -> bool:
    api_key = await get_setting("RESEND_API_KEY")
    if not api_key:
        print(f"[Notifier] RESEND_API_KEY manquante — email non envoyé à {to}")
        return False

    payload: dict = {
        "from": "builderz <noreply@builderz.shop>",
        "to": [to],
        "subject": subject,
        "text": body,
    }
    if html:
        payload["html"] = html

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {api_key}"},
            json=payload,
        )
        if resp.status_code not in (200, 201):
            print(f"[Notifier] Resend error {resp.status_code}: {resp.text}")
            return False
        return True


async def notify_admin_new_request(client_name: str, site_url: str, message: str) -> None:
    admin = await get_setting("ADMIN_EMAIL") or "sloan.dlrz@gmail.com"
    subject = f"Nouvelle demande — {client_name}"
    body = f"""Nouvelle demande de modification reçue.

Client : {client_name}
Site : {site_url}

Demande :
{message}

Connectez-vous sur builderz.shop/app/guardian pour valider ou refuser.
"""
    await send_email(admin, subject, body)


async def notify_client_status(client_email: str, client_name: str, status: str, admin_response: str = "") -> None:
    if status == "approved":
        subject = "Votre modification est en cours"
        body = f"Bonjour {client_name},\n\nVotre demande a été validée et est en cours de traitement.\n\nL'équipe builderz"
    elif status == "done":
        note = f"\nNote : {admin_response}" if admin_response else ""
        subject = "Votre modification a été appliquée ✓"
        body = f"Bonjour {client_name},\n\nLes modifications ont été appliquées sur votre site.{note}\n\nL'équipe builderz"
    elif status == "rejected":
        note = f"\nMessage : {admin_response}" if admin_response else "\nNous vous contacterons prochainement."
        subject = "Concernant votre demande de modification"
        body = f"Bonjour {client_name},\n\nNous avons examiné votre demande.{note}\n\nL'équipe builderz"
    else:
        return
    await send_email(client_email, subject, body)
