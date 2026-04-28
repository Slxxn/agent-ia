from fastapi import APIRouter, HTTPException
from backend.core.project_manager import project_manager
import os

router = APIRouter(prefix="/projects", tags=["env"])


def _read_env_file(path: str) -> dict:
    """Lire un fichier .env et retourner un dict clé/valeur."""
    data = {}
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    data[k.strip()] = v.strip()
    return data


def _write_env_file(path: str, data: dict):
    """Écrire un dict clé/valeur dans un fichier .env."""
    with open(path, "w", encoding="utf-8") as f:
        for k, v in data.items():
            f.write(f"{k}={v}\n")


@router.get("/{project_id}/env")
async def get_env(project_id: int):
    """Récupérer les variables d'environnement d'un projet.
    Lit .env en priorité, puis .env.example comme fallback."""
    workspace = await project_manager.get_workspace_path(project_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Projet introuvable")

    env_path = os.path.join(workspace, ".env")
    example_path = os.path.join(workspace, ".env.example")

    # Merge : on prend les clés de l'example comme base, on écrase avec .env
    env_data = _read_env_file(example_path)
    env_data.update(_read_env_file(env_path))

    return env_data


@router.post("/{project_id}/env")
async def update_env(project_id: int, env: dict):
    """Mettre à jour (merge intelligent) les variables d'environnement.
    Les clés existantes sont mises à jour, les nouvelles sont ajoutées."""
    workspace = await project_manager.get_workspace_path(project_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Projet introuvable")

    env_path = os.path.join(workspace, ".env")

    # Merge : on part des valeurs existantes et on écrase avec les nouvelles
    existing = _read_env_file(env_path)
    existing.update(env)

    _write_env_file(env_path, existing)
    return {"success": True, "message": "Variables d'environnement mises à jour"}


@router.delete("/{project_id}/env/{key}")
async def delete_env_var(project_id: int, key: str):
    """Supprimer une variable d'environnement spécifique."""
    workspace = await project_manager.get_workspace_path(project_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Projet introuvable")

    env_path = os.path.join(workspace, ".env")
    env_data = _read_env_file(env_path)

    if key not in env_data:
        raise HTTPException(status_code=404, detail=f"Variable '{key}' introuvable")

    del env_data[key]
    _write_env_file(env_path, env_data)
    return {"success": True, "message": f"Variable '{key}' supprimée"}
