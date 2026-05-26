"""
builderz.shop — Templates HTML emails
Tous les templates partagent le même design system :
- Fond #0d0f1a (bleu très sombre)
- Accent #6366f1 (violet)
- Cartes sur fond #1a1d2e
- Typographie : system-ui / sans-serif
"""

BASE_URL = "https://builderz.shop"
LOGO_PIXELS = """
<table cellpadding="0" cellspacing="0" border="0" align="center">
  <tr>
    <td style="padding:2px"><div style="width:10px;height:10px;background:#6366f1;border-radius:2px"></div></td>
    <td style="padding:2px"><div style="width:10px;height:10px;background:#818cf8;border-radius:2px"></div></td>
    <td style="padding:2px"><div style="width:10px;height:10px;background:#6366f1;border-radius:2px"></div></td>
  </tr>
  <tr>
    <td style="padding:2px"><div style="width:10px;height:10px;background:#818cf8;border-radius:2px"></div></td>
    <td style="padding:2px"><div style="width:10px;height:10px;background:#6366f1;border-radius:2px"></div></td>
    <td style="padding:2px"><div style="width:10px;height:10px;background:#818cf8;border-radius:2px"></div></td>
  </tr>
  <tr>
    <td style="padding:2px"><div style="width:10px;height:10px;background:#6366f1;border-radius:2px"></div></td>
    <td style="padding:2px"><div style="width:10px;height:10px;background:#818cf8;border-radius:2px"></div></td>
    <td style="padding:2px"><div style="width:10px;height:10px;background:#6366f1;border-radius:2px"></div></td>
  </tr>
</table>
"""


