"""
Agent Executor — Exécute les tâches une par une en utilisant les tools.
Gère les retries, la validation et le logging.
"""

import re
from typing import Dict, Any, Optional, List
from backend.tools.filesystem import FilesystemTool
from backend.tools.terminal import TerminalTool
from backend.tools.llm import LLMTool
from backend.db.database import add_log
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


class AgentExecutor:
    """Exécuteur de tâches de l'agent."""

    def __init__(self, filesystem: FilesystemTool, terminal: TerminalTool, llm: LLMTool):
        self.filesystem = filesystem
        self.terminal = terminal
        self.llm = llm

    async def execute_task(
        self,
        project_id: int,
        task_description: str,
        steps: List[str],
        context: str = ""
    ) -> Dict[str, Any]:
        """Exécuter une tâche complète."""
        await add_log(project_id, f"Exécution de la tâche : {task_description}", "info")

        result = await self.llm.generate_code(task_description, context)

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
            return f"main{ext}"
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
        if _is_ghost_file(content):
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
        ext = path.rsplit('.', 1)[-1].lower() if '.' in path else ''
        if ext == 'ts' and _contains_jsx(content):
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

        result = self.filesystem.create_file(path, content)
        if result.get("success"):
            await add_log(project_id, f"Fichier créé : {result.get('path', path)}", "info")
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

        if ext in ('js', 'mjs', 'ts', 'css'):
            if content.count('{') > content.count('}'):
                issues.append("accolade '}' manquante")
            if content.count('(') > content.count(')'):
                issues.append("parenthèse ')' manquante")

        return issues

    async def _repair_file(
        self,
        project_id: int,
        path: str,
        broken_content: str,
        issues: List[str],
    ) -> Optional[str]:
        """Demander au LLM de réparer un fichier tronqué/incomplet."""
        for attempt in range(MAX_REPAIR_ATTEMPTS):
            issues_text = ", ".join(issues)
            repair_prompt = (
                f"Le fichier '{path}' que tu as généré est INCOMPLET ou TRONQUÉ. "
                f"Problèmes détectés : {issues_text}.\n\n"
                f"Voici le contenu actuel (potentiellement tronqué) :\n\n"
                f"```\n{broken_content}\n```\n\n"
                f"Renvoie la VERSION COMPLÈTE et CORRIGÉE de ce fichier. "
                f"Aucun '...', aucun placeholder, toutes les balises fermées, "
                f"tout le code écrit en entier. Utilise le format :\n\n"
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
        await add_log(project_id, f"Exécution commande : {command}", "debug")
        result = await self.terminal.run_command(command)

        if result.get("success"):
            stdout = result.get("stdout", "").strip()
            if stdout:
                log_output = stdout[:500] + ("..." if len(stdout) > 500 else "")
                await add_log(project_id, f"Sortie : {log_output}", "debug")
        else:
            stderr = result.get("stderr", "").strip()
            error_output = stderr[:500] or "(aucune sortie d'erreur)"
            await add_log(project_id, f"Erreur commande : {error_output}", "error")
        return result

    # ─── README ─────────────────────────────────────────────────────────

    async def generate_readme(
        self, project_id: int, project_name: str, objective: str, project_type: str
    ) -> Dict[str, Any]:
        """Générer un README.md pour le projet."""
        await add_log(project_id, "Génération du README.md...", "info")

        tree = self.filesystem.get_tree()

        deployment_guidance = ""
        if project_type == "Statique":
            deployment_guidance = STATIC_PROJECT_PROMPT
        elif project_type == "ReactNodeSQLite":
            deployment_guidance = REACT_NODE_SQLITE_PROJECT_PROMPT
        elif project_type == "ReactSupabase":
            deployment_guidance = REACT_SUPABASE_PROJECT_PROMPT

        payment_guidance = ""
        if "paiement" in objective.lower() or "e-commerce" in objective.lower():
            payment_guidance = (
                "\n\n### Intégration des paiements\n"
                "Le projet inclut l'intégration de Stripe et/ou PayPal. "
                "Veuillez vous référer aux sections suivantes pour la configuration :\n"
                f"\n{STRIPE_INTEGRATION_PROMPT}"
                f"\n{PAYPAL_INTEGRATION_PROMPT}"
            )

        prompt = f"""Génère un fichier README.md complet en français pour le projet suivant :

Nom du projet : {project_name}
Objectif : {objective}

Structure des fichiers :
{tree}

Le README doit contenir :
1. Titre et description
2. Prérequis
3. Installation
4. Utilisation
5. Structure du projet
6. Instructions de déploiement et d'hébergement (très important)
7. Configuration des paiements (si applicable)
8. Licence

Instructions spécifiques pour ce type de projet :
{deployment_guidance}
{payment_guidance}

Génère UNIQUEMENT le contenu Markdown du README, sans bloc de code englobant."""

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

        fallback_readme = f"""# {project_name}

## Description

{objective}

## Structure du projet

```
{tree}
```

## Installation

Consultez les fichiers du projet pour les instructions d'installation.

## Licence

MIT
"""
        return self.filesystem.create_file("README.md", fallback_readme)
