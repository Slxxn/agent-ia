"""
POST /api/payment/confirm
Appelé par la page /success après redirection Stripe.
Met à jour le statut projet et envoie les emails client + admin.
"""

import json
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.db.database import get_db, get_setting
from backend.site_guardian.notifier import send_email

router = APIRouter(prefix="/payment", tags=["payment"])

ADMIN_FALLBACK = "sloan.dlrz@gmail.com"


class ConfirmPayload(BaseModel):
    project_id: int


def _client_html(business_name: str, portal_link: str, deploy_url: str, final_price: float) -> str:
    deploy_block = ""
    if deploy_url:
        deploy_block = f"""
        <tr>
          <td style="padding:0 0 20px 0;">
            <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
              Votre site sera disponible à l'adresse :<br>
              <a href="{deploy_url}" style="color:#6366f1;text-decoration:none;font-weight:600;">{deploy_url}</a>
            </p>
          </td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#080810;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#080810;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Logo -->
        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:10px;vertical-align:middle;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:9px;height:9px;background:#6366f1;border-radius:2px;margin:1px;"></td>
                      <td style="width:2px;"></td>
                      <td style="width:9px;height:9px;background:#818cf8;border-radius:2px;"></td>
                      <td style="width:2px;"></td>
                      <td style="width:9px;height:9px;background:#6366f1;border-radius:2px;"></td>
                    </tr>
                    <tr><td colspan="5" style="height:2px;"></td></tr>
                    <tr>
                      <td style="width:9px;height:9px;background:#818cf8;border-radius:2px;"></td>
                      <td></td>
                      <td style="width:9px;height:9px;background:#6366f1;border-radius:2px;"></td>
                      <td></td>
                      <td style="width:9px;height:9px;background:#818cf8;border-radius:2px;"></td>
                    </tr>
                    <tr><td colspan="5" style="height:2px;"></td></tr>
                    <tr>
                      <td style="width:9px;height:9px;background:#6366f1;border-radius:2px;"></td>
                      <td></td>
                      <td style="width:9px;height:9px;background:#818cf8;border-radius:2px;"></td>
                      <td></td>
                      <td style="width:9px;height:9px;background:#6366f1;border-radius:2px;"></td>
                    </tr>
                  </table>
                </td>
                <td style="vertical-align:middle;">
                  <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">builderz</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background-color:#0f0f1a;border:1px solid #1e1e35;border-radius:16px;padding:40px 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">

              <!-- Check icon -->
              <tr>
                <td style="padding:0 0 24px 0;" align="center">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:64px;height:64px;background:rgba(16,185,129,0.1);border:1.5px solid rgba(16,185,129,0.3);border-radius:50%;text-align:center;vertical-align:middle;">
                        <span style="font-size:28px;line-height:64px;">✓</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Title -->
              <tr>
                <td style="padding:0 0 8px 0;" align="center">
                  <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                    Paiement confirmé !
                  </h1>
                </td>
              </tr>

              <!-- Subtitle -->
              <tr>
                <td style="padding:0 0 32px 0;" align="center">
                  <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;">
                    Bonjour <strong style="color:#94a3b8;">{business_name}</strong>, merci pour votre confiance.
                  </p>
                </td>
              </tr>

              <!-- Separator -->
              <tr><td style="height:1px;background-color:#1e1e35;padding:0 0 24px 0;"></td></tr>

              <!-- Body text -->
              <tr>
                <td style="padding:24px 0 20px 0;">
                  <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.8;">
                    Votre paiement de <strong style="color:#ffffff;">{int(final_price)}€</strong> a bien été reçu.
                    Notre équipe commence à travailler sur votre site <strong style="color:#ffffff;">sous 24–48h</strong>.
                  </p>
                </td>
              </tr>

              {deploy_block}

              <!-- Steps -->
              <tr>
                <td style="padding:0 0 28px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080810;border:1px solid #1e1e35;border-radius:10px;">
                    <tr>
                      <td style="padding:14px 18px;border-bottom:1px solid #1a1a2e;">
                        <table cellpadding="0" cellspacing="0"><tr>
                          <td style="font-size:16px;padding-right:12px;">📧</td>
                          <td style="font-size:13px;color:#94a3b8;line-height:1.5;">Un email de confirmation vient de vous être envoyé.</td>
                        </tr></table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 18px;border-bottom:1px solid #1a1a2e;">
                        <table cellpadding="0" cellspacing="0"><tr>
                          <td style="font-size:16px;padding-right:12px;">🎨</td>
                          <td style="font-size:13px;color:#94a3b8;line-height:1.5;">Nous créons votre site selon votre brief et vos préférences.</td>
                        </tr></table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 18px;">
                        <table cellpadding="0" cellspacing="0"><tr>
                          <td style="font-size:16px;padding-right:12px;">🔗</td>
                          <td style="font-size:13px;color:#94a3b8;line-height:1.5;">Suivez l'avancement en temps réel sur votre portail client.</td>
                        </tr></table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td align="center" style="padding:0 0 8px 0;">
                  <a href="{portal_link}"
                    style="display:inline-block;padding:14px 32px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:0.2px;">
                    Suivre mon projet →
                  </a>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 0 0 0;" align="center">
            <p style="margin:0;font-size:12px;color:#334155;line-height:1.6;">
              builderz.shop · Création de sites web pour TPE/PME<br>
              <a href="https://builderz.shop" style="color:#475569;text-decoration:none;">builderz.shop</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>"""


