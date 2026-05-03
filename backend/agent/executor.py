"""
Agent Executor — Exécute les tâches une par une en utilisant les tools.
Gère les retries, la validation et le logging.
"""

import os
import re
from typing import Dict, Any, Optional, List, Callable, TYPE_CHECKING
from backend.tools.filesystem import FilesystemTool
from backend.tools.terminal import TerminalTool
from backend.tools.llm import LLMTool, get_model_for_complexity, route_model
from backend.agent.task_classifier import classify_task, COMPLEXITY_LABELS
from backend.db.database import add_log, add_tokens_used

if TYPE_CHECKING:
    from backend.agent.project_brain import ProjectBrain
from backend.prompts.templates import (
    STATIC_PROJECT_PROMPT,
    REACT_NODE_SQLITE_PROJECT_PROMPT,
    REACT_SUPABASE_PROJECT_PROMPT,
    STRIPE_INTEGRATION_PROMPT,
    PAYPAL_INTEGRATION_PROMPT,
)

MAX_RETRIES = 3
MAX_REPAIR_ATTEMPTS = 2  # nb max de relances LLM pour réparer un fichier tronqué

# Mots clés de langage qui ne sont JAMAIS des noms de fichiers
LANG_KEYWORDS = {
    'python', 'py', 'javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx',
    'java', 'kotlin', 'kt', 'scala',
    'html', 'htm', 'xhtml',
    'css', 'scss', 'sass', 'less',
    'json', 'jsonc', 'yaml', 'yml', 'xml', 'toml', 'ini', 'cfg', 'conf', 'env',
    'sql', 'sqlite',
    'bash', 'shell', 'sh', 'zsh', 'fish', 'powershell', 'ps1', 'bat', 'cmd',
    'markdown', 'md', 'mdx', 'rst',
    'text', 'txt', 'plaintext',
    'rust', 'rs', 'go', 'c', 'cpp', 'cxx', 'h', 'hpp', 'cs',
    'ruby', 'rb', 'php', 'dockerfile', 'docker',
    'command', 'console', 'output', 'log', 'diff',
}

# ─── Patterns de détection de troncature/incomplétude ──────────────────
TRUNCATION_MARKERS = [
    re.compile(r'\.\.\.\s*$'),                          # finit par ...
    re.compile(r'//\s*reste du code', re.IGNORECASE),   # // reste du code
    re.compile(r'<!--\s*contenu.*-->', re.IGNORECASE),   # <!-- contenu ici -->
    re.compile(r'\bTODO\b.{0,40}$', re.IGNORECASE),     # TODO en fin de ligne
    re.compile(r'à compléter', re.IGNORECASE),
    re.compile(r'voir plus haut', re.IGNORECASE),
]

# ─── Fichiers système qui ne doivent jamais être traités comme fantômes ─────
GHOST_FILE_WHITELIST = {
    'vite-env.d.ts', 'vite.config.ts', 'vite.config.js',
    'tsconfig.json', 'tsconfig.node.json', 'tsconfig.app.json',
    'postcss.config.js', 'postcss.config.cjs',
    'tailwind.config.ts', 'tailwind.config.js',
    'eslint.config.js', '.eslintrc.js', '.eslintrc.json',
    'prettier.config.js', '.prettierrc',
}

# Contenu par défaut pour les fichiers système connus si fantômes
GHOST_FILE_DEFAULTS = {
    'vite-env.d.ts': '/// <reference types="vite/client" />\n',
}

# ─── Patterns de détection de fichiers fantômes ─────────────────────────
# Un fichier "fantôme" n'a que des commentaires, pas de vrai code.
GHOST_FILE_MARKERS = [
    re.compile(r'^\s*//\s*(déjà existant|already exists?|existant|supposé|supposé présent)', re.IGNORECASE | re.MULTILINE),
    re.compile(r'^\s*//\s*(voir fichier|see file|à vérifier|to check)', re.IGNORECASE | re.MULTILINE),
    re.compile(r'^\s*//\s*(composant|component|store|context)\s+\w+\s*(déjà|already)', re.IGNORECASE | re.MULTILINE),
    re.compile(r'^\s*#\s*(déjà existant|already exists?|supposé)', re.IGNORECASE | re.MULTILINE),
]

# Map langage -> extension par défaut
LANG_TO_EXT = {
    'python': '.py', 'py': '.py',
    'javascript': '.js', 'js': '.js',
    'typescript': '.ts', 'ts': '.ts',
    'jsx': '.jsx', 'tsx': '.tsx',
    'html': '.html', 'htm': '.html',
    'css': '.css', 'scss': '.scss',
    'json': '.json', 'jsonc': '.json',
    'yaml': '.yaml', 'yml': '.yaml',
    'toml': '.toml',
    'markdown': '.md', 'md': '.md',
    'sql': '.sql',
    'rust': '.rs', 'rs': '.rs',
    'go': '.go',
    'java': '.java',
    'c': '.c', 'cpp': '.cpp',
    'ruby': '.rb', 'rb': '.rb',
    'php': '.php',
    'dockerfile': 'Dockerfile',
}

# Hooks/exports courants et leurs alias à toujours générer ensemble
HOOK_ALIASES = {
    'useCart': ['useCartStore', 'useCartContext'],
    'useCartStore': ['useCart', 'useCartContext'],
    'useAuth': ['useAuthStore', 'useAuthContext'],
    'useAuthStore': ['useAuth', 'useAuthContext'],
}


