"""Routes FastAPI Prospect Hunter."""
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.db.database import get_db
from backend.prospect_hunter.scraper import scrape_pages_jaunes
from backend.prospect_hunter.scorer import score_prospect, get_priority
from backend.prospect_hunter.pitch_generator import generate_pitch

router = APIRouter(prefix="/api/prospects", tags=["prospects"])


class ScanRequest(BaseModel):
    sector: str
    city: str = "Montpellier"
    max_results: int = 20


class ProspectUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


@router.post("/scan")
async def scan_prospects(req: ScanRequest):
    try:
        raw = await scrape_pages_jaunes(req.sector, req.city, req.max_results)
    except Exception as e:
        raise HTTPException(500, f"Erreur scraping : {str(e)}")

    results = []
    db = await get_db()
    try:
        for biz in raw:
            prospect_data = {**biz, "sector": req.sector, "city": req.city}
            score = await score_prospect(prospect_data)
            priority = get_priority(score)
            prospect_id = str(uuid.uuid4())
            now = datetime.now(timezone.utc).isoformat()

            await db.execute("""
                INSERT OR IGNORE INTO prospects
                (id, name, sector, address, city, lat, lng, phone, website,
                 score, priority, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)
            """, (
                prospect_id, biz.get("name", ""), req.sector,
                biz.get("address", ""), req.city,
                biz.get("lat"), biz.get("lng"),
                biz.get("phone", ""), biz.get("website", ""),
                score, priority, now, now
            ))
            await db.commit()
            results.append({
                "id": prospect_id,
                "name": biz.get("name"),
                "score": score,
                "priority": priority,
                "website": biz.get("website"),
                "city": req.city,
                "address": biz.get("address"),
                "phone": biz.get("phone"),
                "lat": biz.get("lat"),
                "lng": biz.get("lng"),
                "sector": req.sector,
                "status": "new",
            })
    finally:
        await db.close()

    results.sort(key=lambda x: x["score"], reverse=True)
    return {"scanned": len(results), "prospects": results}


@router.get("/")
async def list_prospects(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    sector: Optional[str] = None,
    limit: int = 100
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
            (body, datetime.now(timezone.utc).isoformat(), prospect_id)
        )
        await db.commit()
    finally:
        await db.close()

    return {"subject": subject, "pitch": body}


@router.patch("/{prospect_id}")
async def update_prospect(prospect_id: str, update: ProspectUpdate):
    db = await get_db()
    try:
        now = datetime.now(timezone.utc).isoformat()
        if update.status is not None:
            await db.execute(
                "UPDATE prospects SET status = ?, updated_at = ? WHERE id = ?",
                (update.status, now, prospect_id)
            )
        if update.notes is not None:
            await db.execute(
                "UPDATE prospects SET notes = ?, updated_at = ? WHERE id = ?",
                (update.notes, now, prospect_id)
            )
        await db.commit()
    finally:
        await db.close()
    return {"ok": True}


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
            (datetime.now(timezone.utc).isoformat(), prospect_id)
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
        }
    }
