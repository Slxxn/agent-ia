"""
API Routes — Portail client (suivi de commande sans authentification).
"""

import secrets
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.db.database import get_db, get_project

router = APIRouter(prefix="/portal", tags=["portal"])


class PortalCreate(BaseModel):
    firestore_id: str = ""
    client_email: str
    client_phone: str = ""
    business_name: str
    site_type: str = "standard"


class PortalStatusUpdate(BaseModel):
    status: str
    project_id: Optional[int] = None


@router.post("")
async def create_portal_order(data: PortalCreate):
    token = secrets.token_urlsafe(24)
    db = await get_db()
    try:
        await db.execute(
            """INSERT INTO portal_orders
               (token, firestore_id, client_email, client_phone, business_name, site_type, status)
               VALUES (?, ?, ?, ?, ?, ?, 'pending')""",
            (token, data.firestore_id, data.client_email, data.client_phone,
             data.business_name, data.site_type),
        )
        await db.commit()
    finally:
        await db.close()
    return {"token": token}


@router.get("/{token}")
async def get_portal_order(token: str):
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM portal_orders WHERE token = ?", (token,)
        )
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Commande non trouvée.")
        data = dict(row)
    finally:
        await db.close()

    if data.get("project_id"):
        project = await get_project(data["project_id"])
        if project:
            data["project_status"] = project["status"]
            data["project_progress"] = project["progress"]
            data["deploy_url"] = project.get("deploy_url", "")

    return data


@router.patch("/{token}")
async def update_portal_order(token: str, body: PortalStatusUpdate):
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id FROM portal_orders WHERE token = ?", (token,)
        )
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Commande non trouvée.")
        await db.execute(
            """UPDATE portal_orders SET status = ?, project_id = ?,
               updated_at = datetime('now') WHERE token = ?""",
            (body.status, body.project_id, token),
        )
        await db.commit()
    finally:
        await db.close()
    return {"success": True}
