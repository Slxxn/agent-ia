"""
Gestionnaire de projets.
Gère le cycle de vie des projets et leur workspace.
"""

import os
import asyncio
from typing import Optional, Dict, Any, List
from backend.db.database import (
    create_project, get_project, get_all_projects,
    update_project, delete_project, add_log
)

# Chemin racine du workspace
WORKSPACE_ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "workspace")


class ProjectManager:
    """Gestionnaire centralisé des projets."""

    def __init__(self):
        os.makedirs(WORKSPACE_ROOT, exist_ok=True)

    async def create(self, name: str, description: str = "") -> Dict[str, Any]:
        """Créer un nouveau projet avec son workspace."""
        project = await create_project(name, description)
        # Créer le répertoire workspace
        workspace_path = os.path.join(WORKSPACE_ROOT, project["workspace_path"].replace("workspace/", ""))
        os.makedirs(workspace_path, exist_ok=True)
        await add_log(project["id"], f"Projet '{name}' créé avec succès.", "info")
        return project

    async def get(self, project_id: int) -> Optional[Dict[str, Any]]:
        """Récupérer un projet."""
        return await get_project(project_id)

    async def list_all(self) -> List[Dict[str, Any]]:
        """Lister tous les projets."""
        return await get_all_projects()

    async def update_status(self, project_id: int, status: str) -> Optional[Dict[str, Any]]:
        """Mettre à jour le statut d'un projet."""
        project = await update_project(project_id, status=status)
        if project:
            await add_log(project_id, f"Statut changé vers '{status}'.", "info")
        return project

    async def update_progress(self, project_id: int, progress: float) -> Optional[Dict[str, Any]]:
        """Mettre à jour la progression d'un projet."""
        return await update_project(project_id, progress=min(100.0, max(0.0, progress)))

    async def get_workspace_path(self, project_id: int) -> Optional[str]:
        """Obtenir le chemin absolu du workspace d'un projet."""
        project = await get_project(project_id)
        if not project:
            return None
        rel_path = project["workspace_path"].replace("workspace/", "")
        return os.path.join(WORKSPACE_ROOT, rel_path)

    async def delete(self, project_id: int) -> bool:
        """Supprimer un projet."""
        return await delete_project(project_id)


# Instance singleton
project_manager = ProjectManager()
