"""
Tool Filesystem — Opérations sur les fichiers dans le workspace.
Toutes les opérations sont sandboxées dans le répertoire workspace du projet.
"""

import os
import shutil
from typing import List, Dict, Any, Optional


class FilesystemTool:
    """Outil de gestion de fichiers sandboxé dans le workspace du projet."""

    def __init__(self, workspace_path: str):
        self.workspace_path = os.path.abspath(workspace_path)
        os.makedirs(self.workspace_path, exist_ok=True)

    def _safe_path(self, path: str) -> str:
        """Résoudre un chemin en s'assurant qu'il reste dans le workspace."""
        # Normaliser et résoudre le chemin
        if os.path.isabs(path):
            # Si le chemin est absolu, le rendre relatif au workspace
            full_path = os.path.normpath(path)
        else:
            full_path = os.path.normpath(os.path.join(self.workspace_path, path))

        # Vérification de sécurité : le chemin doit rester dans le workspace
        if not full_path.startswith(self.workspace_path):
            raise PermissionError(
                f"Accès refusé : le chemin '{path}' sort du workspace. "
                f"Toutes les opérations doivent rester dans '{self.workspace_path}'."
            )
        return full_path

    def create_file(self, path: str, content: str) -> Dict[str, Any]:
        """Créer ou écraser un fichier avec le contenu donné."""
        try:
            full_path = self._safe_path(path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
            return {
                "success": True,
                "path": os.path.relpath(full_path, self.workspace_path),
                "message": f"Fichier créé : {os.path.relpath(full_path, self.workspace_path)}"
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def read_file(self, path: str) -> Dict[str, Any]:
        """Lire le contenu d'un fichier."""
        try:
            full_path = self._safe_path(path)
            if not os.path.exists(full_path):
                return {"success": False, "error": f"Fichier non trouvé : {path}"}
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()
            return {
                "success": True,
                "path": os.path.relpath(full_path, self.workspace_path),
                "content": content
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def list_files(self, path: str = ".") -> Dict[str, Any]:
        """Lister les fichiers et dossiers dans un répertoire."""
        try:
            full_path = self._safe_path(path)
            if not os.path.exists(full_path):
                return {"success": False, "error": f"Répertoire non trouvé : {path}"}
            if not os.path.isdir(full_path):
                return {"success": False, "error": f"'{path}' n'est pas un répertoire."}

            entries = []
            for entry in sorted(os.listdir(full_path)):
                entry_path = os.path.join(full_path, entry)
                entries.append({
                    "name": entry,
                    "type": "directory" if os.path.isdir(entry_path) else "file",
                    "size": os.path.getsize(entry_path) if os.path.isfile(entry_path) else 0
                })
            return {
                "success": True,
                "path": os.path.relpath(full_path, self.workspace_path),
                "entries": entries
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def create_directory(self, path: str) -> Dict[str, Any]:
        """Créer un répertoire."""
        try:
            full_path = self._safe_path(path)
            os.makedirs(full_path, exist_ok=True)
            return {
                "success": True,
                "path": os.path.relpath(full_path, self.workspace_path),
                "message": f"Répertoire créé : {os.path.relpath(full_path, self.workspace_path)}"
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def delete_file(self, path: str) -> Dict[str, Any]:
        """Supprimer un fichier."""
        try:
            full_path = self._safe_path(path)
            if not os.path.exists(full_path):
                return {"success": False, "error": f"Fichier non trouvé : {path}"}
            if os.path.isdir(full_path):
                shutil.rmtree(full_path)
            else:
                os.remove(full_path)
            return {
                "success": True,
                "message": f"Supprimé : {os.path.relpath(full_path, self.workspace_path)}"
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def file_exists(self, path: str) -> bool:
        """Vérifier si un fichier existe."""
        try:
            full_path = self._safe_path(path)
            return os.path.exists(full_path)
        except PermissionError:
            return False

    def get_tree(self, path: str = ".", prefix: str = "", max_depth: int = 4) -> str:
        """Obtenir l'arborescence du workspace sous forme de texte."""
        try:
            full_path = self._safe_path(path)
            return self._build_tree(full_path, prefix, max_depth, 0)
        except Exception as e:
            return f"Erreur : {e}"

    def _build_tree(self, path: str, prefix: str, max_depth: int, current_depth: int) -> str:
        """Construire récursivement l'arborescence."""
        if current_depth >= max_depth:
            return ""
        if not os.path.isdir(path):
            return ""

        entries = sorted(os.listdir(path))
        lines = []
        for i, entry in enumerate(entries):
            is_last = i == len(entries) - 1
            connector = "└── " if is_last else "├── "
            entry_path = os.path.join(path, entry)

            if os.path.isdir(entry_path):
                lines.append(f"{prefix}{connector}{entry}/")
                extension = "    " if is_last else "│   "
                subtree = self._build_tree(entry_path, prefix + extension, max_depth, current_depth + 1)
                if subtree:
                    lines.append(subtree)
            else:
                lines.append(f"{prefix}{connector}{entry}")

        return "\n".join(lines)
