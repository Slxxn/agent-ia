"""
Gestionnaire de tâches.
Gère le cycle de vie des tâches au sein d'un projet.
"""

import asyncio
from typing import Optional, Dict, Any, List
from backend.db.database import (
    create_task, get_task, get_tasks_by_project,
    update_task, add_log
)


class TaskManager:
    """Gestionnaire centralisé des tâches."""

    async def create(self, project_id: int, description: str, steps: List[str] = None) -> Dict[str, Any]:
        """Créer une nouvelle tâche pour un projet."""
        task = await create_task(project_id, description, steps)
        await add_log(project_id, f"Tâche créée : {description}", "info")
        return task

    async def get(self, task_id: int) -> Optional[Dict[str, Any]]:
        """Récupérer une tâche."""
        return await get_task(task_id)

    async def get_by_project(self, project_id: int) -> List[Dict[str, Any]]:
        """Récupérer toutes les tâches d'un projet."""
        return await get_tasks_by_project(project_id)

    async def start(self, task_id: int) -> Optional[Dict[str, Any]]:
        """Démarrer une tâche."""
        task = await update_task(task_id, status="running")
        if task:
            await add_log(task["project_id"], f"Tâche #{task_id} démarrée : {task['description']}", "info")
        return task

    async def complete(self, task_id: int, result: str = "") -> Optional[Dict[str, Any]]:
        """Marquer une tâche comme terminée."""
        task = await update_task(task_id, status="done", result=result)
        if task:
            await add_log(task["project_id"], f"Tâche #{task_id} terminée avec succès.", "info")
        return task

    async def fail(self, task_id: int, error: str = "") -> Optional[Dict[str, Any]]:
        """Marquer une tâche comme en erreur."""
        task = await get_task(task_id)
        if not task:
            return None
        retries = task.get("retries", 0) + 1
        task = await update_task(task_id, status="error", result=error, retries=retries)
        if task:
            await add_log(task["project_id"], f"Tâche #{task_id} en erreur (tentative {retries}/3) : {error}", "error")
        return task

    async def retry(self, task_id: int) -> Optional[Dict[str, Any]]:
        """Réessayer une tâche en erreur."""
        task = await get_task(task_id)
        if not task:
            return None
        if task["retries"] >= 3:
            await add_log(task["project_id"], f"Tâche #{task_id} : nombre max de tentatives atteint (3).", "error")
            return task
        task = await update_task(task_id, status="pending")
        return task

    async def can_retry(self, task_id: int) -> bool:
        """Vérifier si une tâche peut être réessayée."""
        task = await get_task(task_id)
        if not task:
            return False
        return task["retries"] < 3


# Instance singleton
task_manager = TaskManager()
