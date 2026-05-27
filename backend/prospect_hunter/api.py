"""Routes FastAPI Prospect Hunter."""
import uuid
import asyncio
import time
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.db.database import get_db
from backend.prospect_hunter.scraper import scrape_both_sources, test_scrapers
from backend.prospect_hunter.scorer import score_prospect, get_priority
from backend.prospect_hunter.pitch_generator import generate_pitch

router = APIRouter(prefix="/api/prospects", tags=["prospects"])

ALL_SECTORS = [
    "coiffeur", "restaurant", "boulangerie", "plombier",
    "électricien", "menuisier", "médecin", "dentiste",
    "avocat", "comptable", "agence immobilière", "fleuriste",
    "garage automobile", "photographe",
]


class ScanRequest(BaseModel):
    sector: str          # secteur précis ou "all" pour tout scanner
    city: str = "Montpellier"
    max_results: int = 20


class ProspectUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


# ─── Santé des sources ────────────────────────────────────────────────────────

@router.get("/status")
async def get_scraper_status(city: str = "Montpellier"):
    """Vérifie que Pages Jaunes et data.gouv sont accessibles."""
    return await test_scrapers(city)


# ─── Helpers ──────────────────────────────────────────────────────────────────

async def _save_prospect(db, biz: dict, sector: str, city: str) -> dict | None:
    """Score, sauvegarde et retourne le prospect. Retourne None si nom vide."""
    name = biz.get("name", "").strip()
    if not name:
        return None

    prospect_data = {**biz, "sector": sector, "city": city}
    score = await score_prospect(prospect_data)
    priority = get_priority(score)
    prospect_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    cursor = await db.execute(
        "SELECT id FROM prospects WHERE name = ? AND city = ?",
        (name, city),
    )
    existing = await cursor.fetchone()
    if existing:
        # Enrichir si on a plus d'infos cette fois
        await db.execute("""
            UPDATE prospects SET
              phone    = CASE WHEN (phone IS NULL OR phone = '') AND ? != '' THEN ? ELSE phone END,
              website  = CASE WHEN (website IS NULL OR website = '') AND ? != '' THEN ? ELSE website END,
              score    = MAX(score, ?),
              priority = CASE WHEN ? > score THEN ? ELSE priority END,
              updated_at = ?
            WHERE id = ?
        """, (
            biz.get("phone", ""), biz.get("phone", ""),
            biz.get("website", ""), biz.get("website", ""),
            score,
            score, priority,
            now,
            existing[0],
        ))
        await db.commit()
        return None  # Pas un nouveau prospect

    await db.execute("""
        INSERT INTO prospects
        (id, name, sector, address, city, lat, lng, phone, website,
         score, priority, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)
    """, (
        prospect_id, name, sector,
        biz.get("address", ""), city,
        biz.get("lat"), biz.get("lng"),
        biz.get("phone", ""), biz.get("website", ""),
        score, priority, now, now,
    ))
    await db.commit()

    return {
        "id": prospect_id,
        "name": name,
        "score": score,
        "priority": priority,
        "website": biz.get("website"),
        "city": city,
        "address": biz.get("address"),
        "phone": biz.get("phone"),
        "lat": biz.get("lat"),
        "lng": biz.get("lng"),
        "sector": sector,
        "status": "new",
    }


# ─── Scan ─────────────────────────────────────────────────────────────────────

