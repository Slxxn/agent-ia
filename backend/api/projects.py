"""
API Routes — Gestion des projets.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from backend.core.project_manager import project_manager
from backend.core.task_manager import task_manager
from backend.agent.runner import AgentRunner
from backend.db.database import get_tasks_by_project, get_brief, get_tokens_used

router = APIRouter(prefix="/projects", tags=["projects"])


# ─── Schémas Pydantic ───

class ProjectCreate(BaseModel):
    name: str
    description: str = ""

class ProjectStart(BaseModel):
    objective: str

class ProjectBriefRequest(BaseModel):
    objective: str
    settings: dict = {}

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = ""
    objective: Optional[str] = ""
    status: str
    progress: float
    created_at: str
    updated_at: str
    workspace_path: str
    tokens_used: Optional[int] = 0
    deploy_url: Optional[str] = ""

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


@router.post("/{project_id}/brief")
async def build_project_brief(project_id: int, data: ProjectBriefRequest):
    raise HTTPException(status_code=410, detail="Brief créatif statique supprimé — le design system est généré dynamiquement par Gemini.")


@router.get("/{project_id}/brief")
async def get_project_brief(project_id: int):
    """Récupérer le brief créatif sauvegardé d'un projet."""
    project = await project_manager.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé.")

    brief = await get_brief(project_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief non trouvé.")
    return brief


@router.post("/{project_id}/start")
async def start_project(project_id: int, data: ProjectStart):
    """Démarrer l'exécution d'un projet."""
    project = await project_manager.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé.")

    # Sauvegarder l'objectif en base
    await project_manager.update(project_id, objective=data.objective)

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


@router.post("/{project_id}/deploy")
async def deploy_project(project_id: int):
    """Déclencher le déploiement Firebase d'un projet existant."""
    project = await project_manager.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé.")

    workspace_path = await project_manager.get_workspace_path(project_id)
    if not workspace_path:
        raise HTTPException(status_code=400, detail="Workspace introuvable.")

    import asyncio
    async def _run_deploy():
        from backend.db.database import add_log, update_project
        await add_log(project_id, "🚀 Déploiement manuel déclenché...", "info")
        url = await AgentRunner._deploy_firebase(project_id, workspace_path)
        if url:
            await update_project(project_id, deploy_url=url)

    asyncio.create_task(_run_deploy())
    return {"success": True, "message": "Déploiement démarré en arrière-plan."}


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


@router.post("/{project_id}/prepare-workspace")
async def prepare_workspace_route(project_id: int):
    """Prépare le workspace Claude Code depuis le brief JSON d'un projet."""
    import asyncio, json
    from backend.db.database import get_db

    db = await get_db()
    try:
        cursor = await db.execute("SELECT brief FROM projects WHERE id = ?", (project_id,))
        row = await cursor.fetchone()
    finally:
        await db.close()

    if not row or not row[0]:
        raise HTTPException(status_code=404, detail="Brief non trouvé pour ce projet.")

    brief = json.loads(row[0])

    from backend.tools.brief_to_claude import prepare_workspace
    slug = await prepare_workspace(brief)
    return {"success": True, "slug": slug, "workspace": f"workspace/{slug}"}


@router.post("/{project_id}/validate-visual")
async def validate_visual(project_id: int):
    """Lancer la validation visuelle manuellement sur un projet terminé."""
    import asyncio
    from backend.tools.filesystem import FilesystemTool
    from backend.tools.terminal import TerminalTool
    from backend.tools.llm import LLMTool
    from backend.agent.executor import AgentExecutor
    from backend.agent.visual_validator import VisualValidator
    from backend.agent.project_brain import ProjectBrain
    from backend.db.database import add_log

    project = await project_manager.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé.")

    workspace_path = await project_manager.get_workspace_path(project_id)
    if not workspace_path:
        raise HTTPException(status_code=404, detail="Workspace non trouvé.")

    async def _run():
        await add_log(project_id, "🎨 Validation visuelle lancée manuellement…", "info")
        try:
            fs  = FilesystemTool(workspace_path)
            t   = TerminalTool(workspace_path)
            llm = LLMTool()
            brain   = ProjectBrain(project_id, workspace_path)
            executor = AgentExecutor(fs, t, llm, brain=brain)
            validator = VisualValidator(executor=executor)
            # Use deployed URL if available, otherwise fall back to local dev server
            deployed_url = project.get("url") if project else None
            await validator.run_validation_loop(
                project_id, workspace_path, deployed_url=deployed_url, force=True
            )
            await add_log(project_id, "✅ Validation visuelle terminée.", "info")
        except Exception as e:
            await add_log(project_id, f"❌ Erreur validation visuelle : {e}", "error")

    asyncio.create_task(_run())
    return {"success": True, "message": "Validation visuelle démarrée."}
