#!/usr/bin/env python3
"""
Prépare le workspace depuis un brief client (JSON du formulaire).

Usage :
  python backend/tools/brief_to_claude.py --brief '{"businessName": "Salon Emma", ...}'
  python backend/tools/brief_to_claude.py --file briefs/salon-emma.json
  python backend/tools/brief_to_claude.py --project-id abc123
"""

import argparse
import asyncio
import json
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT))

HERO_BLOCKS = {
    "beaute": "HeroBeaute",
    "restaurant": "HeroRestaurant",
    "artisan": "HeroArtisan",
    "medical": "HeroMedical",
    "immobilier": "HeroImmobilier",
    "coach": "HeroCoach",
    "photo": "HeroPhoto",
    "mode": "HeroMode",
    "sport": "HeroSport",
    "tech": "HeroTech",
    "association": "HeroAssociation",
    "autre": "HeroGeneric",
}

SECTION_PLANS = {
    ("beaute", "bookings"):     ["Services", "About", "Gallery", "Testimonials", "Booking", "Stats", "Contact"],
    ("beaute", "showcase"):     ["Services", "About", "Gallery", "Testimonials", "Stats", "Contact"],
    ("restaurant", "bookings"): ["Features", "Menu", "About", "Testimonials", "Booking", "Contact"],
    ("restaurant", "showcase"): ["Features", "Menu", "Gallery", "Testimonials", "Contact"],
    ("artisan", "prospects"):   ["Services", "Process", "Gallery", "Stats", "Testimonials", "Devis"],
    ("artisan", "showcase"):    ["Services", "Process", "Gallery", "Testimonials", "Contact"],
    ("coach", "bookings"):      ["Benefits", "About", "Method", "Pricing", "Testimonials", "FAQ", "Booking"],
    ("coach", "prospects"):     ["Benefits", "About", "Method", "Pricing", "Testimonials", "Contact"],
    ("photo", "portfolio"):     ["Gallery", "About", "Services", "Pricing", "Testimonials", "Contact"],
    ("medical", "bookings"):    ["Services", "Team", "Process", "FAQ", "Booking", "Contact"],
    ("immobilier", "prospects"):["Properties", "Services", "Stats", "Testimonials", "Team", "Contact"],
    ("mode", "ecommerce"):      ["FeaturedProducts", "Features", "Gallery", "Testimonials", "Newsletter"],
    ("sport", "bookings"):      ["Classes", "Pricing", "Schedule", "Testimonials", "Booking"],
    ("tech", "prospects"):      ["Features", "Stats", "LogoStrip", "Process", "Pricing", "Testimonials", "FAQ", "CTA"],
    ("tech", "ecommerce"):      ["Features", "Products", "Pricing", "Testimonials", "FAQ", "CTA"],
    ("association", "showcase"):["Mission", "Actions", "Stats", "Team", "Testimonials", "Contact"],
}

# ── Normalisation des valeurs venant du formulaire (clés courtes) ──────────────

STYLE_MAP = {
    "luxe": "Luxe & Élégant", "minimaliste": "Minimaliste", "moderne": "Moderne & Audacieux",
    "naturel": "Naturel & Chaleureux", "colore": "Coloré & Vibrant", "pro": "Professionnel",
}
THEME_MAP = {"dark": "sombre", "light": "clair", "neutral": "clair",
             "Sombre (noir)": "sombre", "Clair (blanc)": "clair", "Neutre (gris)": "clair"}


def normalize_style(value: str) -> str:
    return STYLE_MAP.get(value, value or "Professionnel")


def normalize_theme(value: str) -> str:
    return THEME_MAP.get(value, "clair")


# ── Direction artistique sectorielle ────────────────────────────────────────────
# Chaque palette : fonds teintés métier (jamais blanc/noir purs), 2 accents, 1 tint.
# Voir .claude/skills/site-generator.md pour la logique complète.

