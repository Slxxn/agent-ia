"""
Tool Terminal — Exécution de commandes dans le workspace.
Toutes les commandes sont exécutées dans le répertoire workspace du projet.
Commandes destructives système interdites.
"""

import asyncio
import os
import re
import sys
from typing import Dict, Any, Optional

# Commandes npm bloquées (l'utilisateur les lance manuellement)
NPM_BLOCKED_PATTERNS = [
    r"\bnpm\s+(install|i|ci|run|start|build|dev|test)\b",
    r"\bpnpm\s+(install|i|run|start|build|dev|test)\b",
    r"\byarn\s+(install|run|start|build|dev|test)?\b",
    r"\bnpx\s+create-",
]

# Commandes interdites pour la sécurité
FORBIDDEN_PATTERNS = [
    r"\brm\s+-rf\s+/",          # rm -rf /
    r"\brm\s+-rf\s+~",          # rm -rf ~
    r"\bsudo\s+rm\b",           # sudo rm
    r"\bmkfs\b",                # formatage disque
    r"\bdd\s+if=",              # dd destructif
    r"\b:(){ :|:& };:",         # fork bomb
    r"\bshutdown\b",            # arrêt système
    r"\breboot\b",              # redémarrage
    r"\bhalt\b",                # arrêt
    r"\binit\s+0\b",            # arrêt
    r"\bsystemctl\s+(stop|disable|mask)\b",  # services système
    r"\bchmod\s+-R\s+777\s+/",  # permissions racine
    r"\bchown\s+-R\s+.*\s+/",   # propriétaire racine
    r"\bcurl\s+.*\|\s*sh\b",    # pipe curl vers shell
    r"\bwget\s+.*\|\s*sh\b",    # pipe wget vers shell
]

# Timeout par défaut pour les commandes (en secondes)
DEFAULT_TIMEOUT = 180
MAX_OUTPUT_LENGTH = 10000


# Emplacements courants de Node.js sur Windows
NODE_PATHS_WINDOWS = [
    r"C:\Program Files\nodejs",
    r"C:\Program Files (x86)\nodejs",
    os.path.join(os.environ.get("APPDATA", ""), "npm"),
    os.path.join(os.environ.get("LOCALAPPDATA", ""), "Programs", "nodejs"),
    os.path.join(os.environ.get("ProgramFiles", ""), "nodejs"),
]


def _find_npm_path() -> str:
    """Trouver le chemin complet de npm.cmd sur Windows."""
    for node_dir in NODE_PATHS_WINDOWS:
        npm_cmd = os.path.join(node_dir, "npm.cmd")
        if os.path.isfile(npm_cmd):
            return npm_cmd
    return "npm"  # Fallback si non trouvé


def _find_npx_path() -> str:
    """Trouver le chemin complet de npx.cmd sur Windows."""
    for node_dir in NODE_PATHS_WINDOWS:
        npx_cmd = os.path.join(node_dir, "npx.cmd")
        if os.path.isfile(npx_cmd):
            return npx_cmd
    return "npx"  # Fallback si non trouvé


class TerminalTool:
    """Outil d'exécution de commandes sandboxé dans le workspace du projet."""

    def __init__(self, workspace_path: str):
        self.workspace_path = os.path.abspath(workspace_path)
        os.makedirs(self.workspace_path, exist_ok=True)

    def _is_safe_command(self, command: str) -> tuple[bool, str]:

        for pattern in NPM_BLOCKED_PATTERNS:
            if re.search(pattern, command, re.IGNORECASE):
                return False, (
                "Commande npm/pnpm/yarn bloquée. "
                "Lancez-la manuellement dans votre terminal."
                )


        """Vérifier si une commande est sûre à exécuter."""
        for pattern in FORBIDDEN_PATTERNS:
            if re.search(pattern, command):
                return False, f"Commande interdite (pattern: {pattern})"
        return True, ""

    async def run_command(
        self,
        command: str,
        timeout: int = DEFAULT_TIMEOUT,
        env: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Exécuter une commande dans le workspace du projet."""
        # Vérification de sécurité
        is_safe, reason = self._is_safe_command(command)
        if not is_safe:
            return {
                "success": False,
                "exit_code": -1,
                "stdout": "",
                "stderr": f"Commande refusée pour raison de sécurité : {reason}",
                "command": command
            }

        is_windows = sys.platform == "win32"

        # Conversion automatique des commandes Linux vers Windows
        if is_windows:
            # Remplacer npm et npx par leurs chemins complets pour contourner le problème de PATH
            npm_path = _find_npm_path()
            npx_path = _find_npx_path()
            # Doubler les backslashes pour éviter les erreurs d'échappement dans re.sub
            npm_replacement = '"' + npm_path.replace('\\', '\\\\') + '"'
            npx_replacement = '"' + npx_path.replace('\\', '\\\\') + '"'
            import re as _re
            command = _re.sub(r'(?<![\w/\\])npm(?=\s|$)', npm_replacement, command)
            command = _re.sub(r'(?<![\w/\\])npx(?=\s|$)', npx_replacement, command)
            # Convertir mkdir -p en mkdir
            command = _re.sub(r'mkdir\s+-p\s+', 'mkdir ', command)

        try:
            # Préparer l'environnement
            cmd_env = os.environ.copy()
            if env:
                cmd_env.update(env)

            # Exécuter la commande
            # Sur Windows, on force explicitement cmd.exe /c pour être certain que le PATH est chargé
            if is_windows:
                process = await asyncio.create_subprocess_exec(
                    "cmd.exe", "/c", command,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=self.workspace_path,
                    env=cmd_env
                )
            else:
                process = await asyncio.create_subprocess_shell(
                    command,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=self.workspace_path,
                    env=cmd_env
                )

            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=timeout
                )
            except asyncio.TimeoutError:
                process.kill()
                await process.wait()
                return {
                    "success": False,
                    "exit_code": -1,
                    "stdout": "",
                    "stderr": f"Commande interrompue : timeout de {timeout}s dépassé.",
                    "command": command
                }

            stdout_str = stdout.decode("utf-8", errors="replace")
            stderr_str = stderr.decode("utf-8", errors="replace")

            # Tronquer la sortie si trop longue
            if len(stdout_str) > MAX_OUTPUT_LENGTH:
                stdout_str = stdout_str[:MAX_OUTPUT_LENGTH] + "\n... [sortie tronquée]"
            if len(stderr_str) > MAX_OUTPUT_LENGTH:
                stderr_str = stderr_str[:MAX_OUTPUT_LENGTH] + "\n... [sortie tronquée]"

            return {
                "success": process.returncode == 0,
                "exit_code": process.returncode,
                "stdout": stdout_str,
                "stderr": stderr_str,
                "command": command
            }

        except Exception as e:
            return {
                "success": False,
                "exit_code": -1,
                "stdout": "",
                "stderr": str(e),
                "command": command
            }
