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
    ("beaute", "bookings"):     ["Services", "Gallery", "Testimonials", "Booking", "Stats", "Contact"],
    ("beaute", "showcase"):     ["Services", "Gallery", "Testimonials", "Stats", "Contact"],
    ("restaurant", "bookings"): ["Features", "Menu", "Testimonials", "Booking", "Contact"],
    ("restaurant", "showcase"): ["Features", "Gallery", "Testimonials", "Contact"],
    ("artisan", "prospects"):   ["Services", "Process", "Gallery", "Stats", "Testimonials", "Devis"],
    ("artisan", "showcase"):    ["Services", "Gallery", "Testimonials", "Contact"],
    ("coach", "bookings"):      ["Benefits", "Method", "Pricing", "Testimonials", "FAQ", "Booking"],
    ("coach", "prospects"):     ["Benefits", "Method", "Pricing", "Testimonials", "Contact"],
    ("photo", "portfolio"):     ["Gallery", "Services", "Pricing", "Testimonials", "Contact"],
    ("medical", "bookings"):    ["Services", "Team", "Process", "FAQ", "Booking", "Contact"],
    ("immobilier", "prospects"):["Properties", "Services", "Stats", "Testimonials", "Team", "Contact"],
    ("mode", "ecommerce"):      ["FeaturedProducts", "Features", "Gallery", "Testimonials", "Newsletter"],
    ("sport", "bookings"):      ["Classes", "Pricing", "Schedule", "Testimonials", "Booking"],
    ("tech", "prospects"):      ["Features", "Stats", "LogoStrip", "Process", "Pricing", "Testimonials", "FAQ", "CTA"],
    ("tech", "ecommerce"):      ["Features", "Products", "Pricing", "Testimonials", "FAQ", "CTA"],
    ("association", "showcase"):["Mission", "Actions", "Stats", "Team", "Testimonials", "Contact"],
}

THEME_TOKENS = {
    "Sombre (noir)": {
        "--bg-primary": "#050505", "--bg-secondary": "#111111",
        "--bg-surface": "#1a1a1a", "--bg-muted": "#222222",
        "--text-primary": "#ffffff", "--text-secondary": "rgba(255,255,255,0.6)",
        "--text-muted": "rgba(255,255,255,0.3)", "--text-inverted": "#000000",
        "--border-default": "rgba(255,255,255,0.08)", "--border-subtle": "rgba(255,255,255,0.04)",
    },
    "Clair (blanc)": {
        "--bg-primary": "#ffffff", "--bg-secondary": "#f8f9fa",
        "--bg-surface": "#f1f3f5", "--bg-muted": "#e9ecef",
        "--text-primary": "#0d0d0d", "--text-secondary": "rgba(0,0,0,0.6)",
        "--text-muted": "rgba(0,0,0,0.3)", "--text-inverted": "#ffffff",
        "--border-default": "rgba(0,0,0,0.08)", "--border-subtle": "rgba(0,0,0,0.04)",
    },
    "Neutre (gris)": {
        "--bg-primary": "#fafaf8", "--bg-secondary": "#f5f4f0",
        "--bg-surface": "#eeecea", "--bg-muted": "#e8e6e0",
        "--text-primary": "#1a1a1a", "--text-secondary": "rgba(0,0,0,0.55)",
        "--text-muted": "rgba(0,0,0,0.3)", "--text-inverted": "#ffffff",
        "--border-default": "rgba(0,0,0,0.07)", "--border-subtle": "rgba(0,0,0,0.03)",
    },
}

FONT_PAIRS = {
    "Luxe & Élégant":      ("Playfair Display", "DM Sans"),
    "Minimaliste":         ("Inter", "Inter"),
    "Moderne & Audacieux": ("Syne", "Inter"),
    "Naturel & Chaleureux":("Lora", "Source Sans 3"),
    "Coloré & Vibrant":    ("Plus Jakarta Sans", "Inter"),
    "Professionnel":       ("IBM Plex Sans", "IBM Plex Sans"),
    "Immersif & Sombre":   ("Space Grotesk", "Inter"),
    "Futuriste / HUD":     ("Orbitron", "Share Tech Mono"),
    "Narratif/Film":       ("Cormorant Garamond", "DM Sans"),
    "Éditorial Audacieux": ("Cabinet Grotesk", "Inter"),
}


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
           ["Features", "Testimonials", "Stats", "Contact"]))


