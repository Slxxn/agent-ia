"""
API Route — Suggestions Gemini pour le formulaire client.
Reçoit les données du formulaire et retourne des suggestions de design + stats.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from backend.tools.llm import LLMTool, _gemini_or, DEEPSEEK_MODEL_FLASH, GEMINI_MODEL
from backend.db.database import get_setting
from backend.tools.llm import set_gemini_key
import json
import re

router = APIRouter(prefix="/gemini-preview", tags=["gemini-preview"])


class FormPreviewRequest(BaseModel):
    businessName: str
    sector: str
    siteGoal: str
    tagline: Optional[str] = ""
    description: Optional[str] = ""
    targetAudience: Optional[str] = ""
    uniqueValue: Optional[str] = ""
    colors: List[str] = []
    colorTheme: Optional[str] = "light"
    visualStyle: Optional[str] = ""
    pages: List[str] = []
    features: List[str] = []
    budget: Optional[str] = ""


@router.post("")
async def gemini_preview(data: FormPreviewRequest):
    gemini_key = await get_setting("GEMINI_API_KEY")
    if gemini_key:
        set_gemini_key(gemini_key)

    llm = LLMTool()

    system = """You are a web design and digital marketing expert. You analyze a client brief and generate concrete, impactful recommendations.

Respond ONLY in valid JSON with this exact structure:
{
  "palette": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": "#hexcode",
    "background": "#hexcode",
    "names": ["Color name 1", "Color name 2", "Color name 3"]
  },
  "ambiance": "short description of the visual ambiance in 1 sentence",
  "typography": {
    "display": "Display font name",
    "body": "Body font name"
  },
  "stats": [
    {
      "emoji": "📈",
      "value": "3x more",
      "label": "bookings with a permanently visible button"
    }
  ],
  "sections": ["Hero with strong headline", "Before/After gallery", "..."],
  "animations": "description of recommended animations in 1 sentence",
  "tip": "short personalized tip for this specific sector"
}

Rules for stats:
- Maximum 4 stats
- Simple numbers understandable by everyone
- 100% relevant to the client's sector
- Short format: "X times more Y" or "X% of clients do Z"
- Based on known marketing realities

Rules for palette:
- Take into account the colors chosen by the client
- Complete with harmonious colors
- Adapt to the sector and visual style"""

    colors_str = ", ".join(data.colors) if data.colors else "not specified"
    prompt = f"""Client brief:
- Business: {data.businessName}
- Sector: {data.sector}
- Goal: {data.siteGoal}
- Tagline: {data.tagline or 'not specified'}
- Description: {data.description or 'not specified'}
- Audience: {data.targetAudience or 'not specified'}
- Competitive advantage: {data.uniqueValue or 'not specified'}
- Chosen colors: {colors_str}
- Theme: {data.colorTheme}
- Visual style: {data.visualStyle or 'not specified'}
- Desired pages: {', '.join(data.pages) if data.pages else 'not specified'}
- Features: {', '.join(data.features) if data.features else 'not specified'}
- Budget: {data.budget or 'not specified'}

Generate the AI suggestions for this client."""

    model = _gemini_or(DEEPSEEK_MODEL_FLASH)
    try:
        result = await llm.call_ollama(prompt, system_prompt=system, temperature=0.3, model_override=model)
    except Exception as e:
        return {"success": False, "error": f"Erreur LLM : {e}"}

    if not result.get("success", True) and "content" not in result:
        return {"success": False, "error": result.get("error", "Erreur LLM inconnue")}

    content = result.get("content", "")

    # Strip markdown code fences if present
    content = re.sub(r'```(?:json)?\s*', '', content).strip()

    try:
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            suggestions = json.loads(json_match.group())
            return {"success": True, "suggestions": suggestions}
    except Exception as e:
        return {"success": False, "error": f"JSON invalide : {e}"}

    return {"success": False, "error": f"Aucun JSON trouvé. Réponse reçue : {content[:300]!r}"}
