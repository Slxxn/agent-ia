"""
UnsplashTool — Recherche d'images libres de droits via Unsplash API.
Anti-doublon par projet : chaque image est unique dans un projet donné.
"""

import httpx
from typing import Dict, List, Optional

UNSPLASH_ACCESS_KEY = "lTsfyEnrhi9xHvF7x4DL8BPfB3Vps8_C1dbuAj90Q1A"
UNSPLASH_API = "https://api.unsplash.com"


class UnsplashTool:
    def __init__(self):
        self._used_ids: Dict[int, set] = {}

    def _get_used(self, project_id: int) -> set:
        if project_id not in self._used_ids:
            self._used_ids[project_id] = set()
        return self._used_ids[project_id]

    async def search(
        self,
        query: str,
        project_id: int,
        orientation: str = "landscape",
        count: int = 1,
    ) -> List[Dict]:
        used = self._get_used(project_id)
        results = []
        page = 1

        async with httpx.AsyncClient(timeout=10) as client:
            while len(results) < count:
                resp = await client.get(
                    f"{UNSPLASH_API}/search/photos",
                    headers={"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"},
                    params={
                        "query": query,
                        "orientation": orientation,
                        "per_page": 20,
                        "page": page,
                        "content_filter": "high",
                    },
                )
                if resp.status_code != 200:
                    break

                photos = resp.json().get("results", [])
                if not photos:
                    break

                for photo in photos:
                    if photo["id"] in used:
                        continue
                    used.add(photo["id"])
                    results.append({
                        "id": photo["id"],
                        "url": photo["urls"]["regular"],
                        "url_small": photo["urls"]["small"],
                        "alt": photo.get("alt_description") or query,
                        "author": photo["user"]["name"],
                        "author_link": photo["user"]["links"]["html"],
                        "unsplash_link": photo["links"]["html"],
                    })
                    if len(results) >= count:
                        break

                page += 1
                if page > 3:
                    break

        return results

    async def get_image_map(
        self,
        keywords: Dict[str, str],
        project_id: int,
    ) -> Dict[str, str]:
        image_map: Dict[str, str] = {}
        for slot, query in keywords.items():
            orientation = "portrait" if "portrait" in slot else "landscape"
            photos = await self.search(query, project_id, orientation=orientation, count=1)
            if photos:
                image_map[slot] = photos[0]["url"]
        return image_map


unsplash = UnsplashTool()
