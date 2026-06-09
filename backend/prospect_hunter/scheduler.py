"""
Scan automatique — Prospect Hunter.

Logique :
- 2 scans par jour : 06h00 UTC et 18h00 UTC
- 2 secteurs par scan en rotation → 4 secteurs/jour, cycle complet en ~3.5 jours
- Chaque secteur = ~20 entreprises → ~20 requêtes Google Custom Search
- Total : ~80 requêtes/jour sur les 100 gratuites (marge de 20)
- Ville configurable via la clé PROSPECT_AUTO_CITY (défaut : Montpellier)
"""
import os
import uuid
import asyncio
import logging
from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from backend.prospect_hunter.scraper import scrape_both_sources
from backend.prospect_hunter.scorer import score_prospect, get_priority
from backend.db.database import get_db

log = logging.getLogger("prospect_hunter.scheduler")

ALL_SECTORS = [
    "coiffeur", "restaurant", "boulangerie", "plombier",
    "électricien", "menuisier", "médecin", "dentiste",
    "avocat", "comptable", "agence immobilière", "fleuriste",
    "garage automobile", "photographe",
]

SECTORS_PER_RUN = 2   # 2 secteurs × ~20 req = ~40 req/scan × 2 scans = ~80/jour


async def _save_if_new(db, biz: dict, sector: str, city: str) -> bool:
    name = biz.get("name", "").strip()
    if not name:
        return False
    cursor = await db.execute(
        "SELECT id FROM prospects WHERE name = ? AND city = ?", (name, city)
    )
    if await cursor.fetchone():
        await db.execute("""
            UPDATE prospects SET
              phone   = CASE WHEN (phone IS NULL OR phone='') AND ?!='' THEN ? ELSE phone END,
              website = CASE WHEN (website IS NULL OR website='') AND ?!='' THEN ? ELSE website END,
              updated_at = ?
            WHERE name=? AND city=?
        """, (
            biz.get("phone",""), biz.get("phone",""),
            biz.get("website",""), biz.get("website",""),
            datetime.now(timezone.utc).isoformat(), name, city,
        ))
        await db.commit()
        return False

    prospect_data = {**biz, "sector": sector, "city": city}
    score = await score_prospect(prospect_data)
    priority = get_priority(score)
    now = datetime.now(timezone.utc).isoformat()
    await db.execute("""
        INSERT INTO prospects
        (id, name, sector, address, city, lat, lng, phone, website,
         score, priority, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)
    """, (
        str(uuid.uuid4()), name, sector,
        biz.get("address",""), city,
        biz.get("lat"), biz.get("lng"),
        biz.get("phone",""), biz.get("website",""),
        score, priority, now, now,
    ))
    await db.commit()
    return True


async def run_scan(slot: int):
    """
    Scan les 2 prochains secteurs en rotation.
    slot=0 → scan du matin (06h), slot=1 → scan du soir (18h).
    Chaque slot prend les 2 secteurs suivants dans la rotation journalière.
    """
    city = os.getenv("PROSPECT_AUTO_CITY", "Montpellier")

    # slot 0 → secteurs [0,1] du jour, slot 1 → secteurs [2,3] du jour
    day_index = datetime.now().timetuple().tm_yday
    base = (day_index * SECTORS_PER_RUN * 2 + slot * SECTORS_PER_RUN) % len(ALL_SECTORS)
    sectors = [ALL_SECTORS[(base + i) % len(ALL_SECTORS)] for i in range(SECTORS_PER_RUN)]

    label = "matin" if slot == 0 else "soir"
    log.info(f"[AutoScan/{label}] Démarrage — ville={city} secteurs={sectors}")
    total_new = 0

    db = await get_db()
    try:
        for sector in sectors:
            try:
                results = await scrape_both_sources(sector, city, max_results=20, enrich_websites=True)
                new_count = 0
                for biz in results:
                    if await _save_if_new(db, biz, sector, city):
                        new_count += 1
                total_new += new_count
                log.info(f"[AutoScan/{label}] {sector} → {len(results)} trouvés, {new_count} nouveaux")
            except Exception as e:
                log.error(f"[AutoScan/{label}] Erreur sur secteur '{sector}' : {e}")
            await asyncio.sleep(1)
    finally:
        await db.close()

    log.info(f"[AutoScan/{label}] Terminé — {total_new} nouveaux prospects ajoutés")

    from backend.db.database import set_setting
    await set_setting("PROSPECT_LAST_AUTO_SCAN", datetime.now(timezone.utc).isoformat(), encrypted=False)


def start_scheduler() -> AsyncIOScheduler:
    """Crée et démarre le scheduler. Appeler depuis le lifespan FastAPI."""
    scheduler = AsyncIOScheduler(timezone="UTC")

    scheduler.add_job(
        run_scan, args=[0],
        trigger=CronTrigger(hour=6, minute=0),
        id="prospect_scan_morning",
        name="Scan auto Prospect Hunter — matin",
        replace_existing=True,
        misfire_grace_time=3600,
    )
    scheduler.add_job(
        run_scan, args=[1],
        trigger=CronTrigger(hour=18, minute=0),
        id="prospect_scan_evening",
        name="Scan auto Prospect Hunter — soir",
        replace_existing=True,
        misfire_grace_time=3600,
    )

    scheduler.start()
    log.info("[AutoScan] Scheduler démarré — scans à 06h00 et 18h00 UTC")
    return scheduler
