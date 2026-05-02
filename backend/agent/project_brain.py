"""
Project Brain — Persistent structural understanding of each generated project.

Tracks which symbols each file exports, what each file imports, the route map,
and the detected tech stack. Updated after every file write so the LLM always
receives accurate context instead of guessing.

Storage: workspace/.brain/snapshot.json  (never shipped with the project)
"""

import json
import os
import re
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class FileNode:
    path: str
    file_type: str          # component | hook | store | page | util | config | entry | module
    exports: List[str] = field(default_factory=list)          # named export symbols
    default_export: Optional[str] = None                      # name of default export
    imports: Dict[str, List[str]] = field(default_factory=dict)   # source → [symbols]
    local_deps: List[str] = field(default_factory=list)       # resolved local file deps


@dataclass
class BrainSnapshot:
    project_id: int
    workspace_name: str
    tech_stack: List[str] = field(default_factory=list)
    packages: Dict[str, str] = field(default_factory=dict)    # dep name → version
    entry_point: str = "src/main.tsx"
    routes: List[Dict[str, str]] = field(default_factory=list)
    files: Dict[str, Any] = field(default_factory=dict)       # rel_path → FileNode dict


# ---------------------------------------------------------------------------
# Main class
# ---------------------------------------------------------------------------

class ProjectBrain:
    """
    Call update_file() after every file write — O(1) per file.
    Call get_context() to build the LLM context string.
    Call validate_imports() before writing to catch broken local imports early.
    """

    _BRAIN_DIR = ".brain"
    _SNAP_FILE  = "snapshot.json"

    def __init__(self, project_id: int, workspace_path: str):
        self.project_id    = project_id
        self.workspace_path = os.path.abspath(workspace_path)
        self._brain_dir    = os.path.join(self.workspace_path, self._BRAIN_DIR)
        self._snap_path    = os.path.join(self._brain_dir, self._SNAP_FILE)
        self._snap: Optional[BrainSnapshot] = None
        os.makedirs(self._brain_dir, exist_ok=True)

    # ── Public API ──────────────────────────────────────────────────────────

    def update_file(self, rel_path: str, content: str) -> None:
        """Ingest a newly-written file into the brain. Fast, synchronous."""
        self._ensure_loaded()

        node = self._analyze(rel_path, content)
        self._snap.files[rel_path] = asdict(node)

        # package.json → update tech stack & packages
        if rel_path == "package.json":
            try:
                pkg = json.loads(content)
                self._snap.packages = {
                    **pkg.get("dependencies", {}),
                    **pkg.get("devDependencies", {}),
                }
                self._snap.tech_stack = self._detect_stack(self._snap.packages)
            except Exception:
                pass

        # index.html → detect Vite entry point
        if rel_path == "index.html":
            m = re.search(r'src=["\']([^"\']+\.tsx?)["\']', content)
            if m:
                self._snap.entry_point = m.group(1).lstrip("/")

        self._rebuild_deps()
        self._refresh_routes()
        self._save()

    def get_context(self) -> str:
        """
        Compact context block injected into every LLM prompt.
        Tells the model exactly what's already exported so it can import correctly.
        """
        self._ensure_loaded()
        snap = self._snap
        lines: List[str] = []

        if snap.tech_stack:
            lines.append(f"Stack: {', '.join(snap.tech_stack)}")

        if snap.packages:
            lines.append(f"Packages installés: {', '.join(list(snap.packages.keys())[:30])}")

        export_lines: List[str] = []
        for path, nd in snap.files.items():
            exports = nd.get("exports", [])
            default_exp = nd.get("default_export")
            syms: List[str] = []
            if default_exp:
                syms.append(f"default:{default_exp}")
            syms += [e for e in exports if e != default_exp]
            if syms:
                export_lines.append(f"  {path}: {', '.join(syms)}")

        if export_lines:
            lines.append("\n## Exports existants (ce que tu peux importer):")
            lines.extend(export_lines)

        if snap.routes:
            lines.append("\n## Routes définies:")
            for r in snap.routes:
                lines.append(f"  {r.get('path','?')} → {r.get('component','?')}")

        return "\n".join(lines)

    def validate_imports(self, rel_path: str, content: str) -> List[str]:
        """
        Return a list of warning strings for local imports that cannot be resolved.
        Does NOT block the write — caller decides whether to warn or refuse.
        """
        self._ensure_loaded()

        known = set(self._snap.files.keys())
        warnings: List[str] = []

        for m in re.finditer(r"""from\s+['"](\./[^'"]+|\.\.[^'"]+)['"]""", content):
            source  = m.group(1)
            resolved = self._resolve_import(source, rel_path)
            if resolved and not self._path_exists(resolved, known):
                warnings.append(f"Import local introuvable: '{source}' → '{resolved}'")

        return warnings

    def get_exports_for(self, rel_path: str) -> List[str]:
        """Named exports from a specific file (empty list if unknown)."""
        self._ensure_loaded()
        nd = self._snap.files.get(rel_path, {})
        return nd.get("exports", [])

    def summary_stats(self) -> Dict[str, Any]:
        """Quick stats for logging."""
        self._ensure_loaded()
        return {
            "files": len(self._snap.files),
            "stack": self._snap.tech_stack,
            "routes": len(self._snap.routes),
            "packages": len(self._snap.packages),
        }

    # ── Internal helpers ────────────────────────────────────────────────────

    def _ensure_loaded(self) -> None:
        if self._snap is not None:
            return
        if os.path.exists(self._snap_path):
            try:
                with open(self._snap_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                valid_keys = set(BrainSnapshot.__dataclass_fields__.keys())
                self._snap = BrainSnapshot(**{k: v for k, v in data.items() if k in valid_keys})
                return
            except Exception:
                pass
        self._snap = BrainSnapshot(
            project_id=self.project_id,
            workspace_name=os.path.basename(self.workspace_path),
        )

    def _save(self) -> None:
        try:
            with open(self._snap_path, "w", encoding="utf-8") as f:
                json.dump(asdict(self._snap), f, indent=2, ensure_ascii=False)
        except Exception:
            pass

    def _analyze(self, rel_path: str, content: str) -> FileNode:
        exports, default_exp = self._extract_exports(content)
        imports = self._extract_imports(content)
        return FileNode(
            path=rel_path,
            file_type=self._classify(rel_path),
            exports=exports,
            default_export=default_exp,
            imports=imports,
        )

    def _extract_exports(self, content: str):
        named: List[str] = []

        # export [async] function|class|const|let|var|type|interface|enum Name
        named += re.findall(
            r"export\s+(?:async\s+)?(?:function\*?|class|const|let|var|type|interface|enum)\s+(\w+)",
            content,
        )

        # export { A, B as C }
        for group in re.findall(r"export\s*\{([^}]+)\}", content):
            for item in group.split(","):
                alias = item.strip().split(" as ")[-1].strip()
                if alias and alias != "default":
                    named.append(alias)

        # export default function/class Name  |  export default Name
        default_m = re.search(
            r"export\s+default\s+(?:(?:async\s+)?(?:function\*?|class)\s+)?(\w+)", content
        )
        default_exp = default_m.group(1) if default_m else None

        return list(dict.fromkeys(named)), default_exp   # deduplicate, preserve order

    def _extract_imports(self, content: str) -> Dict[str, List[str]]:
        result: Dict[str, List[str]] = {}
        # Handles: import D from 'x', import { A, B } from 'x', import * as N from 'x',
        #          import D, { A } from 'x'
        pattern = re.compile(
            r"""import\s+(?:type\s+)?(?:
                \*\s+as\s+(\w+)                        |  # group 1: * as Ns
                \{([^}]*)\}                            |  # group 2: { A, B }
                (\w+)(?:\s*,\s*\{([^}]*)\})?              # group 3+4: Default [, { A }]
            )\s+from\s+['"]([^'"]+)['"]""",
            re.VERBOSE,
        )
        for m in pattern.finditer(content):
            source = m.group(5)
            syms: List[str] = []
            if m.group(1):
                syms.append(f"* as {m.group(1)}")
            if m.group(2):
                syms += [s.strip().split(" as ")[0].strip()
                         for s in m.group(2).split(",") if s.strip()]
            if m.group(3):
                syms.append(m.group(3))
            if m.group(4):
                syms += [s.strip().split(" as ")[0].strip()
                         for s in m.group(4).split(",") if s.strip()]
            result[source] = syms
        return result

    def _classify(self, path: str) -> str:
        p = path.lower()
        if "store" in p or "context" in p:
            return "store"
        if re.search(r"/use[A-Z]", path) or "hook" in p:
            return "hook"
        if "pages/" in p or "/page" in p:
            return "page"
        if "components/" in p:
            return "component"
        if "lib/" in p or "util" in p or "helper" in p:
            return "util"
        if path.endswith((".css", ".scss")):
            return "style"
        if "config" in p or path.endswith((".config.ts", ".config.js", ".config.mjs")):
            return "config"
        if "main" in p or p.endswith("index.tsx") or p.endswith("index.ts"):
            return "entry"
        return "module"

    def _detect_stack(self, packages: Dict[str, str]) -> List[str]:
        mapping = {
            "react": "React", "vite": "Vite", "next": "Next.js",
            "express": "Express", "tailwindcss": "Tailwind CSS",
            "framer-motion": "Framer Motion", "@supabase/supabase-js": "Supabase",
            "stripe": "Stripe", "@stripe/stripe-js": "Stripe (client)",
            "zustand": "Zustand", "react-router-dom": "React Router",
            "sqlite3": "SQLite", "prisma": "Prisma",
        }
        return [label for pkg, label in mapping.items() if pkg in packages]

    def _rebuild_deps(self) -> None:
        for path, nd in self._snap.files.items():
            deps = []
            for source in nd.get("imports", {}):
                resolved = self._resolve_import(source, path)
                if resolved:
                    deps.append(resolved)
            nd["local_deps"] = deps

    def _refresh_routes(self) -> None:
        routes: List[Dict[str, str]] = []
        for path in self._snap.files:
            if not any(k in path.lower() for k in ("app", "router", "routes")):
                continue
            full = os.path.join(self.workspace_path, path)
            if not os.path.exists(full):
                continue
            try:
                with open(full, "r", encoding="utf-8") as f:
                    content = f.read()
                for m in re.finditer(
                    r'<Route\s+path=["\']([^"\']+)["\'][^>]*?element=\{<(\w+)', content
                ):
                    routes.append({"path": m.group(1), "component": m.group(2)})
            except Exception:
                pass
        self._snap.routes = routes

    def _resolve_import(self, source: str, from_file: str) -> Optional[str]:
        """Resolve a relative import to a project-relative path (no extension appended)."""
        if not source.startswith("."):
            return None
        from_dir = os.path.dirname(from_file)
        raw = os.path.normpath(os.path.join(from_dir, source)).replace("\\", "/")
        return raw

    def _path_exists(self, resolved: str, known: set) -> bool:
        suffixes = ["", ".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts", "/index.js"]
        for suf in suffixes:
            candidate = resolved + suf
            if candidate in known:
                return True
            if os.path.exists(os.path.join(self.workspace_path, candidate)):
                return True
        return False
