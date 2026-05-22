"""Scraping prospects via Firecrawl."""
import httpx
from backend.core.settings_crypto import get_setting

FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1"

SECTORS = [
    "coiffeur", "restaurant", "boulangerie", "plombier",
    "électricien", "menuisier", "médecin", "dentiste",
    "avocat", "comptable", "agence immobilière", "fleuriste",
    "garage automobile", "photographe"
]

async def scrape_pages_jaunes(sector: str, city: str, max_results: int = 20) -> list[dict]:
    api_key = await get_setting("FIRECRAWL_API_KEY")
    if not api_key:
        raise ValueError("FIRECRAWL_API_KEY manquante dans les réglages")

    url = f"https://www.pagesjaunes.fr/pagesblanches/recherche?quoiqui={sector.replace(' ', '+')}&ou={city}"

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{FIRECRAWL_API_URL}/scrape",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "url": url,
                "formats": ["extract"],
                "extract": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "businesses": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string"},
                                        "address": {"type": "string"},
                                        "phone": {"type": "string"},
                                        "website": {"type": "string"}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        )
        data = response.json()
        return data.get("data", {}).get("extract", {}).get("businesses", [])[:max_results]
