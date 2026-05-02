"""
Build Validator — Autonomous build-fix loop.

After all files are generated the runner calls run_and_fix_loop().
It compiles the project, parses TypeScript/Vite errors, asks the LLM to fix
each broken file, and retries until the build passes or max attempts is reached.

Supported error formats:
  TypeScript:  src/App.tsx(3,9): error TS2305: ...
  Vite ESBuild: ✘ [ERROR] No matching export ...  \n    src/file.tsx:3:9:
  Vite import:  Failed to resolve import "pkg" from "src/file.tsx"
"""

import os
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from backend.db.database import add_log
from backend.tools.filesystem import FilesystemTool
from backend.tools.llm import LLMTool
from backend.tools.terminal import TerminalTool


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class BuildError:
    file_path: str                   # project-relative path, e.g. "src/App.tsx"
    line: Optional[int]
    col: Optional[int]
    code: str                        # "TS2305", "VITE_IMPORT", "ESBUILD", …
    message: str
    raw: str                         # original error line for logging


@dataclass
class BuildResult:
    success: bool
    errors: List[BuildError] = field(default_factory=list)
    output: str = ""


# ---------------------------------------------------------------------------
# Validator
# ---------------------------------------------------------------------------

class BuildValidator:
    """
    Runs TypeScript type-check on the project, parses errors, and generates
    targeted LLM fixes — one file at a time.  Re-runs until clean or exhausted.
    """

    # tsc --noEmit is faster than a full vite build and catches the same TS errors.
    # --skipLibCheck avoids noise from node_modules type definitions.
    TSC_ARGS = ("tsc", "--noEmit", "--skipLibCheck")

    def __init__(
        self,
        llm: LLMTool,
        terminal: TerminalTool,
        filesystem: FilesystemTool,
    ):
        self.llm        = llm
        self.terminal   = terminal
        self.filesystem = filesystem

    # ── Main entry point ────────────────────────────────────────────────────

    async def run_and_fix_loop(
        self,
        project_id: int,
        workspace_path: str,
        max_attempts: int = 3,
    ) -> bool:
        """
        Run build → parse errors → fix → repeat.
        Returns True if the project compiles cleanly.
        """
        # Only validate if there is a package.json (Node/React project)
        if not os.path.exists(os.path.join(workspace_path, "package.json")):
            await add_log(project_id, "Pas de package.json — validation build ignorée.", "debug")
            return True

        # Ensure tsconfig exists (required for tsc)
        if not os.path.exists(os.path.join(workspace_path, "tsconfig.json")):
            await add_log(project_id, "Pas de tsconfig.json — validation build ignorée.", "debug")
            return True

        await add_log(project_id, "🔍 Démarrage de la validation automatique (tsc)...", "info")

        for attempt in range(1, max_attempts + 1):
            await add_log(
                project_id,
                f"🔨 Compilation — tentative {attempt}/{max_attempts}...",
                "info",
            )

            result = await self._run_tsc(project_id)

            if result.success:
                await add_log(project_id, "✅ Compilation réussie — zéro erreur TypeScript.", "info")
                return True

            errors = result.errors
            if not errors:
                # tsc failed but no structured errors could be parsed
                raw = result.output.strip()
                if raw:
                    snippet = raw[:600].replace("\n", " | ")
                    await add_log(project_id, f"⚠️ Erreur tsc (non parsée) : {snippet}", "warning")
                else:
                    await add_log(
                        project_id,
                        "⚠️ tsc a échoué sans message — tsconfig.json manquant ou npx introuvable.",
                        "warning",
                    )
                break

            await add_log(
                project_id,
                f"⚠️ {len(errors)} erreur(s) TypeScript détectée(s) — génération des correctifs...",
                "warning",
            )

            fixed = await self._fix_errors(project_id, errors, workspace_path)
            if not fixed:
                await add_log(
                    project_id,
                    "❌ Aucun correctif appliqué — arrêt de la boucle de validation.",
                    "warning",
                )
                break

        await add_log(
            project_id,
            "⚠️ Validation terminée avec des erreurs résiduelles. Lancez le projet et corrigez manuellement si nécessaire.",
            "warning",
        )
        return False

    # ── Build step ──────────────────────────────────────────────────────────

    async def _run_tsc(self, project_id: int) -> BuildResult:
        result = await self.terminal.run_npx(*self.TSC_ARGS, timeout=120)
        output = (result.get("stdout", "") + "\n" + result.get("stderr", "")).strip()
        success = result.get("exit_code", 1) == 0

        errors = self._parse_errors(output)
        return BuildResult(success=success and not errors, errors=errors, output=output)

    # ── Error parsing ────────────────────────────────────────────────────────

    def _parse_errors(self, output: str) -> List[BuildError]:
        errors: List[BuildError] = []
        errors.extend(self._parse_tsc_errors(output))
        errors.extend(self._parse_vite_import_errors(output))
        errors.extend(self._parse_esbuild_errors(output))

        # Deduplicate by (file, line, code)
        seen: set = set()
        unique: List[BuildError] = []
        for e in errors:
            key = (e.file_path, e.line, e.code, e.message[:60])
            if key not in seen:
                seen.add(key)
                unique.append(e)
        return unique

    # tsc format:  src/App.tsx(3,9): error TS2305: Module '"x"' has no exported member 'Y'.
    _TSC_RE = re.compile(
        r"([^\s(]+\.(?:tsx?|jsx?))\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)"
    )
    # Also handles forward-slash paths on Windows tsc output
    _TSC_RE2 = re.compile(
        r"([^\s:]+\.(?:tsx?|jsx?)):(\d+):(\d+)\s+-\s+error\s+(TS\d+):\s+(.+)"
    )

    def _parse_tsc_errors(self, output: str) -> List[BuildError]:
        errors: List[BuildError] = []
        for pattern in (self._TSC_RE, self._TSC_RE2):
            for m in pattern.finditer(output):
                fp = m.group(1).replace("\\", "/")
                # Strip absolute workspace prefix if present
                fp = re.sub(r"^[A-Za-z]:/[^/]+(?:/[^/]+)*/workspace/[^/]+/", "", fp)
                errors.append(BuildError(
                    file_path=fp,
                    line=int(m.group(2)),
                    col=int(m.group(3)),
                    code=m.group(4),
                    message=m.group(5).strip(),
                    raw=m.group(0),
                ))
        return errors

    # Vite import:  Failed to resolve import "pkg" from "src/file.tsx"
    _VITE_IMPORT_RE = re.compile(
        r'Failed to resolve import "([^"]+)" from "([^"]+)"'
    )

    def _parse_vite_import_errors(self, output: str) -> List[BuildError]:
        errors: List[BuildError] = []
        for m in self._VITE_IMPORT_RE.finditer(output):
            errors.append(BuildError(
                file_path=m.group(2).replace("\\", "/"),
                line=None,
                col=None,
                code="VITE_IMPORT",
                message=f'Cannot resolve import "{m.group(1)}"',
                raw=m.group(0),
            ))
        return errors

    # esbuild:  ✘ [ERROR] No matching export in "src/X.tsx" for import "Y"
    #               src/App.tsx:3:9:
    _ESBUILD_RE = re.compile(
        r'✘ \[ERROR\] (.+?)\n\s+([^\s:]+\.(?:tsx?|jsx?)):(\d+):(\d+):'
    )

    def _parse_esbuild_errors(self, output: str) -> List[BuildError]:
        errors: List[BuildError] = []
        for m in self._ESBUILD_RE.finditer(output):
            errors.append(BuildError(
                file_path=m.group(2).replace("\\", "/"),
                line=int(m.group(3)),
                col=int(m.group(4)),
                code="ESBUILD",
                message=m.group(1).strip(),
                raw=m.group(0),
            ))
        return errors

    # ── Fix step ─────────────────────────────────────────────────────────────

    async def _fix_errors(
        self,
        project_id: int,
        errors: List[BuildError],
        workspace_path: str,
    ) -> bool:
        by_file: Dict[str, List[BuildError]] = {}
        for err in errors:
            by_file.setdefault(err.file_path, []).append(err)

        # Fix context/lib files before pages that depend on them
        sorted_files = sorted(by_file.items(), key=lambda kv: self._file_fix_priority(kv[0]))

        fixed_any = False
        for file_path, file_errors in sorted_files:
            ok = await self._fix_file(project_id, file_path, file_errors, workspace_path)
            if ok:
                fixed_any = True

        return fixed_any

    @staticmethod
    def _file_fix_priority(path: str) -> int:
        """Fix context/lib files first so pages that import them see correct types."""
        p = path.replace("\\", "/").lower()
        if "/context/" in p or "/store/" in p or "/lib/" in p:
            return 0
        if "/types" in p or "/constants" in p or "/data/" in p:
            return 1
        if "/components/" in p:
            return 2
        return 3  # pages last

    def _find_symbol_source(self, symbol: str, workspace_path: str) -> Optional[Tuple[str, str]]:
        """
        Walk src/ to find which file exports a given symbol.
        Returns (relative_path, content[:2000]) or None.
        """
        src_dir = os.path.join(workspace_path, "src")
        if not os.path.exists(src_dir):
            return None
        pattern = re.compile(rf'\bexport\b.+\b{re.escape(symbol)}\b')
        for root, _dirs, files in os.walk(src_dir):
            if "node_modules" in root:
                continue
            for fname in files:
                if not fname.endswith((".ts", ".tsx", ".js", ".jsx")):
                    continue
                fpath = os.path.join(root, fname)
                try:
                    with open(fpath, encoding="utf-8") as f:
                        src = f.read()
                    if pattern.search(src):
                        rel = os.path.relpath(fpath, workspace_path).replace("\\", "/")
                        return (rel, src[:2500])
                except OSError:
                    pass
        return None

    def _build_extra_context(self, errors: List[BuildError], workspace_path: str) -> str:
        """
        For interface-mismatch errors, find the defining file and include it.
        Covers TS2339 (property), TS2554 (arg count), TS2305 (no export), TS2345 (type mismatch).
        """
        CONTEXT_CODES = {"TS2339", "TS2554", "TS2305", "TS2345", "TS2304", "TS2551"}
        extra_parts: list[str] = []
        seen_symbols: set[str] = set()
        seen_paths: set[str] = set()

        # Always include src/types/index.ts if it exists (common source of interface definitions)
        types_candidates = ["src/types/index.ts", "src/types.ts", "src/types/index.tsx"]
        for tc in types_candidates:
            tp = os.path.join(workspace_path, tc)
            if os.path.exists(tp):
                try:
                    with open(tp, encoding="utf-8") as f:
                        tc_content = f.read()[:3000]
                    extra_parts.append(f"// Types du projet ({tc}):\n```typescript\n{tc_content}\n```")
                    seen_paths.add(tc)
                except OSError:
                    pass
                break

        for err in errors:
            if err.code not in CONTEXT_CODES:
                continue
            # Extract symbol names from common error message patterns
            candidates = re.findall(
                r"Property '(\w+)'|'(\w+)' does not exist|Cannot find name '(\w+)'"
                r"|type '(\w+)'|'(\w+)' has no exported member|Expected \d+ arguments",
                err.message,
            )
            for groups in candidates:
                for sym in groups:
                    if sym and sym not in seen_symbols and len(sym) > 2:
                        seen_symbols.add(sym)
                        found = self._find_symbol_source(sym, workspace_path)
                        if found:
                            rel_path, content = found
                            if rel_path not in seen_paths:
                                seen_paths.add(rel_path)
                                extra_parts.append(
                                    f"// Définition de '{sym}' dans {rel_path}:\n"
                                    f"```typescript\n{content}\n```"
                                )

        return "\n\n".join(extra_parts)

    # TS2551: Property 'X' does not exist … Did you mean 'Y'?
    _TS2551_RE = re.compile(r"Property '(\w+)' does not exist.*Did you mean '(\w+)'", re.IGNORECASE)

    def _apply_direct_fixes(self, content: str, errors: List["BuildError"]) -> str:
        """Apply deterministic fixes for errors that have an unambiguous answer (no LLM needed)."""
        for err in errors:
            if err.code == "TS2551":
                m = self._TS2551_RE.search(err.message)
                if m:
                    wrong, right = m.group(1), m.group(2)
                    # Replace property access: .wrong and ['wrong'] and ["wrong"]
                    content = re.sub(rf'\b{re.escape(wrong)}\b', right, content)
        return content

    async def _fix_file(
        self,
        project_id: int,
        file_path: str,
        errors: List[BuildError],
        workspace_path: str = "",
    ) -> bool:
        read_result = self.filesystem.read_file(file_path)
        if not read_result.get("success"):
            await add_log(project_id, f"Impossible de lire '{file_path}' pour le correctif.", "warning")
            return False

        current_content: str = read_result.get("content", "")

        # Pre-pass: apply deterministic fixes (TS2551 "Did you mean?") without LLM
        patched = self._apply_direct_fixes(current_content, errors)
        if patched.strip() != current_content.strip():
            write_result = self.filesystem.create_file(file_path, patched)
            if write_result.get("success"):
                await add_log(project_id, f"✅ '{file_path}' corrigé (substitution directe).", "info")
                current_content = patched
                # Filter out the TS2551 errors we just resolved
                errors = [e for e in errors if e.code != "TS2551"]
                if not errors:
                    return True

        error_block = self._format_errors(errors)

        # Build cross-file context for interface mismatch errors
        extra_context = ""
        if workspace_path:
            extra_context = self._build_extra_context(errors, workspace_path)

        await add_log(project_id, f"🔧 Correction de '{file_path}' ({len(errors)} erreur(s))...", "info")

        fix_result = await self.llm.generate_targeted_fix(
            file_path=file_path,
            content=current_content,
            errors=error_block,
            extra_context=extra_context,
        )

        if not fix_result.get("success") or not fix_result.get("content"):
            await add_log(project_id, f"LLM n'a pas pu corriger '{file_path}'.", "warning")
            return False

        fixed_content = self._extract_code(fix_result["content"], file_path)
        if not fixed_content or fixed_content.strip() == current_content.strip():
            await add_log(project_id, f"Pas de changement pour '{file_path}'.", "debug")
            return False

        write_result = self.filesystem.create_file(file_path, fixed_content)
        if write_result.get("success"):
            await add_log(project_id, f"✅ '{file_path}' corrigé ({len(errors)} erreur(s) résolue(s)).", "info")
            return True

        await add_log(project_id, f"Échec écriture du correctif pour '{file_path}'.", "error")
        return False

    # ── Utilities ─────────────────────────────────────────────────────────────

    def _format_errors(self, errors: List[BuildError]) -> str:
        lines: List[str] = []
        for e in errors:
            loc = f"ligne {e.line}" if e.line else "?"
            lines.append(f"  [{e.code}] {loc}: {e.message}")
        return "\n".join(lines)

    def _extract_code(self, llm_output: str, file_path: str) -> str:
        """Extract code from a markdown code block, or return raw output."""
        # Try ```ext filename or ```ext or plain ```
        m = re.search(
            r"```(?:[a-zA-Z]*(?:\s+[^\n]*)?\n)([\s\S]+?)```", llm_output
        )
        if m:
            return m.group(1).rstrip()
        # No code fence — return the whole output (LLM returned plain code)
        stripped = llm_output.strip()
        # Sanity: must look like code (has at least one { or import keyword)
        if "{" in stripped or "import " in stripped or "export " in stripped:
            return stripped
        return ""
