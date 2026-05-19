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
                objective TEXT DEFAULT '',
                status TEXT DEFAULT 'idle' CHECK(status IN ('idle','running','paused','error','done')),
                progress REAL DEFAULT 0.0,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now')),
                workspace_path TEXT DEFAULT '',
                tokens_used INTEGER DEFAULT 0,
                brief TEXT DEFAULT ''
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

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT DEFAULT '',
                encrypted INTEGER DEFAULT 0,
                updated_at TEXT DEFAULT (datetime('now'))
            );

            CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
            CREATE INDEX IF NOT EXISTS idx_logs_project ON logs(project_id);
            CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(project_id, timestamp);
        """)
        await db.commit()

        # Migrations — colonnes ajoutées progressivement
        # fix_stats table — tracks which static post-processor fixes fire most often
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS fix_stats (
                fix_name TEXT PRIMARY KEY,
                count INTEGER DEFAULT 0,
                last_fired TEXT DEFAULT (datetime('now'))
            );
        """)
        await db.commit()

        await db.executescript("""
            CREATE TABLE IF NOT EXISTS portal_orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                token TEXT UNIQUE NOT NULL,
                firestore_id TEXT DEFAULT '',
                client_email TEXT DEFAULT '',
                client_phone TEXT DEFAULT '',
                business_name TEXT DEFAULT '',
                site_type TEXT DEFAULT 'standard',
                status TEXT DEFAULT 'awaiting_payment',
                payment_session_id TEXT DEFAULT '',
                project_id INTEGER DEFAULT NULL,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );
            CREATE INDEX IF NOT EXISTS idx_portal_token ON portal_orders(token);
        """)
        await db.commit()

        # guardian_sites table for Site Guardian
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS guardian_sites (
                id TEXT PRIMARY KEY,
                project_id TEXT,
                client_name TEXT DEFAULT '',
                client_email TEXT DEFAULT '',
                site_url TEXT DEFAULT '',
                plan TEXT DEFAULT 'essential',
                active INTEGER DEFAULT 1,
                created_at TEXT
            );
        """)
        await db.commit()

        for migration in [
            "ALTER TABLE projects ADD COLUMN objective TEXT DEFAULT ''",
            "ALTER TABLE projects ADD COLUMN tokens_used INTEGER DEFAULT 0",
            "ALTER TABLE projects ADD COLUMN brief TEXT DEFAULT ''",
            "ALTER TABLE projects ADD COLUMN deploy_url TEXT DEFAULT ''",
            "ALTER TABLE projects ADD COLUMN slug TEXT DEFAULT ''",
            "ALTER TABLE projects ADD COLUMN is_client INTEGER DEFAULT 0",
            "ALTER TABLE projects ADD COLUMN client_name TEXT DEFAULT ''",
            "ALTER TABLE projects ADD COLUMN client_email TEXT DEFAULT ''",
            "ALTER TABLE projects ADD COLUMN notes TEXT DEFAULT ''",
        ]:
            try:
                await db.execute(migration)
                await db.commit()
            except Exception:
                pass  # colonne déjà présente
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
        allowed = {"name", "description", "objective", "status", "progress", "workspace_path", "tokens_used", "brief", "deploy_url"}
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


async def add_tokens_used(project_id: int, tokens: int) -> None:
    """Ajouter des tokens au compteur du projet (opération atomique)."""
    if tokens <= 0:
        return
    db = await get_db()
    try:
        await db.execute(
            "UPDATE projects SET tokens_used = tokens_used + ?, updated_at = datetime('now') WHERE id = ?",
            (tokens, project_id)
        )
        await db.commit()
    finally:
        await db.close()


async def get_tokens_used(project_id: int) -> int:
    """Retourner le nombre total de tokens consommés par un projet."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT tokens_used FROM projects WHERE id = ?", (project_id,))
        row = await cursor.fetchone()
        return row["tokens_used"] if row else 0
    finally:
        await db.close()


async def save_brief(project_id: int, brief_data: dict) -> None:
    """Sauvegarder le brief JSON d'un projet."""
    db = await get_db()
    try:
        await db.execute(
            "UPDATE projects SET brief = ?, updated_at = datetime('now') WHERE id = ?",
            (json.dumps(brief_data, ensure_ascii=False), project_id)
        )
        await db.commit()
    finally:
        await db.close()


async def get_brief(project_id: int) -> Optional[dict]:
    """Récupérer le brief JSON d'un projet."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT brief FROM projects WHERE id = ?", (project_id,))
        row = await cursor.fetchone()
        if row and row["brief"]:
            try:
                return json.loads(row["brief"])
            except Exception:
                return None
        return None
    finally:
        await db.close()


# ─── Table settings ───

async def get_setting(key: str) -> Optional[str]:
    """Récupérer une valeur de réglage (déchiffrée si nécessaire)."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT value, encrypted FROM settings WHERE key = ?", (key,)
        )
        row = await cursor.fetchone()
        if not row:
            return None
        val = row["value"]
        if row["encrypted"] and val:
            try:
                from backend.core.settings_crypto import decrypt_value
                return decrypt_value(val)
            except Exception:
                return val
        return val
    finally:
        await db.close()


async def set_setting(key: str, value: str, encrypted: bool = False) -> None:
    """Créer ou mettre à jour un réglage."""
    db = await get_db()
    try:
        stored = value
        if encrypted and value:
            try:
                from backend.core.settings_crypto import encrypt_value
                stored = encrypt_value(value)
            except Exception:
                pass
        await db.execute(
            """INSERT INTO settings (key, value, encrypted)
               VALUES (?, ?, ?)
               ON CONFLICT(key) DO UPDATE SET value=excluded.value,
                 encrypted=excluded.encrypted,
                 updated_at=datetime('now')""",
            (key, stored, 1 if encrypted else 0)
        )
        await db.commit()
    finally:
        await db.close()


async def get_all_settings() -> list[dict]:
    """Retourner tous les réglages (valeurs sensibles masquées)."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT key, value, encrypted FROM settings ORDER BY key")
        rows = await cursor.fetchall()
        result = []
        for row in rows:
            val = row["value"] or ""
            if row["encrypted"] and len(val) > 8:
                # Masquer : sk_test_...XXXX
                val = val[:8] + "..." + val[-4:]
            result.append({"key": row["key"], "value": val, "encrypted": bool(row["encrypted"])})
        return result
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


# ─── Fix stats (error pattern tracking) ───

async def increment_fix_counter(fix_name: str) -> None:
    """Increment the counter for a static post-processor fix. Used for pattern analysis."""
    db = await get_db()
    try:
        await db.execute(
            """INSERT INTO fix_stats (fix_name, count, last_fired)
               VALUES (?, 1, datetime('now'))
               ON CONFLICT(fix_name) DO UPDATE SET
                 count = count + 1,
                 last_fired = datetime('now')""",
            (fix_name,),
        )
        await db.commit()
    except Exception:
        pass
    finally:
        await db.close()


async def get_fix_stats() -> List[Dict[str, Any]]:
    """Return fix stats ordered by count desc — shows which LLM rules fire most."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT fix_name, count, last_fired FROM fix_stats ORDER BY count DESC"
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        await db.close()
