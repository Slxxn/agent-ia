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
from backend.agent.video_generator import generate_videos_for_project
from backend.agent.assembler import Assembler
from backend.tools.filesystem import FilesystemTool
from backend.tools.terminal import TerminalTool
from backend.tools.llm import LLMTool, set_budget_mode, set_gemini_key, set_anthropic_key
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
                # Restore design system so critique pass works on chat edits too
                ds = memory.get("design_system")
                if ds and not getattr(executor, "_design_system", None):
                    executor._design_system = ds
                if memory.get("is_3d") and not getattr(executor, "_is_3d", False):
                    executor._is_3d = True
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
    async def _quality_generate_homepage(
        cls,
        project_id: int,
        workspace_path: str,
        site_spec: dict,
        design_system: dict | None,
        llm: "LLMTool",
    ) -> None:
        """Quality mode: Claude generates homepage + any page with unknown blocks.
        Standard assembler handles all other pages.
        """
        from backend.agent.assembler import BLOCK_IMPORTS as _KNOWN_BLOCKS

        pages = site_spec.get("pages", [])
        if not pages:
            return

        assembler = Assembler(workspace_path)

        def _needs_claude(page: dict, is_home: bool) -> bool:
            if is_home:
                return True
            # Pages whose blocks are all unknown to the assembler (would render empty)
            page_blocks = [b.get("block", "") for b in page.get("blocks", [])]
            return bool(page_blocks) and all(b not in _KNOWN_BLOCKS for b in page_blocks)

        claude_pages = [p for i, p in enumerate(pages) if _needs_claude(p, i == 0)]
        assembler_pages = [p for i, p in enumerate(pages) if not _needs_claude(p, i == 0)]

        if assembler_pages:
            await add_log(project_id, f"📄 Assemblage standard : {len(assembler_pages)} page(s)", "info")
            for page in assembler_pages:
                assembler._write_page(page)

        palette = (design_system or {}).get("palette", {})
        fonts   = (design_system or {}).get("fonts", {})
        brand   = site_spec.get("brand", {})
        tokens  = palette.get("tokens", {})

        shared_ctx = (
            f"## DESIGN SYSTEM\n"
            f"Palette : {palette.get('name', '')} | "
            f"primary={tokens.get('--primary','?')} bg={tokens.get('--bg','?')} surface={tokens.get('--surface','?')}\n"
            f"Fonts : display={fonts.get('display', '')}, body={fonts.get('body', '')}\n"
            f"Brand : {brand.get('name', '')} — {brand.get('tagline', '')}\n\n"
            f"CSS VARIABLES : var(--primary) var(--accent) var(--bg) var(--surface) var(--text)\n"
            f"import {{ SITE_CONFIG }} from '@/siteConfig';\n"
        )

        fs = FilesystemTool(workspace_path)
        term = TerminalTool(workspace_path)
        executor = AgentExecutor(fs, term, llm)
        executor._design_system = design_system

        for idx, page in enumerate(claude_pages):
            page_name = page.get("name", page.get("file", "Page"))
            page_file = page.get("file", "Page")
            page_path = page.get("path", "/")
            blocks    = page.get("blocks", [])

            section_lines = []
            for b in blocks[:5]:
                bname    = b.get("block", "")
                props    = b.get("props", {})
                headline = props.get("headline", props.get("title", props.get("heading", "")))
                subtitle = props.get("subtitle", props.get("description", ""))
                line = bname
                if headline: line += f' — "{headline}"'
                if subtitle: line += f' — "{subtitle[:50]}"'
                section_lines.append(f"  - {line}")
            sections_text = "\n".join(section_lines) or "  - (sections libres)"

            is_home = (page.get("path", "") == "/" or idx == 0)
            line_budget = "120" if is_home else "80"

            task_desc = (
                f'Génère src/pages/{page_file}.tsx — "{page_name}" (route : {page_path}).\n\n'
                f"Sections :\n{sections_text}\n\n"
                f"RÈGLES :\n"
                f"- Sections inline Tailwind, PAS d'import @/blocks/\n"
                f"- Variables CSS pour les couleurs\n"
                f"- Framer Motion whileInView pour les entrées\n"
                f"- py-16 lg:py-20 par section, responsive mobile-first\n"
                f"- BUDGET {line_budget} lignes max — code concis\n"
                f"- Default export\n"
            )

            progress = 36.0 + (idx / max(len(claude_pages), 1)) * 16.0
            await project_manager.update_progress(project_id, progress)
            label = "homepage" if is_home else f"page complexe ({page_name})"
            await add_log(project_id, f"✨ Génération Claude : {label}", "info")

            result = await executor.execute_task(
                project_id=project_id,
                task_description=task_desc,
                steps=[f"Générer src/pages/{page_file}.tsx"],
                context=shared_ctx,
            )

            if not result.get("success"):
                await add_log(project_id, f"⚠️ {page_name} : fallback assembler", "warning")
                assembler._write_page(page)

    @classmethod
    async def _run(cls, project_id: int, objective: str):
        """Pipeline principal : design system → spec JSON → assemblage blocs → build → deploy."""
        try:
            workspace_path = await project_manager.get_workspace_path(project_id)
            if not workspace_path:
                await add_log(project_id, "Erreur : workspace non trouvé.", "error")
                await project_manager.update_status(project_id, "error")
                return

            os.makedirs(workspace_path, exist_ok=True)

            _gemini_key = await get_setting("GEMINI_API_KEY")
            if _gemini_key:
                set_gemini_key(_gemini_key)
            _anthropic_key = await get_setting("ANTHROPIC_API_KEY")
            if _anthropic_key:
                set_anthropic_key(_anthropic_key)
            _budget_mode = await get_setting("LLM_BUDGET_MODE")
            if _budget_mode:
                set_budget_mode(_budget_mode)

            llm = LLMTool()
            project = await project_manager.get(project_id)
            project_name = project["name"] if project else "projet"

            # Enrichir avec brief CRM si présent (avant le design system)
            saved_brief = await get_brief(project_id)
            full_objective = objective
            if saved_brief:
                palette = saved_brief.get("palette", {})
                fonts = saved_brief.get("fonts", {})
                brand = saved_brief.get("brand_details", {})
                full_objective = (
                    objective
                    + f"\n\nDESIGN BRIEF:\n- Palette: {palette.get('name','')} ({palette.get('mood','')})"
                    + f"\n- Fonts: {fonts.get('display','')}/{fonts.get('body','')}"
                    + f"\n- Brand: {brand.get('name','')}"
                )
                await add_log(project_id, f"📋 Brief CRM chargé — {palette.get('name','')} / {fonts.get('display','')}", "info")

            # ── PHASE 1 : Design system ──────────────────────────────────
            await add_log(project_id, "═══ PHASE 1 : DESIGN SYSTEM ═══", "info")
            await project_manager.update_progress(project_id, 5.0)
            design_system = None
            try:
                design_system = await llm.generate_design_system(full_objective, project_id=project_id)
                if design_system and design_system.get("palette", {}).get("tokens"):
                    palette_name = design_system.get("palette", {}).get("name", "custom")
                    fonts = design_system.get("fonts", {})
                    await add_log(project_id, f"🎨 {palette_name} | {fonts.get('display','?')}/{fonts.get('body','?')}", "info")
            except Exception as _ds_err:
                await add_log(project_id, f"⚠️ Design system : {_ds_err}", "debug")

            # ── PHASE 2 : Génération du spec JSON ────────────────────────
            await add_log(project_id, "═══ PHASE 2 : GÉNÉRATION DU SPEC ═══", "info")
            await project_manager.update_progress(project_id, 15.0)
            _3d_keywords = ("3d/immersive", "three.js", "react three fiber", "immersive",
                            "webgl", "sitetype: '3d'", "expérience 3d", "site 3d")
            _scroll_keywords = ("scrollytelling", "one page", "onepage", "one-page", "single page",
                                "single-page", "une page", "site scrollytelling", "sitetype: 'scrollytelling'")
            is_3d = any(kw in full_objective.lower() for kw in _3d_keywords)
            is_scrollytelling = any(kw in full_objective.lower() for kw in _scroll_keywords)
            if is_3d:
                await add_log(project_id, "🌐 Mode 3D détecté — blocs Three.js activés.", "info")
            if is_scrollytelling:
                await add_log(project_id, "📜 Mode scrollytelling détecté — site une page.", "info")

            import re as _re_strip
            spec_objective = _re_strip.sub(
                r'## (Absolute Technical Rules|Homepage Structure Rules)[\s\S]*?(?=## |\Z)',
                '', full_objective
            ).strip()
            site_spec = await llm.generate_site_spec(spec_objective, design_system, is_3d=is_3d, is_scrollytelling=is_scrollytelling, project_id=project_id)

            if not site_spec or not site_spec.get("pages"):
                await add_log(project_id, "❌ Spec JSON invalide ou vide.", "error")
                await project_manager.update_status(project_id, "error")
                return

            await add_log(project_id, f"✅ Spec : {len(site_spec['pages'])} pages | thème {site_spec.get('theme',{}).get('primary','')}", "info")

            # ── PHASE 3 : Assemblage ─────────────────────────────────────
            await add_log(project_id, "═══ PHASE 3 : ASSEMBLAGE ═══", "info")
            await project_manager.update_progress(project_id, 35.0)
            assembler = Assembler(workspace_path)
            if _budget_mode == "quality":
                await add_log(project_id, "🎨 Mode qualité — scaffold + homepage Claude + assembler pour les autres pages", "info")
                await assembler.scaffold_only(site_spec, project_id)
                await cls._quality_generate_homepage(project_id, workspace_path, site_spec, design_system, llm)
            else:
                await assembler.run(site_spec, project_id)

            # ── PHASE 3.4 : Génération vidéo HyperFrames ─────────────────
            client_has_videos = bool(project.get("videos") or project.get("video_urls"))
            if not client_has_videos:
                await add_log(project_id, "🎬 Génération des vidéos HyperFrames...", "info")
                try:
                    sector = project.get("sector", "default") or "default"
                    style = project.get("visualStyle") or project.get("style", "moderne")
                    generated_videos = await generate_videos_for_project(
                        project_id=str(project_id),
                        brief=full_objective,
                        sector=sector,
                        style=style,
                        workspace_path=workspace_path,
                    )
                    if generated_videos:
                        await add_log(project_id, f"✅ {len(generated_videos)} vidéo(s) générée(s) : {list(generated_videos.keys())}", "info")
                    else:
                        await add_log(project_id, "⚠️ Génération vidéo échouée — site livré sans vidéos", "warning")
                except Exception as _ve:
                    await add_log(project_id, f"⚠️ Erreur vidéo (non bloquante) : {_ve}", "warning")

            # ── PHASE 3.5 : Post-traitement statique ─────────────────────
            post = StaticPostProcessor(workspace_path)
            await post.run(project_id)

            # ── PHASE 3.5 : Injection .env Firebase ──────────────────────
            cls._write_workspace_env(workspace_path, project_name)
            await add_log(project_id, "🔑 .env Firebase injecté.", "debug")

            # ── PHASE 4 : Installation dépendances ───────────────────────
            await add_log(project_id, "═══ PHASE 4 : NPM INSTALL ═══", "info")
            await project_manager.update_progress(project_id, 55.0)
            t_install = TerminalTool(workspace_path)
            install_r = await t_install.run_command("npm install --legacy-peer-deps", timeout=600)
            if not install_r.get("success"):
                await add_log(project_id, f"⚠️ npm install : {install_r.get('stderr','')[:300]}", "warning")

            # ── PHASE 4.5 : Déploiement Firebase ─────────────────────────
            await project_manager.update_progress(project_id, 75.0)
            deploy_url = await cls._deploy_firebase(project_id, workspace_path)
            if deploy_url:
                await update_project(project_id, deploy_url=deploy_url)

            # ── PHASE 5 : Validation visuelle ────────────────────────────
            await project_manager.update_progress(project_id, 88.0)
            page_paths = [p["path"] for p in site_spec.get("pages", [])] or ["/"]
            _fs = FilesystemTool(workspace_path)
            _term = TerminalTool(workspace_path)
            _executor = AgentExecutor(_fs, _term, llm)
            visual = VisualValidator(executor=_executor)
            try:
                visual_ok = await visual.run_validation_loop(
                    project_id=project_id,
                    workspace_path=workspace_path,
                    deployed_url=deploy_url or None,
                    page_paths=page_paths,
                )
            except Exception as _ve:
                await add_log(project_id, f"⚠️ Validation visuelle ignorée : {_ve or type(_ve).__name__}", "warning")
                visual_ok = True
            # If fixes were applied and site was deployed, rebuild + redeploy
            if not visual_ok and deploy_url:
                await add_log(project_id, "🔄 Corrections appliquées — rebuild et redéploiement...", "info")
                new_url = await cls._deploy_firebase(project_id, workspace_path)
                if new_url:
                    deploy_url = new_url
                    await update_project(project_id, deploy_url=new_url)

            await project_manager.update_progress(project_id, 100.0)
            await project_manager.update_status(project_id, "done")
            total_tokens = await get_tokens_used(project_id)
            await add_log(project_id, f"═══ PROJET TERMINÉ — {total_tokens:,} tokens ═══", "info")

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
    def _write_workspace_env(cls, workspace_path: str, project_name: str = "") -> None:
        """
        Write .env to the generated workspace with owner Firebase credentials.
        VITE_DEMO_AUTH=true enables the mock login (demo@preview.com / preview).
        Client handoff = replace these values with the client's own Firebase project.
        """
        api_key      = os.getenv("OWNER_FIREBASE_API_KEY", "")
        auth_domain  = os.getenv("OWNER_FIREBASE_AUTH_DOMAIN", "")
        project_id   = os.getenv("OWNER_FIREBASE_PROJECT_ID", "")
        storage      = os.getenv("OWNER_FIREBASE_STORAGE_BUCKET", "")
        sender_id    = os.getenv("OWNER_FIREBASE_MESSAGING_SENDER_ID", "")
        app_id       = os.getenv("OWNER_FIREBASE_APP_ID", "")

        if not api_key:
            return  # No owner Firebase config — skip silently

        slug = (project_name or "project").lower().replace(" ", "-")
        content = f"""# ─────────────────────────────────────────────────────────────────
# Firebase config — PREVIEW (compte owner)
# ─────────────────────────────────────────────────────────────────
# Ce projet tourne actuellement sur le compte Firebase du développeur.
# Pour livrer au client : remplacer les valeurs ci-dessous par les
# credentials de son propre projet Firebase, puis faire `npm run build`.
#
# 1. Créer un projet sur https://console.firebase.google.com
# 2. Ajouter une app Web → copier les valeurs firebaseConfig
# 3. Activer Authentication (Email/Password) + Firestore + Storage
# 4. Remplacer chaque VITE_FIREBASE_* ci-dessous
# 5. Passer VITE_DEMO_AUTH à false (ou supprimer la ligne)
# ─────────────────────────────────────────────────────────────────

VITE_FIREBASE_API_KEY={api_key}
VITE_FIREBASE_AUTH_DOMAIN={auth_domain}
VITE_FIREBASE_PROJECT_ID={project_id}
VITE_FIREBASE_STORAGE_BUCKET={storage}
VITE_FIREBASE_MESSAGING_SENDER_ID={sender_id}
VITE_FIREBASE_APP_ID={app_id}

# Mode démo — login mock actif (demo@preview.com / preview)
# Passer à false pour activer la vraie authentification Firebase.
VITE_DEMO_AUTH=true
VITE_DEMO_EMAIL=demo@{slug}.com
VITE_DEMO_PASSWORD=preview
"""
        env_path = os.path.join(workspace_path, ".env")
        with open(env_path, "w", encoding="utf-8") as f:
            f.write(content)

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

        # npm run build — cap Node.js heap to avoid OOM on low-RAM VPS
        await add_log(project_id, "🔨 Build de production (npm run build)...", "info")
        build_r = await t.run_command(
            "NODE_OPTIONS=--max-old-space-size=1536 npm run build", timeout=420
        )
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
            "postcss.config.js", "src/vite-env.d.ts", "src/lib/motion.ts",
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
