"""
API Route — Analyse de logo via Gemini Vision.
Extrait les couleurs dominantes, le style visuel et le thème de fond.
"""

import json
from fastapi import APIRouter
from pydantic import BaseModel
from backend.db.database import get_setting
from backend.tools.llm import call_gemini_vision, set_gemini_key

router = APIRouter(prefix="/analyze-logo", tags=["analyze-logo"])


class LogoAnalysisRequest(BaseModel):
    image_base64: str
    media_type: str = "image/png"


@router.post("")
async def analyze_logo(data: LogoAnalysisRequest):
    gemini_key = await get_setting("GEMINI_API_KEY")
    if gemini_key:
        set_gemini_key(gemini_key)

    prompt = """Analyse ce logo. Retourne UNIQUEMENT un JSON valide sans markdown ni balises :
{
  "colors": ["#hex1", "#hex2", "#hex3"],
  "visualStyle": "luxe_elegant|minimal_clean|modern_bold|warm_natural|colorful_vivid|corporate_pro",
  "colorTheme": "light|dark|neutral",
  "reasoning": "1 phrase concise expliquant les choix de couleurs et de style"
}
Règles :
- colors : les 2-3 couleurs dominantes du logo en hex
- visualStyle : choisir la valeur la plus proche parmi les options données
- colorTheme : "light" si le logo est sur fond clair, "dark" si sombre, "neutral" si neutre
- Ne jamais inventer des clés supplémentaires"""

    try:
        raw = await call_gemini_vision(prompt, data.image_base64, data.media_type)
        clean = raw.strip().replace("```json", "").replace("```", "").strip()
        result = json.loads(clean)
        return result
    except Exception as e:
        return {"error": str(e)}