def _admin_html(business_name: str, client_email: str, final_price: float,
                portal_link: str, sector: str, site_type: str,
                description: str, target: str, style: str,
                pages: str, features: str) -> str:
    def row(label: str, value: str) -> str:
        if not value or value == "—":
            return ""
        return f"""<tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b;width:140px;vertical-align:top;">{label}</td>
          <td style="padding:8px 0;font-size:13px;color:#e2e8f0;vertical-align:top;">{value}</td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#080810;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080810;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#6366f1;border-radius:12px 12px 0 0;padding:20px 28px;">
            <p style="margin:0;font-size:11px;font-weight:600;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1px;">Nouvelle commande</p>
            <h1 style="margin:4px 0 0;font-size:20px;font-weight:700;color:#fff;">{business_name}</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#0f0f1a;border:1px solid #1e1e35;border-top:none;border-radius:0 0 12px 12px;padding:24px 28px;">

            <!-- Amount badge -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:10px 18px;">
                  <span style="font-size:22px;font-weight:700;color:#10b981;">{int(final_price)}€</span>
                  <span style="font-size:13px;color:#64748b;margin-left:8px;">reçus</span>
                </td>
              </tr>
            </table>

            <!-- Client info -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              {row("Email client", client_email)}
              {row("Portail", f'<a href="{portal_link}" style="color:#6366f1;text-decoration:none;">{portal_link}</a>')}
            </table>

            <!-- Separator -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="height:1px;background:#1e1e35;padding:0 0 16px 0;"></td></tr>
            </table>

            <!-- Brief -->
            <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:1px;">Brief</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              {row("Secteur", sector)}
              {row("Type de site", site_type)}
              {row("Description", description)}
              {row("Cible", target)}
              {row("Style", style)}
              {row("Pages", pages)}
              {row("Fonctionnalités", features)}
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 0 0;" align="center">
            <p style="margin:0;font-size:11px;color:#334155;">builderz.shop — notification admin</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


@router.post("/confirm")
async def confirm_payment(data: ConfirmPayload):
    now = datetime.now(timezone.utc).isoformat()

    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM projects WHERE id = ?", (data.project_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Projet introuvable.")
        project = dict(row)

        already_paid = project.get("form_status") == "paid"

        await db.execute(
            "UPDATE projects SET form_status = 'paid', updated_at = ? WHERE id = ?",
            (now, data.project_id),
        )

        cursor2 = await db.execute(
            "SELECT token FROM portal_orders WHERE project_id = ? LIMIT 1",
            (data.project_id,),
        )
        token_row = await cursor2.fetchone()
        portal_token = token_row["token"] if token_row else None

        await db.commit()
    finally:
        await db.close()

    if already_paid:
        return {"success": True, "skipped": True, "reason": "already_paid"}

    # ── Données du projet ──────────────────────────────────────────────────
    client_email = project.get("client_email", "")
    deploy_url   = project.get("deploy_url", "") or ""
    final_price  = float(project.get("final_price") or project.get("suggested_price") or 0)

    brief: dict = {}
    if project.get("brief"):
        try:
            brief = json.loads(project["brief"])
        except Exception:
            pass

    business_name = brief.get("businessName") or project.get("name", "")
    sector        = brief.get("sector", "")
    site_type     = brief.get("siteType", "standard")
    pages         = ", ".join(brief.get("pages", [])) or "—"
    features      = ", ".join(brief.get("features", [])) or "—"
    description   = brief.get("description", "")
    target        = brief.get("targetAudience", "")
    style         = brief.get("visualStyle", "")

    portal_link = f"https://builderz.shop/p/{portal_token}" if portal_token else "https://builderz.shop"

    # ── Email client HTML ─────────────────────────────────────────────────
    if client_email:
        client_text = (
            f"Bonjour {business_name},\n\n"
            f"Votre paiement de {int(final_price)}€ a bien été reçu. "
            "Notre équipe commence à travailler sur votre site sous 24–48h.\n\n"
            f"Suivez l'avancement ici : {portal_link}\n\n"
            "L'équipe builderz"
        )
        sent = await send_email(
            to=client_email,
            subject="✓ Votre commande builderz.shop est confirmée",
            body=client_text,
            html=_client_html(business_name, portal_link, deploy_url, final_price),
        )
        if not sent:
            print(f"[payment/confirm] Email client non envoyé — {client_email}")

    # ── Email admin HTML ──────────────────────────────────────────────────
    admin = await get_setting("ADMIN_EMAIL") or ADMIN_FALLBACK
    admin_text = (
        f"Nouvelle commande — {business_name}\n"
        f"Email : {client_email}\nMontant : {int(final_price)}€\n"
        f"Portal : {portal_link}"
    )
    await send_email(
        to=admin,
        subject=f"🔔 Nouvelle commande — {business_name}",
        body=admin_text,
        html=_admin_html(
            business_name, client_email, final_price, portal_link,
            sector, site_type, description, target, style, pages, features,
        ),
    )

    return {"success": True, "project_id": data.project_id, "client_email": client_email}
