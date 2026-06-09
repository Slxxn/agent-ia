"""
Scan automatique quotidien — Prospect Hunter.

Logique :
- Tourne tous les jours à 06h00 UTC
- Tourne 2 secteurs par jour en rotation (14 secteurs → cycle complet en 7 jours)
- Chaque secteur = ~20 entreprises → ~20 requêtes Google Custom Search
- Total : ~40 requêtes/jour sur les 100 gratuites
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

SECTORS_PER_RUN = 2   # 2 secteurs × ~20 entreprises = ~40 requêtes Google/jour


async def _save_if_new(db, biz: dict, sector: str, city: str) -> bool:
    name = biz.get("name", "").strip()
    if not name:
        return False
    cursor = await db.execute(
        "SELECT id FROM prospects WHERE name = ? AND city = ?", (name, city)
    )
    if await cursor.fetchone():
        # Enrichir website/phone si on a plus d'infos
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


async def run_daily_scan():
    """Scan les 2 prochains secteurs dans la rotation quotidienne."""
    city = os.getenv("PROSPECT_AUTO_CITY", "Montpellier")

    # Déterminer les secteurs du jour via le numéro du jour de l'année
    day_index = datetime.now().timetuple().tm_yday
    start = (day_index * SECTORS_PER_RUN) % len(ALL_SECTORS)
    sectors = [ALL_SECTORS[(start + i) % len(ALL_SECTORS)] for i in range(SECTORS_PER_RUN)]

    log.info(f"[AutoScan] Démarrage — ville={city} secteurs={sectors}")
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
                log.info(f"[AutoScan] {sector} → {len(results)} trouvés, {new_count} nouveaux")
            except Exception as e:
                log.error(f"[AutoScan] Erreur sur secteur '{sector}' : {e}")
            await asyncio.sleep(1)
    finally:
        await db.close()

    log.info(f"[AutoScan] Terminé — {total_new} nouveaux prospects ajoutés")

    # Sauvegarder la date du dernier scan
    from backend.db.database import set_setting
    await set_setting("PROSPECT_LAST_AUTO_SCAN", datetime.now(timezone.utc).isoformat(), encrypted=False)


def start_scheduler() -> AsyncIOScheduler:
    """Crée et démarre le scheduler. Appeler depuis le lifespan FastAPI."""
    scheduler = AsyncIOScheduler(timezone="UTC")
    scheduler.add_job(
        run_daily_scan,
        trigger=CronTrigger(hour=6, minute=0),   # 06h00 UTC chaque jour
        id="prospect_daily_scan",
        name="Scan auto Prospect Hunter",
        replace_existing=True,
        misfire_grace_time=3600,                  # tolère 1h de retard (restart VPS)
    )
    scheduler.start()
    log.info("[AutoScan] Scheduler démarré — prochain scan à 06h00 UTC")
    return scheduler
