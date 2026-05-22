"""Score d'opportunité 0-100."""
import httpx

async def score_prospect(prospect: dict) -> int:
    score = 0
    website = prospect.get("website", "")

    if not website:
        return 40

    if not website.startswith("https://"):
        score += 15

    try:
        import time
        start = time.time()
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(website, follow_redirects=True)
            elapsed = time.time() - start
            if elapsed > 3:
                score += 15
            if "viewport" not in resp.text.lower():
                score += 20
            for year in range(2015, 2021):
                if str(year) in resp.text:
                    score += 10
                    break
    except Exception:
        score += 30

    return min(score, 100)

def get_priority(score: int) -> str:
    if score >= 60:
        return "hot"
    elif score >= 35:
        return "warm"
    return "cold"
