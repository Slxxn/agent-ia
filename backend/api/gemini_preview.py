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

    system = """Tu es un expert en design web et marketing digital. Tu analyses le brief d'un client et tu génères des recommandations concrètes et percutantes.

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "palette": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": "#hexcode",
    "background": "#hexcode",
    "names": ["Nom couleur 1", "Nom couleur 2", "Nom couleur 3"]
  },
  "ambiance": "description courte de l'ambiance visuelle en 1 phrase",
  "typography": {
    "display": "Nom police titre",
    "body": "Nom police corps"
  },
  "stats": [
    {
      "emoji": "📈",
      "value": "3x plus",
      "label": "de réservations avec un bouton visible en permanence"
    }
  ],
  "sections": ["Hero avec accroche forte", "Galerie avant/après", "..."],
  "animations": "description des animations recommandées en 1 phrase",
  "tip": "conseil personnalisé court et percutant pour ce secteur spécifique"
}

Règles pour les stats :
- Maximum 4 stats
- Chiffres simples et compréhensibles par tout le monde
- 100% pertinentes pour le secteur du client
- Format court : "X fois plus de Y" ou "X% des clients font Z"
- Basées sur des réalités marketing connues

Règles pour la palette :
- Prends en compte les couleurs choisies par le client
- Complète avec des couleurs harmonieuses
- Adapte au secteur et au style visuel"""

    colors_str = ", ".join(data.colors) if data.colors else "non spécifié"
    prompt = f"""Brief client :
- Entreprise : {data.businessName}
- Secteur : {data.sector}
- Objectif : {data.siteGoal}
- Accroche : {data.tagline or 'non spécifié'}
- Description : {data.description or 'non spécifié'}
- Audience : {data.targetAudience or 'non spécifié'}
- Avantage : {data.uniqueValue or 'non spécifié'}
- Couleurs choisies : {colors_str}
- Thème : {data.colorTheme}
- Style visuel : {data.visualStyle or 'non spécifié'}
- Pages souhaitées : {', '.join(data.pages) if data.pages else 'non spécifié'}
- Fonctionnalités : {', '.join(data.features) if data.features else 'non spécifié'}
- Budget : {data.budget or 'non spécifié'}

Génère les suggestions Gemini pour ce client."""

    model = _gemini_or(DEEPSEEK_MODEL_FLASH)
    try:
        result = await llm.call_ollama(prompt, system_prompt=system, temperature=0.3, model_override=model)
        content = result.get("content", "")
    except Exception as e:
        return {"success": False, "error": f"Erreur LLM : {e}"}

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
