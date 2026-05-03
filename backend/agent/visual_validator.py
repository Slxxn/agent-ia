"""
Visual Validator — screenshots the running app and analyses it with a vision LLM.

Pipeline:
  1. Start Vite dev server on a free port
  2. Wait until the server responds
  3. Capture full-page screenshot via Playwright
  4. Send image to Anthropic Claude vision API
  5. Parse JSON list of issues
  6. If critical issues found AND executor is available → fix → repeat
  7. Always returns True (never blocks the pipeline on visual failures)

Activation: set VISUAL_VALIDATION=1 and ANTHROPIC_API_KEY in .env
"""

import asyncio
import base64
import json
import os
import re
import sys
import tempfile
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, List, Optional

import httpx

from backend.db.database import add_log
from backend.tools.screenshot import ScreenshotTool

if TYPE_CHECKING:
    from backend.agent.executor import AgentExecutor

# ── Configuration ──────────────────────────────────────────────────────────────

ANTHROPIC_API_KEY    = os.getenv("ANTHROPIC_API_KEY", "")
VISION_MODEL         = os.getenv("VISION_MODEL", "claude-sonnet-4-6")
VISUAL_VALIDATION    = os.getenv("VISUAL_VALIDATION", "0") == "1"
MAX_FIX_ITERATIONS   = int(os.getenv("VISUAL_MAX_ITERATIONS", "2"))
SERVER_POLL_INTERVAL = 0.5   # seconds between readiness polls
SERVER_MAX_WAIT      = 20    # seconds total wait for dev server


# ── Data structures ────────────────────────────────────────────────────────────

@dataclass
class VisualIssue:
    severity: str        # "critical" | "warning"
    description: str
    suggested_fix: str


@dataclass
class VisualResult:
    passed: bool
    issues: List[VisualIssue] = field(default_factory=list)


# ── Validator class ────────────────────────────────────────────────────────────

