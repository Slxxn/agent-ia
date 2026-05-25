"""
API Routes — Espace client (accès par email Google / magic link).
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from backend.db.database import get_db, verify_portal_token

router = APIRouter(prefix="/client", tags=["client"])


@router.get("/auth")
async def verify_client_token(token: str = Query(...)):
    """Vérifie un token de portail et retourne l'email associé."""
    email = await verify_portal_token(token)
    if not email:
        raise HTTPException(401, "Token invalide ou expiré")
    return {"email": email}


@router.get("/me")
async def get_client_project(email: str):
    """Retourne le(s) projet(s) du client identifié par son email."""
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

    html = _modification_request_html(client_name, project_name, body.client_email, body.message)

    await send_email(
        to=admin_email,
        subject=f"[builderz] Demande de modif — {project_name}",
        body=f"Client : {client_name} <{body.client_email}>\nProjet : {project_name}\n\n{body.message}",
        html=html,
    )

    return {"success": True, "message": "Votre demande a été envoyée."}


def _modification_request_html(client_name: str, project_name: str, client_email: str, message: str) -> str:
    pixel_logo = """
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 10px;">
        <tr>
          <td style="padding:2px;"><div style="width:10px;height:10px;border-radius:3px;background:#6366f1;"></div></td>
          <td style="padding:2px;"><div style="width:10px;height:10px;border-radius:3px;background:#818cf8;"></div></td>
          <td style="padding:2px;"><div style="width:10px;height:10px;border-radius:3px;background:#6366f1;"></div></td>
        </tr>
        <tr>
          <td style="padding:2px;"><div style="width:10px;height:10px;border-radius:3px;background:#818cf8;"></div></td>
          <td style="padding:2px;"><div style="width:10px;height:10px;border-radius:3px;background:#6366f1;"></div></td>
          <td style="padding:2px;"><div style="width:10px;height:10px;border-radius:3px;background:#818cf8;"></div></td>
        </tr>
        <tr>
          <td style="padding:2px;"><div style="width:10px;height:10px;border-radius:3px;background:#6366f1;"></div></td>
          <td style="padding:2px;"><div style="width:10px;height:10px;border-radius:3px;background:#818cf8;"></div></td>
          <td style="padding:2px;"><div style="width:10px;height:10px;border-radius:3px;background:#6366f1;"></div></td>
        </tr>
      </table>"""

    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @media (prefers-color-scheme: light) {{
      .email-body   {{ background:#f0f2f5 !important; }}
      .email-card   {{ background:#ffffff !important; border-color:#e2e8f0 !important; }}
      .email-header {{ background:linear-gradient(135deg,#6366f1,#818cf8) !important; }}
      .label-cell   {{ background:#f8fafc !important; color:#64748b !important; border-color:#e2e8f0 !important; }}
      .value-cell   {{ color:#1e293b !important; background:#ffffff !important; }}
      .table-wrap   {{ border-color:#e2e8f0 !important; }}
      .msg-box      {{ background:#f8fafc !important; border-color:#e2e8f0 !important; }}
      .msg-text     {{ color:#1e293b !important; }}
      .footer-text  {{ color:#94a3b8 !important; }}
      .row-border   {{ border-color:#e2e8f0 !important; }}
    }}
  </style>
</head>
<body class="email-body" style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table class="email-card" width="520" cellpadding="0" cellspacing="0" style="background:#111118;border:1px solid #1e1e2e;border-radius:16px;overflow:hidden;max-width:520px;width:100%;">

        <!-- Header -->
        <tr><td class="email-header" style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px 36px;text-align:center;">
          {pixel_logo}
          <div style="font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.025em;">builderz</div>
          <div style="font-size:11px;color:#a5b4fc;margin-top:5px;letter-spacing:0.08em;text-transform:uppercase;">Nouvelle demande de modification</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:28px 32px;">

          <!-- Info table -->
          <table class="table-wrap" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #1e1e2e;border-radius:12px;overflow:hidden;margin-bottom:20px;">
            <tr>
              <td class="label-cell" style="background:#0d0d18;padding:12px 16px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;width:32%;border-right:1px solid #1e1e2e;">Projet</td>
              <td class="value-cell" style="padding:12px 16px;font-size:13px;color:#e2e8f0;font-weight:600;">{project_name}</td>
            </tr>
            <tr class="row-border" style="border-top:1px solid #1e1e2e;">
              <td class="label-cell" style="background:#0d0d18;padding:12px 16px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;border-right:1px solid #1e1e2e;border-top:1px solid #1e1e2e;">Client</td>
              <td class="value-cell" style="padding:12px 16px;font-size:13px;color:#e2e8f0;border-top:1px solid #1e1e2e;">{client_name}</td>
            </tr>
            <tr class="row-border" style="border-top:1px solid #1e1e2e;">
              <td class="label-cell" style="background:#0d0d18;padding:12px 16px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;border-right:1px solid #1e1e2e;border-top:1px solid #1e1e2e;">Email</td>
              <td style="padding:12px 16px;font-size:13px;border-top:1px solid #1e1e2e;">
                <a href="mailto:{client_email}" style="color:#6366f1;text-decoration:none;font-weight:500;">{client_email}</a>
              </td>
            </tr>
          </table>

          <!-- Message -->
          <div class="msg-box" style="background:#0d0d18;border:1px solid #1e1e2e;border-radius:12px;padding:20px 22px;">
            <div style="font-size:10px;color:#6366f1;text-transform:uppercase;letter-spacing:0.09em;font-weight:700;margin-bottom:12px;">💬 Message</div>
            <p class="msg-text" style="color:#e2e8f0;font-size:14px;line-height:1.75;margin:0;white-space:pre-wrap;">{message}</p>
          </div>

          <!-- Reply CTA -->
          <div style="text-align:center;margin-top:24px;">
            <a href="mailto:{client_email}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:13px;font-weight:600;text-decoration:none;padding:11px 28px;border-radius:8px;">
              Répondre au client →
            </a>
          </div>

        </td></tr>

        <!-- Footer -->
        <tr><td style="border-top:1px solid #1e1e2e;padding:18px 32px;text-align:center;">
          <p class="footer-text" style="color:#475569;font-size:11px;margin:0;line-height:1.7;">
            builderz.shop · Reçu via l'espace client
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""
