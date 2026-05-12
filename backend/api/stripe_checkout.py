"""
API Routes — Stripe Checkout (collecte des honoraires).
"""

import asyncio
import stripe as _stripe
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.db.database import get_setting, get_db

router = APIRouter(prefix="/checkout", tags=["checkout"])

PRICES = {
    "standard":      45000,   # €450
    "3d":            65000,   # €650
    "scrollytelling": 55000,  # €550
}

LABELS = {
    "standard":      "Site Vitrine",
    "3d":            "Site 3D / WebGL",
    "scrollytelling": "Scrollytelling",
}


class CheckoutCreate(BaseModel):
    portal_token: str
    business_name: str
    site_type: str = "standard"
    client_email: Optional[str] = None
    origin: str


async def _get_stripe():
    key = await get_setting("STRIPE_SECRET_KEY")
    if not key:
        raise HTTPException(400, "Stripe non configuré — ajoutez votre clé dans Réglages.")
    _stripe.api_key = key
    return _stripe


@router.post("/create")
async def create_checkout_session(data: CheckoutCreate):
    stripe = await _get_stripe()

    amount = PRICES.get(data.site_type, 45000)
    label  = LABELS.get(data.site_type, "Site Web")

    session = await asyncio.to_thread(
        lambda: stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "eur",
                    "product_data": {"name": f"{label} — {data.business_name}"},
                    "unit_amount": amount,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=f"{data.origin}/p/{data.portal_token}?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{data.origin}/form",
            customer_email=data.client_email or None,
            metadata={"portal_token": data.portal_token},
        )
    )

    db = await get_db()
    try:
        await db.execute(
            "UPDATE portal_orders SET payment_session_id = ?, updated_at = datetime('now') WHERE token = ?",
            (session.id, data.portal_token),
        )
        await db.commit()
    finally:
        await db.close()

    return {"url": session.url, "session_id": session.id}


@router.get("/verify/{session_id}")
async def verify_session(session_id: str):
    stripe = await _get_stripe()

    session = await asyncio.to_thread(
        lambda: stripe.checkout.Session.retrieve(session_id)
    )

    paid = session.payment_status == "paid"
    metadata = dict(session.metadata) if session.metadata else {}
    portal_token = metadata.get("portal_token")

    if paid and portal_token:
        db = await get_db()
        try:
            await db.execute(
                """UPDATE portal_orders SET status = 'pending',
                   updated_at = datetime('now') WHERE token = ? AND status = 'awaiting_payment'""",
                (portal_token,),
            )
            await db.commit()
        finally:
            await db.close()

    return {
        "paid": paid,
        "payment_status": session.payment_status,
        "portal_token": portal_token,
    }
