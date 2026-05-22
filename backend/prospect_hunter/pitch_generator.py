"""Génération de pitch email via Claude Haiku."""
import json
from backend.tools.llm import LLMTool

async def generate_pitch(prospect: dict) -> tuple[str, str]:
    """Retourne (subject, body)."""
    name = prospect.get("name", "votre entreprise")
    sector = prospect.get("sector", "votre secteur")
    city = prospect.get("city", "Montpellier")
    website = prospect.get("website", "")

    situation = "n'a pas encore de site web" if not website else "a un site web qui pourrait être modernisé"

    prompt = f"""Tu es un consultant web local à Montpellier.
Rédige un email de prospection court pour :

Entreprise : {name}
Secteur : {sector}
Ville : {city}
Situation : {situation}

Règles :
- Maximum 5 phrases
- Ton chaleureux et local
- Proposition concrète : site professionnel livré en 72h à partir de 290€
- Pas de jargon technique
- Terminer par une question simple

Réponds en JSON uniquement :
{{"subject": "objet de l'email", "body": "corps de l'email"}}"""

    llm = LLMTool()
    result = await llm._call_claude(
        prompt=prompt,
        system_prompt="Tu génères des emails de prospection efficaces. Réponds uniquement en JSON valide.",
        max_tokens=400,
        model_override="claude-haiku-4-5-20251001",
    )

    response = result.get("content", "") if result.get("success") else ""
    try:
        clean = response.strip().replace("```json", "").replace("```", "").strip()
        data = json.loads(clean)
        return data.get("subject", ""), data.get("body", "")
    except Exception:
        return f"Votre présence en ligne — {name}", response
