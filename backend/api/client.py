"""
API Routes — Espace client (accès par email Google).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.db.database import get_db

router = APIRouter(prefix="/client", tags=["client"])


@router.get("/me")
async def get_client_project(email: str):
    """Retourne le(s) projet(s) du client identifié par son email Google."""
    if not email:
        raise HTTPException(400, "Email requis")

    db = await get_db()
    try:
        cursor = await db.execute(
            """SELECT id, name, description, objective, status, progress,
                      deploy_url, slug, client_name, client_email,
                      form_status, suggested_price, final_price, created_at
               FROM projects
               WHERE LOWER(client_email) = LOWER(?)
               ORDER BY created_at DESC""",
            (email,)
        )
        rows = await cursor.fetchall()
    finally:
        await db.close()

    if not rows:
        raise HTTPException(404, "Aucun projet trouvé pour cet email")

    projects = [dict(r) for r in rows]
    # Filtrer les projets pas encore payés (crm_pending = pas visible côté client)
    visible = [p for p in projects if p.get("form_status") != "crm_pending"]
    if not visible:
        raise HTTPException(404, "Aucun projet trouvé pour cet email")

    return {"projects": visible}


class ModificationRequest(BaseModel):
    project_id: int
    client_email: str
    message: str


@router.post("/modification-request")
async def send_modification_request(body: ModificationRequest):
    """Le client soumet une demande de modification."""
    from backend.db.database import get_setting
    from backend.site_guardian.notifier import send_email

    admin_email = await get_setting("ADMIN_EMAIL") or "sloan.dlrz@gmail.com"

    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT name, client_name FROM projects WHERE id = ? AND LOWER(client_email) = LOWER(?)",
            (body.project_id, body.client_email)
        )
        row = await cursor.fetchone()
    finally:
        await db.close()

    if not row:
        raise HTTPException(403, "Accès refusé")

    project = dict(row)
    client_name = project.get("client_name") or body.client_email
    project_name = project.get("name", f"Projet #{body.project_id}")

    html = f"""<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#111118;border:1px solid #1e1e2e;border-radius:16px;overflow:hidden;max-width:520px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:28px 36px;">
          <div style="font-size:18px;font-weight:700;color:#fff;">📨 Nouvelle demande de modification</div>
        </td></tr>
        <tr><td style="padding:28px 36px;">
          <table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #1e1e2e;border-radius:10px;overflow:hidden;margin-bottom:20px;">
            <tr style="background:#0f0f1a;">
              <td style="padding:10px 14px;font-size:12px;color:#94a3b8;width:40%;">Projet</td>
              <td style="padding:10px 14px;font-size:13px;color:#e2e8f0;font-weight:600;">{project_name}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:12px;color:#94a3b8;border-top:1px solid #1e1e2e;">Client</td>
              <td style="padding:10px 14px;font-size:13px;color:#e2e8f0;border-top:1px solid #1e1e2e;">{client_name} &lt;{body.client_email}&gt;</td>
            </tr>
          </table>
          <div style="background:#0f0f1a;border:1px solid #1e1e2e;border-radius:10px;padding:16px 18px;">
            <div style="font-size:11px;color:#6366f1;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Message</div>
            <p style="color:#e2e8f0;font-size:14px;line-height:1.7;margin:0;">{body.message}</p>
          </div>
        </td></tr>
        <tr><td style="border-top:1px solid #1e1e2e;padding:16px 36px;text-align:center;">
          <p style="color:#475569;font-size:11px;margin:0;">builderz.shop · Espace client</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""

    await send_email(
        to=admin_email,
        subject=f"[builderz] Demande de modif — {project_name}",
        body=f"Client : {client_name} <{body.client_email}>\nProjet : {project_name}\n\n{body.message}",
        html=html,
    )

    return {"success": True, "message": "Votre demande a été envoyée."}
