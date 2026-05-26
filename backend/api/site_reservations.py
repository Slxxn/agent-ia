"""
API réservations pour les sites clients.
POST /api/reservations/{site_id}         — créer une réservation
GET  /api/reservations/{site_id}         — lister (admin)
PATCH /api/reservations/{site_id}/{id}   — changer le statut (admin)
POST /api/reservations/{site_id}/login   — vérifier le mot de passe admin
"""

import json
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional

from backend.db.database import get_db, get_setting
from backend.site_guardian.notifier import send_email

router = APIRouter(prefix="/reservations", tags=["reservations"])

STATUS_LABELS = {
    "pending":   "En attente",
    "confirmed": "Confirmée",
    "rejected":  "Refusée",
    "done":      "Terminée",
}


# ── Auth helpers ────────────────────────────────────────────────────

async def _check_token(site_id: str, token: str):
    key = f"{site_id.upper()}_ADMIN_TOKEN"
    expected = await get_setting(key)
    if not expected or token != expected:
        raise HTTPException(401, "Token invalide")


# ── Schemas ─────────────────────────────────────────────────────────

class ReservationPayload(BaseModel):
    nom: str
    email: str
    tel: Optional[str] = ""
    poste: Optional[str] = ""
    type_resa: Optional[str] = ""
    date_resa: Optional[str] = ""
    heure_debut: Optional[str] = ""
    heure_fin: Optional[str] = ""
    options: Optional[list] = []
    total: Optional[float] = 0
    activite: Optional[str] = ""
    notes: Optional[str] = ""

class StatusPayload(BaseModel):
    status: str

class LoginPayload(BaseModel):
    password: str


# ── Routes ──────────────────────────────────────────────────────────

@router.post("/{site_id}/login")
async def login(site_id: str, body: LoginPayload):
    key = f"{site_id.upper()}_ADMIN_TOKEN"
    expected = await get_setting(key)
    if not expected or body.password != expected:
        raise HTTPException(401, "Mot de passe incorrect")
    return {"token": expected}


@router.post("/{site_id}")
async def create_reservation(site_id: str, data: ReservationPayload):
    now = datetime.now(timezone.utc).isoformat()
    db = await get_db()
    try:
        await db.execute(
            """INSERT INTO site_reservations
               (site_id, nom, email, tel, poste, type_resa, date_resa,
                heure_debut, heure_fin, options, total, activite, notes,
                status, created_at, updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',?,?)""",
            (
                site_id, data.nom, data.email, data.tel or "",
                data.poste or "", data.type_resa or "", data.date_resa or "",
                data.heure_debut or "", data.heure_fin or "",
                json.dumps(data.options or []), data.total or 0,
                data.activite or "", data.notes or "",
                now, now,
            ),
        )
        await db.commit()
        cursor = await db.execute("SELECT last_insert_rowid()")
        row = await cursor.fetchone()
        resa_id = row[0]
    finally:
        await db.close()

    # Email notification admin
    try:
        admin_key = f"{site_id.upper()}_ADMIN_EMAIL"
        admin_email = await get_setting(admin_key) or await get_setting("ADMIN_EMAIL") or "sloan.dlrz@gmail.com"
        creneau = f"{data.heure_debut} → {data.heure_fin}" if data.heure_debut else "—"
        opts = ", ".join(data.options) if data.options else "—"
        await send_email(
            to=admin_email,
            subject=f"[{site_id}] Nouvelle réservation — {data.nom}",
            body=f"Nouvelle réservation de {data.nom} ({data.email})\nPoste: {data.poste} | Date: {data.date_resa} | Total: {data.total}€",
            html=f"""<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0d0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f1a;padding:40px 16px;">
<tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td align="center" style="background:#13162a;border-radius:16px 16px 0 0;padding:28px 40px 20px;border-bottom:1px solid #2a2d45;">
  <div style="font-size:20px;font-weight:700;color:#fff;">IXSHEL &amp; CO.</div>
  <div style="margin-top:6px;font-size:11px;font-weight:600;letter-spacing:0.12em;color:#550b14;text-transform:uppercase;">Nouvelle réservation #{resa_id}</div>
</td></tr>
<tr><td style="background:#13162a;border-radius:0 0 16px 16px;padding:28px 40px 36px;">
  <div style="background:#1a1d2e;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:6px 0;font-size:13px;color:#6b7280;width:40%">Client</td><td style="font-size:13px;color:#e5e7eb;font-weight:500">{data.nom}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#6b7280">Email</td><td style="font-size:13px;"><a href="mailto:{data.email}" style="color:#550b14">{data.email}</a></td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#6b7280">Téléphone</td><td style="font-size:13px;color:#e5e7eb">{data.tel or '—'}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#6b7280">Poste</td><td style="font-size:13px;color:#e5e7eb">{data.poste}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#6b7280">Date</td><td style="font-size:13px;color:#e5e7eb">{data.date_resa}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#6b7280">Créneau</td><td style="font-size:13px;color:#e5e7eb">{creneau}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#6b7280">Options</td><td style="font-size:13px;color:#e5e7eb">{opts}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#6b7280">Activité</td><td style="font-size:13px;color:#e5e7eb">{data.activite or '—'}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#6b7280;font-weight:700">Total</td><td style="font-size:16px;color:#550b14;font-weight:700">{int(data.total)}€</td></tr>
    </table>
  </div>
  {"<div style='background:#1a1d2e;border-left:3px solid #550b14;border-radius:0 8px 8px 0;padding:14px 18px;font-size:13px;color:#e5e7eb;line-height:1.6'>" + data.notes + "</div>" if data.notes else ""}
</td></tr>
</table></td></tr></table>
</body></html>""",
        )
    except Exception as e:
        print(f"[site_reservations] Email error: {e}")

    return {"success": True, "id": resa_id}


@router.get("/{site_id}")
async def list_reservations(site_id: str, x_admin_token: str = Header(...)):
    await _check_token(site_id, x_admin_token)
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM site_reservations WHERE site_id = ? ORDER BY created_at DESC",
            (site_id,),
        )
        rows = await cursor.fetchall()
    finally:
        await db.close()
    return {"reservations": [dict(r) for r in rows]}


@router.patch("/{site_id}/{resa_id}")
async def update_status(site_id: str, resa_id: int, body: StatusPayload, x_admin_token: str = Header(...)):
    await _check_token(site_id, x_admin_token)
    if body.status not in STATUS_LABELS:
        raise HTTPException(400, f"Statut invalide. Valeurs: {list(STATUS_LABELS)}")
    now = datetime.now(timezone.utc).isoformat()
    db = await get_db()
    try:
        await db.execute(
            "UPDATE site_reservations SET status=?, updated_at=? WHERE id=? AND site_id=?",
            (body.status, now, resa_id, site_id),
        )
        await db.commit()
    finally:
        await db.close()
    return {"success": True}
