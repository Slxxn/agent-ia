"""
API Routes — Gestion des réglages globaux (clés API, URLs, etc.)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.db.database import get_setting, set_setting, get_all_settings

router = APIRouter(prefix="/settings", tags=["settings"])


KNOWN_SETTINGS = [
    # ── LLM principal ───────────────────────────────────────────────────────
    {"key": "DEEPSEEK_API_KEY",      "label": "DeepSeek API Key",           "encrypted": True,  "placeholder": "sk-..."},
    {"key": "DEEPSEEK_BASE_URL",     "label": "DeepSeek Base URL",          "encrypted": False, "placeholder": "https://api.deepseek.com"},
    # ── Gemini Flash (tâches courtes : planification, repair, validation) ──
    {"key": "GEMINI_API_KEY",        "label": "Gemini API Key",             "encrypted": True,  "placeholder": "AIza..."},
    {"key": "LLM_BUDGET_MODE",       "label": "Mode LLM",                   "encrypted": False, "placeholder": "balanced  (economy | balanced | quality)"},
    # ── Ollama (local) ──────────────────────────────────────────────────────
    {"key": "OLLAMA_BASE_URL",       "label": "Ollama Base URL",            "encrypted": False, "placeholder": "http://localhost:11434"},
    {"key": "OLLAMA_MODEL",          "label": "Ollama Model",               "encrypted": False, "placeholder": "qwen2.5-coder:7b"},
    # ── Intégrations ────────────────────────────────────────────────────────
    {"key": "STRIPE_SECRET_KEY",     "label": "Stripe Secret Key",          "encrypted": True,  "placeholder": "sk_live_..."},
    {"key": "STRIPE_PUBLIC_KEY",     "label": "Stripe Publishable Key",     "encrypted": False, "placeholder": "pk_live_..."},
    # ── Déploiement Firebase ────────────────────────────────────────────────
    {"key": "FIREBASE_TOKEN",        "label": "Firebase CI Token",          "encrypted": True,  "placeholder": "1//0g..."},
    {"key": "FIREBASE_PROJECT_ID",   "label": "Firebase Project ID",        "encrypted": False, "placeholder": "mon-projet-abc"},
]


class SettingUpsert(BaseModel):
    key: str
    value: str


@router.get("")
async def list_settings():
    """Lister tous les réglages (valeurs sensibles masquées)."""
    stored = {s["key"]: s for s in await get_all_settings()}
    result = []
    for meta in KNOWN_SETTINGS:
        key = meta["key"]
        entry = stored.get(key, {})
        result.append({
            **meta,
            "value": entry.get("value", ""),
            "set": bool(entry.get("value", "")),
        })
    return result


@router.get("/{key}")
async def get_one_setting(key: str):
    """Récupérer la valeur déchiffrée d'un réglage."""
    value = await get_setting(key)
    if value is None:
        raise HTTPException(status_code=404, detail=f"Réglage '{key}' non trouvé.")
    return {"key": key, "value": value}


@router.post("")
async def upsert_setting(data: SettingUpsert):
    """Créer ou mettre à jour un réglage."""
    encrypted = any(s["encrypted"] for s in KNOWN_SETTINGS if s["key"] == data.key)
    await set_setting(data.key, data.value, encrypted=encrypted)
    return {"success": True, "key": data.key}


@router.delete("/{key}")
async def delete_setting(key: str):
    """Supprimer un réglage."""
    await set_setting(key, "", encrypted=False)
    return {"success": True, "key": key}
