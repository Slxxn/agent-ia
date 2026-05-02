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

# Seules les commandes qui lancent un serveur en continu sont bloquées
# (elles ne se terminent jamais et bloqueraient l'agent indéfiniment).
# npm install / build / test sont autorisés.
NPM_BLOCKED_PATTERNS = [
    r"\bnpm\s+run\s+(dev|start)\b",
    r"\bnpm\s+start\b",
    r"\bpnpm\s+run\s+(dev|start)\b",
    r"\bpnpm\s+dev\b",
    r"\byarn\s+(dev|start)\b",
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
        for pattern in FORBIDDEN_PATTERNS:
            if re.search(pattern, command):
                return False, f"Commande interdite (pattern: {pattern})"
        return True, ""

    async def _run_node_bin(self, bin_path: str, *args: str, timeout: int = DEFAULT_TIMEOUT) -> Dict[str, Any]:
        """Run a node .cmd binary via create_subprocess_exec (avoids shell quoting issues on Windows)."""
        cmd_label = f"{os.path.basename(bin_path).replace('.cmd', '')} {' '.join(args)}"
        try:
            if sys.platform == "win32":
                proc = await asyncio.create_subprocess_exec(
                    "cmd.exe", "/c", bin_path, *args,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=self.workspace_path,
                    env=os.environ.copy(),
                )
            else:
                proc = await asyncio.create_subprocess_exec(
                    bin_path, *args,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=self.workspace_path,
                    env=os.environ.copy(),
                )
            try:
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout)
            except asyncio.TimeoutError:
                proc.kill()
                await proc.wait()
                return {"success": False, "exit_code": -1, "stdout": "", "stderr": f"Timeout ({timeout}s) dépassé.", "command": cmd_label}
            stdout_str = stdout.decode("utf-8", errors="replace")[:MAX_OUTPUT_LENGTH]
            stderr_str = stderr.decode("utf-8", errors="replace")[:MAX_OUTPUT_LENGTH]
            return {"success": proc.returncode == 0, "exit_code": proc.returncode, "stdout": stdout_str, "stderr": stderr_str, "command": cmd_label}
        except Exception as e:
            return {"success": False, "exit_code": -1, "stdout": "", "stderr": str(e), "command": cmd_label}

    async def run_npm(self, *args: str, timeout: int = DEFAULT_TIMEOUT) -> Dict[str, Any]:
        """Run npm via subprocess exec (bypasses shell quoting issues with spaces in Program Files)."""
        full_cmd = "npm " + " ".join(args)
        ok, reason = self._is_safe_command(full_cmd)
        if not ok:
            return {"success": False, "exit_code": -1, "stdout": "", "stderr": reason, "command": full_cmd}
        return await self._run_node_bin(_find_npm_path(), *args, timeout=timeout)

    async def run_npx(self, *args: str, timeout: int = DEFAULT_TIMEOUT) -> Dict[str, Any]:
        """Run npx via subprocess exec (bypasses shell quoting issues with spaces in Program Files)."""
        return await self._run_node_bin(_find_npx_path(), *args, timeout=timeout)

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

        # Sur Windows : intercept mkdir -p et exécute via Python directement
        # (Windows mkdir ne supporte pas -p sur plusieurs chemins et échoue
        # silencieusement si le dossier existe déjà)
        if is_windows and re.search(r'^\s*mkdir\s+-p\b', command):
            paths_str = re.sub(r'^\s*mkdir\s+-p\s+', '', command).strip()
            paths = paths_str.split()
            try:
                for path in paths:
                    full_path = os.path.join(self.workspace_path, path.replace('/', os.sep))
                    os.makedirs(full_path, exist_ok=True)
                return {"success": True, "exit_code": 0, "stdout": "", "stderr": "", "command": command}
            except Exception as e:
                return {"success": False, "exit_code": 1, "stdout": "", "stderr": str(e), "command": command}

        # Conversion automatique des commandes Linux vers Windows
        if is_windows:
            import re as _re
            # Intercepter npm et npx : les router via run_npm/run_npx (exec-based, pas de shell quoting)
            npm_m = _re.match(r'^\s*npm\s+(.*)', command, _re.IGNORECASE)
            if npm_m:
                args = npm_m.group(1).split()
                return await self.run_npm(*args, timeout=timeout)
            npx_m = _re.match(r'^\s*npx\s+(.*)', command, _re.IGNORECASE)
            if npx_m:
                args = npx_m.group(1).split()
                return await self.run_npx(*args, timeout=timeout)
            # touch file → echo. 2>nul (création fichier vide)
            command = _re.sub(r'\btouch\s+(\S+)', r'echo. > \1', command)
            # chmod / chown → no-op sur Windows
            command = _re.sub(r'\b(chmod|chown)\s+\S+\s+\S+', 'echo skip chmod/chown', command)
            # cat file → type file (Windows equivalent), convert / to \
            def _cat_to_type(m):
                path = m.group(1).replace('/', '\\')
                return f'type {path}'
            command = _re.sub(r'\bcat\s+(\S+)', _cat_to_type, command)
            # ls → dir /b
            command = _re.sub(r'^\s*ls\s*$', 'dir /b', command)
            command = _re.sub(r'\bls\s+-la?\b', 'dir', command)

        try:
            # Préparer l'environnement
            cmd_env = os.environ.copy()
            if env:
                cmd_env.update(env)

            # Sur Windows, create_subprocess_shell gère correctement les guillemets
            # (contrairement à create_subprocess_exec + cmd /c qui double-échappe les args).
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
