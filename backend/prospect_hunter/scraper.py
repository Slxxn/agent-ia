"""
Scraping prospects — deux sources en parallèle :
  1. Pages Jaunes HTML  → nom, tél, site web, adresse
  2. API data.gouv.fr   → nom, adresse, coordonnées GPS

Les deux tournent en même temps par secteur, les résultats sont dédupliqués.
"""
import re
import asyncio
import unicodedata
import httpx
from urllib.parse import quote

# ─── Config ────────────────────────────────────────────────────────────────────

CITY_TO_DEP: dict[str, str] = {
    "montpellier": "34", "paris": "75", "lyon": "69", "marseille": "13",
    "bordeaux": "33", "toulouse": "31", "nantes": "44", "nice": "06",
    "strasbourg": "67", "lille": "59", "rennes": "35", "grenoble": "38",
    "tours": "37", "nîmes": "30", "nimes": "30", "perpignan": "66",
    "béziers": "34", "beziers": "34", "sète": "34", "sete": "34",
    "agde": "34", "lunel": "34", "clermont-ferrand": "63",
    "fort-de-france": "972", "martinique": "972",
}

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
}

LEGAL_SUFFIXES = [
    " sarl", " sas", " eurl", " sa", " sc", " snc", " scp", " sci",
    " sasu", " earl", " auto entrepreneur", " micro entreprise",
]


# ─── Normalisation pour déduplication ─────────────────────────────────────────

def _normalize_name(name: str) -> str:
    name = name.lower().strip()
    # Supprimer les accents
    name = "".join(
        c for c in unicodedata.normalize("NFD", name)
        if unicodedata.category(c) != "Mn"
    )
    # Supprimer les formes juridiques
    for suffix in LEGAL_SUFFIXES:
        name = name.replace(suffix, "")
    # Supprimer la ponctuation, normaliser les espaces
    name = re.sub(r"[^\w\s]", "", name)
    return re.sub(r"\s+", " ", name).strip()


def _merge_records(a: dict, b: dict) -> dict:
    """Fusionne deux fiches du même prospect, garde les champs les plus riches."""
    merged = {**a}
    for k, v in b.items():
        if v and not merged.get(k):
            merged[k] = v
    return merged


def _dedup(results: list[dict]) -> list[dict]:
    seen: dict[str, dict] = {}
    for r in results:
        key = _normalize_name(r.get("name", ""))
        if not key:
            continue
        if key in seen:
            seen[key] = _merge_records(seen[key], r)
        else:
            seen[key] = r
    return list(seen.values())


# ─── Source 1 : Pages Jaunes ──────────────────────────────────────────────────

async def _scrape_pj(sector: str, city: str, max_results: int) -> list[dict]:
    url = (
        "https://www.pagesjaunes.fr/annuaire/chercherlespros"
        f"?quoiqui={quote(sector)}&ou={quote(city)}"
    )
    try:
        async with httpx.AsyncClient(
            timeout=20, headers=_HEADERS, follow_redirects=True
        ) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return []
            html = resp.text
    except Exception:
        return []

    # Vérification anti-captcha : la page doit contenir des fiches
    if not any(marker in html for marker in ["bi-content", "bi-generic", "denomination"]):
        return []

    blocks = re.findall(
        r'<article[^>]+class="[^"]*bi-generic[^"]*"[^>]*>(.*?)</article>',
        html, re.DOTALL,
    )
    if not blocks:
        blocks = re.findall(
            r'<div[^>]+class="[^"]*bi-content[^"]*"[^>]*>(.*?)</div>\s*</div>',
            html, re.DOTALL,
        )

    results = []
    for block in blocks[:max_results]:
        name_m = re.search(r'class="[^"]*denomination[^"]*"[^>]*>\s*<[^>]+>([^<]+)<', block)
        if not name_m:
            name_m = re.search(r'<h2[^>]*>\s*<a[^>]*>([^<]+)</a>', block)
        name = name_m.group(1).strip() if name_m else ""

        phone_m = re.search(r'data-phone="([0-9 +]{8,})"', block)
        if not phone_m:
            phone_m = re.search(r'"tel:([0-9+]{8,})"', block)
        phone = phone_m.group(1).strip() if phone_m else ""

        web_m = re.search(r'data-pjlink-type="website"[^>]*href="([^"]+)"', block)
        if not web_m:
            web_m = re.search(
                r'href="(https?://(?!(?:www\.)?pagesjaunes)[^"]+)"', block
            )
        website = web_m.group(1).strip() if web_m else ""

        addr_m = re.search(r'class="[^"]*address[^"]*"[^>]*>\s*<[^>]+>([^<]+)', block)
        if not addr_m:
            addr_m = re.search(r'<address[^>]*>(.*?)</address>', block, re.DOTALL)
        address = re.sub(r"\s+", " ", addr_m.group(1)).strip() if addr_m else ""

        if name:
            results.append({
                "name": name,
                "phone": phone,
                "website": website,
                "address": address,
                "lat": None,
                "lng": None,
                "source": "pages_jaunes",
            })

    return results


