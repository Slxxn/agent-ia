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
    references: Optional[str] = ""
    colors: List[str] = []
    colorTheme: Optional[str] = "light"
    visualStyle: Optional[str] = ""
    pages: List[str] = []
    features: List[str] = []
    budget: Optional[str] = ""
    siteType: Optional[str] = "standard"


SECTOR_PALETTE_HINTS = {
    "beauty":     "warm nude tones, rose gold, blush, ivory — luxurious and feminine",
    "restaurant": "deep warm burgundy, cream, terracotta, golden amber — appetizing and cozy",
    "fashion":    "editorial neutrals: off-white, slate, black, a bold accent like rust or emerald",
    "artisan":    "earthy ochre, warm brown, sand, terracotta — handcrafted and authentic",
    "coach":      "confident navy or forest green, warm white, gold accent — trustworthy and energising",
    "photo":      "minimal black/white/grey, one strong accent — lets the work speak",
    "medical":    "calm sky blue, clean white, soft teal — clinical cleanliness and reassurance",
    "realestate": "deep charcoal, warm grey, champagne gold — premium and aspirational",
    "sport":      "high-energy combinations: electric blue+orange, or black+lime — dynamic and bold",
    "tech":       "deep indigo or midnight blue, electric violet, pure white — modern and cutting-edge",
    "association":"approachable warm coral or sky blue, friendly green — hopeful and inclusive",
    "other":      "balanced, versatile palette suited to a professional modern brand",
}


@router.post("")
async def gemini_preview(data: FormPreviewRequest):
    gemini_key = await get_setting("GEMINI_API_KEY")
    if gemini_key:
        set_gemini_key(gemini_key)

    llm = LLMTool()

    sector_hint = SECTOR_PALETTE_HINTS.get(data.sector, SECTOR_PALETTE_HINTS["other"])
    client_colors = ", ".join(data.colors) if data.colors else "not specified"

    system = f"""You are a senior web designer and brand strategist specialising in high-converting websites for small businesses.

Your job: analyse the client brief and generate THREE distinct, professionally crafted color palettes + actionable recommendations.

SECTOR PALETTE GUIDANCE for "{data.sector}": {sector_hint}

Client's chosen colors (incorporate if possible, adapt for harmony): {client_colors}
Theme preference: {data.colorTheme}

RULES for palettes:
- Each palette must be internally harmonious (passes WCAG AA contrast on background)
- Must feel authentic to the sector — no generic tech palettes for a restaurant, no food-warmth for a SaaS
- "background" should be the page background, "primary" is the main brand color, "secondary" is a supporting tone, "accent" is for CTAs and highlights
- Propose ONE palette close to the client's colors, ONE creative alternative, ONE premium/elegant variant
- All hex codes must be valid 6-digit hex

RULES for suggestedVisualStyle: pick the SINGLE best match from this list based on sector + goal:
standard site styles: luxe_elegant | minimal_clean | modern_bold | warm_natural | colorful_vivid | corporate_pro
3D site styles: immersive_dark | spatial_minimal | holographic | organic_3d | cinematic | futuristic_ui
scrollytelling styles: narrative_film | editorial_bold | poetic_minimal | immersive_3d | brand_story | product_reveal

RULES for suggestedColorTheme: pick ONE from: light | dark | neutral (standard) OR deep_space | neon_dark | midnight | vantablack (3D) OR deep_black | midnight | ink | neon_dark (scrollytelling)

Respond ONLY with valid JSON, no markdown fences:
{{
  "palettes": [
    {{
      "name": "Short evocative palette name",
      "description": "One sentence — what feeling/image this evokes",
      "background": "#hexcode",
      "primary": "#hexcode",
      "secondary": "#hexcode",
      "accent": "#hexcode",
      "text": "#hexcode"
    }},
    {{ ... }},
    {{ ... }}
  ],
  "suggestedVisualStyle": "style_key",
  "suggestedColorTheme": "theme_key",
  "ambiance": "One sentence describing the overall design direction",
  "typography": {{
    "display": "Font name for headings (must be a real Google Font)",
    "body": "Font name for body text (must be a real Google Font)"
  }},
  "stats": [
    {{ "emoji": "📈", "value": "X fois plus", "label": "de réservations avec un bouton toujours visible" }}
  ],
  "sections": ["Section name — why it matters for this sector"],
  "tip": "One specific, actionable tip for this exact sector and goal"
}}"""

    prompt = f"""Client brief:
- Business: {data.businessName}
- Sector: {data.sector}
- Site type: {data.siteType}
- Goal: {data.siteGoal}
- Tagline: {data.tagline or 'not specified'}
- Description: {data.description or 'not specified'}
- Target audience: {data.targetAudience or 'not specified'}
- Competitive advantage: {data.uniqueValue or 'not specified'}
- References / inspiration: {data.references or 'not specified'}
- Visual style chosen: {data.visualStyle or 'not chosen yet'}
- Pages: {', '.join(data.pages) if data.pages else 'not specified'}
- Features: {', '.join(data.features) if data.features else 'not specified'}
- Budget: {data.budget or 'not specified'}

Generate 3 tailored palettes and all recommendations for this client."""

    model = _gemini_or(DEEPSEEK_MODEL_FLASH)
    try:
        result = await llm.call_ollama(prompt, system_prompt=system, temperature=0.4, model_override=model)
    except Exception as e:
        return {"success": False, "error": f"Erreur LLM : {e}"}

    if not result.get("success", True) and "content" not in result:
        return {"success": False, "error": result.get("error", "Erreur LLM inconnue")}

    content = result.get("content", "")
    content = re.sub(r'```(?:json)?\s*', '', content).strip()
    content = content.rstrip('`').strip()

    try:
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            suggestions = json.loads(json_match.group())
            return {"success": True, "suggestions": suggestions}
    except Exception as e:
        return {"success": False, "error": f"JSON invalide : {e}"}

    return {"success": False, "error": f"Aucun JSON trouvé. Réponse : {content[:300]!r}"}