def _is_safe_filename(name: str) -> bool:
    """Valide qu'un nom de fichier est sûr (pas de ':' Windows, pas de '..')."""
    if not name:
        return False
    if any(c in name for c in (':', '\x00', '<', '>', '|', '?', '*', '"')):
        return False
    if '..' in name.split('/') or '..' in name.split('\\'):
        return False
    return True


def _looks_like_path(name: str) -> bool:
    """Heuristique : ressemble à un chemin/fichier ?"""
    if not name:
        return False
    if '.' in name:
        return True
    if name in ('Dockerfile', 'Makefile', 'Procfile', 'LICENSE'):
        return True
    return False


def _is_ghost_file(content: str) -> bool:
    """
    Détecte si un fichier est un 'fantôme' : seulement des commentaires
    indiquant que le fichier est 'déjà existant' sans vrai code.
    """
    stripped = content.strip()
    if not stripped:
        return True

    # Compter les lignes de vrai code (non-commentaires, non-vides)
    real_lines = 0
    for line in stripped.split('\n'):
        line = line.strip()
        if not line:
            continue
        if line.startswith('//') or line.startswith('#') or line.startswith('/*') or line.startswith('*'):
            continue
        real_lines += 1

    # Si moins de 3 lignes de vrai code, vérifier les patterns fantômes
    if real_lines < 3:
        for pattern in GHOST_FILE_MARKERS:
            if pattern.search(stripped):
                return True
        # Fichier avec moins de 3 lignes de code et pas de structure reconnaissable
        if real_lines == 0:
            return True

    return False


def _contains_jsx(content: str) -> bool:
    """Détecte si un contenu contient du JSX (balises React)."""
    # Recherche de patterns JSX : <ComponentName, </ComponentName>, <tag>, etc.
    jsx_pattern = re.compile(
        r'<[A-Z][a-zA-Z]*[\s/>]|'   # Composant JSX (majuscule)
        r'<[a-z]+([\s][^>]*)?>|'    # Balise HTML dans JSX
        r'</[a-zA-Z]+>|'            # Fermeture de balise
        r'return\s*\(\s*\n?\s*<',   # return ( <
    )
    return bool(jsx_pattern.search(content))


def _inject_hook_aliases(content: str, path: str) -> str:
    """
    Injecte automatiquement des alias pour les hooks courants.
    Ex : si 'useCart' est exporté mais pas 'useCartStore', l'alias est ajouté.
    """
    ext = path.rsplit('.', 1)[-1].lower() if '.' in path else ''
    if ext not in ('ts', 'tsx', 'js', 'jsx'):
        return content

    for primary, aliases in HOOK_ALIASES.items():
        # Vérifier si le hook principal est exporté
        export_pattern = re.compile(
            rf'export\s+(const|function)\s+{re.escape(primary)}\b'
        )
        if not export_pattern.search(content):
            continue

        # Pour chaque alias, l'ajouter s'il n'existe pas
        for alias in aliases:
            alias_pattern = re.compile(rf'\b{re.escape(alias)}\b')
            if not alias_pattern.search(content):
                alias_line = f'\n// Alias pour compatibilité\nexport const {alias} = {primary};\n'
                content = content.rstrip() + alias_line

    return content


def _infer_task_type(description: str, complexity: str) -> str:
    """
    Déduit le task_type sémantique à partir de la description de tâche.
    Utilisé par route_model() pour choisir le bon modèle LLM.
    """
    d = description.lower()
    if any(k in d for k in ("npm install", "npm i ", "package.json", "tsconfig", "vite.config", "postcss")):
        return "scaffold"
    if any(k in d for k in ("globals.css", "design system", "tokens", "tailwind.config")):
        return "config"
    if any(k in d for k in ("hero", "about", "landing", "vitrine", "accueil", "service", "problem", "solution", "témoignage", "testimonial", "cta final")):
        return "section_emotional"
    if any(k in d for k in ("pricing", "formulaire", "panier", "cart", "checkout", "paiement", "stripe")):
        return "section_complex"
    if any(k in d for k in ("readme", "installation")):
        return "scaffold"
    if any(k in d for k in ("repair", "réparer", "fix", "corriger")):
        return "repair"
    if complexity == "creative":
        return "section_emotional"
    if complexity == "simple":
        return "scaffold"
    return "component_ui"


class SyntaxValidator:
    """Lightweight structural validator — runs after each file write, no subprocess needed."""

    @staticmethod
    def validate(path: str, content: str) -> list[str]:
        """Returns list of issue descriptions, empty if clean."""
        issues: list[str] = []
        ext = path.rsplit(".", 1)[-1].lower() if "." in path else ""

        if ext not in ("tsx", "jsx", "ts", "js"):
            return issues

        lines = content.split("\n")
        n = len(lines)

        # Suspiciously short component file
        if ext in ("tsx", "jsx") and n < 15:
            fname = os.path.basename(path)
            if fname.lower() not in ("vite-env.d.ts", "index.tsx", "main.tsx"):
                issues.append(f"fichier trop court ({n} lignes) — possible troncature")

        # Unbalanced braces (allow ±3 for string literals)
        opens  = content.count("{")
        closes = content.count("}")
        if opens > closes + 3:
            issues.append(f"accolade non fermée ({opens} ouvertures vs {closes} fermetures)")

        # Unclosed JSX tag at end of file
        last = "\n".join(lines[-6:])
        open_jsx  = len(re.findall(r'<[A-Z][a-zA-Z]+[\s/>]', last))
        close_jsx = len(re.findall(r'</[A-Z][a-zA-Z]+>', last))
        if open_jsx > close_jsx + 1:
            issues.append("balise JSX majuscule non fermée en fin de fichier")

        # Missing export (components and pages should export something)
        if ext in ("tsx", "jsx") and "export" not in content:
            issues.append("aucun export détecté dans le fichier")

        # JSX in .ts file (not .tsx)
        if ext == "ts" and not path.endswith(".d.ts"):
            if re.search(r'<[A-Z][a-zA-Z]+[\s/>]', content):
                issues.append("JSX détecté dans fichier .ts (devrait être .tsx)")

        return issues