def _base(content: str, label: str = "") -> str:
    label_html = f'<div style="margin-top:6px;font-size:11px;font-weight:600;letter-spacing:0.12em;color:#6366f1;text-transform:uppercase;">{label}</div>' if label else ''
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>builderz</title>
</head>
<body style="margin:0;padding:0;background:#0d0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0d0f1a;min-height:100vh;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

        <!-- HEADER -->
        <tr>
          <td align="center" style="background:#13162a;border-radius:16px 16px 0 0;padding:32px 40px 24px;border-bottom:1px solid #2a2d45;">
            {LOGO_PIXELS}
            <div style="margin-top:12px;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">builderz</div>
            {label_html}
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#13162a;border-radius:0 0 16px 16px;padding:32px 40px 40px;">
            {content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td align="center" style="padding:24px 0 0;">
            <div style="font-size:12px;color:#3d4166;line-height:1.6;">
              builderz.shop · contact@builderz.shop<br>
              <a href="{BASE_URL}" style="color:#3d4166;text-decoration:none;">builderz.shop</a>
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>"""


def _btn(text: str, url: str, color: str = "#6366f1") -> str:
    return f"""<table cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0;">
  <tr>
    <td align="center" style="background:{color};border-radius:10px;">
      <a href="{url}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">{text}</a>
    </td>
  </tr>
</table>"""


def _card(content: str) -> str:
    return f'<div style="background:#1a1d2e;border-radius:12px;padding:20px 24px;margin:20px 0;">{content}</div>'


def _row(label: str, value: str) -> str:
    return f"""<tr>
  <td style="padding:7px 0;font-size:13px;color:#6b7280;width:40%;vertical-align:top;">{label}</td>
  <td style="padding:7px 0;font-size:13px;color:#e5e7eb;font-weight:500;">{value}</td>
</tr>"""


def _divider() -> str:
    return '<div style="height:1px;background:#2a2d45;margin:24px 0;"></div>'


# ───────────────────────────────────────────────────────────────────
# EMAIL 1 — Admin : nouvelle demande formulaire
# ───────────────────────────────────────────────────────────────────
def admin_notification_html(
    nom: str,
    email: str,
    telephone: str,
    secteur: str,
    type_site: str,
    objectif: str,
    description: str,
    prix_suggere: float,
    crm_url: str,
) -> str:
    rows = f"""
  {_row("Email", email)}
  {_row("Téléphone", telephone or "—")}
  {_row("Secteur", secteur)}
  {_row("Type de site", type_site)}
  {_row("Objectif", objectif)}
  {_row("Prix suggéré", f"<span style='color:#6366f1;font-weight:700;font-size:15px;'>{prix_suggere:.0f} €</span>")}
"""
    desc_html = f'<p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;font-style:italic;">"{description[:200]}{"..." if len(description) > 200 else ""}"</p>' if description else ""
    content = f"""
<p style="margin:0 0 4px;font-size:13px;color:#818cf8;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Nouvelle demande</p>
<h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">{nom}</h1>

{_card(f'<table width="100%" cellpadding="0" cellspacing="0" border="0">{rows}</table>')}

{desc_html}

{_btn("Voir dans le CRM →", crm_url)}

<p style="margin:20px 0 0;text-align:center;font-size:12px;color:#3d4166;">
  Connectez-vous au dashboard pour valider et envoyer le lien de paiement.
</p>
"""
    return _base(content, label="Nouvelle demande reçue")


# ───────────────────────────────────────────────────────────────────
# EMAIL 2 — Client : lien de paiement
# ───────────────────────────────────────────────────────────────────
def payment_link_html(
    prenom: str,
    nom_projet: str,
    montant: float,
    payment_url: str,
    portal_token: str = "",
) -> str:
    portal_section = ""
    if portal_token:
        portal_url = f"{BASE_URL}/mon-espace?token={portal_token}"
        portal_section = f"""
{_divider()}
<p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-align:center;">
  Consultez dès maintenant l'avancement de votre projet :
</p>
{_btn("Mon espace builderz →", portal_url, color="#1a1d2e")}
"""

    amount_card = _card(f"""
<p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.1em;color:#6b7280;text-transform:uppercase;text-align:center;">Montant total</p>
<p style="margin:0;font-size:42px;font-weight:700;color:#6366f1;text-align:center;letter-spacing:-0.03em;">{montant:.0f}<span style="font-size:24px;">€</span></p>
<p style="margin:8px 0 0;font-size:12px;color:#6b7280;text-align:center;">TTC · Paiement unique · Remboursement sous 14 jours</p>
""")

    content = f"""
<p style="margin:0 0 20px;font-size:16px;color:#e5e7eb;">Bonjour <strong style="color:#ffffff;">{prenom}</strong> 👋</p>

<p style="margin:0 0 24px;font-size:15px;color:#9ca3af;line-height:1.7;">
  Bonne nouvelle ! Votre projet <strong style="color:#ffffff;">« {nom_projet} »</strong> a été validé par notre équipe.
  Vous pouvez maintenant finaliser votre commande en procédant au règlement.
</p>

{amount_card}

{_btn("Finaliser ma commande →", payment_url)}

<p style="margin:16px 0 0;text-align:center;font-size:12px;color:#4b5563;">
  Règlement sécurisé par Stripe.<br>
  Une fois confirmé, vous recevrez un email avec le suivi de votre projet.
</p>

{portal_section}
"""
    return _base(content, label="Votre devis est validé")


# ───────────────────────────────────────────────────────────────────
# EMAIL 3 — Client : confirmation paiement
# ───────────────────────────────────────────────────────────────────
def client_payment_confirmed_html(
    prenom: str,
    nom_projet: str,
    montant: float,
    portal_token: str,
) -> str:
    portal_url = f"{BASE_URL}/mon-espace?token={portal_token}"

    steps_card = _card("""
<p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#ffffff;">Prochaines étapes</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding:8px 0;vertical-align:top;">
      <span style="display:inline-block;width:24px;height:24px;background:#6366f1;border-radius:50%;text-align:center;line-height:24px;font-size:11px;font-weight:700;color:#fff;margin-right:12px;">1</span>
      <span style="font-size:13px;color:#e5e7eb;">Notre équipe analyse votre brief</span>
    </td>
  </tr>
  <tr>
    <td style="padding:8px 0;vertical-align:top;">
      <span style="display:inline-block;width:24px;height:24px;background:#6366f1;border-radius:50%;text-align:center;line-height:24px;font-size:11px;font-weight:700;color:#fff;margin-right:12px;">2</span>
      <span style="font-size:13px;color:#e5e7eb;">Génération de votre site sur mesure</span>
    </td>
  </tr>
  <tr>
    <td style="padding:8px 0;vertical-align:top;">
      <span style="display:inline-block;width:24px;height:24px;background:#6366f1;border-radius:50%;text-align:center;line-height:24px;font-size:11px;font-weight:700;color:#fff;margin-right:12px;">3</span>
      <span style="font-size:13px;color:#e5e7eb;">Livraison sous 72h avec lien de votre site</span>
    </td>
  </tr>
</table>
""")

    content = f"""
<div style="text-align:center;margin-bottom:28px;">
  <div style="display:inline-block;background:#0d2e1a;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;margin-bottom:16px;">✓</div>
  <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Commande confirmée !</h1>
  <p style="margin:8px 0 0;font-size:14px;color:#9ca3af;">Votre commande a bien été reçue.</p>
</div>

<p style="margin:0 0 24px;font-size:15px;color:#9ca3af;line-height:1.7;">
  Bonjour <strong style="color:#ffffff;">{prenom}</strong>,<br><br>
  Merci pour votre confiance. Notre équipe commence à travailler sur votre site <strong style="color:#ffffff;">« {nom_projet} »</strong> dès maintenant.
  Vous recevrez votre site dans les <strong style="color:#ffffff;">72 heures</strong>.
</p>

{steps_card}

{_btn("Suivre mon projet →", portal_url)}

<p style="margin:20px 0 0;text-align:center;font-size:12px;color:#3d4166;">
  Montant débité : <strong style="color:#6b7280;">{montant:.0f} €</strong> · Une question ? contact@builderz.shop
</p>
"""
    return _base(content, label="Commande confirmée ✓")


# ───────────────────────────────────────────────────────────────────
# EMAIL 4 — Admin : confirmation paiement reçu
# ───────────────────────────────────────────────────────────────────
def admin_payment_confirmed_html(
    nom_projet: str,
    montant: float,
    client_email: str,
    secteur: str,
    type_site: str,
    brief_resume: str,
    dashboard_url: str,
) -> str:
    rows = f"""
  {_row("Client", client_email)}
  {_row("Secteur", secteur)}
  {_row("Type de site", type_site)}
"""
    brief_html = f'<div style="margin-top:12px;padding-top:12px;border-top:1px solid #2a2d45;"><p style="margin:0;font-size:12px;color:#6b7280;font-style:italic;">"{brief_resume[:180]}{"..." if len(brief_resume) > 180 else ""}"</p></div>' if brief_resume else ""

    amount_card = _card(f"""
<p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.1em;color:#6b7280;text-transform:uppercase;text-align:center;">Montant encaissé</p>
<p style="margin:0;font-size:36px;font-weight:700;color:#22c55e;text-align:center;letter-spacing:-0.03em;">{montant:.0f} €</p>
""")

    content = f"""
<p style="margin:0 0 4px;font-size:13px;color:#22c55e;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Paiement reçu</p>
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">{nom_projet}</h1>

{amount_card}

{_card(f'<table width="100%" cellpadding="0" cellspacing="0" border="0">{rows}</table>{brief_html}')}

{_btn("Ouvrir dans le dashboard →", dashboard_url)}
"""
    return _base(content, label="🔔 Nouvelle commande")


# ───────────────────────────────────────────────────────────────────
# EMAIL 5 — Admin : demande de modification client (mon-espace)
# ───────────────────────────────────────────────────────────────────
def modification_request_html(
    client_name: str,
    client_email: str,
    nom_projet: str,
    site_url: str,
    message: str,
    dashboard_url: str,
) -> str:
    rows = f"""
  {_row("Client", client_name)}
  {_row("Email", f'<a href="mailto:{client_email}" style="color:#6366f1;text-decoration:none;">{client_email}</a>')}
  {_row("Site", f'<a href="{site_url}" style="color:#6366f1;text-decoration:none;">{site_url}</a>' if site_url else "—")}
"""
    content = f"""
<p style="margin:0 0 4px;font-size:13px;color:#f59e0b;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Demande de modification</p>
<h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">{nom_projet}</h1>

{_card(f'<table width="100%" cellpadding="0" cellspacing="0" border="0">{rows}</table>')}

<p style="margin:20px 0 8px;font-size:13px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;">Message du client</p>
<div style="background:#1a1d2e;border-left:3px solid #6366f1;border-radius:0 8px 8px 0;padding:16px 20px;font-size:14px;color:#e5e7eb;line-height:1.7;font-style:italic;">
  "{message}"
</div>

{_btn("Répondre au client →", dashboard_url)}

<p style="margin:16px 0 0;text-align:center;font-size:12px;color:#3d4166;">
  Connectez-vous au dashboard pour valider, refuser ou marquer comme fait.
</p>
"""
    return _base(content, label="Demande de modification")


# ───────────────────────────────────────────────────────────────────
# EMAIL 6 — Admin : nouvelle demande guardian (site_guardian)
# ───────────────────────────────────────────────────────────────────
def guardian_request_html(
    client_name: str,
    site_url: str,
    message: str,
    dashboard_url: str,
) -> str:
    rows = f"""
  {_row("Client", client_name)}
  {_row("Site", f'<a href="{site_url}" style="color:#6366f1;text-decoration:none;">{site_url}</a>' if site_url else "—")}
"""
    content = f"""
<p style="margin:0 0 4px;font-size:13px;color:#10b981;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Site Guardian</p>
<h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Nouvelle demande de modification</h1>

{_card(f'<table width="100%" cellpadding="0" cellspacing="0" border="0">{rows}</table>')}

<p style="margin:20px 0 8px;font-size:13px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;">Message</p>
<div style="background:#1a1d2e;border-left:3px solid #10b981;border-radius:0 8px 8px 0;padding:16px 20px;font-size:14px;color:#e5e7eb;line-height:1.7;font-style:italic;">
  "{message}"
</div>

{_btn("Voir dans Site Guardian →", dashboard_url, color="#10b981")}
"""
    return _base(content, label="Site Guardian")


# ───────────────────────────────────────────────────────────────────
# EMAIL 7 — Client : statut de sa demande guardian
# ───────────────────────────────────────────────────────────────────
def guardian_status_html(
    client_name: str,
    status: str,
    note: str = "",
) -> str:
    STATUS_MAP = {
        "approved": ("En cours de traitement", "#6366f1", "Votre demande a été validée et est en cours de traitement."),
        "done":     ("Modification appliquée ✓", "#10b981", "Les modifications ont été appliquées sur votre site."),
        "rejected": ("Demande examinée", "#f59e0b", "Nous avons examiné votre demande."),
    }
    label, color, default_msg = STATUS_MAP.get(status, ("Mise à jour", "#6366f1", "Votre demande a été mise à jour."))
    note_html = f"""
<div style="background:#1a1d2e;border-left:3px solid {color};border-radius:0 8px 8px 0;padding:16px 20px;font-size:14px;color:#e5e7eb;line-height:1.7;margin-top:16px;">
  {note}
</div>""" if note else ""

    content = f"""
<p style="margin:0 0 4px;font-size:13px;color:{color};font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Site Guardian</p>
<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">{label}</h1>

<p style="margin:0;font-size:15px;color:#9ca3af;line-height:1.7;">
  Bonjour <strong style="color:#e5e7eb;">{client_name}</strong>,<br>
  {default_msg}
</p>

{note_html}

{_btn("Accéder à mon espace →", f"{BASE_URL}/mon-espace", color=color)}
"""
    return _base(content, label="Mise à jour de votre site")