@router.post("/scan")
async def scan_prospects(req: ScanRequest):
    t0 = time.time()
    sectors = ALL_SECTORS if req.sector == "all" else [req.sector]
    all_results = []
    sectors_done = 0
    sectors_failed = 0

    db = await get_db()
    try:
        for sector in sectors:
            try:
                raw = await scrape_both_sources(sector, req.city, req.max_results)
            except Exception:
                sectors_failed += 1
                continue

            for biz in raw:
                saved = await _save_prospect(db, biz, sector, req.city)
                if saved:
                    all_results.append(saved)

            sectors_done += 1
            # Pause légère entre secteurs pour éviter le rate-limiting PJ
            if req.sector == "all" and sectors_done < len(sectors):
                await asyncio.sleep(0.4)
    finally:
        await db.close()

    all_results.sort(key=lambda x: x["score"], reverse=True)
    elapsed = round(time.time() - t0, 1)

    return {
        "scanned": len(all_results),
        "sectors_done": sectors_done,
        "sectors_failed": sectors_failed,
        "elapsed_seconds": elapsed,
        "prospects": all_results,
    }


# ─── Suppression ─────────────────────────────────────────────────────────────

@router.delete("/")
async def delete_all_prospects():
    """Vide complètement la table prospects."""
    db = await get_db()
    try:
        cursor = await db.execute("DELETE FROM prospects")
        await db.commit()
        return {"deleted": cursor.rowcount}
    finally:
        await db.close()


# ─── Liste ────────────────────────────────────────────────────────────────────

@router.get("/")
async def list_prospects(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    sector: Optional[str] = None,
    limit: int = 100,
):
    db = await get_db()
    try:
        query = "SELECT * FROM prospects WHERE 1=1"
        params: list = []
        if status:
            query += " AND status = ?"
            params.append(status)
        if priority:
            query += " AND priority = ?"
            params.append(priority)
        if sector:
            query += " AND sector = ?"
            params.append(sector)
        query += " ORDER BY score DESC LIMIT ?"
        params.append(limit)
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        cols = [d[0] for d in cursor.description]
        return [dict(zip(cols, row)) for row in rows]
    finally:
        await db.close()


# ─── Pitch ────────────────────────────────────────────────────────────────────

@router.post("/{prospect_id}/pitch")
async def generate_prospect_pitch(prospect_id: str):
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM prospects WHERE id = ?", (prospect_id,)
        )
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(404, "Prospect non trouvé")
        cols = [d[0] for d in cursor.description]
        prospect = dict(zip(cols, row))
    finally:
        await db.close()

    subject, body = await generate_pitch(prospect)

    db = await get_db()
    try:
        await db.execute(
            "UPDATE prospects SET pitch = ?, updated_at = ? WHERE id = ?",
            (body, datetime.now(timezone.utc).isoformat(), prospect_id),
        )
        await db.commit()
    finally:
        await db.close()

    return {"subject": subject, "pitch": body}


# ─── Update ───────────────────────────────────────────────────────────────────

@router.patch("/{prospect_id}")
async def update_prospect(prospect_id: str, update: ProspectUpdate):
    db = await get_db()
    try:
        now = datetime.now(timezone.utc).isoformat()
        if update.status is not None:
            await db.execute(
                "UPDATE prospects SET status = ?, updated_at = ? WHERE id = ?",
                (update.status, now, prospect_id),
            )
        if update.notes is not None:
            await db.execute(
                "UPDATE prospects SET notes = ?, updated_at = ? WHERE id = ?",
                (update.notes, now, prospect_id),
            )
        await db.commit()
    finally:
        await db.close()
    return {"ok": True}


# ─── Convertir en projet ──────────────────────────────────────────────────────

@router.post("/{prospect_id}/convert")
async def convert_to_project(prospect_id: str):
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM prospects WHERE id = ?", (prospect_id,)
        )
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(404, "Prospect non trouvé")
        cols = [d[0] for d in cursor.description]
        prospect = dict(zip(cols, row))
        await db.execute(
            "UPDATE prospects SET status = 'converted', updated_at = ? WHERE id = ?",
            (datetime.now(timezone.utc).isoformat(), prospect_id),
        )
        await db.commit()
    finally:
        await db.close()

    return {
        "ok": True,
        "prefill": {
            "businessName": prospect["name"],
            "sector": prospect["sector"],
            "city": prospect["city"],
        },
    }
