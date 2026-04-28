"""
Point d'entrée principal du backend FastAPI.
Agent Platform — Plateforme de gestion d'agents IA multi-projets.
"""

import os
import sys

# Ajouter le répertoire parent au path pour les imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.db.database import init_db
from backend.api.projects import router as projects_router
from backend.api.logs import router as logs_router
from backend.api.env import router as env_router
from backend.api.chat import router as chat_router
from backend.tools.llm import LLMTool


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Cycle de vie de l'application."""
    # Startup
    print("🚀 Initialisation de la base de données...")
    await init_db()
    print("✅ Base de données initialisée.")

    # Vérifier la connexion au backend LLM
    llm = LLMTool()
    status = await llm.check_connection()
    backend_name = status.get("backend", "?")
    if status.get("connected"):
        print(f"✅ Backend LLM '{backend_name}' connecté.")
        target = status.get("target_model", llm.model)
        if status.get("model_available"):
            print(f"✅ Modèle {target} disponible.")
        else:
            print(f"⚠️  Modèle {target} non listé par le serveur (peut quand même marcher).")
    else:
        print(f"⚠️  Backend LLM '{backend_name}' non connecté : {status.get('error', 'Inconnue')}")

    yield

    # Shutdown
    print("👋 Arrêt du serveur.")


app = FastAPI(
    title="Agent Platform",
    description="Plateforme de gestion d'agents IA multi-projets",
    version="1.0.0",
    lifespan=lifespan
)

# CORS pour le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# IMPORTANT : enregistrer logs_router AVANT projects_router
# pour que les routes /projects/stream et /projects/{id}/stream (dans logs.py)
# soient évaluées avant /projects/{project_id} (dans projects.py).
app.include_router(logs_router, prefix="/api")
app.include_router(env_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(projects_router, prefix="/api")


@app.get("/")
async def root():
    """Route racine."""
    return {
        "name": "Agent Platform",
        "version": "1.0.0",
        "description": "Plateforme de gestion d'agents IA multi-projets",
        "endpoints": {
            "projects": "/api/projects",
            "docs": "/docs"
        }
    }


@app.get("/api/health")
async def health_check():
    """Vérification de santé du serveur."""
    llm = LLMTool()
    status = await llm.check_connection()
    return {
        "status": "ok",
        "ollama": status,  # nom de champ conservé pour compat frontend
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
