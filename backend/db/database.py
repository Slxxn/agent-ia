"""
Module de gestion de la base de données SQLite.
Gère la création des tables et les opérations CRUD.
"""

import aiosqlite
import os
import json
from datetime import datetime
from typing import Optional, List, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "sqlite.db")


async def get_db() -> aiosqlite.Connection:
    """Obtenir une connexion à la base de données."""
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    return db


async def init_db():
    """Initialiser les tables de la base de données."""
    db = await get_db()
    try:
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT DEFAULT '',
                status TEXT DEFAULT 'idle' CHECK(status IN ('idle','running','paused','error','done')),
                progress REAL DEFAULT 0.0,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now')),
                workspace_path TEXT DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                description TEXT NOT NULL,
                status TEXT DEFAULT 'pending' CHECK(status IN ('pending','running','done','error','skipped')),
                step_index INTEGER DEFAULT 0,
                steps TEXT DEFAULT '[]',
                result TEXT DEFAULT '',
                retries INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                timestamp TEXT DEFAULT (datetime('now')),
                level TEXT DEFAULT 'info' CHECK(level IN ('info','error','debug','warning')),
                message TEXT NOT NULL,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
            CREATE INDEX IF NOT EXISTS idx_logs_project ON logs(project_id);
            CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(project_id, timestamp);
        """)
        await db.commit()
    finally:
        await db.close()


# ─── Opérations sur les projets ───

async def create_project(name: str, description: str = "") -> Dict[str, Any]:
    """Créer un nouveau projet."""
    db = await get_db()
    try:
        # Nettoyer le nom pour avoir un nom de dossier propre sans timestamp (ou très court)
        clean_name = name.lower().replace(' ', '-').replace('_', '-')
        import re
        clean_name = re.sub(r'[^a-z0-9\-]', '', clean_name)
        workspace_path = f"workspace/{clean_name}"
        
        cursor = await db.execute(
            "INSERT INTO projects (name, description, workspace_path) VALUES (?, ?, ?)",
            (name, description, workspace_path)
        )
        await db.commit()
        project_id = cursor.lastrowid
        return await get_project(project_id)
    finally:
        await db.close()


async def get_project(project_id: int) -> Optional[Dict[str, Any]]:
    """Récupérer un projet par son ID."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None
    finally:
        await db.close()


async def get_all_projects() -> List[Dict[str, Any]]:
    """Récupérer tous les projets."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM projects ORDER BY created_at DESC")
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        await db.close()


async def update_project(project_id: int, **kwargs) -> Optional[Dict[str, Any]]:
    """Mettre à jour un projet."""
    db = await get_db()
    try:
        allowed = {"name", "description", "status", "progress", "workspace_path"}
        fields = {k: v for k, v in kwargs.items() if k in allowed}
        if not fields:
            return await get_project(project_id)
        fields["updated_at"] = datetime.now().isoformat()
        set_clause = ", ".join(f"{k} = ?" for k in fields)
        values = list(fields.values()) + [project_id]
        await db.execute(f"UPDATE projects SET {set_clause} WHERE id = ?", values)
        await db.commit()
        return await get_project(project_id)
    finally:
        await db.close()


async def delete_project(project_id: int) -> bool:
    """Supprimer un projet."""
    db = await get_db()
    try:
        cursor = await db.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        await db.commit()
        return cursor.rowcount > 0
    finally:
        await db.close()


# ─── Opérations sur les tâches ───

async def create_task(project_id: int, description: str, steps: List[str] = None) -> Dict[str, Any]:
    """Créer une nouvelle tâche."""
    db = await get_db()
    try:
        steps_json = json.dumps(steps or [])
        cursor = await db.execute(
            "INSERT INTO tasks (project_id, description, steps) VALUES (?, ?, ?)",
            (project_id, description, steps_json)
        )
        await db.commit()
        task_id = cursor.lastrowid
        return await get_task(task_id)
    finally:
        await db.close()


async def get_task(task_id: int) -> Optional[Dict[str, Any]]:
    """Récupérer une tâche par son ID."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        row = await cursor.fetchone()
        if row:
            d = dict(row)
            d["steps"] = json.loads(d["steps"]) if d["steps"] else []
            return d
        return None
    finally:
        await db.close()


async def get_tasks_by_project(project_id: int) -> List[Dict[str, Any]]:
    """Récupérer toutes les tâches d'un projet."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM tasks WHERE project_id = ? ORDER BY step_index ASC",
            (project_id,)
        )
        rows = await cursor.fetchall()
        result = []
        for row in rows:
            d = dict(row)
            d["steps"] = json.loads(d["steps"]) if d["steps"] else []
            result.append(d)
        return result
    finally:
        await db.close()


async def update_task(task_id: int, **kwargs) -> Optional[Dict[str, Any]]:
    """Mettre à jour une tâche."""
    db = await get_db()
    try:
        allowed = {"description", "status", "step_index", "steps", "result", "retries"}
        fields = {k: v for k, v in kwargs.items() if k in allowed}
        if "steps" in fields and isinstance(fields["steps"], list):
            fields["steps"] = json.dumps(fields["steps"])
        if not fields:
            return await get_task(task_id)
        fields["updated_at"] = datetime.now().isoformat()
        set_clause = ", ".join(f"{k} = ?" for k in fields)
        values = list(fields.values()) + [task_id]
        await db.execute(f"UPDATE tasks SET {set_clause} WHERE id = ?", values)
        await db.commit()
        return await get_task(task_id)
    finally:
        await db.close()


# ─── Opérations sur les logs ───

async def add_log(project_id: int, message: str, level: str = "info") -> Dict[str, Any]:
    """Ajouter un log pour un projet."""
    db = await get_db()
    try:
        timestamp = datetime.now().isoformat()
        cursor = await db.execute(
            "INSERT INTO logs (project_id, timestamp, level, message) VALUES (?, ?, ?, ?)",
            (project_id, timestamp, level, message)
        )
        await db.commit()
        return {
            "id": cursor.lastrowid,
            "project_id": project_id,
            "timestamp": timestamp,
            "level": level,
            "message": message
        }
    finally:
        await db.close()


async def get_logs(project_id: int, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
    """Récupérer les logs d'un projet."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM logs WHERE project_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?",
            (project_id, limit, offset)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        await db.close()


async def get_logs_after(project_id: int, after_id: int = 0) -> List[Dict[str, Any]]:
    """Récupérer les logs après un certain ID (pour le streaming)."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM logs WHERE project_id = ? AND id > ? ORDER BY id ASC",
            (project_id, after_id)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        await db.close()
