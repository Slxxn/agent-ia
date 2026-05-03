"""
Static Post-Processor — runs after Phase 3 code generation, before npm install.

Automatically fixes recurring bugs that the LLM generates despite prompt constraints:
  1. Section backgrounds: replaces bg-[var(--surface)] with bg-slate-50 in light-theme projects
  2. Navbar active state: replaces naive split('#')[0] detection with the isActive helper
  3. BrowserRouter split: ensures main.tsx wraps App, App.tsx has no BrowserRouter

Never raises — all fixes are best-effort and logged.
"""

from __future__ import annotations

import json
import os
import re
from typing import Optional

from backend.db.database import add_log


class StaticPostProcessor:
    def __init__(self, workspace_path: str, logo_url: str = ""):
        self.workspace_path = workspace_path
        self.logo_url = logo_url

    async def run(self, project_id: int) -> None:
        await add_log(project_id, "═══ PHASE 3.4 : POST-TRAITEMENT STATIQUE ═══", "info")
        try:
            await self._fix_missing_react_imports(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor React imports : {e}", "debug")
        try:
            await self._fix_package_build_script(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor build script : {e}", "debug")
        try:
            await self._fix_vite_alias(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor vite alias : {e}", "debug")
        try:
            await self._fix_tsconfig(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor tsconfig : {e}", "debug")
        try:
            await self._fix_jsx_entities(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor JSX entities : {e}", "debug")
        try:
            await self._fix_button_variants(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor button variants : {e}", "debug")
        try:
            await self._fix_button_href(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor button href : {e}", "debug")
        try:
            await self._fix_named_default_imports(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor named imports : {e}", "debug")
        try:
            await self._fix_css_opacity_vars(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor CSS opacity vars : {e}", "debug")
        try:
            await self._fix_section_backgrounds(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor backgrounds : {e}", "debug")
        try:
            await self._fix_navbar_active(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor navbar : {e}", "debug")
        try:
            await self._fix_browser_router(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor BrowserRouter : {e}", "debug")
        try:
            await self._fix_providers(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor providers : {e}", "debug")
        try:
            await self._fix_animation_variants(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor animation variants : {e}", "debug")
        try:
            await self._fix_font_variable(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor font variable : {e}", "debug")
        try:
            await self._fix_section_spacing(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor section spacing : {e}", "debug")
        try:
            await self._fix_missing_css_classes(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor CSS classes : {e}", "debug")
        try:
            await self._fix_navbar_logo(project_id)
        except Exception as e:
            await add_log(project_id, f"⚠️ Post-processor navbar logo : {e}", "debug")

    # ── NEW: missing React / Router imports ──────────────────────────────────

    # APIs that must be imported from 'react'
    _REACT_APIS: dict[str, re.Pattern] = {
        'createContext': re.compile(r'\bcreateContext\s*[(<]'),
        'useContext':    re.compile(r'\buseContext\s*\('),
        'useState':      re.compile(r'\buseState\s*[\(<]'),
        'useEffect':     re.compile(r'\buseEffect\s*\('),
        'useRef':        re.compile(r'\buseRef\s*[\(<]'),
        'useCallback':   re.compile(r'\buseCallback\s*\('),
        'useMemo':       re.compile(r'\buseMemo\s*\('),
        'useReducer':    re.compile(r'\buseReducer\s*\('),
        'forwardRef':    re.compile(r'\bforwardRef\s*[\(<]'),
        'memo':          re.compile(r'\bmemo\s*\('),
    }

    # APIs that must be imported from 'react-router-dom'
    _ROUTER_APIS: dict[str, re.Pattern] = {
        'Routes':       re.compile(r'<Routes[\s>/]'),
        'Route':        re.compile(r'<Route[\s>/]'),
        'Link':         re.compile(r'<Link[\s>/]'),
        'NavLink':      re.compile(r'<NavLink[\s>/]'),
        'Navigate':     re.compile(r'<Navigate[\s>/]|\bNavigate\s*\('),
        'Outlet':       re.compile(r'<Outlet[\s>/]'),
        'useNavigate':  re.compile(r'\buseNavigate\s*\('),
        'useLocation':  re.compile(r'\buseLocation\s*\('),
        'useParams':    re.compile(r'\buseParams\s*\('),
    }

    @staticmethod
    def _get_imported_names(content: str, module: str) -> set[str]:
        """Return set of names already imported from `module`."""
        names: set[str] = set()
        for m in re.finditer(
            rf"import\s*\{{([^}}]*)\}}\s*from\s*['\"]{{module}}['\"]".replace("{module}", re.escape(module)),
            content,
        ):
            for name in m.group(1).split(','):
                stripped = name.strip().split(' as ')[0].strip()
                if stripped:
                    names.add(stripped)
        return names

    async def _fix_missing_react_imports(self, project_id: int) -> None:
        """Add missing React hooks and router imports to files that use them without importing."""
        src_dir = os.path.join(self.workspace_path, "src")
        if not os.path.exists(src_dir):
            return

        fixed = 0
        for root, _dirs, files in os.walk(src_dir):
            if "node_modules" in root:
                continue
            for fname in files:
                if not fname.endswith((".tsx", ".ts", ".jsx", ".js")):
                    continue
                fpath = os.path.join(root, fname)
                try:
                    with open(fpath, encoding="utf-8") as f:
                        content = f.read()
                except OSError:
                    continue

                original = content

                # --- React imports ---
                already_react = self._get_imported_names(content, "react")
                needed_react: set[str] = set()
                for api, pattern in self._REACT_APIS.items():
                    if api not in already_react and pattern.search(content):
                        needed_react.add(api)

                if needed_react:
                    existing = re.search(
                        r"import\s*\{([^}]*)\}\s*from\s*['\"]react['\"]",
                        content,
                    )
                    if existing:
                        old_names = {n.strip() for n in existing.group(1).split(',') if n.strip()}
                        all_names = sorted(old_names | needed_react)
                        content = content.replace(
                            existing.group(0),
                            f"import {{ {', '.join(all_names)} }} from 'react';",
                        )
                    else:
                        new_line = f"import {{ {', '.join(sorted(needed_react))} }} from 'react';\n"
                        content = new_line + content

                # --- Router imports ---
                already_router = self._get_imported_names(content, "react-router-dom")
                needed_router: set[str] = set()
                for api, pattern in self._ROUTER_APIS.items():
                    if api not in already_router and pattern.search(content):
                        needed_router.add(api)

                if needed_router:
                    existing = re.search(
                        r"import\s*\{([^}]*)\}\s*from\s*['\"]react-router-dom['\"]",
                        content,
                    )
                    if existing:
                        old_names = {n.strip() for n in existing.group(1).split(',') if n.strip()}
                        all_names = sorted(old_names | needed_router)
                        content = content.replace(
                            existing.group(0),
                            f"import {{ {', '.join(all_names)} }} from 'react-router-dom';",
                        )
                    else:
                        new_line = f"import {{ {', '.join(sorted(needed_router))} }} from 'react-router-dom';\n"
                        # Insert after React import if present
                        react_imp = re.search(r"(import\s*\{[^}]*\}\s*from\s*['\"]react['\"];?\n?)", content)
                        if react_imp:
                            pos = react_imp.end()
                            content = content[:pos] + new_line + content[pos:]
                        else:
                            content = new_line + content

                # --- Firebase: ensure initializeApp imported from 'firebase/app' ---
                uses_firebase_sdks = re.search(
                    r"from\s*['\"]firebase/(auth|firestore|storage)['\"]", content
                )
                has_app_import = re.search(r"from\s*['\"]firebase/app['\"]", content)
                uses_init = re.search(r'\binitializeApp\s*\(', content)
                if uses_firebase_sdks and uses_init and not has_app_import:
                    new_line = "import { initializeApp, getApps } from 'firebase/app';\n"
                    content = new_line + content

                if content != original:
                    with open(fpath, "w", encoding="utf-8") as f:
                        f.write(content)
                    fixed += 1

        if fixed:
            await add_log(project_id, f"✅ Imports manquants : React/Router/Firebase ajoutés dans {fixed} fichier(s).", "info")

    # ── NEW: package.json build script ───────────────────────────────────────

    async def _fix_package_build_script(self, project_id: int) -> None:
        """Change 'tsc && vite build' to 'vite build' to skip broken type checking."""
        pkg_path = os.path.join(self.workspace_path, "package.json")
        if not os.path.exists(pkg_path):
            return
        with open(pkg_path, encoding="utf-8") as f:
            pkg = json.load(f)
        build_cmd = pkg.get("scripts", {}).get("build", "")
        if "tsc &&" in build_cmd:
            pkg["scripts"]["build"] = build_cmd.replace("tsc && ", "").replace("tsc&& ", "")
            with open(pkg_path, "w", encoding="utf-8") as f:
                json.dump(pkg, f, indent=2)
            await add_log(project_id, "✅ Build script : tsc supprimé (vite build seul).", "info")

    # ── NEW: vite.config.ts @ alias ───────────────────────────────────────────

    async def _fix_vite_alias(self, project_id: int) -> None:
        """Inject @ path alias into vite.config.ts if missing."""
        vite_path = os.path.join(self.workspace_path, "vite.config.ts")
        if not os.path.exists(vite_path):
            vite_path = os.path.join(self.workspace_path, "vite.config.js")
        if not os.path.exists(vite_path):
            return
        with open(vite_path, encoding="utf-8") as f:
            content = f.read()
        if "alias" in content:
            return
        # Add path import if missing
        if "import path" not in content:
            content = "import path from 'path';\n" + content
        # Inject resolve.alias into defineConfig
        content = re.sub(
            r"(plugins\s*:\s*\[)",
            "resolve: { alias: { '@': path.resolve(__dirname, './src') } },\n  \\1",
            content,
            count=1,
        )
        with open(vite_path, "w", encoding="utf-8") as f:
            f.write(content)
        await add_log(project_id, "✅ Vite config : alias @ → ./src injecté.", "info")

    # ── NEW: button variant fixer ─────────────────────────────────────────────

    async def _fix_button_variants(self, project_id: int) -> None:
        """Replace invalid variant='filled' with variant='primary' across all TSX/JSX files."""
        src_dir = os.path.join(self.workspace_path, "src")
        if not os.path.exists(src_dir):
            return
        fixed = 0
        for root, _dirs, files in os.walk(src_dir):
            if "node_modules" in root:
                continue
            for fname in files:
                if not fname.endswith((".tsx", ".jsx")):
                    continue
                fpath = os.path.join(root, fname)
                with open(fpath, encoding="utf-8") as f:
                    content = f.read()
                new = content.replace('variant="filled"', 'variant="primary"').replace("variant='filled'", "variant='primary'")
                # Also fix dynamic: plan.popular ? 'filled' : 'outline' → 'primary'
                new = re.sub(r"'\bfilled\b'", "'primary'", new)
                if new != content:
                    with open(fpath, "w", encoding="utf-8") as f:
                        f.write(new)
                    fixed += 1
        if fixed:
            await add_log(project_id, f"✅ Button variants : variant='filled' → 'primary' dans {fixed} fichier(s).", "info")

    # ── NEW: button href fixer ────────────────────────────────────────────────

    async def _fix_button_href(self, project_id: int) -> None:
        """Wrap <Button href={...}> in <a href={...}> since Button has no href prop."""
        src_dir = os.path.join(self.workspace_path, "src")
        if not os.path.exists(src_dir):
            return
        fixed = 0
        pattern = re.compile(
            r'<Button([^>]*)\shref=(\{[^}]+\}|"[^"]*")([^>]*)>(.*?)</Button>',
            re.DOTALL,
        )
        for root, _dirs, files in os.walk(src_dir):
            if "node_modules" in root:
                continue
            for fname in files:
                if not fname.endswith((".tsx", ".jsx")):
                    continue
                fpath = os.path.join(root, fname)
                with open(fpath, encoding="utf-8") as f:
                    content = f.read()
                def replace_btn_href(m: re.Match) -> str:
                    before = m.group(1)
                    href = m.group(2)
                    after = m.group(3)
                    inner = m.group(4)
                    attrs = (before + after).strip()
                    return f'<a href={href}><Button {attrs}>{inner}</Button></a>'
                new = pattern.sub(replace_btn_href, content)
                if new != content:
                    with open(fpath, "w", encoding="utf-8") as f:
                        f.write(new)
                    fixed += 1
        if fixed:
            await add_log(project_id, f"✅ Button href : wrappé dans <a> dans {fixed} fichier(s).", "info")

    # ── NEW: named→default import fixer ──────────────────────────────────────

    async def _fix_named_default_imports(self, project_id: int) -> None:
        """
        For each UI/component file that uses `export default`, convert any
        named import of that component elsewhere to a default import.
        """
        src_dir = os.path.join(self.workspace_path, "src")
        if not os.path.exists(src_dir):
            return

        # Build map: component_name → True if it uses export default
        default_exports: set[str] = set()
        for root, _dirs, files in os.walk(src_dir):
            if "node_modules" in root:
                continue
            for fname in files:
                if not fname.endswith((".tsx", ".ts")):
                    continue
                fpath = os.path.join(root, fname)
                with open(fpath, encoding="utf-8") as f:
                    content = f.read()
                for m in re.finditer(r'export\s+default\s+(?:function\s+|class\s+)?(\w+)', content):
                    default_exports.add(m.group(1))

        if not default_exports:
            return

        fixed = 0
        for root, _dirs, files in os.walk(src_dir):
            if "node_modules" in root:
                continue
            for fname in files:
                if not fname.endswith((".tsx", ".ts")):
                    continue
                fpath = os.path.join(root, fname)
                with open(fpath, encoding="utf-8") as f:
                    content = f.read()
                original = content
                for name in default_exports:
                    # import { Name } from '...' → import Name from '...'
                    content = re.sub(
                        rf"import\s+\{{\s*{name}\s*\}}\s+from\s+('[^']+?'|\"[^\"]+?\")",
                        rf"import {name} from \1",
                        content,
                    )
                if content != original:
                    with open(fpath, "w", encoding="utf-8") as f:
                        f.write(content)
                    fixed += 1

        if fixed:
            await add_log(project_id, f"✅ Imports : named→default corrigé dans {fixed} fichier(s).", "info")

    # ── NEW: CSS opacity arbitrary var fixer ──────────────────────────────────

    async def _fix_css_opacity_vars(self, project_id: int) -> None:
        """
        Replace bg-[var(--x)]/N (unsupported Tailwind) with plain bg-[var(--x)]
        and border-[var(--x)]/N with border-[var(--x)] across all CSS/TSX files.
        """
        fixed = 0
        pattern = re.compile(r'((?:bg|border|text|ring)-\[var\([^)]+\)\])/\d+')
        for root, _dirs, files in os.walk(self.workspace_path):
            if "node_modules" in root:
                continue
            for fname in files:
                if not fname.endswith((".tsx", ".jsx", ".css")):
                    continue
                fpath = os.path.join(root, fname)
                with open(fpath, encoding="utf-8") as f:
                    content = f.read()
                new = pattern.sub(r'\1', content)
                if new != content:
                    with open(fpath, "w", encoding="utf-8") as f:
                        f.write(new)
                    fixed += 1
        if fixed:
            await add_log(project_id, f"✅ CSS vars opacity : /N supprimé dans {fixed} fichier(s).", "info")

    # ── 0a. tsconfig.json fix ─────────────────────────────────────────────────

    async def _fix_tsconfig(self, project_id: int) -> None:
        """Remove invalid 'references' and enforce correct compilerOptions."""
        tsconfig_path = os.path.join(self.workspace_path, "tsconfig.json")
        if not os.path.exists(tsconfig_path):
            return
        with open(tsconfig_path, encoding="utf-8") as f:
            raw = f.read()
        # Strip JS-style comments before parsing
        cleaned = re.sub(r'//[^\n]*', '', raw)
        cleaned = re.sub(r'/\*.*?\*/', '', cleaned, flags=re.DOTALL)
        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError:
            return

        changed = False
        if "references" in data:
            del data["references"]
            changed = True

        co = data.setdefault("compilerOptions", {})
        required = {
            "target": "ES2020", "module": "ESNext",
            "moduleResolution": "bundler", "jsx": "react-jsx",
            "noEmit": True, "skipLibCheck": True, "strict": True,
        }
        for key, val in required.items():
            if co.get(key) != val:
                co[key] = val
                changed = True

        if "src" not in data.get("include", []):
            data["include"] = ["src"]
            changed = True

        if changed:
            with open(tsconfig_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            await add_log(project_id, "✅ tsconfig.json : références invalides supprimées, compilerOptions corrigés.", "info")

    # ── 0b. JSX unescaped > fix ────────────────────────────────────────────────

    async def _fix_jsx_entities(self, project_id: int) -> None:
        """Replace bare > in JSX text positions (not in tags/attrs) with &gt;."""
        src_dir = os.path.join(self.workspace_path, "src")
        if not os.path.exists(src_dir):
            return

        # Matches > that is not: inside a JSX tag (<...>), after = (attribute value),
        # or followed immediately by < or / (closing tag). Targets human-readable text like "IXSHEL&CO>".
        pattern = re.compile(r'(?<![=<{(/])>(?!\s*[/<{])')
        fixed = 0

        for root, _dirs, files in os.walk(src_dir):
            if "node_modules" in root:
                continue
            for fname in files:
                if not fname.endswith((".tsx", ".jsx")):
                    continue
                fpath = os.path.join(root, fname)
                try:
                    with open(fpath, encoding="utf-8") as f:
                        content = f.read()

                    # Only fix > that appears inside JSX text (between > and <)
                    # Strategy: find JSX text nodes and replace bare > within them
                    new_content = self._fix_jsx_gt_in_text_nodes(content)
                    if new_content != content:
                        with open(fpath, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        fixed += 1
                except OSError:
                    continue

        if fixed:
            await add_log(project_id, f"✅ JSX entities : > non échappé corrigé dans {fixed} fichier(s).", "info")

    @staticmethod
    def _fix_jsx_gt_in_text_nodes(content: str) -> str:
        """Fix bare > inside JSX text content (between > ... <) that would break TSX parsing."""
        # Match JSX text nodes: content between a closing > and an opening <
        # that contains a bare > not part of an arrow function or comparison
        def replace_in_text(m: re.Match) -> str:
            text = m.group(0)
            # Only replace > that's inside a word boundary context like "BRAND&CO>"
            # not standalone operators. Heuristic: preceded by word char or &
            fixed = re.sub(r'(?<=[\w;])>', '&gt;', text)
            return fixed

        # Find JSX text regions: between }> or tag-close > and next tag-open <
        result = re.sub(
            r'(?<=>)([^<>{]+)(?=<)',
            replace_in_text,
            content,
        )
        return result

    # ── 0c. Context providers auto-wiring ─────────────────────────────────────

    async def _fix_providers(self, project_id: int) -> None:
        """Scan context files for exported Providers, inject them into App.tsx."""
        app_path = self._find_file("App.tsx") or self._find_file("App.jsx")
        if not app_path:
            return

        context_dir = self._find_dir("contexts") or self._find_dir("context") or self._find_dir("store")
        if not context_dir:
            return

        providers: list[tuple[str, str]] = []  # (ProviderName, import_path)
        for fname in sorted(os.listdir(context_dir)):
            if not fname.endswith((".tsx", ".ts")):
                continue
            fpath = os.path.join(context_dir, fname)
            try:
                with open(fpath, encoding="utf-8") as f:
                    src = f.read()
            except OSError:
                continue
            for m in re.finditer(r'export\s+(?:const|function|default\s+function)\s+(\w*Provider\w*)\b', src):
                provider_name = m.group(1)
                module_stem = fname.rsplit(".", 1)[0]
                # Build relative import path from App.tsx location
                app_dir = os.path.dirname(app_path)
                ctx_rel = os.path.relpath(context_dir, app_dir).replace("\\", "/")
                import_path = f"{ctx_rel}/{module_stem}"
                if not import_path.startswith("."):
                    import_path = "./" + import_path
                providers.append((provider_name, import_path))

        if not providers:
            return

        with open(app_path, encoding="utf-8") as f:
            app_content = f.read()

        original = app_content
        for provider_name, import_path in providers:
            # Add import if missing
            if provider_name not in app_content:
                import_line = f"import {{ {provider_name} }} from '{import_path}';\n"
                # Insert after last existing import line
                last_import = list(re.finditer(r'^import\s+.+;?\s*$', app_content, re.MULTILINE))
                if last_import:
                    pos = last_import[-1].end()
                    app_content = app_content[:pos] + "\n" + import_line + app_content[pos:]
                else:
                    app_content = import_line + app_content

            # Wrap JSX if not already wrapped
            if f"<{provider_name}" not in app_content:
                app_content = self._wrap_jsx_with_provider(app_content, provider_name)

        if app_content != original:
            with open(app_path, "w", encoding="utf-8") as f:
                f.write(app_content)
            names = ", ".join(p[0] for p in providers)
            await add_log(project_id, f"✅ Providers auto-wirés dans App.tsx : {names}.", "info")

    @staticmethod
    def _wrap_jsx_with_provider(content: str, provider_name: str) -> str:
        """Wrap the inner JSX of the return() block with <ProviderName>...</ProviderName>."""
        # Insert <Provider> right after return ( <, and </Provider> before last ) of return block
        content = re.sub(
            r'(return\s*\(\s*\n?\s*)(<)',
            rf'\1<{provider_name}>\n    \2',
            content,
            count=1,
        )
        # Insert closing tag before the final ); of the return block
        # Find last </Something> before ); and insert </Provider> after it
        content = re.sub(
            r'(\n(\s*)</\w+>\s*\n\s*\)\s*;?\s*\n(\s*\}\s*\n\s*export))',
            rf'\n\2</{provider_name}>\1',
            content,
            count=1,
        )
        return content

    # ── 1. Section backgrounds ─────────────────────────────────────────────────

    async def _fix_section_backgrounds(self, project_id: int) -> None:
        """Replace bg-[var(--surface)] with bg-slate-50 in section files (light theme)."""
        if self._is_dark_theme():
            return  # dark theme: var(--surface) is #18181B, already visually distinct

        sections_dir = self._find_dir("sections")
        if not sections_dir:
            return

        fixed = 0
        for fname in os.listdir(sections_dir):
            if not fname.endswith((".tsx", ".jsx", ".ts", ".js")):
                continue
            fpath = os.path.join(sections_dir, fname)
            try:
                with open(fpath, encoding="utf-8") as f:
                    content = f.read()
                if "bg-[var(--surface)]" not in content:
                    continue
                new_content = content.replace("bg-[var(--surface)]", "bg-violet-50")
                with open(fpath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                fixed += 1
            except OSError:
                continue

        if fixed:
            await add_log(project_id, f"✅ Backgrounds : {fixed} section(s) corrigées (bg-[var(--surface)] → bg-violet-50).", "info")

    def _is_dark_theme(self) -> bool:
        """Detect dark theme by checking for --bg: #09090B in index.css or globals.css."""
        for css_name in ("index.css", "globals.css", "global.css"):
            css_path = self._find_file(css_name)
            if css_path:
                try:
                    with open(css_path, encoding="utf-8") as f:
                        content = f.read()
                    if "--bg:" in content and "#09090" in content:
                        return True
                    if "--bg:" in content and "#0a0a0" in content.lower():
                        return True
                except OSError:
                    pass
        return False

    # ── 2. Navbar active state ─────────────────────────────────────────────────

    _ISACTIVE_HELPER = """\
  const isActive = (path: string) => {
    if (path.startsWith('/#')) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };\n"""

    async def _fix_navbar_active(self, project_id: int) -> None:
        """Replace naive split('#')[0] active detection with the isActive helper."""
        navbar_path = self._find_navbar()
        if not navbar_path:
            return

        with open(navbar_path, encoding="utf-8") as f:
            content = f.read()

        # Only fix if the naive pattern is present
        if "split('#')[0]" not in content and "split('#')" not in content:
            return

        # 1. Inject isActive helper before the return statement (if not already present)
        if "const isActive" not in content:
            # Find the line with "return (" in the component function body
            content = re.sub(
                r'(\n\s*return\s*\()',
                lambda m: f"\n{self._ISACTIVE_HELPER}{m.group(1)}",
                content,
                count=1,
            )

        # 2. Replace className conditions that use split('#')[0]
        # Pattern: location.pathname === link.path.split('#')[0] || (... startsWith ...)
        content = re.sub(
            r"location\.pathname === link\.path\.split\('#'\)\[0\]"
            r".*?(?=\s*\?)",
            "isActive(link.path)",
            content,
            flags=re.DOTALL,
        )

        # 3. Fix duplicate key={link.path} when multiple nav items share the same path
        # Replace key={link.path} with key={link.label} inside navLinks.map
        content = re.sub(
            r'(navLinks\.map\([^)]+\)[^{]*\{[^}]*key=\{)link\.path(\})',
            r'\1link.label\2',
            content,
        )

        with open(navbar_path, "w", encoding="utf-8") as f:
            f.write(content)

        await add_log(project_id, "✅ Navbar : isActive helper injecté, détection active corrigée.", "info")

    # ── 3. BrowserRouter split ─────────────────────────────────────────────────

    async def _fix_browser_router(self, project_id: int) -> None:
        """Ensure BrowserRouter is only in main.tsx, not inside App.tsx."""
        app_path = self._find_file("App.tsx") or self._find_file("App.jsx")
        main_path = self._find_file("main.tsx") or self._find_file("main.jsx")

        if app_path:
            with open(app_path, encoding="utf-8") as f:
                app_content = f.read()

            # If App.tsx contains BrowserRouter AND main.tsx also contains it → remove from App.tsx
            if "BrowserRouter" in app_content and main_path:
                with open(main_path, encoding="utf-8") as f:
                    main_content = f.read()

                if "BrowserRouter" in main_content:
                    # Remove BrowserRouter wrapper from App.tsx
                    fixed = re.sub(
                        r'<BrowserRouter>\s*\n(\s*)',
                        '',
                        app_content,
                    )
                    fixed = re.sub(r'\s*</BrowserRouter>', '', fixed)
                    # Also remove the import if no longer needed
                    if "BrowserRouter" not in fixed.replace("import", ""):
                        fixed = re.sub(
                            r',?\s*BrowserRouter\s*,?',
                            lambda m: ',' if m.group().strip() == ',' else '',
                            fixed,
                        )
                        fixed = re.sub(r"import\s*\{\s*,\s*", "import { ", fixed)
                        fixed = re.sub(r",\s*\}", " }", fixed)

                    with open(app_path, "w", encoding="utf-8") as f:
                        f.write(fixed)
                    await add_log(project_id, "✅ BrowserRouter : supprimé de App.tsx (déjà dans main.tsx).", "info")

        if main_path:
            with open(main_path, encoding="utf-8") as f:
                main_content = f.read()

            # If main.tsx has NO BrowserRouter but App.tsx does NOT either → add to main.tsx
            if "BrowserRouter" not in main_content:
                app_has_router = False
                if app_path:
                    with open(app_path, encoding="utf-8") as f:
                        app_has_router = "BrowserRouter" in f.read()

                if not app_has_router:
                    # Add BrowserRouter import and wrap App
                    if "react-router-dom" not in main_content:
                        main_content = "import { BrowserRouter } from 'react-router-dom';\n" + main_content
                    elif "BrowserRouter" not in main_content:
                        main_content = re.sub(
                            r"(from 'react-router-dom')",
                            r"",
                            main_content,
                        )
                        main_content = re.sub(
                            r"import \{([^}]+)\} from 'react-router-dom'",
                            lambda m: f"import {{ BrowserRouter, {m.group(1).strip()} }} from 'react-router-dom'",
                            main_content,
                        )

                    main_content = re.sub(
                        r'(<App\s*/>)',
                        r'<BrowserRouter>\1</BrowserRouter>',
                        main_content,
                    )
                    with open(main_path, "w", encoding="utf-8") as f:
                        f.write(main_content)
                    await add_log(project_id, "✅ BrowserRouter : ajouté dans main.tsx pour wrapper App.", "info")

    # ── Animation variant key fixer ───────────────────────────────────────────

    async def _fix_animation_variants(self, project_id: int) -> None:
        """
        Fix Framer Motion variant key mismatches.
        staggerContainer/staggerItem use 'hidden'/'show'.
        fadeInUp/scaleIn/fadeIn use 'hidden'/'visible'.
        When mixed, animate= or whileInView= must match the variant's keys.
        """
        fixed_files = 0
        for root, _dirs, files in os.walk(self.workspace_path):
            if "node_modules" in root:
                continue
            for fname in files:
                if not fname.endswith((".tsx", ".jsx")):
                    continue
                path = os.path.join(root, fname)
                with open(path, encoding="utf-8") as f:
                    content = f.read()

                original = content

                # Pattern: variants={staggerContainer} ... whileInView="visible"
                # Fix: whileInView="visible" → whileInView="show"
                # We look for motion elements that have staggerContainer AND visible animate key
                def fix_stagger_visible(text: str) -> str:
                    # Find motion.X blocks that reference staggerContainer or staggerItem
                    # and use animate="visible" or whileInView="visible"
                    # Strategy: scan line by line for the pattern within JSX blocks
                    lines = text.split('\n')
                    result = []
                    in_stagger_block = False
                    brace_depth = 0

                    for i, line in enumerate(lines):
                        # Detect start of a motion element with staggerContainer
                        if 'variants={staggerContainer}' in line or 'variants={staggerItem}' in line:
                            in_stagger_block = True

                        if in_stagger_block:
                            # Fix the animate= key on this or nearby lines
                            line = line.replace('animate="visible"', 'animate="show"')
                            line = line.replace("animate='visible'", "animate='show'")
                            line = line.replace('whileInView="visible"', 'whileInView="show"')
                            line = line.replace("whileInView='visible'", "whileInView='show'")

                            # Reset after we've seen the closing > of the opening tag
                            if '>' in line and 'variants={stagger' not in line:
                                in_stagger_block = False

                        result.append(line)
                    return '\n'.join(result)

                content = fix_stagger_visible(content)

                if content != original:
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(content)
                    fixed_files += 1

        if fixed_files:
            await add_log(project_id, f"✅ Animation variants : corrigé dans {fixed_files} fichier(s) (stagger→show).", "info")

    # ── Font variable consistency fixer ───────────────────────────────────────

    async def _fix_font_variable(self, project_id: int) -> None:
        """
        Ensure --font-display in globals.css matches the font loaded in index.html.
        Extracts font family names from Google Fonts link and updates CSS variable.
        """
        index_path = os.path.join(self.workspace_path, "index.html")
        globals_path = self._find_file("globals.css")

        if not index_path or not os.path.exists(index_path) or not globals_path:
            return

        with open(index_path, encoding="utf-8") as f:
            index_content = f.read()

        # Extract font families from Google Fonts URL
        fonts_match = re.search(r'fonts\.googleapis\.com/css2\?([^"\']+)', index_content)
        if not fonts_match:
            return

        font_string = fonts_match.group(1)
        # Extract family names: family=Cormorant+Garamond → "Cormorant Garamond"
        families = re.findall(r'family=([A-Za-z+]+)', font_string)
        families = [f.replace('+', ' ') for f in families]

        if not families:
            return

        with open(globals_path, encoding="utf-8") as f:
            css = f.read()

        original = css
        # First family = display font, second = body font (if exists)
        display_font = families[0]
        body_font = families[1] if len(families) > 1 else None

        # Fix --font-display if it doesn't match any loaded font
        loaded_names = [f.lower() for f in families]
        display_match = re.search(r"--font-display:\s*'([^']+)'", css)
        if display_match:
            current = display_match.group(1).lower()
            if not any(current in name or name in current for name in loaded_names):
                # Replace with the first loaded font
                is_serif = any(k in display_font.lower() for k in ['garamond', 'serif', 'playfair', 'lora', 'merriweather'])
                fallback = 'serif' if is_serif else 'sans-serif'
                css = re.sub(
                    r"--font-display:\s*'[^']+',\s*[^;]+;",
                    f"--font-display: '{display_font}', {fallback};",
                    css,
                )

        if body_font:
            body_match = re.search(r"--font-body:\s*'([^']+)'", css)
            if body_match:
                current = body_match.group(1).lower()
                if not any(current in name or name in current for name in loaded_names):
                    css = re.sub(
                        r"--font-body:\s*'[^']+',\s*[^;]+;",
                        f"--font-body: '{body_font}', sans-serif;",
                        css,
                    )

        if css != original:
            with open(globals_path, "w", encoding="utf-8") as f:
                f.write(css)
            await add_log(project_id, f"✅ Font variable : --font-display alignée sur '{display_font}'.", "info")

    # ── Section spacing normalizer ─────────────────────────────────────────────

    async def _fix_section_spacing(self, project_id: int) -> None:
        """
        Replace excessively large vertical section padding with reasonable values.
        py-24 lg:py-32 and above → py-12 lg:py-16.
        Also fix double top padding when Layout already adds pt for navbar.
        """
        sections_dir = self._find_dir("sections")
        if not sections_dir:
            return

        # Check if Layout adds pt-* on main
        layout_path = self._find_file("Layout.tsx") or self._find_file("Layout.jsx")
        layout_adds_pt = False
        if layout_path:
            with open(layout_path, encoding="utf-8") as f:
                layout_adds_pt = bool(re.search(r'<main[^>]+pt-\d+', f.read()))

        fixed_files = 0
        for fname in os.listdir(sections_dir):
            if not fname.endswith((".tsx", ".jsx")):
                continue
            path = os.path.join(sections_dir, fname)
            with open(path, encoding="utf-8") as f:
                content = f.read()

            original = content

            # Reduce excessive section padding
            replacements = [
                (r'\bpy-24\s+lg:py-32\b', 'py-12 lg:py-16'),
                (r'\bpy-24\s+sm:py-32\s+lg:py-40\b', 'py-12 lg:py-16'),
                (r'\bpy-20\s+lg:py-28\b', 'py-12 lg:py-16'),
                (r'\bpy-24\s+lg:py-28\b', 'py-12 lg:py-16'),
                (r'\bpy-28\s+lg:py-36\b', 'py-12 lg:py-16'),
                (r'\bpy-32\s+lg:py-40\b', 'py-12 lg:py-16'),
            ]
            for pattern, replacement in replacements:
                content = re.sub(pattern, replacement, content)

            if content != original:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                fixed_files += 1

        # Fix HeroSection double top padding if Layout handles navbar offset
        if layout_adds_pt:
            hero_path = self._find_file("HeroSection.tsx") or self._find_file("HeroSection.jsx")
            if hero_path:
                with open(hero_path, encoding="utf-8") as f:
                    hero = f.read()
                original = hero
                # Replace large pt-* values that duplicate Layout's navbar offset
                hero = re.sub(r'\bpt-2[4-9]\b|\bpt-3[0-9]\b', 'pt-8', hero)
                hero = re.sub(r'\blg:pt-3[0-9]\b|\blg:pt-2[4-9]\b', 'lg:pt-12', hero)
                if hero != original:
                    with open(hero_path, "w", encoding="utf-8") as f:
                        f.write(hero)
                    fixed_files += 1

        if fixed_files:
            await add_log(project_id, f"✅ Section spacing : normalisé dans {fixed_files} fichier(s).", "info")

    # ── Missing CSS class injector ─────────────────────────────────────────────

    async def _fix_missing_css_classes(self, project_id: int) -> None:
        """
        Detect CSS class names used in TSX/JSX that are not Tailwind utilities
        and not defined in any CSS file, then inject definitions into globals.css.
        Covers: gradient-text, section-label, shadow-glow.
        """
        globals_path = self._find_file("globals.css")
        if not globals_path:
            return

        with open(globals_path, encoding="utf-8") as f:
            css = f.read()

        # Classes to check and their CSS definitions
        class_definitions = {
            'gradient-text': """\n/* Gradient text utility */\n.gradient-text {\n  background: linear-gradient(135deg, var(--primary, #6d28d9), var(--accent, #a78bfa));\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n}\n""",
            'section-label': """\n/* Section label badge */\n.section-label {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.375rem;\n  font-size: 0.7rem;\n  font-weight: 600;\n  letter-spacing: 0.12em;\n  text-transform: uppercase;\n  color: var(--accent, #6d28d9);\n  background-color: color-mix(in srgb, var(--accent, #6d28d9) 10%, transparent);\n  border: 1px solid color-mix(in srgb, var(--accent, #6d28d9) 25%, transparent);\n  border-radius: 9999px;\n  padding: 0.375rem 0.75rem;\n  margin-bottom: 1rem;\n}\n""",
            'shadow-glow': """\n/* Glow shadow for primary elements */\n.shadow-glow {\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary, #6d28d9) 20%, transparent);\n}\n""",
        }

        # Scan all TSX/JSX files to see which classes are actually used
        used_classes: set[str] = set()
        for root, _dirs, files in os.walk(self.workspace_path):
            if "node_modules" in root:
                continue
            for fname in files:
                if not fname.endswith((".tsx", ".jsx", ".ts", ".js")):
                    continue
                with open(os.path.join(root, fname), encoding="utf-8") as f:
                    file_content = f.read()
                for cls in class_definitions:
                    if cls in file_content:
                        used_classes.add(cls)

        injected = []
        for cls in used_classes:
            selector = f'.{cls}'
            if selector not in css:
                css += class_definitions[cls]
                injected.append(cls)

        if injected:
            with open(globals_path, "w", encoding="utf-8") as f:
                f.write(css)
            await add_log(project_id, f"✅ CSS classes injectées dans globals.css : {', '.join(injected)}.", "info")

    # ── Navbar logo injector ──────────────────────────────────────────────────

    async def _fix_navbar_logo(self, project_id: int) -> None:
        """
        If a logo_url was provided with the project, ensure the Navbar uses it.
        Replaces text/icon logos with an <img> tag pointing to the real logo.
        """
        if not self.logo_url:
            return

        navbar_path = self._find_navbar()
        if not navbar_path:
            return

        with open(navbar_path, encoding="utf-8") as f:
            content = f.read()

        # Already using the logo URL → nothing to do
        if self.logo_url in content:
            return

        original = content

        # Pattern 1: <Sparkles ... /> followed by <span>BRANDNAME</span> → replace whole logo block
        # Pattern 2: text-based logo with no img tag at all → inject img before brand text
        logo_img = f'<img src="{self.logo_url}" alt="logo" className="h-8 w-auto object-contain" />'

        # Try to replace common icon+text logo pattern
        replaced = re.sub(
            r'<(?:Sparkles|Star|Zap|Diamond|Logo)\s[^/]*/>\s*\n?\s*(<span[^>]*>[^<]*</span>)',
            logo_img + r' \1',
            content,
        )

        # If no icon found, try inserting before first <span> in logo Link
        if replaced == content:
            replaced = re.sub(
                r'(className="[^"]*(?:logo|brand|flex items-center)[^"]*"[^>]*>)\s*\n?\s*(<span)',
                rf'\1\n            {logo_img}\n            \2',
                content,
                count=1,
            )

        if replaced != original:
            with open(navbar_path, "w", encoding="utf-8") as f:
                f.write(replaced)
            await add_log(project_id, f"✅ Navbar logo : image injectée depuis logoUrl.", "info")

    # ── Helpers ────────────────────────────────────────────────────────────────

    def _find_file(self, filename: str) -> Optional[str]:
        """Walk src/ to find a file by name."""
        for root, _dirs, files in os.walk(self.workspace_path):
            if "node_modules" in root:
                continue
            if filename in files:
                return os.path.join(root, filename)
        return None

    def _find_dir(self, dirname: str) -> Optional[str]:
        """Walk workspace to find a directory by name."""
        for root, dirs, _files in os.walk(self.workspace_path):
            if "node_modules" in root:
                continue
            if dirname in dirs:
                return os.path.join(root, dirname)
        return None

    def _find_navbar(self) -> Optional[str]:
        """Find Navbar.tsx / Navbar.jsx anywhere in src/."""
        for name in ("Navbar.tsx", "Navbar.jsx", "navbar.tsx", "navbar.jsx"):
            path = self._find_file(name)
            if path:
                return path
        return None
