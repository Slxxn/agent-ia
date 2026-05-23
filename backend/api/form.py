"""
Routes formulaire conversationnel builderz.shop.
POST /api/form/submit         — crée le projet, calcule le prix, notifie admin
POST /api/form/calculate-price — calcule le prix sans sauvegarder
"""

import json
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request

from backend.db.database import get_db
from backend.tools.pricing import calculate_price, get_site_type_from_answers
from backend.tools.question_tree import get_goal_choices

router = APIRouter(prefix="/form", tags=["form"])


@router.post("/calculate-price")
async def calc_price(request: Request):
    answers = await request.json()
    site_type = get_site_type_from_answers(answers)
    answers["site_type"] = site_type
    pricing = calculate_price(answers)
    return pricing


@router.post("/submit")
async def submit_form(request: Request):
    answers = await request.json()

    site_type = get_site_type_from_answers(answers)
    answers["site_type"] = site_type
    pricing = calculate_price(answers)

    project_id = str(uuid.uuid4())
    business_name = answers.get("business_name", "Nouveau projet")
    slug = business_name.lower().replace(" ", "-").replace("'", "")[:40]
    now = datetime.now(timezone.utc).isoformat()

    db = await get_db()
    try:
        # Insert into projects table (status='idle', form_status='pending_validation')
        await db.execute(
            """INSERT INTO projects
               (name, description, status, progress, workspace_path,
                brief, generation_mode, is_client, client_email,
                suggested_price, final_price, form_status,
                slug, created_at, updated_at)
               VALUES (?, ?, 'idle', 0, '', ?, 'pending', 1, ?,
                       ?, ?, 'crm_pending', ?, ?, ?)""",
            (
                business_name,
                answers.get("description", ""),
                json.dumps(answers),
                answers.get("email", ""),
                pricing["suggested"],
                pricing["suggested"],
                slug,
                now,
                now,
            ),
        )
        await db.commit()
        cursor = await db.execute("SELECT last_insert_rowid()")
        row = await cursor.fetchone()
        db_id = row[0]
    finally:
        await db.close()

    return {
        "project_id": db_id,
        "slug": slug,
        "pricing": pricing,
        "site_type": site_type,
        "message": "Votre demande a été reçue. Nous vous contacterons sous 24h.",
    }


@router.get("/goal-choices/{sector}")
async def goal_choices(sector: str):
    return get_goal_choices(sector)
