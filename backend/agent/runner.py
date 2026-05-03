"""
Agent Runner — Boucle principale de l'agent.
Orchestre le cycle complet : planification → exécution → validation → correction.
"""

import asyncio
import os
import re
from typing import Dict, Any, Optional, Callable
from backend.agent.planner import AgentPlanner
from backend.agent.executor import AgentExecutor
from backend.agent.project_brain import ProjectBrain
from backend.agent.build_validator import BuildValidator
from backend.agent.visual_validator import VisualValidator
from backend.agent.validator import NarrativeValidator
from backend.agent.static_post_processor import StaticPostProcessor
from backend.tools.filesystem import FilesystemTool
from backend.tools.terminal import TerminalTool
from backend.tools.llm import LLMTool, set_budget_mode, set_gemini_key
from backend.core.project_manager import project_manager, WORKSPACE_ROOT
from backend.core.task_manager import task_manager
from backend.db.database import add_log, update_project, get_brief, get_tokens_used, get_setting

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
        """Traite un message envoyé via le chatbot (non-bloquant)."""
        await add_log(project_id, f"💬 Message reçu : {message}", "info")
        asyncio.create_task(cls._run_chat_task(project_id, message))
        return True

    @classmethod
    async def _run_chat_task(cls, project_id: int, message: str):
        """Exécute la modification demandée en arrière-plan."""
        await add_log(project_id, "🤖 Analyse de votre demande en cours...", "debug")

        workspace_path = await project_manager.get_workspace_path(project_id)
        if not workspace_path:
            await add_log(project_id, "Erreur : workspace introuvable.", "error")
            return

        filesystem = FilesystemTool(workspace_path)
        terminal = TerminalTool(workspace_path)
        llm = LLMTool()
        brain = ProjectBrain(project_id, workspace_path)
        executor = AgentExecutor(filesystem, terminal, llm, brain=brain)

        project = await project_manager.get(project_id)
        project_name = project["name"] if project else "projet"

        brain_ctx = brain.get_context()
        context = f"Projet : {project_name}\n"
        if brain_ctx:
            context += f"\n## État du projet:\n{brain_ctx}\n"

        try:
            from backend.agent.project_memory import ProjectMemory
            memory = ProjectMemory.load(workspace_path)
            if memory:
                context += f"\n{ProjectMemory.to_context(memory)}\n"
        except Exception:
            pass

        tree = filesystem.get_tree()
        if tree:
            context += f"Fichiers existants :\n{tree}\n"

        await add_log(project_id, f"Exécution de la modification : {message}", "info")
        result = await executor.execute_task(
            project_id=project_id,
            task_description=f"Modification demandée par l'utilisateur : {message}",
            steps=["Analyser la demande", "Modifier les fichiers nécessaires", "Vérifier le résultat"],
            context=context,
        )

        if result.get("success"):
            await add_log(project_id, "✅ Modification terminée avec succès.", "info")
        else:
            await add_log(project_id, f"❌ Échec de la modification : {result.get('error', 'Erreur inconnue')}", "error")

        if cls.get_status(project_id) == "paused":
            await cls.resume_project(project_id)

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

            # Charger les réglages DB et les appliquer au module LLM
            _gemini_key = await get_setting("GEMINI_API_KEY")
            if _gemini_key:
                set_gemini_key(_gemini_key)
            _budget_mode = await get_setting("LLM_BUDGET_MODE")
            if _budget_mode:
                set_budget_mode(_budget_mode)

            # Initialiser les tools
            filesystem = FilesystemTool(workspace_path)
            terminal = TerminalTool(workspace_path)
            llm = LLMTool()

            # Initialiser le Project Brain (compréhension persistante du projet)
            brain = ProjectBrain(project_id, workspace_path)

            # Initialiser le planner et l'executor
            planner = AgentPlanner(llm)
            executor = AgentExecutor(filesystem, terminal, llm, brain=brain)

            # ── ÉTAPE 1 : Planification ──
            await add_log(project_id, "═══ PHASE 1 : PLANIFICATION ═══", "info")
            await cls._check_controls(project_id)

            # Structuration Gemini du brief brut → spec technique
            await add_log(project_id, "Structuration du brief en cours…", "debug")
            structured = await llm.structure_brief(objective)
            if structured and structured != objective:
                await add_log(project_id, "Brief structuré par Gemini Flash.", "info")
                planning_objective = f"{objective}\n\n## Spec technique (générée automatiquement)\n{structured}"
            else:
                planning_objective = objective

            # Enrichir l'objectif avec le brief si déjà généré via /brief
            saved_brief = await get_brief(project_id)
            planning_objective_base = planning_objective
            if saved_brief:
                palette = saved_brief.get("palette", {})
                fonts = saved_brief.get("fonts", {})
                brand = saved_brief.get("brand_details", {})
                narrative = saved_brief.get("project_type", "")
                integrations = saved_brief.get("integrations_required", [])
                planning_objective = (
                    planning_objective_base
                    + f"\n\nDESIGN BRIEF:\n- Palette: {palette.get('name', '')} ({palette.get('mood', '')})"
                    + f"\n- Fonts: {fonts.get('display', '')}/{fonts.get('body', '')}"
                    + f"\n- Narrative: {narrative}"
                    + f"\n- Brand: {brand.get('name', '')}"
                )
                if integrations:
                    planning_objective += f"\n- Intégrations: {', '.join(integrations)}"
                await add_log(project_id, f"📋 Brief chargé — {palette.get('name', '')} / {fonts.get('display', '')}", "info")

            plan = await planner.generate_plan(project_id, planning_objective)
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

            # ── ÉTAPE 2b : Enrichissement Gemini ──
            await add_log(project_id, "═══ PHASE 2b : ENRICHISSEMENT GEMINI ═══", "info")

            # Vérification des tâches manquantes
            try:
                missing = await llm.check_missing_tasks(planning_objective, plan)
                if missing and missing.strip():
                    await add_log(project_id, f"Analyse plan Gemini : {missing}", "debug")
            except Exception:
                pass

            # Génération du copywriting
            _sector = ""
            _brand = ""
            if saved_brief:
                _sector = saved_brief.get("project_type", "")
                _brand = saved_brief.get("brand_details", {}).get("name", "")
            try:
                copywriting = await llm.generate_copywriting(planning_objective, sector=_sector, brand_name=_brand)
                if copywriting and copywriting.strip():
                    executor._gemini_copywriting = copywriting
                    await add_log(project_id, "Copywriting Gemini généré.", "info")
            except Exception:
                pass

            # Génération des mots-clés images Unsplash
            try:
                image_keywords = await llm.generate_image_keywords(planning_objective, sector=_sector)
                if image_keywords:
                    from backend.tools.unsplash import unsplash
                    image_map = await unsplash.get_image_map(image_keywords, project_id)
                    if image_map:
                        executor._image_map = image_map
                        await add_log(project_id, f"Images Unsplash récupérées : {len(image_map)} visuels.", "info")
            except Exception:
                pass

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
            
            # ── ÉTAPE 2.9 : Config de base canonique ──
            await cls._write_base_config(workspace_path, project_id)

            # ── ÉTAPE 3 : Exécution tâche par tâche ──
            await add_log(project_id, "═══ PHASE 3 : EXÉCUTION ═══", "info")
            project = await project_manager.get(project_id)
            project_name = project["name"] if project else "projet"

            executor._current_brief = saved_brief
            executor._current_phase = 3

            i = 0
            while i < len(task_ids):
                await cls._check_controls(project_id)

                task = await task_manager.get(task_ids[i])
                if not task:
                    i += 1
                    continue

                # ── Détection batch parallèle ──────────────────────────────
                # Si cette tâche + les suivantes sont des sections indépendantes,
                # on fire leurs LLM calls en parallèle (3x plus rapide)
                parallel_batch: list[tuple[int, int, dict]] = []
                if cls._is_parallelizable(task["description"]):
                    parallel_batch = [(i, task_ids[i], task)]
                    j = i + 1
                    while j < len(task_ids) and len(parallel_batch) < 3:
                        next_task = await task_manager.get(task_ids[j])
                        if next_task and cls._is_parallelizable(next_task["description"]):
                            parallel_batch.append((j, task_ids[j], next_task))
                            j += 1
                        else:
                            break

                if len(parallel_batch) >= 2:
                    # Build shared context at batch start
                    batch_ctx = f"Projet : {project_name}\nObjectif : {objective}\n"
                    tree = filesystem.get_tree()
                    if tree:
                        batch_ctx += f"Fichiers existants :\n{tree}\n"

                    await add_log(project_id, f"⚡ LLM parallèle : {len(parallel_batch)} tâches simultanées", "info")

                    # Fire all LLM calls simultaneously
                    prefetched = await asyncio.gather(*[
                        executor.prefetch_llm_response(project_id, t["description"], batch_ctx)
                        for _, _, t in parallel_batch
                    ], return_exceptions=True)

                    # Process results sequentially (file writes + brain updates)
                    for (idx, tid, btask), actions in zip(parallel_batch, prefetched):
                        await add_log(project_id, f"──── Tâche {idx+1}/{total_tasks} : {btask['description']} ────", "info")
                        await task_manager.start(tid)
                        if isinstance(actions, Exception) or not actions:
                            await add_log(project_id, f"⚠️ Prefetch échoué pour tâche {idx+1}, fallback séquentiel.", "warning")
                            ctx = f"Projet : {project_name}\nObjectif : {objective}\n"
                            if tree:
                                ctx += f"Fichiers existants :\n{tree}\n"
                            fallback = await executor.execute_task(project_id=project_id, task_description=btask["description"], steps=btask.get("steps", []), context=ctx)
                            if fallback.get("success"):
                                await task_manager.complete(tid, fallback.get("summary", "OK"))
                            else:
                                await task_manager.fail(tid, fallback.get("error", "Échec"))
                        else:
                            success_count = 0
                            for action in actions:
                                r = await executor._execute_action(project_id, action)
                                if r.get("success"):
                                    success_count += 1
                            if success_count >= len(actions) * 0.7:
                                await task_manager.complete(tid, f"{success_count}/{len(actions)} actions OK")
                                await add_log(project_id, f"✅ Tâche {idx+1} terminée ({success_count}/{len(actions)}).", "info")
                            else:
                                await task_manager.fail(tid, "Trop d'actions échouées")
                        progress = ((idx + 1) / total_tasks) * 90
                        await project_manager.update_progress(project_id, progress)

                    i += len(parallel_batch)
                    continue

                # ── Exécution séquentielle normale ─────────────────────────
                await add_log(
                    project_id,
                    f"──── Tâche {i+1}/{total_tasks} : {task['description']} ────",
                    "info"
                )

                # Démarrer la tâche
                await task_manager.start(task_ids[i])

                # Exécuter avec retries
                success = False
                previous_error: str | None = None
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

                    # Callback de progression par action dans la tâche
                    task_start_pct = (i / total_tasks) * 90
                    task_range_pct = 90 / total_tasks

                    async def on_task_progress(fraction: float, _s=task_start_pct, _r=task_range_pct):
                        await project_manager.update_progress(project_id, _s + fraction * _r)

                    # Enrichir la description avec l'erreur précédente si retry
                    task_desc = task["description"]
                    if attempt > 0 and previous_error:
                        task_desc = (
                            f"{task['description']}\n\n"
                            f"⚠️ TENTATIVE {attempt+1} — La tentative précédente a échoué :\n"
                            f"{previous_error}\n"
                            f"Identifie et corrige la cause racine. Ne répète pas la même erreur."
                        )

                    # Exécuter la tâche
                    result = await executor.execute_task(
                        project_id=project_id,
                        task_description=task_desc,
                        steps=task.get("steps", []),
                        context=context,
                        on_progress=on_task_progress,
                    )

                    if result.get("success"):
                        await task_manager.complete(task_ids[i], result.get("summary", "OK"))
                        success = True
                        break
                    else:
                        previous_error = (result.get("error") or result.get("summary") or "Échec inconnu")[:600]
                        await task_manager.fail(task_ids[i], result.get("error", "Échec"))
                        can_retry = await task_manager.can_retry(task_ids[i])
                        if not can_retry:
                            await add_log(
                                project_id,
                                f"Tâche {i+1} : max retries atteint, passage à la suivante.",
                                "error"
                            )
                            break
                        await asyncio.sleep(1)

                # Mettre à jour la progression
                progress = ((i + 1) / total_tasks) * 90
                await project_manager.update_progress(project_id, progress)
                i += 1

            # ── ÉTAPE 3.4 : Post-traitement statique (fix patterns récurrents) ──
            await cls._check_controls(project_id)
            # Extract logo URL from objective if provided by CRM form
            _logo_match = re.search(r'Logo image URL:\s*(https?://\S+)', objective)
            _logo_url = _logo_match.group(1).rstrip('.,)') if _logo_match else ""
            post_processor = StaticPostProcessor(workspace_path, logo_url=_logo_url)
            await post_processor.run(project_id)

            # ── ÉTAPE 3.45 : Réparation des fichiers avec erreurs syntaxiques ──
            await cls._check_controls(project_id)
            if executor._syntax_issues:
                await add_log(
                    project_id,
                    f"🔧 {len(executor._syntax_issues)} fichier(s) signalé(s) pour réparation syntaxique...",
                    "info",
                )
                for file_path, issues in list(executor._syntax_issues.items()):
                    read_r = filesystem.read_file(file_path)
                    if not read_r.get("success"):
                        continue
                    content = read_r.get("content", "")
                    repaired = await executor._repair_file(project_id, file_path, content, issues)
                    if repaired and repaired.strip() != content.strip():
                        filesystem.create_file(file_path, repaired)
                        await add_log(project_id, f"✅ '{file_path}' réparé.", "info")
                executor._syntax_issues.clear()

            # ── ÉTAPE 3.5 : npm install autonome ──
            await cls._check_controls(project_id)
            pkg_dir = cls._find_pkg_dir(workspace_path)
            if pkg_dir:
                await add_log(project_id, f"📦 Installation des dépendances npm...", "info")
                npm_t = TerminalTool(pkg_dir)
                npm_r = await npm_t.run_npm("install", timeout=300)
                if npm_r["success"]:
                    await add_log(project_id, "✅ npm install réussi.", "info")
                else:
                    err = (npm_r.get("stderr", "") or npm_r.get("stdout", "") or "aucune sortie")[:300]
                    await add_log(project_id, f"⚠️ npm install : {err}", "warning")
                # Si les fichiers sont dans un sous-dossier, recentrer le workspace
                if pkg_dir != workspace_path:
                    await add_log(project_id, f"📁 Workspace recentré : {os.path.basename(pkg_dir)}/", "info")
                    workspace_path = pkg_dir
                    filesystem = FilesystemTool(workspace_path)
                    terminal = TerminalTool(workspace_path)
                    brain = ProjectBrain(project_id, workspace_path)
                    executor = AgentExecutor(filesystem, terminal, llm, brain=brain)
                    executor._current_brief = saved_brief

            # ── ÉTAPE 3.6 : Validation narrative ──
            await cls._check_controls(project_id)
            narrative_validator = NarrativeValidator(executor=executor)
            await narrative_validator.run_validation(project_id, workspace_path)

            # ── ÉTAPE 4 : Validation build autonome ──
            executor._current_phase = 4
            await cls._check_controls(project_id)
            pkg_json = os.path.join(workspace_path, "package.json")
            if os.path.exists(pkg_json):
                await add_log(project_id, "═══ PHASE 4 : VALIDATION BUILD ═══", "info")
                await project_manager.update_progress(project_id, 91.0)
                validator = BuildValidator(llm, terminal, filesystem)
                await validator.run_and_fix_loop(project_id, workspace_path, max_attempts=2)
                await project_manager.update_progress(project_id, 96.0)

            # ── ÉTAPE 4.5 : Validation visuelle ──
            if os.path.exists(pkg_json):
                await cls._check_controls(project_id)
                visual_validator = VisualValidator(executor=executor)
                await visual_validator.run_validation_loop(project_id, workspace_path)
                await project_manager.update_progress(project_id, 97.0)

            # ── ÉTAPE 5 : Génération du README ──
            await cls._check_controls(project_id)
            await add_log(project_id, "═══ PHASE 5 : GÉNÉRATION README ═══", "info")
            await executor.generate_readme(project_id, project_name, objective, project_type="")
            await project_manager.update_progress(project_id, 100.0)

            # ── ÉTAPE 6 : Déploiement Firebase ──
            await cls._check_controls(project_id)
            deploy_url = await cls._deploy_firebase(project_id, workspace_path)
            if deploy_url:
                await update_project(project_id, deploy_url=deploy_url)

            # ── Snapshot mémoire projet ──
            try:
                from backend.agent.project_memory import ProjectMemory
                all_tasks = [await task_manager.get(tid) for tid in task_ids]
                await ProjectMemory.save(
                    project_id,
                    workspace_path,
                    objective=objective,
                    project_name=project_name,
                    brief=saved_brief,
                    executor=executor,
                    build_success=True,
                    build_attempts=2,
                    deploy_url=deploy_url or "",
                    tasks=[t for t in all_tasks if t],
                    phase="complete",
                )
            except Exception:
                pass

            # ── Terminé ──
            total_tokens = await get_tokens_used(project_id)
            await project_manager.update_status(project_id, "done")
            await add_log(project_id, f"═══ PROJET TERMINÉ — {total_tokens:,} tokens consommés ═══", "info")

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
    async def _firebase_cmd(cls, t: "TerminalTool", *args, timeout: int = 120) -> dict:
        """Run firebase-tools via global install (preferred) or npx, clearing npx cache on failure."""
        import shutil as _shutil, asyncio as _asyncio

        # Prefer globally installed firebase to avoid npx cache corruption
        fb_bin = _shutil.which("firebase")
        if fb_bin:
            import shlex as _shlex
            cmd = _shlex.join([fb_bin, *args])
            return await t.run_command(cmd, timeout=timeout)

        # Use npx but wipe the cache dir first to avoid ENOTEMPTY errors
        npx_cache = os.path.expanduser("~/.npm/_npx")
        if os.path.isdir(npx_cache):
            try:
                import shutil as _sh
                _sh.rmtree(npx_cache, ignore_errors=True)
            except Exception:
                pass

        return await t.run_npx("--yes", "firebase-tools", *args, timeout=timeout)

    @classmethod
    async def _deploy_firebase(cls, project_id: int, workspace_path: str) -> str | None:
        """Build + deploy vers Firebase Hosting. Retourne l'URL publique ou None."""
        import re as _re
        import json as _json

        token      = await get_setting("FIREBASE_TOKEN")
        project_fb = await get_setting("FIREBASE_PROJECT_ID")

        if not token or not project_fb:
            await add_log(project_id, "⏭ Déploiement Firebase ignoré (FIREBASE_TOKEN / FIREBASE_PROJECT_ID non configurés).", "info")
            return None

        await add_log(project_id, "═══ PHASE 6 : DÉPLOIEMENT FIREBASE ═══", "info")
        t = TerminalTool(workspace_path)

        # Dériver un site ID unique par projet : "<project_fb>-p<project_id>"
        # Firebase site IDs: lowercase alphanum + hyphens, max 30 chars
        site_id = f"{project_fb}-p{project_id}"
        site_id = _re.sub(r'[^a-z0-9-]', '-', site_id.lower())[:30].rstrip('-')

        # Créer le site Firebase — vérifier si déjà existant via la sortie
        create_r = await cls._firebase_cmd(
            t, "hosting:sites:create", site_id,
            "--project", project_fb,
            "--token", token,
            "--non-interactive",
            timeout=90,
        )
        out_create = (create_r.get("stdout", "") + create_r.get("stderr", "")).lower()
        site_ready = (
            create_r["success"]
            or "already exists" in out_create
            or "already in use" in out_create
            or site_id in out_create
        )
        if not site_ready:
            await add_log(project_id, f"❌ Impossible de créer le site Firebase '{site_id}' — déploiement annulé.", "error")
            return None
        await add_log(project_id, f"✅ Site Firebase '{site_id}' prêt.", "info")

        # Générer firebase.json (toujours écraser pour garantir le bon site_id)
        firebase_json_path = os.path.join(workspace_path, "firebase.json")
        config = {
            "hosting": {
                "site": site_id,
                "public": "dist",
                "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
                "rewrites": [{"source": "**", "destination": "/index.html"}]
            }
        }
        with open(firebase_json_path, "w") as f:
            _json.dump(config, f, indent=2)

        # Générer .firebaserc (toujours écraser)
        firebaserc_path = os.path.join(workspace_path, ".firebaserc")
        with open(firebaserc_path, "w") as f:
            _json.dump({"projects": {"default": project_fb}}, f, indent=2)

        # npm run build
        await add_log(project_id, "🔨 Build de production (npm run build)...", "info")
        build_r = await t.run_npm("run", "build", timeout=300)
        if not build_r["success"]:
            err = (build_r.get("stderr", "") or build_r.get("stdout", ""))[:400]
            await add_log(project_id, f"❌ Build échoué — déploiement annulé : {err}", "error")
            return None
        await add_log(project_id, "✅ Build réussi.", "info")

        # firebase deploy
        await add_log(project_id, "🚀 Déploiement vers Firebase Hosting...", "info")
        deploy_r = await cls._firebase_cmd(
            t, "deploy",
            "--only", "hosting",
            "--token", token,
            "--project", project_fb,
            "--non-interactive",
            timeout=300,
        )
        if not deploy_r["success"] and "401" in (deploy_r.get("stdout", "") + deploy_r.get("stderr", "")):
            await add_log(project_id, "⚠️ Token expiré, tentative sans token...", "warning")
            deploy_r = await cls._firebase_cmd(
                t, "deploy",
                "--only", "hosting",
                "--project", project_fb,
                "--non-interactive",
                timeout=300,
            )
        output = (deploy_r.get("stdout", "") + "\n" + deploy_r.get("stderr", "")).strip()

        # Extraire l'URL depuis la sortie
        match = _re.search(r'Hosting URL:\s*(https://\S+)', output)
        if match:
            url = match.group(1).rstrip("/")
            await add_log(project_id, f"🌐 Projet en ligne : {url}", "info")
            return url

        if deploy_r["success"]:
            # Deploy ok mais URL non parsée — construire l'URL standard
            url = f"https://{site_id}.web.app"
            await add_log(project_id, f"🌐 Déploiement réussi : {url}", "info")
            return url

        err = output[:400]
        await add_log(project_id, f"❌ Déploiement échoué : {err}", "error")
        return None

    @staticmethod
    def _is_parallelizable(description: str) -> bool:
        """True if this task generates standalone section components with no cross-task file deps."""
        d = description.lower()
        structural = [
            'package.json', 'tsconfig', 'vite.config', 'postcss', 'globals.css',
            'design system', 'tailwind', 'src/types', 'types/index', 'cartstore',
            'cart store', 'store panier', 'cartcontext', 'authcontext', 'app.tsx',
            'main.tsx', 'assembly', 'assemblage', 'layout', 'navbar', 'footer',
            'install', 'npm', 'readme', 'firebase', 'stripe', 'checkout',
        ]
        if any(s in d for s in structural):
            return False
        parallelizable = [
            'hero', 'features', 'feature grid', 'testimonial', 'pricing',
            'faq', 'how it works', 'problem', 'solution', 'cta', 'about',
            'logos', 'social proof', 'gallery', 'newsletter', 'team',
            'product card', 'product grid', 'filter', 'category',
        ]
        return any(p in d for p in parallelizable)

    @classmethod
    async def _write_base_config(cls, workspace_path: str, project_id: int) -> None:
        """Pre-write canonical config files before Phase 3 so the LLM starts from a clean base."""
        tpl_dir = os.path.join(os.path.dirname(__file__), "..", "templates", "react-vite")
        tpl_dir = os.path.normpath(tpl_dir)
        if not os.path.isdir(tpl_dir):
            return
        files = [
            "tsconfig.json", "tsconfig.node.json", "vite.config.ts",
            "postcss.config.js", "src/vite-env.d.ts",
        ]
        written = []
        for rel in files:
            src = os.path.join(tpl_dir, rel)
            dst = os.path.join(workspace_path, rel)
            if not os.path.exists(src):
                continue
            if not os.path.exists(dst):
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                import shutil as _shutil
                _shutil.copy2(src, dst)
                written.append(rel)
        if written:
            await add_log(project_id, f"📋 Config de base : {', '.join(written)}", "debug")

    @staticmethod
    def _find_pkg_dir(workspace_path: str) -> str | None:
        """Trouver le dossier contenant package.json (racine ou un niveau en dessous)."""
        if os.path.exists(os.path.join(workspace_path, "package.json")):
            return workspace_path
        try:
            for item in os.listdir(workspace_path):
                sub = os.path.join(workspace_path, item)
                if os.path.isdir(sub) and os.path.exists(os.path.join(sub, "package.json")):
                    return sub
        except OSError:
            pass
        return None

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
