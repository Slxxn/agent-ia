"""
Project Memory — Persistent semantic snapshot of a generated project.

Written to workspace/.agent_memory.json after each phase and at completion.
Read by the chat task runner to inject accurate context for modifications.

Why: ProjectBrain tracks file structure (imports/exports/routes) but not
design decisions, types, build health, or deploy state. This fills that
gap with a compact JSON that survives process restarts.

Error pattern tracking: each static fix fired is counted in the DB so
we can identify which LLM rules are weakest over time.
"""

from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from typing import Any, Optional

from backend.db.database import add_log


MEMORY_FILE = ".agent_memory.json"


class ProjectMemory:

    # ── Public API ──────────────────────────────────────────────────────────

    @classmethod
    async def save(
        cls,
        project_id: int,
        workspace_path: str,
        *,
        objective: str = "",
        project_name: str = "",
        brief: Optional[dict] = None,
        executor: Any = None,
        build_success: bool = False,
        build_attempts: int = 0,
        deploy_url: str = "",
        tasks: Optional[list] = None,
        phase: str = "complete",
    ) -> None:
        """Build and persist memory snapshot to workspace/.agent_memory.json."""
        try:
            data = cls._build_snapshot(
                project_id=project_id,
                workspace_path=workspace_path,
                objective=objective,
                project_name=project_name,
                brief=brief,
                executor=executor,
                build_success=build_success,
                build_attempts=build_attempts,
                deploy_url=deploy_url,
                tasks=tasks or [],
                phase=phase,
            )
            path = os.path.join(workspace_path, MEMORY_FILE)
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            await add_log(project_id, f"💾 Mémoire projet sauvegardée (phase={phase}).", "debug")
        except Exception as exc:
            await add_log(project_id, f"⚠️ Sauvegarde mémoire échouée : {exc}", "debug")

    @classmethod
    def load(cls, workspace_path: str) -> Optional[dict]:
        """Load memory from workspace. Returns None if not found or corrupt."""
        path = os.path.join(workspace_path, MEMORY_FILE)
        try:
            with open(path, encoding="utf-8") as f:
                return json.load(f)
        except (OSError, json.JSONDecodeError):
            return None

    @classmethod
    def to_context(cls, data: dict) -> str:
        """
        Convert memory to a concise LLM context string.
        Injected into chat modification tasks so the agent knows exactly
        what it's working with — without re-reading the entire file tree.
        """
        lines = ["## MÉMOIRE DU PROJET"]

        if data.get("project_name"):
            lines.append(f"**Projet** : {data['project_name']}")
        if data.get("objective"):
            lines.append(f"**Objectif** : {data['objective'][:200]}")
        if data.get("phase") and data["phase"] != "complete":
            lines.append(f"**État** : génération en cours (phase {data['phase']})")
        elif data.get("phase") == "complete":
            lines.append(f"**État** : projet terminé — {data.get('saved_at', '')[:10]}")

        # Design system
        design = data.get("design", {})
        if design:
            palette = design.get("palette", "")
            theme   = design.get("theme", "")
            fonts   = design.get("fonts", {})
            tokens  = design.get("palette_tokens", {})
            if palette:
                lines.append(f"**Palette** : {palette} (thème {theme})")
            if fonts:
                lines.append(f"**Polices** : {fonts.get('display', '')} / {fonts.get('body', '')}")
            if tokens:
                tok_str = "  ".join(f"{k}: {v}" for k, v in list(tokens.items())[:6])
                lines.append(f"**CSS vars** : {tok_str}")

        # Architecture
        arch = data.get("architecture", {})
        if arch.get("router"):
            lines.append(f"**Routing** : {arch['router']}")
        providers = arch.get("providers", [])
        if providers:
            lines.append(f"**Providers** : {', '.join(providers)} (dans App.tsx)")
        key_files = arch.get("key_files", {})
        if key_files:
            kf_str = " | ".join(f"{k}: `{v}`" for k, v in key_files.items())
            lines.append(f"**Fichiers clés** : {kf_str}")

        # Files count + list
        files = data.get("files_created", [])
        if files:
            lines.append(f"**Fichiers src** : {len(files)} fichiers")

        # Build + deploy
        build = data.get("build_result", {})
        if build:
            ok = build.get("success", False)
            n_err = build.get("errors_count", 0)
            status = "✅ build propre" if ok else f"⚠️ {n_err} erreur(s) résiduelle(s)"
            lines.append(f"**Build** : {status} ({build.get('attempts', 1)} tentative(s))")
        if data.get("deploy_url"):
            lines.append(f"**URL déployée** : {data['deploy_url']}")

        # Types — always inject so LLM never invents fields
        types_content = data.get("types_content", "")
        if types_content:
            lines.append(f"\n### Types (src/types/index.ts)\n```typescript\n{types_content[:3000]}\n```")

        # CSS :root snapshot
        css_vars = data.get("css_vars", "")
        if css_vars:
            lines.append(f"\n### Variables CSS (:root)\n```css\n{css_vars[:800]}\n```")

        return "\n".join(lines)

    # ── Error pattern tracking ───────────────────────────────────────────────

    @classmethod
    async def record_fix(cls, fix_name: str) -> None:
        """
        Increment a counter for a static fix in the DB.
        Call this from StaticPostProcessor when a fix fires.
        Over time the stats reveal which LLM rules are weakest.
        """
        try:
            from backend.db.database import increment_fix_counter
            await increment_fix_counter(fix_name)
        except Exception:
            pass  # non-critical — never block the pipeline

    # ── Internal builders ───────────────────────────────────────────────────

    @classmethod
    def _build_snapshot(
        cls,
        project_id: int,
        workspace_path: str,
        objective: str,
        project_name: str,
        brief: Optional[dict],
        executor: Any,
        build_success: bool,
        build_attempts: int,
        deploy_url: str,
        tasks: list,
        phase: str,
    ) -> dict:
        data: dict = {
            "project_id":  project_id,
            "project_name": project_name,
            "objective":   objective,
            "phase":       phase,
            "saved_at":    datetime.now(timezone.utc).isoformat(),
            "design":      {},
            "architecture": {},
            "files_created": [],
            "types_content": "",
            "css_vars":    "",
            "build_result": {
                "success":      build_success,
                "attempts":     build_attempts,
                "errors_count": 0,
            },
            "deploy_url":  deploy_url,
            "tasks_summary": [],
        }

        # ── Design brief ──────────────────────────────────────────────────
        if brief:
            # Support both old brief format and new design_system format
            ds = brief.get("design_system", {})
            palette = ds.get("palette", brief.get("palette", {}))
            fonts   = ds.get("fonts",   brief.get("fonts",   {}))
            mood    = palette.get("mood", "").lower()
            theme   = "dark" if any(k in mood for k in ("sombre", "dark", "premium", "nuit")) else "light"
            data["design"] = {
                "palette":        palette.get("name", ""),
                "palette_tokens": palette.get("tokens", {}),
                "fonts":          {"display": fonts.get("display", ""), "body": fonts.get("body", "")},
                "theme":          theme,
            }
            # Persist full design system for future chat tasks
            if ds:
                data["design_system"] = ds

        # ── Types content ─────────────────────────────────────────────────
        if executor and getattr(executor, "_types_content", None):
            data["types_content"] = executor._types_content
        else:
            for rel in ("src/types/index.ts", "src/types/index.tsx", "src/types.ts"):
                tp = os.path.join(workspace_path, rel)
                if os.path.exists(tp):
                    try:
                        with open(tp, encoding="utf-8") as f:
                            data["types_content"] = f.read()[:4000]
                    except OSError:
                        pass
                    break

        # ── CSS :root snapshot ────────────────────────────────────────────
        for rel in ("src/styles/globals.css", "src/index.css", "src/globals.css", "src/global.css"):
            cp = os.path.join(workspace_path, rel)
            if os.path.exists(cp):
                try:
                    with open(cp, encoding="utf-8") as f:
                        css = f.read()
                    m = re.search(r':root\s*\{([^}]+)\}', css)
                    if m:
                        data["css_vars"] = m.group(0)[:800]
                except OSError:
                    pass
                break

        # ── Architecture detection ────────────────────────────────────────
        arch: dict = {}

        main_tsx = os.path.join(workspace_path, "src", "main.tsx")
        if os.path.exists(main_tsx):
            try:
                with open(main_tsx, encoding="utf-8") as f:
                    mc = f.read()
                if "BrowserRouter" in mc:
                    arch["router"] = "BrowserRouter wraps App in main.tsx — App.tsx uses Routes only"
                elif "createBrowserRouter" in mc:
                    arch["router"] = "createBrowserRouter in main.tsx"
            except OSError:
                pass

        app_tsx = os.path.join(workspace_path, "src", "App.tsx")
        if os.path.exists(app_tsx):
            try:
                with open(app_tsx, encoding="utf-8") as f:
                    ac = f.read()
                providers = list(dict.fromkeys(re.findall(r'<(\w+Provider)\b', ac)))
                if providers:
                    arch["providers"] = providers
            except OSError:
                pass

        key_files: dict = {}
        candidates = {
            "types":    ["src/types/index.ts", "src/types/index.tsx"],
            "cart":     ["src/context/CartContext.tsx", "src/stores/cartStore.tsx"],
            "auth":     ["src/context/AuthContext.tsx"],
            "firebase": ["src/lib/firebase.ts"],
            "utils":    ["src/lib/utils.ts"],
            "stripe":   ["src/lib/stripe.ts"],
        }
        for role, paths in candidates.items():
            for p in paths:
                if os.path.exists(os.path.join(workspace_path, p)):
                    key_files[role] = p
                    break
        arch["key_files"] = {k: v for k, v in key_files.items() if v}
        data["architecture"] = arch

        # ── Files created list ────────────────────────────────────────────
        src_dir = os.path.join(workspace_path, "src")
        if os.path.exists(src_dir):
            files = []
            for root, _dirs, fnames in os.walk(src_dir):
                if "node_modules" in root:
                    continue
                for fname in fnames:
                    rel = os.path.relpath(
                        os.path.join(root, fname), workspace_path
                    ).replace("\\", "/")
                    files.append(rel)
            data["files_created"] = sorted(files)

        # ── Tasks summary ─────────────────────────────────────────────────
        data["tasks_summary"] = [
            {
                "description": t.get("description", "")[:120],
                "status": t.get("status", "?"),
            }
            for t in tasks
        ]

        return data
