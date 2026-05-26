"""Notifications email via Resend API."""
import httpx
from typing import Optional
from backend.db.database import get_setting
from backend.utils.email_templates import guardian_request_html, guardian_status_html


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
    body = f"Nouvelle demande de {client_name}\nSite : {site_url}\n\n{message}"
    html = guardian_request_html(
        client_name=client_name,
        site_url=site_url,
        message=message,
        dashboard_url="https://builderz.shop/app/guardian",
    )
    await send_email(admin, subject, body, html=html)


async def notify_client_status(client_email: str, client_name: str, status: str, admin_response: str = "") -> None:
    SUBJECTS = {
        "approved": "Votre modification est en cours",
        "done":     "Votre modification a été appliquée",
        "rejected": "Concernant votre demande de modification",
    }
    subject = SUBJECTS.get(status)
    if not subject:
        return
    body = f"Bonjour {client_name},\n\n{admin_response or ''}\n\nL'équipe builderz"
    html = guardian_status_html(client_name=client_name, status=status, note=admin_response)
    await send_email(client_email, subject, body, html=html)