SECTOR_PALETTES = {
    "beaute": {
        "clair": {"bg": "#faf6f1", "bg2": "#f3ece4", "surface": "#efe6dc", "muted": "#e7dccf",
                  "text": "#3d3431", "text2": "rgba(61,52,49,0.65)", "accent": "#b5755f",
                  "accent2": "#a8c5bc", "tint": "#f0dfd8", "inverted": "#faf6f1"},
        "sombre": {"bg": "#1c1714", "bg2": "#241d19", "surface": "#2c241f", "muted": "#352b25",
                   "text": "#f0e9e2", "text2": "rgba(240,233,226,0.6)", "accent": "#cf9277",
                   "accent2": "#9dbfb5", "tint": "#3a2e27", "inverted": "#1c1714"},
    },
    "restaurant": {
        "clair": {"bg": "#faf7f2", "bg2": "#f1ebe1", "surface": "#ece4d7", "muted": "#e3d8c7",
                  "text": "#2e2a26", "text2": "rgba(46,42,38,0.65)", "accent": "#8c3b2e",
                  "accent2": "#7a7d5c", "tint": "#f0e2d6", "inverted": "#faf7f2"},
        "sombre": {"bg": "#171311", "bg2": "#1f1a16", "surface": "#27201b", "muted": "#302822",
                   "text": "#efe8df", "text2": "rgba(239,232,223,0.6)", "accent": "#caa05a",
                   "accent2": "#8c9a6c", "tint": "#332a21", "inverted": "#171311"},
    },
    "artisan": {
        "clair": {"bg": "#f7f5f1", "bg2": "#edeae3", "surface": "#e7e2d8", "muted": "#ddd6c9",
                  "text": "#2b2823", "text2": "rgba(43,40,35,0.65)", "accent": "#b07d3f",
                  "accent2": "#3e5c6b", "tint": "#efe5d4", "inverted": "#f7f5f1"},
        "sombre": {"bg": "#161513", "bg2": "#1e1c19", "surface": "#26231f", "muted": "#2f2c26",
                   "text": "#edeae3", "text2": "rgba(237,234,227,0.6)", "accent": "#c79554",
                   "accent2": "#7fa3b5", "tint": "#322c22", "inverted": "#161513"},
    },
    "coach": {
        "clair": {"bg": "#f8f7f4", "bg2": "#eeede8", "surface": "#e8e6df", "muted": "#dfdcd2",
                  "text": "#26241f", "text2": "rgba(38,36,31,0.65)", "accent": "#4a6b5d",
                  "accent2": "#b58a5a", "tint": "#e4ebe7", "inverted": "#f8f7f4"},
        "sombre": {"bg": "#141614", "bg2": "#1b1f1c", "surface": "#232825", "muted": "#2b322d",
                   "text": "#e9ece9", "text2": "rgba(233,236,233,0.6)", "accent": "#8db3a2",
                   "accent2": "#cda97f", "tint": "#27312b", "inverted": "#141614"},
    },
    "photo": {
        "clair": {"bg": "#f6f5f3", "bg2": "#ecebe8", "surface": "#e5e4e0", "muted": "#dcdad5",
                  "text": "#1f1e1c", "text2": "rgba(31,30,28,0.65)", "accent": "#54524e",
                  "accent2": "#9c5b3f", "tint": "#e9e2db", "inverted": "#f6f5f3"},
        "sombre": {"bg": "#101010", "bg2": "#171717", "surface": "#1f1f1f", "muted": "#282828",
                   "text": "#ececec", "text2": "rgba(236,236,236,0.6)", "accent": "#d4cfc7",
                   "accent2": "#b3714f", "tint": "#262220", "inverted": "#101010"},
    },
    "medical": {
        "clair": {"bg": "#f6f9f9", "bg2": "#eaf1f1", "surface": "#e2ecec", "muted": "#d7e4e4",
                  "text": "#23312f", "text2": "rgba(35,49,47,0.65)", "accent": "#2e6e6a",
                  "accent2": "#9fc4c0", "tint": "#e0eeec", "inverted": "#f6f9f9"},
        "sombre": {"bg": "#121817", "bg2": "#19201f", "surface": "#212a29", "muted": "#293433",
                   "text": "#e6eeec", "text2": "rgba(230,238,236,0.6)", "accent": "#7db8b2",
                   "accent2": "#cfe3e0", "tint": "#22302e", "inverted": "#121817"},
    },
    "immobilier": {
        "clair": {"bg": "#f8f7f5", "bg2": "#edebe6", "surface": "#e6e3dc", "muted": "#dcd8cf",
                  "text": "#23262b", "text2": "rgba(35,38,43,0.65)", "accent": "#1f3a5f",
                  "accent2": "#b59b6a", "tint": "#e6e9ee", "inverted": "#f8f7f5"},
        "sombre": {"bg": "#13161b", "bg2": "#1a1e25", "surface": "#22272f", "muted": "#2a3039",
                   "text": "#e8eaee", "text2": "rgba(232,234,238,0.6)", "accent": "#7d9cc4",
                   "accent2": "#cbb285", "tint": "#222a35", "inverted": "#13161b"},
    },
    "sport": {
        "clair": {"bg": "#f7f6f4", "bg2": "#edece8", "surface": "#e6e4df", "muted": "#dcd9d2",
                  "text": "#1e1f22", "text2": "rgba(30,31,34,0.65)", "accent": "#d4502e",
                  "accent2": "#2c2f36", "tint": "#f4ded5", "inverted": "#f7f6f4"},
        "sombre": {"bg": "#0e0f12", "bg2": "#15161a", "surface": "#1c1e23", "muted": "#24262c",
                   "text": "#f2f2f2", "text2": "rgba(242,242,242,0.6)", "accent": "#e06a45",
                   "accent2": "#9ee04a", "tint": "#2a1d17", "inverted": "#0e0f12"},
    },
    "mode": {
        "clair": {"bg": "#f9f7f4", "bg2": "#f0ede8", "surface": "#e9e5de", "muted": "#dfdad1",
                  "text": "#211f1d", "text2": "rgba(33,31,29,0.65)", "accent": "#1c1a18",
                  "accent2": "#a3654a", "tint": "#efe7df", "inverted": "#f9f7f4"},
        "sombre": {"bg": "#141312", "bg2": "#1b1a18", "surface": "#232120", "muted": "#2b2927",
                   "text": "#efedea", "text2": "rgba(239,237,234,0.6)", "accent": "#e8e4de",
                   "accent2": "#bf8262", "tint": "#2a2522", "inverted": "#141312"},
    },
    "tech": {
        "clair": {"bg": "#fafafa", "bg2": "#f1f2f4", "surface": "#e9ebee", "muted": "#dfe2e7",
                  "text": "#17181c", "text2": "rgba(23,24,28,0.65)", "accent": "#2563eb",
                  "accent2": "#0d9488", "tint": "#e3ecfc", "inverted": "#fafafa"},
        "sombre": {"bg": "#0b0c0f", "bg2": "#121419", "surface": "#1a1d24", "muted": "#22262f",
                   "text": "#eceef2", "text2": "rgba(236,238,242,0.6)", "accent": "#5b8cf0",
                   "accent2": "#2dd4bf", "tint": "#1a2233", "inverted": "#0b0c0f"},
    },
    "association": {
        "clair": {"bg": "#fbf9f5", "bg2": "#f2eee6", "surface": "#ebe6db", "muted": "#e1dbcd",
                  "text": "#2c2a26", "text2": "rgba(44,42,38,0.65)", "accent": "#c0572e",
                  "accent2": "#33658a", "tint": "#f4e3d9", "inverted": "#fbf9f5"},
        "sombre": {"bg": "#161412", "bg2": "#1d1b18", "surface": "#262320", "muted": "#2e2b27",
                   "text": "#eeebe6", "text2": "rgba(238,235,230,0.6)", "accent": "#d97e54",
                   "accent2": "#7da7c7", "tint": "#322620", "inverted": "#161412"},
    },
    "autre": {
        "clair": {"bg": "#f8f7f4", "bg2": "#eeede9", "surface": "#e7e6e1", "muted": "#dddcd5",
                  "text": "#26251f", "text2": "rgba(38,37,31,0.65)", "accent": "#5c6b54",
                  "accent2": "#b08d57", "tint": "#e8ebe4", "inverted": "#f8f7f4"},
        "sombre": {"bg": "#131311", "bg2": "#1a1a17", "surface": "#22221e", "muted": "#2a2a25",
                   "text": "#ebeae5", "text2": "rgba(235,234,229,0.6)", "accent": "#9db38f",
                   "accent2": "#c8a874", "tint": "#262a22", "inverted": "#131311"},
    },
}