def generate_tokens_css(brief: dict) -> str:
    theme = brief.get("colorTheme", "Sombre (noir)")
    tokens = THEME_TOKENS.get(theme, THEME_TOKENS["Sombre (noir)"]).copy()

    colors = brief.get("colors", [])
    if colors:
        tokens["--color-accent"] = colors[0]
        tokens["--color-accent-hover"] = colors[0]
        tokens["--color-accent-muted"] = colors[0] + "26"
        if len(colors) > 1:
            tokens["--color-primary"] = colors[1]

    style = brief.get("visualStyle", "Professionnel")
    display_font, body_font = FONT_PAIRS.get(style, ("Inter", "Inter"))
    tokens["--font-display"] = f"'{display_font}', sans-serif"
    tokens["--font-body"] = f"'{body_font}', sans-serif"

    lines = [":root {"]
    for key, value in tokens.items():
        lines.append(f"  {key}: {value};")
    lines += [
        "  --section-padding-y: 6rem;",
        "  --section-padding-x: 1.5rem;",
        "  --container-max: 80rem;",
        "  --radius-card: 1.5rem;",
        "  --radius-button: 9999px;",
        "}",
    ]

    fonts_import = ""
    if display_font != "Inter" or body_font != "Inter":
        all_fonts = list(dict.fromkeys([display_font, body_font]))
        font_params = "&".join(f"family={f.replace(' ', '+')}:wght@300;400;500;600;700" for f in all_fonts)
        fonts_import = f"@import url('https://fonts.googleapis.com/css2?{font_params}&display=swap');\n\n"

    return fonts_import + "\n".join(lines)


def generate_brief_md(brief: dict, slug: str) -> str:
    sector = brief.get("sector", "autre")
    goal = brief.get("siteGoal", "showcase")
    site_type = brief.get("siteType", "standard")
    business_name = brief.get("businessName", "")
    section_plan = get_section_plan(sector, goal)
    hero_block = HERO_BLOCKS.get(sector.lower(), "HeroGeneric")
    display_font, body_font = FONT_PAIRS.get(brief.get("visualStyle", ""), ("Inter", "Inter"))

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
    today = datetime.now().strftime("%d/%m/%Y %H:%M")

    return f"""# Brief Client — {business_name}
> Généré automatiquement depuis le formulaire builderz.shop
> Date : {today}
> Slug : {slug}

---

## Informations client

| Champ | Valeur |
|-------|--------|
| Nom de l'entreprise | {business_name} |
| Secteur | {sector} |
| Type de site | {site_type} |
| Objectif principal | {goal} |
| Email client | {brief.get('clientEmail', '')} |

---

## Description de l'activité

{brief.get('description', 'Non renseigné')}

**Cible client :** {brief.get('targetAudience', 'Non renseigné')}

**Valeur unique :** {brief.get('uniqueValue', 'Non renseigné')}

**Références / inspirations :** {brief.get('references', 'Aucune')}

---

## Design

| Paramètre | Valeur |
|-----------|--------|
| Style visuel | {brief.get('visualStyle', 'Professionnel')} |
| Thème | {brief.get('colorTheme', 'Sombre (noir)')} |
| Police display | {display_font} |
| Police body | {body_font} |
| Couleurs client | {', '.join(brief.get('colors', [])) or 'Palette par défaut'} |
| Logo | {'Fourni → public/logo.png' if brief.get('logoUrl') else 'Non fourni → générer un text-logo'} |

---

## Structure à générer

### Hero block recommandé
**{hero_block}**
→ Fichier : `src/components/hero/{hero_block}.tsx`

### Sections dans l'ordre
{sections_list}

### Pages à créer
{pages_list}

### Fonctionnalités demandées
{features_list}

---

## Instructions pour Claude Code

### Ce que tu DOIS faire

1. **Lire ce brief en entier** avant d'écrire une seule ligne de code
2. **Compléter App.tsx** : remplacer les commentaires par le vrai contenu
3. **Générer le Hero** : `{hero_block}` adapté au brief
4. **Générer les sections** dans l'ordre listé ci-dessus
5. **Générer les pages** listées dans "Pages à créer"
6. **Personnaliser Navbar** : vrais liens + CTA adapté à l'objectif
7. **Personnaliser Footer** : nom, liens légaux, contacts

### Ce que tu NE DOIS PAS faire

- Modifier `package.json`, `vite.config.ts`, `tsconfig.json`, `src/main.tsx`
- Modifier `src/styles/tokens.css` (déjà généré)
- Hardcoder des couleurs — utiliser `var(--color-accent)` etc.
- Mettre BrowserRouter dans App.tsx
- Créer des fichiers hors de `src/`

### Règles CSS

```tsx
// ✅ Correct
className="bg-[var(--bg-primary)] text-[var(--text-primary)]"
className="text-[var(--color-accent)]"

// ❌ Jamais
className="bg-[#050505] text-white text-indigo-400"
```

### Règles animations

```tsx
const variants = {{
  hidden: {{ opacity: 0, y: 30 }},
  visible: {{ opacity: 1, y: 0, transition: {{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} }}
}}
// whileInView + viewport once:true sur toutes les sections
```

### Copywriting

Utilise le brief pour du contenu réel :
- Titre Hero : accroche basée sur `uniqueValue`
- Sous-titre : résumé de `description`
- CTAs : verbes d'action adaptés à l'objectif `{goal}`
- Pas de Lorem ipsum

---

## Après génération

```bash
# 1. TypeScript check
cd workspace/{slug} && npx tsc --noEmit

# 2. Build test
npm run build

# 3. Enregistrer dans le dashboard
cd ../..
python backend/tools/register_project.py \\
  --name "{business_name}" \\
  --slug "{slug}" \\
  --sector "{sector}" \\
  --type "{site_type}" \\
  --is-client false \\
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
    print(f"🎨 Tokens CSS générés ({len(brief.get('colors', []))} couleur(s) client)")

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