class VisualValidator:
    """
    Runs the screenshot → vision analysis → fix loop.
    Pass an AgentExecutor to enable auto-fix; omit to analysis-only.
    """

    def __init__(self, executor: Optional["AgentExecutor"] = None):
        self.executor = executor

    # ── Main entry point ───────────────────────────────────────────────────

    async def run_validation_loop(
        self,
        project_id: int,
        workspace_path: str,
        port: int = 5174,
        deployed_url: Optional[str] = None,
        force: bool = False,
    ) -> bool:
        if not force and not VISUAL_VALIDATION:
            return True
        if not ANTHROPIC_API_KEY:
            await add_log(project_id, "⚠️ ANTHROPIC_API_KEY absent — validation visuelle désactivée.", "debug")
            return True
        if not ScreenshotTool.is_available():
            await add_log(project_id, "⚠️ Playwright absent — installez-le avec: pip install playwright && playwright install chromium", "debug")
            return True

        await add_log(project_id, "═══ PHASE 4.5 : VALIDATION VISUELLE ═══", "info")

        server = None
        if deployed_url:
            await add_log(project_id, f"🌐 Capture du site déployé : {deployed_url}", "info")
            tool = ScreenshotTool(url=deployed_url)
        else:
            server = await self._start_dev_server(project_id, workspace_path, port)
            if server is None:
                await add_log(project_id, "⚠️ Serveur de dev non démarré — validation visuelle ignorée.", "warning")
                return True
            tool = ScreenshotTool(url=f"http://localhost:{port}")

        try:
            for iteration in range(1, MAX_FIX_ITERATIONS + 1):
                await add_log(project_id, f"📸 Capture d'écran — itération {iteration}/{MAX_FIX_ITERATIONS}...", "info")

                with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                    path = tmp.name

                ok = await tool.capture(path)
                if not ok:
                    await add_log(project_id, "⚠️ Capture échouée — validation visuelle ignorée.", "warning")
                    os.unlink(path)
                    break

                result = await self._analyze(project_id, path)
                try:
                    os.unlink(path)
                except OSError:
                    pass

                criticals = [i for i in result.issues if i.severity == "critical"]
                warnings  = [i for i in result.issues if i.severity == "warning"]

                if not result.issues:
                    await add_log(project_id, "✅ Validation visuelle : aucun problème détecté.", "info")
                    return True

                for issue in criticals:
                    await add_log(project_id, f"  🔴 [CRITIQUE] {issue.description}", "warning")
                for issue in warnings:
                    await add_log(project_id, f"  🟡 [WARN] {issue.description}", "debug")

                await add_log(
                    project_id,
                    f"⚠️ {len(criticals)} critique(s), {len(warnings)} avertissement(s) détecté(s).",
                    "warning",
                )

                if not criticals or self.executor is None or iteration == MAX_FIX_ITERATIONS:
                    break

                await self._fix_issues(project_id, result.issues, workspace_path)
                # Give Vite HMR time to reload
                await asyncio.sleep(3)

            return True

        finally:
            if server is not None:
                server.terminate()
                try:
                    await asyncio.wait_for(server.wait(), timeout=5)
                except (asyncio.TimeoutError, Exception):
                    try:
                        server.kill()
                    except Exception:
                        pass

    # ── Dev server ─────────────────────────────────────────────────────────

    async def _start_dev_server(
        self,
        project_id: int,
        workspace_path: str,
        port: int,
    ) -> Optional[asyncio.subprocess.Process]:
        from backend.tools.terminal import _find_npm_path

        npm = _find_npm_path()

        try:
            proc = await asyncio.create_subprocess_shell(
                f'"{npm}" run dev -- --port {port} --host false',
                cwd=workspace_path,
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL,
            )
        except Exception as e:
            await add_log(project_id, f"⚠️ Impossible de lancer le serveur de dev : {e}", "debug")
            return None

        await add_log(project_id, f"⏳ Attente du serveur de dev (port {port})...", "debug")
        deadline = asyncio.get_event_loop().time() + SERVER_MAX_WAIT
        while asyncio.get_event_loop().time() < deadline:
            await asyncio.sleep(SERVER_POLL_INTERVAL)
            try:
                async with httpx.AsyncClient(timeout=1.0) as client:
                    r = await client.get(f"http://localhost:{port}")
                    if r.status_code < 500:
                        await add_log(project_id, f"✓ Serveur prêt sur http://localhost:{port}", "debug")
                        return proc
            except Exception:
                pass

        proc.terminate()
        await add_log(project_id, "⚠️ Serveur de dev non disponible dans les délais.", "debug")
        return None

    # ── Vision analysis ────────────────────────────────────────────────────

    async def _analyze(self, project_id: int, screenshot_path: str) -> VisualResult:
        with open(screenshot_path, "rb") as f:
            img_b64 = base64.standard_b64encode(f.read()).decode()

        prompt = """\
You are an expert UI/UX reviewer analyzing a website screenshot.

Identify ONLY real technical visual problems — not stylistic preferences.
Focus on:
- Layout breaks: content overflowing its container, elements overlapping incorrectly
- Blank white/grey zones where content should render (component not mounting)
- Text illegible against its background (contrast failure)
- Broken or missing images (broken img tag placeholders)
- Obvious misalignment (clearly off-grid elements)
- Horizontal scrollbar on a desktop viewport (unwanted overflow)
- Visible JS error messages or "undefined" text rendered on screen

Respond ONLY with a valid JSON array (empty array [] if no issues):
[
  {
    "severity": "critical",
    "description": "Short one-line description",
    "suggested_fix": "Specific Tailwind class or React code change to fix it"
  }
]"""

        try:
            headers = {
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            }
            payload = {
                "model": VISION_MODEL,
                "max_tokens": 1024,
                "messages": [{
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": img_b64,
                            },
                        },
                        {"type": "text", "text": prompt},
                    ],
                }],
            }

            async with httpx.AsyncClient(timeout=40) as client:
                r = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers=headers,
                    json=payload,
                )

            if r.status_code != 200:
                await add_log(project_id, f"⚠️ API vision ({r.status_code}) — analyse ignorée.", "debug")
                return VisualResult(passed=True)

            raw_text = r.json().get("content", [{}])[0].get("text", "[]")
            m = re.search(r'\[.*\]', raw_text, re.DOTALL)
            if not m:
                return VisualResult(passed=True)

            raw_issues = json.loads(m.group(0))
            issues = [
                VisualIssue(
                    severity=i.get("severity", "warning"),
                    description=i.get("description", ""),
                    suggested_fix=i.get("suggested_fix", ""),
                )
                for i in raw_issues
                if isinstance(i, dict) and i.get("description")
            ]
            has_critical = any(i.severity == "critical" for i in issues)
            return VisualResult(passed=not has_critical, issues=issues)

        except Exception as exc:
            await add_log(project_id, f"⚠️ Erreur analyse visuelle : {exc}", "debug")
            return VisualResult(passed=True)

    # ── Auto-fix ───────────────────────────────────────────────────────────

    async def _fix_issues(
        self,
        project_id: int,
        issues: List[VisualIssue],
        workspace_path: str,
    ) -> None:
        if not self.executor:
            return

        issues_text = "\n".join(
            f"[{i.severity.upper()}] {i.description}\n  → Fix: {i.suggested_fix}"
            for i in issues
            if i.severity == "critical"
        )
        task = (
            f"Corriger les problèmes visuels détectés (validation automatique) :\n\n"
            f"{issues_text}\n\n"
            "Modifier uniquement les fichiers concernés. "
            "Ne pas recréer des fichiers entiers — cibler les corrections précises."
        )
        await add_log(project_id, "🔧 Correction automatique des problèmes visuels...", "info")
        await self.executor.execute_task(
            project_id=project_id,
            task_description=task,
            steps=["Localiser les fichiers concernés", "Appliquer les corrections ciblées"],
            context=f"Workspace : {workspace_path}",
        )