# Triplets de fontes par secteur : (display, body, accent script ou None)
SECTOR_FONTS = {
    "beaute":      ("Cormorant Garamond", "Raleway", "Great Vibes"),
    "restaurant":  ("Playfair Display", "Lato", "Pinyon Script"),
    "artisan":     ("Archivo", "Source Sans 3", None),
    "coach":       ("Fraunces", "Inter", None),
    "photo":       ("Syne", "Inter", None),
    "medical":     ("Lora", "Source Sans 3", None),
    "immobilier":  ("Cormorant Garamond", "Jost", None),
    "sport":       ("Archivo Black", "Inter", None),
    "mode":        ("Marcellus", "Jost", None),
    "tech":        ("Space Grotesk", "Inter", None),
    "association": ("Bitter", "Source Sans 3", None),
    "autre":       ("Fraunces", "Inter", None),
}

# Les styles "froids" suppriment la fonte script
STYLES_WITHOUT_SCRIPT = {"Minimaliste", "Professionnel", "Moderne & Audacieux"}


def slugify(text: str) -> str:
    text = text.lower()
    for src, dst in [("àáâãäå","a"),("èéêë","e"),("ìíîï","i"),("òóôõö","o"),("ùúûü","u"),("ç","c")]:
        for c in src:
            text = text.replace(c, dst)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')


