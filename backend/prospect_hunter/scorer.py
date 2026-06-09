"""Score d'opportunité 0-100.
Plus le score est élevé, plus c'est une opportunité (site absent ou de mauvaise qualité).
"""
import time
import httpx


async def score_prospect(prospect: dict) -> int:
    website = prospect.get("website", "")
    phone   = prospect.get("phone", "")
    lat     = prospect.get("lat")

    # ── Pas de site = forte opportunité ───────────────────────────────────────
    if not website:
        score = 50
        if phone:
            score += 15   # joignable directement
        if lat:
            score += 10   # coordonnées GPS = entreprise vérifiée sur la carte
        return min(score, 100)

    # ── A un site — évaluer sa qualité ────────────────────────────────────────
    score = 20

    if not website.startswith("https://"):
        score += 10       # pas HTTPS = site ancien

    try:
        start = time.time()
        async with httpx.AsyncClient(timeout=8, follow_redirects=True) as client:
            resp = await client.get(website)
        elapsed = time.time() - start

        if elapsed > 3:
            score += 15   # site lent
        if "viewport" not in resp.text.lower():
            score += 25   # pas responsive / mobile-friendly
        for year in range(2015, 2022):
            if str(year) in resp.text:
                score += 15   # copyright périmé → refonte à proposer
                break
    except Exception:
        score += 30           # site inaccessible = besoin urgent de refonte

    return min(score, 100)


def get_priority(score: int) -> str:
    if score >= 60:
        return "hot"
    elif score >= 35:
        return "warm"
    return "cold"