# ─── Source 2 : API data.gouv.fr ──────────────────────────────────────────────

def _get_dep(city: str) -> str:
    return CITY_TO_DEP.get(city.lower().strip(), "34")


async def _scrape_api_gouv(sector: str, city: str, max_results: int) -> list[dict]:
    dep = _get_dep(city)
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://recherche-entreprises.api.gouv.fr/search",
                params={
                    "q": sector,
                    "departement": dep,
                    "per_page": max_results,
                    "page": 1,
                    "etat_administratif": "A",
                },
            )
            data = resp.json()
    except Exception:
        return []

    results = []
    for item in data.get("results", []):
        siege = item.get("siege", {})
        name = (
            item.get("nom_complet")
            or (item.get("liste_enseignes") or [None])[0]
            or item.get("nom_raison_sociale", "")
        )
        if not name:
            continue
        address = ", ".join(filter(None, [
            siege.get("adresse_ligne_1", ""),
            siege.get("code_postal", ""),
            siege.get("commune", ""),
        ]))
        results.append({
            "name": name.title(),
            "phone": "",
            "website": "",
            "address": address,
            "lat": siege.get("latitude"),
            "lng": siege.get("longitude"),
            "source": "data_gouv",
        })
    return results[:max_results]


# ─── Test de santé des sources ────────────────────────────────────────────────

async def test_scrapers(city: str = "Montpellier") -> dict:
    """Vérifie rapidement que chaque source répond correctement."""
    pj_ok = False
    gouv_ok = False
    pj_msg = "Non disponible"
    gouv_msg = "Non disponible"

    # Test Pages Jaunes (1 résultat, timeout court)
    try:
        url = f"https://www.pagesjaunes.fr/annuaire/chercherlespros?quoiqui=coiffeur&ou={quote(city)}"
        async with httpx.AsyncClient(timeout=10, headers=_HEADERS, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code == 200 and any(
                m in resp.text for m in ["bi-content", "bi-generic", "denomination"]
            ):
                pj_ok = True
                pj_msg = "Opérationnel"
            else:
                pj_msg = f"Bloqué (HTTP {resp.status_code})" if resp.status_code != 200 else "Captcha détecté"
    except Exception as e:
        pj_msg = f"Erreur : {str(e)[:60]}"

    # Test data.gouv
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://recherche-entreprises.api.gouv.fr/search",
                params={"q": "coiffeur", "departement": _get_dep(city), "per_page": 1},
            )
            data = resp.json()
            if data.get("results"):
                gouv_ok = True
                gouv_msg = "Opérationnel"
            else:
                gouv_msg = "Aucun résultat de test"
    except Exception as e:
        gouv_msg = f"Erreur : {str(e)[:60]}"

    return {
        "pages_jaunes": {"ok": pj_ok, "message": pj_msg},
        "data_gouv": {"ok": gouv_ok, "message": gouv_msg},
    }


# ─── Point d'entrée principal ─────────────────────────────────────────────────

async def scrape_both_sources(sector: str, city: str, max_results: int = 20) -> list[dict]:
    """Lance PJ + data.gouv en parallèle et déduplique les résultats."""
    pj_task = asyncio.create_task(_scrape_pj(sector, city, max_results))
    gouv_task = asyncio.create_task(_scrape_api_gouv(sector, city, max_results))

    pj_results, gouv_results = await asyncio.gather(pj_task, gouv_task, return_exceptions=True)

    if isinstance(pj_results, Exception):
        pj_results = []
    if isinstance(gouv_results, Exception):
        gouv_results = []

    merged = _dedup([*pj_results, *gouv_results])
    return merged[:max_results]


# Alias pour compatibilité avec l'ancien appel
scrape_pages_jaunes = scrape_both_sources