def get_section_plan(sector: str, goal: str) -> list:
    key = (sector.lower(), goal.lower())
    return SECTION_PLANS.get(key,
           SECTION_PLANS.get((sector.lower(), "showcase"),
           ["Features", "About", "Testimonials", "Stats", "Contact"]))


def get_fonts(brief: dict) -> tuple:
    sector = (brief.get("sector") or "autre").lower()
    style = normalize_style(brief.get("visualStyle", ""))
    display, body, accent = SECTOR_FONTS.get(sector, SECTOR_FONTS["autre"])
    if style in STYLES_WITHOUT_SCRIPT:
        accent = None
    if style == "Luxe & Élégant" and accent is None:
        accent = "Pinyon Script"
    return display, body, accent


def generate_tokens_css(brief: dict) -> str:
    sector = (brief.get("sector") or "autre").lower()
    theme = normalize_theme(brief.get("colorTheme", "clair"))
    palettes = SECTOR_PALETTES.get(sector, SECTOR_PALETTES["autre"])
    p = palettes.get(theme, palettes["clair"]).copy()

    # Les couleurs client remplacent les accents, la logique de palette reste
    colors = brief.get("colors", [])
    if colors:
        p["accent"] = colors[0]
        if len(colors) > 1:
            p["accent2"] = colors[1]

    display_font, body_font, accent_font = get_fonts(brief)

    tokens = {
        "--bg-primary": p["bg"], "--bg-secondary": p["bg2"],
        "--bg-surface": p["surface"], "--bg-muted": p["muted"],
        "--text-primary": p["text"], "--text-secondary": p["text2"],
        "--text-muted": p["text2"].replace("0.65", "0.4").replace("0.6", "0.38"),
        "--text-inverted": p["inverted"],
        "--color-primary": p["text"],
        "--color-accent": p["accent"],
        "--color-accent-hover": p["accent"],
        "--color-accent-muted": p["accent"] + "26",
        "--color-accent-2": p["accent2"],
        "--color-tint": p["tint"],
        "--border-default": "color-mix(in srgb, var(--text-primary) 10%, transparent)",
        "--border-subtle": "color-mix(in srgb, var(--text-primary) 5%, transparent)",
        "--font-display": f"'{display_font}', serif",
        "--font-body": f"'{body_font}', sans-serif",
        "--font-accent": f"'{accent_font}', cursive" if accent_font else f"'{display_font}', serif",
    }

    lines = [":root {"]
    for key, value in tokens.items():
        lines.append(f"  {key}: {value};")
    lines += [
        "  --section-padding-y: 6rem;",
        "  --section-padding-x: 1.5rem;",
        "  --container-max: 80rem;",
        "  --radius-card: 1.25rem;",
        "  --radius-button: 9999px;",
        "}",
    ]

    all_fonts = [f for f in dict.fromkeys([display_font, body_font, accent_font]) if f]
    font_params = "&".join(
        f"family={f.replace(' ', '+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400"
        if f not in ("Great Vibes", "Pinyon Script", "Archivo Black", "Marcellus")
        else f"family={f.replace(' ', '+')}"
        for f in all_fonts
    )
    fonts_import = f"@import url('https://fonts.googleapis.com/css2?{font_params}&display=swap');\n\n"

    return fonts_import + "\n".join(lines)


