"""Routes FastAPI Site Guardian."""
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.db.database import get_db
from backend.site_guardian.monitor import run_checks_for_site
from backend.site_guardian.notifier import notify_admin_new_request, notify_client_status

router = APIRouter(prefix="/api/guardian", tags=["guardian"])


class SiteCreate(BaseModel):
    project_id: str
    client_name: str
    client_email: str
    site_url: str
    plan: str = "essential"


class RequestCreate(BaseModel):
    site_id: str
    message: str


class RequestAction(BaseModel):
    action: str  # approve | reject | done
    admin_response: Optional[str] = ""


# ── Sites ──────────────────────────────────────────────────────────────────────

@router.get("/sites")
async def list_sites():
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT s.*,
                   (SELECT status FROM guardian_checks
                    WHERE site_id = s.id AND check_type = 'uptime'
                    ORDER BY checked_at DESC LIMIT 1) as uptime_status,
                   (SELECT details FROM guardian_checks
                    WHERE site_id = s.id AND check_type = 'ssl'
                    ORDER BY checked_at DESC LIMIT 1) as ssl_details,
                   (SELECT COUNT(*) FROM guardian_requests
                    WHERE site_id = s.id AND status = 'pending') as pending_requests
            FROM guardian_sites s
            WHERE s.active = 1
            ORDER BY s.created_at DESC
        """)
        rows = await cursor.fetchall()
        cols = [d[0] for d in cursor.description]
        return [dict(zip(cols, row)) for row in rows]
    finally:
        await db.close()


@router.post("/sites")
async def create_site(site: SiteCreate):
    site_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    db = await get_db()
    try:
        await db.execute("""
            INSERT INTO guardian_sites
            (id, project_id, client_name, client_email, site_url, plan, active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?)
        """, (site_id, site.project_id, site.client_name,
              site.client_email, site.site_url, site.plan, now))
        await db.commit()
    finally:
        await db.close()
    return {"id": site_id, "ok": True}


@router.post("/sites/{site_id}/check")
async def run_site_check(site_id: str):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM guardian_sites WHERE id = ?", (site_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(404, "Site non trouvé")
        cols = [d[0] for d in cursor.description]
        site = dict(zip(cols, row))
    finally:
        await db.close()

    checks = await run_checks_for_site(site)

    db = await get_db()
    try:
        for check in checks:
            await db.execute("""
                INSERT INTO guardian_checks
                (id, site_id, check_type, status, details, checked_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (str(uuid.uuid4()), check["site_id"], check["check_type"],
                  check["status"], check["details"], check["checked_at"]))
        await db.commit()
    finally:
        await db.close()

    return {"checks": checks}


# ── Lookup by portal token ─────────────────────────────────────────────────────

@router.get("/portal/{token}")
async def get_site_for_token(token: str):
    """Trouve le site Guardian associé à un token de portal client."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT project_id FROM portal_orders WHERE token = ?", (token,)
        )
        row = await cursor.fetchone()
        if not row or not row[0]:
            return None
        project_id = str(row[0])
        cursor = await db.execute(
            "SELECT * FROM guardian_sites WHERE project_id = ? AND active = 1 LIMIT 1",
            (project_id,)
        )
        site_row = await cursor.fetchone()
        if not site_row:
            return None
        cols = [d[0] for d in cursor.description]
        return dict(zip(cols, site_row))
    finally:
        await db.close()


# ── Demandes ───────────────────────────────────────────────────────────────────

@router.get("/requests")
async def list_requests(status: Optional[str] = None):
    db = await get_db()
    try:
        query = """
            SELECT r.*, s.client_name, s.site_url, s.client_email
            FROM guardian_requests r
            JOIN guardian_sites s ON r.site_id = s.id
            WHERE 1=1
        """
        params: list = []
        if status:
            query += " AND r.status = ?"
            params.append(status)
        query += " ORDER BY r.created_at DESC"
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        cols = [d[0] for d in cursor.description]
        return [dict(zip(cols, row)) for row in rows]
    finally:
        await db.close()


@router.post("/requests")
async def create_request(req: RequestCreate):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM guardian_sites WHERE id = ?", (req.site_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(404, "Site non trouvé")
        cols = [d[0] for d in cursor.description]
        site = dict(zip(cols, row))
    finally:
        await db.close()

    request_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    db = await get_db()
    try:
        await db.execute("""
            INSERT INTO guardian_requests
            (id, site_id, message, status, created_at, updated_at)
            VALUES (?, ?, ?, 'pending', ?, ?)
        """, (request_id, req.site_id, req.message, now, now))
        await db.commit()
    finally:
        await db.close()

    await notify_admin_new_request(
        client_name=site["client_name"],
        site_url=site["site_url"],
        message=req.message,
    )

    return {"id": request_id, "status": "pending"}


@router.post("/requests/{request_id}/action")
async def handle_request(request_id: str, action: RequestAction):
    status_map = {"approve": "approved", "reject": "rejected", "done": "done"}
    new_status = status_map.get(action.action)
    if not new_status:
        raise HTTPException(400, "Action invalide")

    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT r.*, s.client_email, s.client_name
            FROM guardian_requests r
            JOIN guardian_sites s ON r.site_id = s.id
            WHERE r.id = ?
        """, (request_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(404, "Demande non trouvée")
        cols = [d[0] for d in cursor.description]
        req_data = dict(zip(cols, row))

        await db.execute("""
            UPDATE guardian_requests
            SET status = ?, admin_response = ?, updated_at = ?
            WHERE id = ?
        """, (new_status, action.admin_response, datetime.now(timezone.utc).isoformat(), request_id))
        await db.commit()
    finally:
        await db.close()

    await notify_client_status(
        client_email=req_data["client_email"],
        client_name=req_data["client_name"],
        status=new_status,
        admin_response=action.admin_response or "",
    )
    return {"ok": True, "status": new_status}


class SitePatch(BaseModel):
    client_email: Optional[str] = None
    client_name: Optional[str] = None
    site_url: Optional[str] = None

@router.patch("/sites/{site_id}")
async def patch_site(site_id: str, body: SitePatch):
    """Met à jour les infos d'un site (email client, nom, URL)."""
    from datetime import datetime, timezone
    fields = {k: v for k, v in body.dict().items() if v is not None}
    if not fields:
        return {"success": True}

    now = datetime.now(timezone.utc).isoformat()
    set_clause = ", ".join(f"{k} = ?" for k in fields)
    values = list(fields.values()) + [now, site_id]

    db = await get_db()
    try:
        await db.execute(
            f"UPDATE guardian_sites SET {set_clause}, updated_at = ? WHERE id = ?",
            values
        )
        # Sync client_email vers projects si lié
        if "client_email" in fields:
            cursor = await db.execute("SELECT project_id FROM guardian_sites WHERE id = ?", (site_id,))
            row = await cursor.fetchone()
            if row and row[0]:
                await db.execute(
                    "UPDATE projects SET client_email = ? WHERE id = ?",
                    (fields["client_email"], row[0])
                )
        await db.commit()
    finally:
        await db.close()

    return {"success": True}


@router.get("/sites/{site_id}/requests")
async def site_requests(site_id: str):
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM guardian_requests WHERE site_id = ? ORDER BY created_at DESC",
            (site_id,)
        )
        rows = await cursor.fetchall()
        cols = [d[0] for d in cursor.description]
        return [dict(zip(cols, row)) for row in rows]
    finally:
        await db.close()
