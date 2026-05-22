"""
API Routes — Gestion des projets.
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from backend.core.project_manager import project_manager
from backend.core.task_manager import task_manager
from backend.agent.runner import AgentRunner
from backend.db.database import get_tasks_by_project, get_brief, get_tokens_used, get_db

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
    generation_mode: Optional[str] = "agent"
    brief: Optional[str] = ""
    suggested_price: Optional[float] = 0
    final_price: Optional[float] = 0
    form_status: Optional[str] = ""
    client_phone: Optional[str] = ""

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


@router.patch("/{project_id}")
async def patch_project(project_id: int, data: dict):
    """Mettre à jour les métadonnées d'un projet (slug, is_client, deploy_url, etc.)."""
    db = await get_db()
    try:
        allowed = {"slug", "is_client", "client_name", "client_email", "client_phone",
                   "deploy_url", "status", "progress", "notes", "generation_mode",
                   "suggested_price", "final_price", "description", "objective"}
        fields = {k: v for k, v in data.items() if k in allowed}
        if not fields:
            raise HTTPException(400, "Aucun champ valide à mettre à jour.")
        from datetime import datetime
        fields["updated_at"] = datetime.now().isoformat()
        set_clause = ", ".join(f"{k} = ?" for k in fields)
        await db.execute(
            f"UPDATE projects SET {set_clause} WHERE id = ?",
            list(fields.values()) + [project_id]
        )
        await db.commit()
        cursor = await db.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        row = await cursor.fetchone()
        return dict(row) if row else {}
    finally:
        await db.close()


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

    # Sauvegarder l'objectif et le mode de génération
    await project_manager.update(project_id, objective=data.objective, generation_mode="agent")

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


@router.post("/{project_id}/generate-claude-prompt")
async def generate_claude_prompt(project_id: int):
    """Génère un prompt prêt à coller dans Claude Code VS Code."""
    import json as _json
    from datetime import datetime, timezone

    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Projet non trouvé")
        project = dict(row)
    finally:
        await db.close()

    brief = {}
    if project.get("brief"):
        try:
            brief = _json.loads(project["brief"])
        except Exception:
            pass

    business_name = brief.get("businessName", project.get("name", ""))
    sector = brief.get("sector", "")
    site_type = brief.get("siteType", "standard")
    goal = brief.get("siteGoal", "showcase")
    slug = project.get("slug", "") or business_name.lower().replace(" ", "-")

    prompt = f"""# Génération site — {business_name}

## Contexte
Tu vas générer un site web professionnel pour un client builderz.shop.
Lis d'abord le brief complet avant d'écrire la moindre ligne de code.

## Brief client
- **Nom** : {business_name}
- **Secteur** : {sector}
- **Type de site** : {site_type}
- **Objectif** : {goal}
- **Description** : {brief.get('description', 'Non renseigné')}
- **Cible client** : {brief.get('targetAudience', 'Non renseigné')}
- **Valeur unique** : {brief.get('uniqueValue', 'Non renseigné')}
- **Style visuel** : {brief.get('visualStyle', 'Professionnel')}
- **Thème** : {brief.get('colorTheme', 'Sombre (noir)')}
- **Couleurs** : {', '.join(brief.get('colors', [])) or 'Palette par défaut'}
- **Pages** : {', '.join(brief.get('pages', ['accueil']))}
- **Fonctionnalités** : {', '.join(brief.get('features', [])) or 'Standard'}
- **Références** : {brief.get('references', 'Aucune')}

## Instructions

1. Lance d'abord :
```bash
python backend/tools/brief_to_claude.py --project-id {project_id}
```
Cela va préparer le workspace `workspace/{slug}/`
avec le bon starter et les tokens CSS générés.

2. Ouvre le workspace dans VS Code :
```bash
code workspace/{slug}/
```

3. Génère le site en suivant `.claude/skills/site-generator.md`

4. Après génération, enregistre dans le dashboard :
```bash
python backend/tools/register_project.py \\
  --slug "{slug}" \\
  --update \\
  --status "ready"
```

## Rappel skills à charger
- `.claude/skills/site-generator.md` — instructions génération
- `.claude/skills/delivery-protocol.md` — protocole livraison
- `.claude/skills/frontend-design.md` — règles qualité visuelle
"""

    db = await get_db()
    try:
        await db.execute(
            "UPDATE projects SET generation_mode = 'manual', updated_at = ? WHERE id = ?",
            (datetime.now(timezone.utc).isoformat(), project_id),
        )
        await db.commit()
    finally:
        await db.close()

    return {"prompt": prompt, "slug": slug}


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


@router.post("/{project_id}/send-payment-link")
async def send_payment_link(project_id: int, request: Request):
    """Envoie le lien de paiement au client. Déclenché par l'admin depuis le dashboard."""
    import json as _json
    from datetime import datetime, timezone
    from backend.db.database import get_db, get_setting

    body = await request.json()
    final_price = body.get("final_price")

    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(404, "Projet non trouvé")
        project = dict(row)
    finally:
        await db.close()

    price_to_charge = float(final_price or project.get("final_price") or project.get("suggested_price") or 390)
    now = datetime.now(timezone.utc).isoformat()

    # Try Stripe if key configured
    payment_url = None
    stripe_key = await get_setting("STRIPE_SECRET_KEY")
    if stripe_key:
        try:
            import stripe
            stripe.api_key = stripe_key
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price_data": {
                        "currency": "eur",
                        "product_data": {
                            "name": f"Site web — {project['name']}",
                            "description": "Création de votre site web professionnel builderz.shop",
                        },
                        "unit_amount": int(price_to_charge * 100),
                    },
                    "quantity": 1,
                }],
                mode="payment",
                success_url=f"https://builderz.shop/success?project={project_id}",
                cancel_url=f"https://builderz.shop/form?canceled=true",
                customer_email=project.get("client_email", ""),
                metadata={"project_id": str(project_id)},
            )
            payment_url = session.url
            db = await get_db()
            try:
                await db.execute(
                    "UPDATE projects SET form_status='payment_sent', stripe_session_id=?, final_price=?, updated_at=? WHERE id=?",
                    (session.id, price_to_charge, now, project_id)
                )
                await db.commit()
            finally:
                await db.close()
        except Exception as e:
            payment_url = None

    if not payment_url:
        # Fallback: just update price and status
        db = await get_db()
        try:
            await db.execute(
                "UPDATE projects SET form_status='payment_sent', final_price=?, updated_at=? WHERE id=?",
                (price_to_charge, now, project_id)
            )
            await db.commit()
        finally:
            await db.close()

    return {
        "success": True,
        "payment_url": payment_url,
        "amount": price_to_charge,
        "message": f"Lien envoyé au client ({project.get('client_email', '')}) — {price_to_charge}€"
    }