def generate_brief_md(brief: dict, slug: str) -> str:
    sector = brief.get("sector", "autre")
    goal = brief.get("siteGoal", "showcase")
    site_type = brief.get("siteType", "standard")
    business_name = brief.get("businessName", "")
    city = brief.get("city", "")
    section_plan = get_section_plan(sector, goal)
    hero_block = HERO_BLOCKS.get(sector.lower(), "HeroGeneric")
    display_font, body_font, accent_font = get_fonts(brief)
    theme = normalize_theme(brief.get("colorTheme", "clair"))
    style = normalize_style(brief.get("visualStyle", ""))

    pages_selected = brief.get("pages", ["accueil"])
    features_selected = brief.get("features", [])
    required_pages = ["MentionsLegales"]
    if any(x in goal for x in ["ecommerce", "vente"]):
        required_pages += ["CGV", "PolitiqueConfidentialite"]

    sections_list = "\n".join(
        f"{i+1}. **{s}** → `src/components/sections/{s}.tsx`"
        for i, s in enumerate(section_plan)
    )
    pages_list = "\n".join(
        f"- `src/pages/{p}.tsx`" for p in pages_selected + required_pages
    )
    features_list = "\n".join(f"- {f}" for f in features_selected) or "- Aucune fonctionnalité spécifique"
    services_raw = brief.get("services", "")
    today = datetime.now().strftime("%d/%m/%Y %H:%M")

    return f"""# Brief Client — {business_name}
> Généré automatiquement depuis le formulaire builderz.shop
> Date : {today} · Slug : {slug}

---

## ⚠️ Protocole

1. Lis ce brief EN ENTIER.
2. Lis `.claude/skills/site-generator.md` — il contient la direction artistique
   sectorielle, la règle des 3 fontes, la stratégie images, les composants
   signature obligatoires et le protocole de vérification visuelle par screenshots.
3. Annonce ta direction artistique (5 lignes) AVANT de coder.

---

## Informations client

| Champ | Valeur |
|-------|--------|
| Nom de l'entreprise | {business_name} |
| Ville / zone | {city or '⚠️ Non renseigné — demander ou déduire de la description'} |
| Secteur | {sector} |
| Type de site | {site_type} |
| Objectif principal | {goal} |
| Email client | {brief.get('clientEmail', '')} |
| Téléphone à afficher sur le site | {brief.get('displayPhone', brief.get('clientPhone', 'Non fourni'))} |

## Description de l'activité

{brief.get('description', 'Non renseigné')}

**Cible client :** {brief.get('targetAudience', 'Non renseigné — déduire de la description')}
**Valeur unique :** {brief.get('uniqueValue', 'Non renseigné — déduire de la description')}
**Références / inspirations :** {brief.get('references', 'Aucune')}

## Services / prestations (avec prix si fournis)

{services_raw or '⚠️ Non renseigné — déduire 4-6 prestations plausibles du marché local et les lister dans le récap final pour validation client'}

---

## Direction artistique imposée (point de départ)

| Paramètre | Valeur |
|-----------|--------|
| Style demandé | {style} |
| Thème | {theme} |
| Police display | {display_font} |
| Police body | {body_font} |
| Police accent script | {accent_font or '— (aucune, style sobre)'} |
| Couleurs client | {', '.join(brief.get('colors', [])) or 'Palette sectorielle par défaut (déjà dans tokens.css)'} |
| Logo | {'Fourni → public/logo.png' if brief.get('logoUrl') else 'Non fourni → text-logo en font display'} |

Les tokens sont déjà générés dans `src/styles/tokens.css` (palette sectorielle
complète : --color-accent, --color-accent-2, --color-tint, --font-accent…).
Les lire avant de coder. Ne pas les modifier.

---

## Structure à générer

### Hero : **{hero_block}** → `src/components/hero/{hero_block}.tsx`

### Sections dans l'ordre
{sections_list}

### Pages
{pages_list}

### Fonctionnalités demandées
{features_list}

---

## Rappels qualité (détail dans site-generator.md)

- **Images d'abord** : télécharger les vraies photos métier dans `public/images/` et les vérifier (`file`) avant de coder
- **≥ 5 composants signature** : micro-labels, stats bar, citation, badge flottant, séparateur organique, pricing vedette, témoignages réalistes, CTA secondaire…
- **Localisation partout** : "{city or '{ville}'}" dans le hero, title SEO, footer, témoignages
- **Copywriting** : chiffres organiques, prix réels des services ci-dessus, zéro lorem ipsum, zéro emoji
- **Vérification visuelle obligatoire** : screenshots desktop + mobile lus et validés avant de terminer

## Après génération

```bash
cd workspace/{slug} && npx tsc --noEmit && npm run build
cd ../.. && python backend/tools/register_project.py \\
  --name "{business_name}" --slug "{slug}" --sector "{sector}" \\
  --type "{site_type}" --is-client false \\
  --client-email "{brief.get('clientEmail', '')}" \\
  --notes "Généré depuis formulaire le {today}"
```
"""


