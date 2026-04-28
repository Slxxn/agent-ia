"""
Agent Runner — Boucle principale de l'agent.
Orchestre le cycle complet : planification → exécution → validation → correction.
"""

import asyncio
import os
from typing import Dict, Any, Optional, Callable
from backend.agent.planner import AgentPlanner
from backend.agent.executor import AgentExecutor
from backend.tools.filesystem import FilesystemTool
from backend.tools.terminal import TerminalTool
from backend.tools.llm import LLMTool
from backend.core.project_manager import project_manager, WORKSPACE_ROOT
from backend.core.task_manager import task_manager
from backend.db.database import add_log, update_project

MAX_RETRIES = 3


class AgentRunner:
    """
    Runner principal de l'agent.
    Gère le cycle de vie complet d'un projet :
    1. Recevoir l'objectif
    2. Générer le plan
    3. Découper en tâches
    4. Exécuter tâche par tâche
    5. Valider les résultats
    6. Corriger si erreur (max 3 retries)
    7. Générer le README final
    """

    # Stockage des tâches en cours d'exécution (project_id -> asyncio.Task)
    _running_tasks: Dict[int, asyncio.Task] = {}
    # Signaux de contrôle
    _pause_events: Dict[int, asyncio.Event] = {}
    _stop_flags: Dict[int, bool] = {}

    @classmethod
    async def start_project(cls, project_id: int, objective: str) -> Dict[str, Any]:
        """Démarrer l'exécution d'un projet."""
        # Vérifier que le projet existe
        project = await project_manager.get(project_id)
        if not project:
            return {"success": False, "error": "Projet non trouvé."}

        # Vérifier qu'il n'est pas déjà en cours
        if project_id in cls._running_tasks and not cls._running_tasks[project_id].done():
            return {"success": False, "error": "Le projet est déjà en cours d'exécution."}

        # Initialiser les contrôles
        cls._pause_events[project_id] = asyncio.Event()
        cls._pause_events[project_id].set()  # Non pausé par défaut
        cls._stop_flags[project_id] = False

        # Réinitialiser la progression (important pour les redémarrages)
        await project_manager.update_progress(project_id, 0.0)

        # Lancer l'exécution en arrière-plan
        task = asyncio.create_task(cls._run(project_id, objective))
        cls._running_tasks[project_id] = task

        await project_manager.update_status(project_id, "running")
        await add_log(project_id, f"Projet démarré avec l'objectif : {objective}", "info")

        return {"success": True, "message": "Projet démarré."}

    @classmethod
    async def stop_project(cls, project_id: int) -> Dict[str, Any]:
        """Arrêter l'exécution d'un projet."""
        cls._stop_flags[project_id] = True
        # Débloquer si en pause
        if project_id in cls._pause_events:
            cls._pause_events[project_id].set()

        if project_id in cls._running_tasks:
            task = cls._running_tasks[project_id]
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass

        await project_manager.update_status(project_id, "idle")
        await add_log(project_id, "Projet arrêté par l'utilisateur.", "info")
        return {"success": True, "message": "Projet arrêté."}

    @classmethod
    async def pause_project(cls, project_id: int) -> Dict[str, Any]:
        """Mettre en pause l'exécution d'un projet."""
        if project_id in cls._pause_events:
            cls._pause_events[project_id].clear()
            await project_manager.update_status(project_id, "paused")
            await add_log(project_id, "Projet mis en pause.", "info")
            return {"success": True, "message": "Projet mis en pause."}
        return {"success": False, "error": "Projet non trouvé en exécution."}

    @classmethod
    async def resume_project(cls, project_id: int) -> Dict[str, Any]:
        """Reprendre l'exécution d'un projet en pause."""
        if project_id in cls._pause_events:
            cls._pause_events[project_id].set()
            await project_manager.update_status(project_id, "running")
            await add_log(project_id, "Projet repris.", "info")
            return {"success": True, "message": "Projet repris."}
        return {"success": False, "error": "Projet non trouvé en pause."}

    @classmethod
    async def handle_chat_message(cls, project_id: int, message: str) -> bool:
        """Traite un message envoyé via le chatbot."""
        await add_log(project_id, f"💬 Message reçu : {message}", "info")
        await add_log(project_id, "🤖 Analyse de votre demande en cours...", "debug")
        
        workspace_path = await project_manager.get_workspace_path(project_id)
        if not workspace_path:
            return False
            
        filesystem = FilesystemTool(workspace_path)
        terminal = TerminalTool(workspace_path)
        llm = LLMTool()
        executor = AgentExecutor(filesystem, terminal, llm)
        
        project = await project_manager.get(project_id)
        project_name = project["name"] if project else "projet"
        
        # Construire le contexte pour la modification
        context = f"Projet : {project_name}\n"
        tree = filesystem.get_tree()
        if tree:
            context += f"Fichiers existants :\n{tree}\n"
            
        # Exécuter la modification comme une nouvelle tâche "à la volée"
        await add_log(project_id, f"Exécution de la modification : {message}", "info")
        result = await executor.execute_task(
            project_id=project_id,
            task_description=f"Modification demandée par l'utilisateur : {message}",
            steps=["Analyser la demande", "Modifier les fichiers nécessaires", "Vérifier le résultat"],
            context=context
        )
        
        if result.get("success"):
            await add_log(project_id, "Modification terminée avec succès.", "info")
        else:
            await add_log(project_id, f"Échec de la modification : {result.get('error', 'Erreur inconnue')}", "error")

        # Si le projet était en pause, on le relance automatiquement
        if cls.get_status(project_id) == "paused":
            await cls.resume_project(project_id)
        # NOTE : on ne relance PAS un cycle complet si le projet est done/error.
        # La modification directe via execute_task est suffisante.
        # Relancer start_project causerait une régénération complète non souhaitée.

        return True

    @classmethod
    async def _run(cls, project_id: int, objective: str):
        """Boucle principale d'exécution de l'agent."""
        try:
            # Obtenir le workspace
            workspace_path = await project_manager.get_workspace_path(project_id)
            if not workspace_path:
                await add_log(project_id, "Erreur : workspace non trouvé.", "error")
                await project_manager.update_status(project_id, "error")
                return

            os.makedirs(workspace_path, exist_ok=True)

            # Initialiser les tools
            filesystem = FilesystemTool(workspace_path)
            terminal = TerminalTool(workspace_path)
            llm = LLMTool()

            # Initialiser le planner et l'executor
            planner = AgentPlanner(llm)
            executor = AgentExecutor(filesystem, terminal, llm)

            # ── ÉTAPE 1 : Planification ──
            await add_log(project_id, "═══ PHASE 1 : PLANIFICATION ═══", "info")
            await cls._check_controls(project_id)

            plan = await planner.generate_plan(project_id, objective)
            if not plan:
                await add_log(project_id, "Erreur : impossible de générer un plan.", "error")
                await project_manager.update_status(project_id, "error")
                return

            # ── ÉTAPE 2 : Création des tâches ──
            await add_log(project_id, "═══ PHASE 2 : CRÉATION DES TÂCHES ═══", "info")
            task_ids = []
            for i, task_def in enumerate(plan):
                task = await task_manager.create(
                    project_id=project_id,
                    description=task_def["description"],
                    steps=task_def.get("steps", [])
                )
                task_ids.append(task["id"])
                await add_log(project_id, f"Tâche {i+1}/{len(plan)} créée : {task_def['description']}", "info")

            total_tasks = len(task_ids)

            # --- Nouveau : Check des variables d'environnement ---
            env_example = os.path.join(workspace_path, ".env.example")
            env_real = os.path.join(workspace_path, ".env")

            if os.path.exists(env_example) and not os.path.exists(env_real):
                await add_log(project_id, "⚠️ Configuration requise : Des variables d'environnement ont été détectées.", "warning")
                await add_log(project_id, "Veuillez les remplir dans l'onglet 'Variables' puis cliquez sur 'Reprendre'.", "info")
                
                # On met le projet en pause
                await cls.pause_project(project_id)
                
                # On attend que l'utilisateur clique sur "Reprendre"
                while True:
                    project_state = await project_manager.get(project_id)
                    if project_state and project_state.get("status") != "paused":
                        break
                    await asyncio.sleep(1)
            
            # ── ÉTAPE 3 : Exécution tâche par tâche ──
            await add_log(project_id, "═══ PHASE 3 : EXÉCUTION ═══", "info")
            project = await project_manager.get(project_id)
            project_name = project["name"] if project else "projet"

            for i, task_id in enumerate(task_ids):
                await cls._check_controls(project_id)

                task = await task_manager.get(task_id)
                if not task:
                    continue

                await add_log(
                    project_id,
                    f"──── Tâche {i+1}/{total_tasks} : {task['description']} ────",
                    "info"
                )

                # Démarrer la tâche
                await task_manager.start(task_id)

                # Exécuter avec retries
                success = False
                for attempt in range(MAX_RETRIES):
                    await cls._check_controls(project_id)

                    if attempt > 0:
                        await add_log(
                            project_id,
                            f"Tentative {attempt + 1}/{MAX_RETRIES} pour la tâche {i+1}",
                            "warning"
                        )

                    # Construire le contexte
                    context = f"Projet : {project_name}\nObjectif : {objective}\n"
                    tree = filesystem.get_tree()
                    if tree:
                        context += f"Fichiers existants :\n{tree}\n"

                    # Exécuter la tâche
                    result = await executor.execute_task(
                        project_id=project_id,
                        task_description=task["description"],
                        steps=task.get("steps", []),
                        context=context
                    )

                    if result.get("success"):
                        await task_manager.complete(task_id, result.get("summary", "OK"))
                        success = True
                        break
                    else:
                        await task_manager.fail(task_id, result.get("error", "Échec"))
                        can_retry = await task_manager.can_retry(task_id)
                        if not can_retry:
                            await add_log(
                                project_id,
                                f"Tâche {i+1} : max retries atteint, passage à la suivante.",
                                "error"
                            )
                            break
                        await asyncio.sleep(1)  # Petit délai avant retry

                # Mettre à jour la progression
                progress = ((i + 1) / total_tasks) * 90  # 90% pour les tâches, 10% pour le README
                await project_manager.update_progress(project_id, progress)

            # ── ÉTAPE 4 : Génération du README ──
            await cls._check_controls(project_id)
            await add_log(project_id, "═══ PHASE 4 : GÉNÉRATION README ═══", "info")
            await executor.generate_readme(project_id, project_name, objective, project_type="")
            await project_manager.update_progress(project_id, 100.0)

            # ── Terminé ──
            await project_manager.update_status(project_id, "done")
            await add_log(project_id, "═══ PROJET TERMINÉ AVEC SUCCÈS ═══", "info")

        except asyncio.CancelledError:
            await add_log(project_id, "Exécution annulée.", "warning")
            await project_manager.update_status(project_id, "idle")
        except Exception as e:
            await add_log(project_id, f"Erreur fatale : {str(e)}", "error")
            await project_manager.update_status(project_id, "error")
        finally:
            # Nettoyage
            cls._running_tasks.pop(project_id, None)
            cls._pause_events.pop(project_id, None)
            cls._stop_flags.pop(project_id, None)

    @classmethod
    async def _check_controls(cls, project_id: int):
        """Vérifier les signaux de contrôle (pause/stop)."""
        # Vérifier le stop
        if cls._stop_flags.get(project_id, False):
            raise asyncio.CancelledError("Arrêt demandé par l'utilisateur.")

        # Attendre si en pause
        if project_id in cls._pause_events:
            await cls._pause_events[project_id].wait()

    @classmethod
    def get_status(cls, project_id: int) -> str:
        """Obtenir le statut d'exécution d'un projet."""
        if project_id in cls._running_tasks:
            task = cls._running_tasks[project_id]
            if not task.done():
                if project_id in cls._pause_events and not cls._pause_events[project_id].is_set():
                    return "paused"
                return "running"
        return "idle"
