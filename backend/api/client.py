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
    from backend.utils.email_templates import modification_request_html

    admin_email = await get_setting("ADMIN_EMAIL") or "sloan.dlrz@gmail.com"

    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT name, client_name, deploy_url FROM projects WHERE id = ? AND LOWER(client_email) = LOWER(?)",
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

    site_url = project.get("deploy_url", "") or ""
    html = modification_request_html(
        client_name=client_name,
        client_email=body.client_email,
        nom_projet=project_name,
        site_url=site_url,
        message=body.message,
        dashboard_url="https://builderz.shop/app/platform",
    )

    await send_email(
        to=admin_email,
        subject=f"[builderz] Demande de modif — {project_name}",
        body=f"Client : {client_name} <{body.client_email}>\nProjet : {project_name}\n\n{body.message}",
        html=html,
    )

    return {"success": True, "message": "Votre demande a été envoyée."}
