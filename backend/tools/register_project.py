#!/usr/bin/env python3
"""
Script CLI pour enregistrer un projet dans le dashboard builderz.
Utilisé par Claude Code après chaque génération de site.

Usage :
  python backend/tools/register_project.py --name "Salon Emma" --slug "salon-emma" --sector "beaute" --type "standard" --is-client false
  python backend/tools/register_project.py --slug "salon-emma" --update --is-client true --client-email "emma@salon.fr"
"""

import argparse
import asyncio
import uuid
from datetime import datetime, timezone
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent.parent))


async def register_project(args):
    from backend.db.database import get_db

    now = datetime.now(timezone.utc).isoformat()

    db = await get_db()
    try:
        if args.update:
            updates, params = [], []

            if args.is_client is not None:
                is_client = args.is_client.lower() == 'true'
                updates.append("is_client = ?")
                params.append(1 if is_client else 0)
                if is_client:
                    await _add_to_guardian(db, args.slug, args, now)

            for field, col in [
                (args.deploy_url,    "deploy_url"),
                (args.status,        "status"),
                (args.client_email,  "client_email"),
                (args.client_name,   "client_name"),
                (args.notes,         "notes"),
            ]:
                if field is not None:
                    updates.append(f"{col} = ?")
                    params.append(field)

            if updates:
                updates.append("updated_at = ?")
                params.extend([now, args.slug])
                await db.execute(
                    f"UPDATE projects SET {', '.join(updates)} WHERE slug = ?", params
                )
                await db.commit()
                print(f"✅ Projet '{args.slug}' mis à jour")

        else:
            cursor = await db.execute("SELECT id FROM projects WHERE slug = ?", (args.slug,))
            if await cursor.fetchone():
                print(f"⚠️  Projet '{args.slug}' existe déjà. Utilise --update pour le modifier.")
                return

            is_client = args.is_client and args.is_client.lower() == 'true'
            project_id = str(uuid.uuid4())

            await db.execute("""
                INSERT INTO projects
                  (name, slug, description, workspace_path, is_client,
                   client_email, client_name, notes, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'idle', ?, ?)
            """, (
                args.name,
                args.slug,
                f"{args.sector or ''} · {args.type or 'standard'}",
                f"workspace/{args.slug}",
                1 if is_client else 0,
                args.client_email or "",
                args.client_name or "",
                args.notes or "",
                now, now,
            ))
            await db.commit()

            cursor = await db.execute("SELECT id FROM projects WHERE slug = ?", (args.slug,))
            row = await cursor.fetchone()
            pid = row[0] if row else "?"

            print(f"✅ Projet '{args.name}' enregistré (ID: {pid})")
            print(f"   Slug    : {args.slug}")
            print(f"   Secteur : {args.sector}  |  Type : {args.type or 'standard'}")
            print(f"   Client  : {'Oui' if is_client else 'Non (test)'}")

            if is_client:
                await _add_to_guardian(db, args.slug, args, now)
                print(f"   Guardian: ajouté à la surveillance ✅")

    finally:
        await db.close()


async def _add_to_guardian(db, slug, args, now):
    cursor = await db.execute("SELECT id, deploy_url FROM projects WHERE slug = ?", (slug,))
    row = await cursor.fetchone()
    if not row:
        return
    project_id, deploy_url = row[0], row[1] or ""

    cursor = await db.execute("SELECT id FROM guardian_sites WHERE project_id = ?", (project_id,))
    if await cursor.fetchone():
        return

    await db.execute("""
        CREATE TABLE IF NOT EXISTS guardian_sites (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            client_name TEXT DEFAULT '',
            client_email TEXT DEFAULT '',
            site_url TEXT DEFAULT '',
            plan TEXT DEFAULT 'essential',
            active INTEGER DEFAULT 1,
            created_at TEXT
        )
    """)
    await db.execute("""
        INSERT INTO guardian_sites (id, project_id, client_name, client_email, site_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        str(uuid.uuid4()), project_id,
        args.client_name or "", args.client_email or "",
        deploy_url or (args.deploy_url if hasattr(args, 'deploy_url') else ""),
        now,
    ))
    await db.commit()


def main():
    parser = argparse.ArgumentParser(description="Enregistre un projet dans le dashboard builderz")
    parser.add_argument("--name",         help="Nom du projet (ex: 'Salon Emma')")
    parser.add_argument("--slug",         required=True, help="Slug unique (ex: 'salon-emma')")
    parser.add_argument("--sector",       help="Secteur (beaute/restaurant/artisan/...)")
    parser.add_argument("--type",         default="standard", help="Type (standard/scrollytelling/3d)")
    parser.add_argument("--is-client",    help="true = client payant, false = test")
    parser.add_argument("--client-email", help="Email du client")
    parser.add_argument("--client-name",  help="Nom du client")
    parser.add_argument("--deploy-url",   help="URL Firebase après déploiement")
    parser.add_argument("--status",       help="Statut (idle/done/deployed/archived)")
    parser.add_argument("--notes",        help="Notes sur le projet")
    parser.add_argument("--update",       action="store_true", help="Mettre à jour un projet existant")
    args = parser.parse_args()

    if not args.update and not args.name:
        parser.error("--name est obligatoire pour un nouveau projet")

    asyncio.run(register_project(args))


if __name__ == "__main__":
    main()