async def prepare_workspace(brief: dict) -> str:
    business_name = brief.get("businessName", "projet")
    site_type = brief.get("siteType", "standard")
    slug = slugify(business_name)

    starters_map = {
        "standard":      ROOT / "starters" / "vitrine-standard",
        "scrollytelling": ROOT / "starters" / "scrollytelling",
        "3d":            ROOT / "starters" / "3d-immersif",
    }
    starter = starters_map.get(site_type, starters_map["standard"])
    workspace = ROOT / "workspace" / slug

    if not starter.exists():
        print(f"❌ Starter '{starter.name}' introuvable.")
        sys.exit(1)

    if workspace.exists():
        suffix = datetime.now().strftime("%m%d-%H%M")
        slug = f"{slug}-{suffix}"
        workspace = ROOT / "workspace" / slug
        print(f"⚠️  Workspace existant → nouveau slug : {slug}")

    print(f"📁 Copie du starter '{site_type}' → workspace/{slug}/")
    shutil.copytree(starter, workspace)

    tokens_path = workspace / "src" / "styles" / "tokens.css"
    tokens_path.parent.mkdir(parents=True, exist_ok=True)
    tokens_path.write_text(generate_tokens_css(brief))
    print(f"🎨 Tokens CSS sectoriels générés ({brief.get('sector', 'autre')} / {normalize_theme(brief.get('colorTheme', 'clair'))})")

    if brief.get("logoUrl"):
        print(f"🖼️  Logo URL : {brief['logoUrl']} → à placer dans public/logo.png")

    brief_path = workspace / "brief.md"
    brief_path.write_text(generate_brief_md(brief, slug))
    (workspace / "brief.json").write_text(json.dumps(brief, ensure_ascii=False, indent=2))
    print(f"📄 brief.md généré dans workspace/{slug}/")

    print(f"\n✅ Workspace prêt : workspace/{slug}/")
    print(f"\n💬 Dans VS Code, dis à Claude Code :")
    print(f'   "Lis workspace/{slug}/brief.md et génère le site complet"')

    return slug


async def load_brief_from_db(project_id: str) -> dict:
    from backend.db.database import get_db
    db = await get_db()
    try:
        cursor = await db.execute("SELECT brief FROM projects WHERE id = ?", (project_id,))
        row = await cursor.fetchone()
        if row and row[0]:
            return json.loads(row[0])
        raise ValueError(f"Projet {project_id} introuvable ou sans brief")
    finally:
        await db.close()


def main():
    parser = argparse.ArgumentParser(description="Prépare un workspace depuis un brief client")
    parser.add_argument("--brief",      help="JSON du brief en ligne de commande")
    parser.add_argument("--file",       help="Chemin vers un fichier JSON de brief")
    parser.add_argument("--project-id", help="ID du projet dans la DB")
    args = parser.parse_args()

    if args.brief:
        brief = json.loads(args.brief)
    elif args.file:
        brief = json.loads(Path(args.file).read_text())
    elif args.project_id:
        brief = asyncio.run(load_brief_from_db(args.project_id))
    else:
        parser.error("Fournis --brief, --file ou --project-id")

    asyncio.run(prepare_workspace(brief))


if __name__ == "__main__":
    main()
