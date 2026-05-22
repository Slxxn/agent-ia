"""Scraping prospects via l'API Recherche Entreprises (data.gouv.fr) — sans clé API."""
import httpx

# Mapping ville → code département
CITY_TO_DEP: dict[str, str] = {
    "montpellier": "34", "paris": "75", "lyon": "69", "marseille": "13",
    "bordeaux": "33", "toulouse": "31", "nantes": "44", "nice": "06",
    "strasbourg": "67", "lille": "59", "rennes": "35", "grenoble": "38",
    "tours": "37", "nîmes": "30", "nimes": "30", "perpignan": "66",
    "béziers": "34", "beziers": "34", "sète": "34", "sete": "34",
    "agde": "34", "lunel": "34", "clermont-ferrand": "63",
}

# Codes NAF approchés par secteur (pour enrichir le scoring)
SECTOR_NAF: dict[str, list[str]] = {
    "coiffeur": ["9602A", "9602B"],
    "restaurant": ["5610A", "5610B", "5610C"],
    "boulangerie": ["1071A", "1071B", "4724Z"],
    "plombier": ["4322A"],
    "électricien": ["4321A"],
    "menuisier": ["4332A", "1623Z"],
    "médecin": ["8621Z", "8622A", "8622B"],
    "dentiste": ["8623Z"],
    "avocat": ["6910Z"],
    "comptable": ["6920Z"],
    "agence immobilière": ["6831Z", "6832A"],
    "fleuriste": ["4776Z"],
    "garage automobile": ["4520A", "4520B"],
    "photographe": ["7420Z"],
}


def _get_dep(city: str) -> str:
    return CITY_TO_DEP.get(city.lower().strip(), "34")


async def scrape_pages_jaunes(sector: str, city: str, max_results: int = 20) -> list[dict]:
    """
    Recherche des entreprises via l'API officielle recherche-entreprises.api.gouv.fr.
    Aucune clé API requise.
    """
    dep = _get_dep(city)
    results: list[dict] = []

    async with httpx.AsyncClient(timeout=15) as client:
        # Première passe : recherche par nom de secteur + département
        params = {
            "q": sector,
            "departement": dep,
            "per_page": max_results,
            "page": 1,
            "etat_administratif": "A",  # entreprises actives uniquement
        }
        try:
            resp = await client.get(
                "https://recherche-entreprises.api.gouv.fr/search",
                params=params,
            )
            data = resp.json()
        except Exception:
            return []

        for item in data.get("results", []):
            siege = item.get("siege", {})
            name = (
                item.get("nom_complet")
                or (item.get("liste_enseignes") or [None])[0]
                or item.get("nom_raison_sociale", "")
            )
            address_parts = [
                siege.get("adresse_ligne_1", ""),
                siege.get("code_postal", ""),
                siege.get("commune", ""),
            ]
            address = ", ".join(p for p in address_parts if p)

            results.append({
                "name": name.title(),
                "address": address,
                "phone": "",   # API gouvernement ne fournit pas les téléphones
                "website": _guess_website(name),
                "lat": siege.get("latitude"),
                "lng": siege.get("longitude"),
                "siren": item.get("siren", ""),
            })

    return results[:max_results]


def _guess_website(name: str) -> str:
    """
    On ne peut pas deviner un site web avec certitude sans scraping.
    Retourne une chaîne vide — le scorer traitera ça comme "pas de site" (score élevé).
    """
    return ""
