"""
API Routes — Gestion des projets.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from backend.core.project_manager import project_manager
from backend.core.task_manager import task_manager
from backend.agent.runner import AgentRunner
from backend.db.database import get_tasks_by_project

router = APIRouter(prefix="/projects", tags=["projects"])


# ─── Schémas Pydantic ───

class ProjectCreate(BaseModel):
    name: str
    description: str = ""

class ProjectStart(BaseModel):
    objective: str

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = ""
    status: str
    progress: float
    created_at: str
    updated_at: str
    workspace_path: str

class TaskResponse(BaseModel):
    id: int
    project_id: int
    description: str
    status: str
    step_index: int
    steps: list
    result: str
    retries: int
    created_at: str
    updated_at: str


# ─── Routes ───

@router.get("", response_model=List[ProjectResponse])
async def list_projects():
    """Lister tous les projets."""
    projects = await project_manager.list_all()
    return projects


@router.post("", response_model=ProjectResponse)
async def create_project(data: ProjectCreate):
    """Créer un nouveau projet."""
    project = await project_manager.create(data.name, data.description)
    return project


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int):
    """Récupérer un projet par son ID."""
    project = await project_manager.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé.")
    return project


@router.delete("/{project_id}")
async def delete_project(project_id: int):
    """Supprimer un projet."""
    success = await project_manager.delete(project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Projet non trouvé.")
    return {"message": "Projet supprimé."}


@router.post("/{project_id}/start")
async def start_project(project_id: int, data: ProjectStart):
    """Démarrer l'exécution d'un projet."""
    project = await project_manager.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé.")

    result = await AgentRunner.start_project(project_id, data.objective)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Erreur de démarrage."))
    return result


@router.post("/{project_id}/stop")
async def stop_project(project_id: int):
    """Arrêter l'exécution d'un projet."""
    project = await project_manager.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé.")

    result = await AgentRunner.stop_project(project_id)
    return result


@router.post("/{project_id}/pause")
async def pause_project(project_id: int):
    """Mettre en pause l'exécution d'un projet."""
    project = await project_manager.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé.")

    result = await AgentRunner.pause_project(project_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result


@router.post("/{project_id}/resume")
async def resume_project(project_id: int):
    """Reprendre l'exécution d'un projet en pause."""
    project = await project_manager.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé.")

    result = await AgentRunner.resume_project(project_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result


@router.get("/{project_id}/tasks", response_model=List[TaskResponse])
async def get_project_tasks(project_id: int):
    """Récupérer les tâches d'un projet."""
    project = await project_manager.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé.")

    tasks = await get_tasks_by_project(project_id)
    return tasks


@router.get("/{project_id}/files")
async def get_project_files(project_id: int):
    """Récupérer l'arborescence des fichiers du workspace."""
    from backend.tools.filesystem import FilesystemTool

    workspace_path = await project_manager.get_workspace_path(project_id)
    if not workspace_path:
        raise HTTPException(status_code=404, detail="Workspace non trouvé.")

    fs = FilesystemTool(workspace_path)
    result = fs.list_files(".")
    tree = fs.get_tree()

    return {
        "files": result.get("entries", []),
        "tree": tree
    }


@router.get("/{project_id}/files/{file_path:path}")
async def read_project_file(project_id: int, file_path: str):
    """Lire le contenu d'un fichier du workspace."""
    from backend.tools.filesystem import FilesystemTool

    workspace_path = await project_manager.get_workspace_path(project_id)
    if not workspace_path:
        raise HTTPException(status_code=404, detail="Workspace non trouvé.")

    fs = FilesystemTool(workspace_path)
    result = fs.read_file(file_path)

    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error", "Fichier non trouvé."))

    return result
