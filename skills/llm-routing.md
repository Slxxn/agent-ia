---
name: llm-routing
description: Règles de routing LLM pour backend/tools/llm.py. Charger avant toute modification du système de routing LLM.
---

# Skill — LLM Routing

## Architecture actuelle
Le fichier backend/tools/llm.py est le point central de routing.
Il expose LLMTool qui sélectionne le bon LLM selon le mode et le type de tâche.

## Routing cible

| Type de tâche       | economy         | balanced             | quality              |
|---------------------|-----------------|----------------------|----------------------|
| Sections UI         | DeepSeek Chat   | DeepSeek Chat        | Claude Sonnet        |
| Fichiers critiques  | DeepSeek Chat   | DeepSeek Reasoner    | Claude Sonnet        |
| Planification       | Gemini Flash    | Gemini Flash         | Gemini Flash         |
| Repair/Validation   | Gemini Flash    | Gemini Flash         | Claude Sonnet        |

## Règles d'intégration Claude API
- Modèle : claude-sonnet-4-6
- Client : anthropic Python SDK (pip install anthropic)
- Max tokens : 8192 (identique aux autres LLMs)
- Gestion d'erreurs : retry x2 sur RateLimitError, raise sur les autres

## Variables d'environnement dans backend/.env
```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
```

## Pattern d'implémentation
```python
import anthropic

async def _call_claude(self, prompt: str, system: str, max_tokens: int = 8192) -> Dict[str, Any]:
    client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
    message = await client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": prompt}]
    )
    return {"content": message.content[0].text, "model": ANTHROPIC_MODEL}
```

## Points d'attention
- Ne pas casser le routing existant — Claude est une nouvelle branche, pas un remplacement
- Le LLMTool doit rester rétrocompatible avec les appels existants
- ANTHROPIC_API_KEY est chiffré avec le système AES existant (settings_crypto.py)
- Les modèles Claude ont le préfixe "claude-" — le dispatch dans call_ollama() vérifie ce préfixe