class AgentExecutor:
    """Exécuteur de tâches de l'agent."""

    def __init__(
        self,
        filesystem: FilesystemTool,
        terminal: TerminalTool,
        llm: LLMTool,
        brain: Optional["ProjectBrain"] = None,
    ):
        self.filesystem      = filesystem
        self.terminal        = terminal
        self.llm             = llm
        self.brain           = brain
        self._current_phase  = 0   # mis à jour par runner.py
        self._current_brief: dict | None = None  # brief projet injecté par runner.py
        self._syntax_issues: dict[str, list[str]] = {}  # populated by per-file validation
        self._types_content: str | None = None  # set when src/types/index.ts is written

    async def execute_task(
        self,
        project_id: int,
        task_description: str,
        steps: List[str],
        context: str = "",
        on_progress: Optional[Callable[[float], Any]] = None,
    ) -> Dict[str, Any]:
        """Exécuter une tâche complète."""
        await add_log(project_id, f"Exécution de la tâche : {task_description}", "info")

        # Enrichir le contexte avec l'état actuel du Project Brain
        if self.brain:
            brain_ctx = self.brain.get_context()
            if brain_ctx:
                context = f"## PROJET (Project Brain):\n{brain_ctx}\n\n{context}"

        complexity = classify_task(task_description)
        # Déduire le task_type pour le router LLM depuis la complexité et les mots-clés
        ttype = _infer_task_type(task_description, complexity)
        phase = getattr(self, "_current_phase", 0)
        model_name = route_model(task_type=ttype, phase=phase)
        await add_log(project_id, f"🧠 [{COMPLEXITY_LABELS[complexity]}] → {model_name} (phase {phase})", "debug")

        brief = getattr(self, "_current_brief", None)

        # Injecter le copywriting Gemini dans le contexte
        copywriting = getattr(self, "_gemini_copywriting", None)
        if copywriting:
            context = f"## COPYWRITING (utilise ces textes dans les composants) :\n{copywriting}\n\n{context}"

        # Injecter la map d'images Unsplash dans le contexte
        image_map = getattr(self, "_image_map", None)
        if image_map:
            img_lines = "\n".join(f"- {slot}: {url}" for slot, url in image_map.items())
            context = f"## IMAGES UNSPLASH (URLs réelles à utiliser, ne pas inventer d'autres URLs) :\n{img_lines}\n\n{context}"

        # Injecter le contenu du fichier de types dans le contexte
        types_content = self._types_content
        if types_content:
            context = f"## TYPES DU PROJET (utilise UNIQUEMENT ces interfaces, ne jamais inventer de champs) :\n```typescript\n{types_content}\n```\n\n{context}"

        result = await self.llm.generate_code(
            task_description, context,
            model_override=model_name,
            task_type=ttype,
            phase=phase,
            brief=brief,
        )

        # Tracker les tokens consommés
        tokens = (result.get("prompt_tokens", 0) or 0) + (result.get("completion_tokens", 0) or 0)
        if tokens > 0:
            await add_tokens_used(project_id, tokens)

        if not result.get("success"):
            error_msg = result.get("error", "Erreur LLM inconnue")
            await add_log(project_id, f"Erreur LLM : {error_msg}", "error")
            return {"success": False, "error": error_msg}

        content = result.get("content", "")
        await add_log(project_id, "Code généré par le LLM, extraction des actions...", "debug")

        actions = self._parse_actions(content)
        await add_log(project_id, f"{len(actions)} actions extraites.", "info")

        if not actions:
            preview = content.strip()[:300].replace("\n", " ⏎ ")
            await add_log(
                project_id,
                f"Aucune action exploitable extraite. Début de la réponse : {preview}",
                "error",
            )
            return {
                "success": False,
                "error": "Aucune action n'a pu être extraite de la réponse du LLM.",
                "actions_total": 0,
                "actions_success": 0,
            }

        results = []
        for i, action in enumerate(actions):
            await add_log(
                project_id,
                f"Action {i+1}/{len(actions)} : {action['type']} - {action.get('path', action.get('command', ''))}",
                "info",
            )

            action_result = await self._execute_action(project_id, action)
            results.append(action_result)

            if on_progress:
                await on_progress((i + 1) / len(actions))

            if not action_result.get("success", False):
                await add_log(
                    project_id,
                    f"Action {i+1} échouée : {action_result.get('error', 'Inconnue')}",
                    "error",
                )
                if action["type"] == "command":
                    continue

        success_count = sum(1 for r in results if r.get("success", False))
        total = len(results)
        overall_success = success_count >= total * 0.7 if total > 0 else False

        summary = f"Tâche terminée : {success_count}/{total} actions réussies."
        await add_log(project_id, summary, "info" if overall_success else "warning")

        return {
            "success": overall_success,
            "actions_total": total,
            "actions_success": success_count,
            "results": results,
            "summary": summary,
        }

    async def execute_command(
        self,
        project_id: int,
        command: str,
        description: str,
        expected_output_contains: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Exécute une commande shell et vérifie son succès."""
        await add_log(project_id, f"Exécution de commande : {description}", "info")
        result = await self.terminal.execute(command)

        if result["success"]:
            stdout = result.get("stdout", "")
            if expected_output_contains and expected_output_contains not in stdout:
                return {
                    "success": False,
                    "error": f"La commande a réussi mais la sortie n'inclut pas '{expected_output_contains}'",
                    "stdout": stdout,
                    "stderr": result.get("stderr", ""),
                }
            return {"success": True, "stdout": stdout, "stderr": result.get("stderr", "")}
        else:
            return {
                "success": False,
                "error": result.get("stderr", "Erreur inconnue"),
                "stdout": result.get("stdout", ""),
                "stderr": result.get("stderr", ""),
            }

    # ─── Parsing ────────────────────────────────────────────────────────

    def _parse_actions(self, content: str) -> List[Dict[str, Any]]:
        """
        Parser unifié : lit TOUS les blocs ```...``` du contenu et les
        classifie (commande / fichier).
        """
        actions: List[Dict[str, Any]] = []

        segments = content.split('```')
        blocks: List[str] = []
        for i, seg in enumerate(segments):
            if i == 0:
                continue
            if i % 2 == 1:
                blocks.append(seg)

        for raw_block in blocks:
            if '\n' not in raw_block:
                continue
            header_line, _, body = raw_block.partition('\n')
            header = header_line.strip()
            body = body.rstrip()
            body_stripped = body.strip()

            if not body_stripped:
                continue

            # 1) COMMANDES SHELL
            header_lower = header.lower()
            cmd_langs = {
                'bash', 'shell', 'sh', 'zsh', 'command', 'cmd',
                'powershell', 'ps1', 'console', 'terminal',
            }
            if header_lower in cmd_langs:
                for line in body.split('\n'):
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    if line.startswith('$ '):
                        line = line[2:].strip()
                    if line:
                        actions.append({"type": "command", "command": line})
                continue

            # 2) FICHIERS
            filepath = self._extract_filepath_from_header(header, body_stripped)

            if filepath and _is_safe_filename(filepath) and _looks_like_path(filepath):
                actions.append({
                    "type": "file",
                    "path": filepath,
                    "content": body,
                })

        return actions

    def _extract_filepath_from_header(self, header: str, body: str) -> Optional[str]:
        """Extrait le chemin du fichier depuis le header d'un bloc ```."""
        h = header.strip()

        if not h:
            return self._guess_path_from_body(body, lang="")

        if h.lower().startswith("filename:"):
            name = h.split(":", 1)[1].strip().lstrip("/").lstrip("\\")
            return re.sub(r'\s*\(.*?\)\s*$', '', name).strip()

        if ":" in h:
            left, right = h.split(":", 1)
            left = left.strip().lower()
            right = right.strip().lstrip("/").lstrip("\\")
            right = re.sub(r'\s*\(.*?\)\s*$', '', right).strip()
            if left in LANG_KEYWORDS:
                if right and _looks_like_path(right):
                    return right
                return self._guess_path_from_body(body, lang=left)

        if " " in h:
            parts = h.split(None, 1)
            left = parts[0].strip().lower()
            right = parts[1].strip()
            right = re.sub(r'\s*\(.*?\)\s*$', '', right).strip()
            if left in LANG_KEYWORDS and right and _looks_like_path(right):
                return right.lstrip("/").lstrip("\\")

        h_clean = re.sub(r'\s*\(.*?\)\s*$', '', h).strip()
        if _looks_like_path(h_clean):
            return h_clean.lstrip("/").lstrip("\\")

        if h.lower() in LANG_KEYWORDS:
            return self._guess_path_from_body(body, lang=h.lower())

        return None

    def _guess_path_from_body(self, body: str, lang: str) -> Optional[str]:
        """Devine le nom de fichier depuis les premières lignes du contenu."""
        first_lines = body.strip().split('\n', 5)[:5]
        comment_prefixes = ('//', '#', '/*', '*', '<!--')
        for line in first_lines:
            line = line.strip()
            for p in comment_prefixes:
                if line.startswith(p):
                    candidate = line[len(p):].strip().rstrip('-->').rstrip('*/').strip()
                    candidate = candidate.split()[0] if candidate else ""
                    if candidate and _is_safe_filename(candidate) and _looks_like_path(candidate):
                        return candidate
                    break

        ext = LANG_TO_EXT.get(lang.lower())
        if ext == 'Dockerfile':
            return 'Dockerfile'
        if ext:
            # Ne retourner "main.*" que si le contenu ressemble à un vrai point d'entrée.
            # Évite que tous les blocs sans nom de fichier écrasent le même main.tsx.
            is_entry_point = (
                'ReactDOM' in body or
                'createRoot' in body or
                ('createApp' in body and 'mount' in body) or  # Vue
                ext in ('.py', '.go', '.rs') and 'main' in body[:200].lower()
            )
            if is_entry_point:
                return f"main{ext}"
            return None
        return None

    # ─── Exécution ──────────────────────────────────────────────────────

    async def _execute_action(self, project_id: int, action: Dict[str, Any]) -> Dict[str, Any]:
        action_type = action.get("type")
        if action_type == "file":
            return await self._execute_file_action(project_id, action)
        if action_type == "command":
            return await self._execute_command_action(project_id, action)
        return {"success": False, "error": f"Type d'action inconnu : {action_type}"}

    async def _execute_file_action(self, project_id: int, action: Dict[str, Any]) -> Dict[str, Any]:
        path = action.get("path", "")
        content = action.get("content", "")

        if not _is_safe_filename(path):
            err = f"Nom de fichier refusé pour des raisons de sécurité : {path!r}"
            await add_log(project_id, err, "error")
            return {"success": False, "error": err}

        # ── Détection fichier fantôme ──────────────────────────────────
        filename = os.path.basename(path.replace('\\', '/'))
        is_system_file = filename in GHOST_FILE_WHITELIST or filename.endswith('.d.ts')

        if is_system_file and _is_ghost_file(content):
            default = GHOST_FILE_DEFAULTS.get(filename)
            if default:
                content = default
                await add_log(project_id, f"Fichier système '{path}' restauré avec son contenu par défaut.", "info")
            # else: system file with unusual content — write as-is, don't block
        elif not is_system_file and _is_ghost_file(content):
            await add_log(
                project_id,
                f"Fichier fantôme détecté pour '{path}' (commentaire vide). Régénération forcée.",
                "warning",
            )
            regenerated = await self._regenerate_ghost_file(project_id, path)
            if regenerated is not None:
                content = regenerated
                await add_log(project_id, f"Fichier '{path}' régénéré avec succès.", "info")
            else:
                await add_log(
                    project_id,
                    f"Régénération impossible pour '{path}', fichier ignoré.",
                    "error",
                )
                return {"success": False, "error": f"Fichier fantôme non régénérable : {path}"}

        # ── Correction JSX dans fichier .ts ───────────────────────────
        # Only auto-convert PascalCase component files, never utils/types/lib/hooks/store/config
        ext = path.rsplit('.', 1)[-1].lower() if '.' in path else ''
        if ext == 'ts' and not filename.endswith('.d.ts') and _contains_jsx(content):
            path_lower = path.lower().replace('\\', '/')
            non_component_dirs = ('/lib/', '/utils', '/types', '/constants', '/helpers', '/config', '/store', '/hook', '/api/', '/services/')
            in_non_component = any(d in path_lower for d in non_component_dirs)
            name_part = filename.rsplit('.', 1)[0]
            is_pascal = name_part and name_part[0].isupper()
            if not in_non_component and is_pascal:
                await add_log(
                    project_id,
                    f"JSX détecté dans '{path}' (extension .ts). Conversion en .tsx automatique.",
                    "warning",
                )
                path = path[:-3] + '.tsx'
                action['path'] = path

        # ── Injection d'alias de hooks ─────────────────────────────────
        content = _inject_hook_aliases(content, path)

        # ── Validation d'intégrité ─────────────────────────────────────
        issues = self._check_file_integrity(path, content)
        if issues:
            await add_log(
                project_id,
                f"Fichier '{path}' incomplet, tentative de réparation : {', '.join(issues)}",
                "warning",
            )
            repaired = await self._repair_file(project_id, path, content, issues)
            if repaired is not None:
                content = repaired
                await add_log(project_id, f"Fichier '{path}' réparé avec succès.", "info")
            else:
                await add_log(
                    project_id,
                    f"Réparation impossible pour '{path}', écriture en l'état.",
                    "warning",
                )

        # ── Validation des imports locaux via Project Brain ────────────────
        if self.brain:
            import_issues = self.brain.validate_imports(path, content)
            for issue in import_issues:
                # debug level : le fichier sera peut-être créé dans une action suivante
                await add_log(project_id, f"🧠 Brain: {issue}", "debug")

        result = self.filesystem.create_file(path, content)
        if result.get("success"):
            await add_log(project_id, f"Fichier créé : {result.get('path', path)}", "info")
            # ── Cache types content for injection into subsequent tasks ────
            path_norm = path.replace("\\", "/")
            if "types/index.ts" in path_norm or "types/index.tsx" in path_norm:
                self._types_content = content
            # ── Per-file syntax validation ────────────────────────────────
            syntax_issues = SyntaxValidator.validate(path, content)
            if syntax_issues:
                self._syntax_issues[path] = syntax_issues
                issues_str = " | ".join(syntax_issues)
                await add_log(project_id, f"⚠️ Validation syntaxique '{os.path.basename(path)}' : {issues_str} — tentative de réparation", "warning")
                repaired = await self._repair_file(project_id, path, content, syntax_issues)
                if repaired is not None:
                    fix_result = self.filesystem.create_file(path, repaired)
                    if fix_result.get("success"):
                        content = repaired
                        del self._syntax_issues[path]
                        await add_log(project_id, f"✅ Fichier '{os.path.basename(path)}' réparé et réécrit.", "info")
            # ── Mise à jour du Project Brain ──────────────────────────────
            if self.brain:
                self.brain.update_file(path, content)
        else:
            await add_log(project_id, f"Erreur création fichier {path} : {result.get('error')}", "error")
        return result

    # ─── Régénération fichier fantôme ───────────────────────────────────

    async def _regenerate_ghost_file(
        self, project_id: int, path: str
    ) -> Optional[str]:
        """
        Demande au LLM de générer le vrai contenu d'un fichier fantôme.
        """
        ext = path.rsplit('.', 1)[-1].lower() if '.' in path else ''

        # Prompts spécialisés selon le type de fichier
        if 'store' in path.lower() or 'context' in path.lower() or 'cart' in path.lower():
            prompt = (
                f"Génère le fichier '{path}' COMPLET pour un projet React/TypeScript e-commerce.\n\n"
                f"Ce fichier est un store/context React. Il DOIT contenir :\n"
                f"- L'interface CartItem (id, name, price, image, quantity)\n"
                f"- CartContext créé avec createContext\n"
                f"- CartProvider implémenté avec React createElement (PAS de JSX dans un .ts)\n"
                f"- useState pour gérer items[]\n"
                f"- Fonctions : addItem, removeItem, updateQuantity, clearCart\n"
                f"- Exports : CartProvider (default + named), useCart, useCartStore (alias), CartItem\n\n"
                f"IMPORTANT : utilise createElement() au lieu du JSX car l'extension est .ts\n\n"
                f"Utilise le format :\n```filename:{path}\ncontenu complet\n```"
            )
        elif ext in ('ts', 'tsx') and 'button' in path.lower():
            prompt = (
                f"Génère le fichier '{path}' COMPLET : composant Button React avec Tailwind CSS, "
                f"class-variance-authority, @radix-ui/react-slot. Exporte Button et buttonVariants.\n"
                f"Format : ```filename:{path}\ncontenu\n```"
            )
        elif ext in ('ts', 'tsx') and 'badge' in path.lower():
            prompt = (
                f"Génère le fichier '{path}' COMPLET : composant Badge React avec Tailwind CSS, "
                f"class-variance-authority. Exporte Badge et badgeVariants.\n"
                f"Format : ```filename:{path}\ncontenu\n```"
            )
        elif ext in ('ts', 'tsx') and 'sheet' in path.lower():
            prompt = (
                f"Génère le fichier '{path}' COMPLET : composant Sheet React basé sur "
                f"@radix-ui/react-dialog. Exporte Sheet, SheetTrigger, SheetContent, "
                f"SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetClose, "
                f"SheetPortal, SheetOverlay.\n"
                f"Format : ```filename:{path}\ncontenu\n```"
            )
        else:
            prompt = (
                f"Génère le fichier '{path}' COMPLET pour un projet React/TypeScript.\n"
                f"Ce fichier a été marqué comme vide ou avec seulement un commentaire. "
                f"Génère une implémentation complète et fonctionnelle.\n"
                f"Format : ```filename:{path}\ncontenu complet\n```"
            )

        for attempt in range(MAX_REPAIR_ATTEMPTS):
            result = await self.llm.generate_code(prompt)
            if not result.get("success"):
                continue
            new_actions = self._parse_actions(result.get("content", ""))
            for act in new_actions:
                if act.get("type") == "file":
                    new_content = act.get("content", "")
                    if not _is_ghost_file(new_content):
                        return new_content
        return None

    # ─── Validation d'intégrité ─────────────────────────────────────────

    def _check_file_integrity(self, path: str, content: str) -> List[str]:
        """Retourne la liste des problèmes détectés sur le contenu."""
        issues: List[str] = []
        if not content or not content.strip():
            issues.append("contenu vide")
            return issues

        for pattern in TRUNCATION_MARKERS:
            if pattern.search(content):
                issues.append("placeholder/troncature détecté")
                break

        ext = path.lower().rsplit('.', 1)[-1] if '.' in path else ''
        if ext in ('html', 'htm'):
            lower = content.lower()
            if '<html' in lower and '</html>' not in lower:
                issues.append("</html> manquant")
            if '<body' in lower and '</body>' not in lower:
                issues.append("</body> manquant")
            n_script_open = lower.count('<script')
            n_script_close = lower.count('</script>')
            if n_script_open > n_script_close:
                issues.append("</script> manquant")
            n_style_open = lower.count('<style')
            n_style_close = lower.count('</style>')
            if n_style_open > n_style_close:
                issues.append("</style> manquant")

        if ext in ('js', 'mjs', 'ts', 'tsx', 'jsx', 'css'):
            opens  = content.count('{')
            closes = content.count('}')
            if opens > closes + 2:
                issues.append(f"accolade non fermée ({opens} ouvertures vs {closes} fermetures)")
            if content.count('(') > content.count(')') + 2:
                issues.append("parenthèse ')' manquante")

        # JSX tag balance check for .tsx/.jsx
        if ext in ('tsx', 'jsx'):
            # Count opening vs closing tags for block-level elements likely to be unclosed on truncation
            block_tags = ['div', 'section', 'main', 'article', 'header', 'footer', 'table', 'tbody', 'thead', 'tr', 'ul', 'ol', 'nav', 'aside', 'form']
            for tag in block_tags:
                n_open  = len(re.findall(rf'<{tag}[\s>/]', content))
                n_close = content.count(f'</{tag}>')
                if n_open > n_close + 3:
                    issues.append(f"balise <{tag}> non fermée ({n_open} ouvertures vs {n_close} fermetures)")
                    break  # one issue is enough to trigger repair

        return issues

    async def _repair_file(
        self,
        project_id: int,
        path: str,
        broken_content: str,
        issues: List[str],
    ) -> Optional[str]:
        """Demander au LLM de réparer un fichier tronqué/incomplet."""
        ext = path.rsplit('.', 1)[-1].lower() if '.' in path else ''
        is_truncated = any("troncature" in i or "tronqu" in i or "placeholder" in i for i in issues)

        for attempt in range(MAX_REPAIR_ATTEMPTS):
            issues_text = ", ".join(issues)

            # For truncated files: lightweight "continue from tail" prompt to save tokens
            if is_truncated and ext in ('tsx', 'jsx', 'ts', 'js') and len(broken_content) > 400:
                tail_lines = broken_content.rstrip().split('\n')[-40:]
                tail = '\n'.join(tail_lines)
                repair_prompt = (
                    f"Le fichier `{path}` a été TRONQUÉ (coupé avant la fin).\n\n"
                    f"Voici la fin du fichier là où la coupure s'est produite :\n"
                    f"```\n{tail}\n```\n\n"
                    f"Continue EXACTEMENT depuis là où le fichier s'est arrêté. "
                    f"Ferme toutes les balises JSX ouvertes et les accolades manquantes. "
                    f"Ne répète PAS le début du fichier — renvoie UNIQUEMENT la suite manquante dans un bloc :\n"
                    f"```{ext}\n[suite du fichier ici]\n```"
                )
                result = await self.llm.generate_code(repair_prompt)
                if result.get("success"):
                    continuation = result.get("content", "")
                    # Extract the code block
                    m = re.search(r'```[a-zA-Z]*\n([\s\S]+?)```', continuation)
                    suffix = m.group(1).rstrip() if m else continuation.strip()
                    if suffix:
                        stitched = broken_content.rstrip() + '\n' + suffix
                        if not self._check_file_integrity(path, stitched):
                            return stitched
                        # If still broken, fall through to full regeneration
                        broken_content = stitched
                        is_truncated = False  # next attempt: full regen
                continue

            # Full regeneration for structural issues
            repair_prompt = (
                f"Le fichier '{path}' que tu as généré est INCOMPLET ou TRONQUÉ. "
                f"Problèmes détectés : {issues_text}.\n\n"
                f"Voici le contenu actuel (potentiellement tronqué) :\n\n"
                f"```\n{broken_content}\n```\n\n"
                f"Renvoie la VERSION COMPLÈTE et CORRIGÉE de ce fichier. "
                f"Toutes les balises JSX doivent être fermées (<div>...</div>), "
                f"toutes les accolades équilibrées, aucun placeholder. "
                f"Utilise le format :\n\n"
                f"```filename:{path}\n"
                f"contenu complet ici\n"
                f"```"
            )
            result = await self.llm.generate_code(repair_prompt)
            if not result.get("success"):
                continue
            new_actions = self._parse_actions(result.get("content", ""))
            for act in new_actions:
                if act.get("type") == "file":
                    new_content = act.get("content", "")
                    new_issues = self._check_file_integrity(path, new_content)
                    if not new_issues:
                        return new_content
                    if len(new_issues) < len(issues):
                        broken_content = new_content
                        issues = new_issues
        return None

    async def _execute_command_action(self, project_id: int, action: Dict[str, Any]) -> Dict[str, Any]:
        command = action.get("command", "")

        # Strip "cd <path> && " prefix — le terminal tourne déjà dans workspace_path
        command = re.sub(r'^cd\s+\S+\s*&&\s*', '', command).strip()

        # Bloquer les heredocs shell (<<) — incompatibles avec cmd.exe Windows
        if re.search(r'<<\s*[\'"]?\w', command):
            await add_log(
                project_id,
                f"Commande heredoc ignorée (incompatible Windows) : {command[:120]}",
                "warning",
            )
            return {"success": True, "stdout": "", "stderr": "", "exit_code": 0}

        await add_log(project_id, f"Exécution commande : {command}", "debug")
        result = await self.terminal.run_command(command)

        if result.get("success"):
            stdout = result.get("stdout", "").strip()
            if stdout:
                log_output = stdout[:500] + ("..." if len(stdout) > 500 else "")
                await add_log(project_id, f"Sortie : {log_output}", "debug")
        else:
            stderr = result.get("stderr", "").strip()
            stdout = result.get("stdout", "").strip()
            # npm écrit souvent les erreurs sur stdout plutôt que stderr
            error_output = stderr or stdout or "(aucune sortie d'erreur)"
            await add_log(project_id, f"Erreur commande : {error_output[:500]}", "error")
        return result

    # ─── README ─────────────────────────────────────────────────────────

    async def generate_readme(
        self, project_id: int, project_name: str, objective: str, project_type: str
    ) -> Dict[str, Any]:
        """Générer un README.md pour le projet."""
        await add_log(project_id, "Génération du README.md...", "info")

        tree = self.filesystem.get_tree()

        # Détection automatique du type de projet depuis l'arborescence
        has_vite    = "vite.config" in tree
        has_server  = "server/" in tree or "server\\" in tree
        has_express = has_server and ("express" in tree or "index.js" in tree)
        has_static  = "index.html" in tree and not has_vite
        has_stripe  = "stripe" in objective.lower() or "stripe" in tree.lower()
        has_paypal  = "paypal" in objective.lower() or "paypal" in tree.lower()
        has_payment = has_stripe or has_paypal or "paiement" in objective.lower() or "e-commerce" in objective.lower()

        # Détecter le port du serveur front
        import os as _os
        vite_config_path = _os.path.join(self.filesystem.workspace_path, "vite.config.ts")
        frontend_port = "5173"
        if _os.path.exists(vite_config_path):
            try:
                with open(vite_config_path) as f:
                    cfg = f.read()
                    import re as _re
                    m = _re.search(r'port:\s*(\d+)', cfg)
                    if m:
                        frontend_port = m.group(1)
            except Exception:
                pass

        # Détecter le port du backend Express
        server_port = "3001"
        server_index = _os.path.join(self.filesystem.workspace_path, "server", "index.js")
        if _os.path.exists(server_index):
            try:
                with open(server_index) as f:
                    sc = f.read()
                    m2 = _re.search(r'PORT\s*[=|]\s*[^\d]*(\d{4,5})', sc)
                    if m2:
                        server_port = m2.group(1)
            except Exception:
                pass

        # Construire le bloc "Lancer le projet" adapté
        if has_vite and has_express:
            run_instructions = f"""### Frontend (React/Vite)
```bash
cd <dossier-projet>
npm install
npm run dev
# → http://localhost:{frontend_port}
```

### Backend (Node.js/Express)
```bash
cd server
npm install
node index.js
# → http://localhost:{server_port}
```"""
        elif has_vite:
            run_instructions = f"""```bash
npm install
npm run dev
# → http://localhost:{frontend_port}
```"""
        elif has_static:
            run_instructions = """Ouvrez simplement `index.html` dans votre navigateur.
Ou lancez un serveur local :
```bash
npx serve .
```"""
        else:
            run_instructions = """```bash
npm install
npm start
```"""

        payment_section = ""
        if has_payment:
            payment_section = "\n## Paiements\n"
            if has_stripe:
                payment_section += STRIPE_INTEGRATION_PROMPT + "\n"
            if has_paypal:
                payment_section += PAYPAL_INTEGRATION_PROMPT + "\n"

        # Injecter les infos du brief si disponible
        brief_context = ""
        brand_name = project_name
        if self._current_brief:
            palette = self._current_brief.get("palette", {})
            fonts   = self._current_brief.get("fonts", {})
            brand   = self._current_brief.get("brand_details", {})
            metier  = self._current_brief.get("metier", "")
            integrations = self._current_brief.get("integrations_required", [])
            warnings = self._current_brief.get("integration_warnings", [])
            if brand.get("name"):
                brand_name = brand["name"]
            brief_context = f"""
**Brief créatif :**
- Palette : {palette.get('name', '')} ({palette.get('mood', '')})
- Typographie : {fonts.get('display', '')} / {fonts.get('body', '')}
- Métier : {metier}
- Phrase signature : {brand.get('signature_phrase', '')}
- Intégrations : {', '.join(integrations) if integrations else 'aucune'}"""
            if warnings:
                brief_context += "\n- ⚠️ " + "\n- ⚠️ ".join(warnings)

        prompt = f"""Génère un README.md complet et professionnel en français pour ce projet.

**Nom :** {brand_name}
**Objectif :** {objective}{brief_context}
**Arborescence :**
{tree}

**Commandes de lancement (utilise-les EXACTEMENT dans la section Installation) :**
{run_instructions}

Le README doit contenir ces sections dans cet ordre :
1. # {brand_name} — titre + courte description percutante inspirée du brief
2. ## Présentation — concept, cible, proposition de valeur (3-4 phrases)
3. ## Fonctionnalités — liste bullet des features principales
4. ## Stack technique — tableau : React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, etc.
5. ## Prérequis — Node.js 18+, npm
6. ## Installation & Lancement — les commandes EXACTES ci-dessus
7. ## Structure du projet — arborescence commentée (key files seulement)
8. ## Variables d'environnement — si des fichiers .env.example existent{payment_section}
9. ## Déploiement — Vercel (front) + Railway/Render (back si applicable)
10. ## Licence — MIT

IMPORTANT :
- N'invente PAS de commandes. Utilise uniquement celles fournies ci-dessus.
- Copie le ton de la phrase signature dans la description si elle est fournie.
- Génère UNIQUEMENT le Markdown, sans bloc de code englobant."""

        result = await self.llm.generate_code(prompt)

        if result.get("success"):
            readme_content = (result.get("content") or "").strip()
            if readme_content.startswith("```"):
                readme_content = re.sub(r'^```\w*\n', '', readme_content)
                readme_content = re.sub(r'\n```$', '', readme_content)

            file_result = self.filesystem.create_file("README.md", readme_content)
            if file_result.get("success"):
                await add_log(project_id, "README.md généré avec succès.", "info")
            return file_result

        # Fallback cohérent si le LLM échoue
        signature = ""
        if self._current_brief:
            brand = self._current_brief.get("brand_details", {})
            sig = brand.get("signature_phrase", "")
            if sig:
                signature = f"\n> *{sig}*\n"

        fallback_readme = f"""# {brand_name}
{signature}
{objective}

## Installation & Lancement

{run_instructions}

## Structure du projet

```
{tree}
```

## Licence

MIT
"""
        return self.filesystem.create_file("README.md", fallback_readme)
