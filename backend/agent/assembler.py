"""
Assembler — takes a JSON site spec from the LLM and generates a complete
React project by composing pre-built blocks from workspace-template.

The spec format:
{
  "title": "Site Name",
  "brand": { "name": "Brand", "tagline": "...", "logoUrl": "..." },
  "theme": { "primary": "#6366f1", "accent": "#818cf8", "accent2": "#38bdf8", "bg": "#0f0f12", "surface": "#1a1a1f" },
  "navbar": { "links": [{"label":"Accueil","href":"/"},...], "cta": {"label":"...","href":"..."} },
  "footer": { "columns": [...], "socials": [...], "legal": "..." },
  "pages": [
    {
      "path": "/",
      "name": "Home",
      "file": "Home",
      "blocks": [
        { "block": "HeroA", "props": { "headline": "...", ... } },
        { "block": "FeaturesGrid", "props": { ... } },
        ...
      ]
    },
    ...
  ]
}
"""

from __future__ import annotations

import json
import os
import re
import shutil
from pathlib import Path
from typing import Any

from backend.db.database import add_log

TEMPLATE_DIR = Path(__file__).parent.parent.parent / "workspace-template"

BLOCK_IMPORTS: dict[str, str] = {
    "HeroA":            "import HeroA from '@/blocks/hero/HeroA';",
    "HeroB":            "import HeroB from '@/blocks/hero/HeroB';",
    "HeroC":            "import HeroC from '@/blocks/hero/HeroC';",
    "Hero3D":           "import Hero3D from '@/blocks/three/Hero3D';",
    "Scene3D":          "import Scene3D from '@/blocks/three/Scene3D';",
    "ParallaxSection":  "import ParallaxSection from '@/blocks/three/ParallaxSection';",
    "FeaturesGrid":     "import FeaturesGrid from '@/blocks/features/FeaturesGrid';",
    "FeaturesCards":    "import FeaturesCards from '@/blocks/features/FeaturesCards';",
    "TestimonialsGrid": "import TestimonialsGrid from '@/blocks/testimonials/TestimonialsGrid';",
    "PricingCards":     "import PricingCards from '@/blocks/pricing/PricingCards';",
    "FaqAccordion":     "import FaqAccordion from '@/blocks/faq/FaqAccordion';",
    "CtaBanner":        "import CtaBanner from '@/blocks/cta/CtaBanner';",
    "ContactForm":      "import ContactForm from '@/blocks/contact/ContactForm';",
    "GalleryGrid":      "import GalleryGrid from '@/blocks/gallery/GalleryGrid';",
}

THREE_BLOCKS = {"Hero3D", "Scene3D", "ParallaxSection"}
THREE_DEPS = {
    "@react-three/fiber": "^8.16.8",
    "@react-three/drei": "^9.109.2",
    "three": "^0.166.1",
    "@types/three": "^0.166.0",
}


class Assembler:
    def __init__(self, workspace_path: str):
        self.workspace = Path(workspace_path)

    async def run(self, spec: dict, project_id: int) -> None:
        await add_log(project_id, "═══ ASSEMBLAGE DU SITE ═══", "info")

        # 1. Copy base template
        await add_log(project_id, "📁 Copie du template de base...", "info")
        self._copy_template()

        # 2. Apply theme (CSS variables)
        await add_log(project_id, "🎨 Application du thème...", "info")
        self._apply_theme(spec.get("theme", {}))

        # 2b. Inject Three.js deps if any 3D block is used
        all_blocks = {b["block"] for p in spec.get("pages", []) for b in p.get("blocks", [])}
        if all_blocks & THREE_BLOCKS:
            await add_log(project_id, "🌐 Blocs 3D détectés — injection des dépendances Three.js...", "info")
            self._inject_3d_deps()

        # 3. Generate siteConfig.ts
        await add_log(project_id, "⚙️  Génération de la configuration...", "info")
        self._write_site_config(spec)

        # 4. Generate page files
        pages = spec.get("pages", [])
        await add_log(project_id, f"📄 Génération de {len(pages)} page(s)...", "info")
        for page in pages:
            self._write_page(page)

        # 5. Generate App.tsx with all routes
        await add_log(project_id, "🔧 Génération de App.tsx...", "info")
        self._write_app(pages, spec)

        # 6. Update index.html title
        self._write_index_html(spec.get("title", "Site"))

        await add_log(project_id, "✅ Assemblage terminé.", "info")

    # ── Private ─────────────────────────────────────────────────────────────

    def _inject_3d_deps(self) -> None:
        pkg_path = self.workspace / "package.json"
        if not pkg_path.exists():
            return
        pkg = json.loads(pkg_path.read_text(encoding="utf-8"))
        pkg.setdefault("dependencies", {}).update(THREE_DEPS)
        pkg_path.write_text(json.dumps(pkg, indent=2, ensure_ascii=False), encoding="utf-8")

    def _copy_template(self) -> None:
        if self.workspace.exists():
            shutil.rmtree(self.workspace)
        shutil.copytree(TEMPLATE_DIR, self.workspace)

    def _apply_theme(self, theme: dict) -> None:
        css_path = self.workspace / "src" / "index.css"
        if not css_path.exists() or not theme:
            return
        css = css_path.read_text(encoding="utf-8")
        replacements = {
            "--primary:": theme.get("primary"),
            "--primary-hover:": theme.get("primaryHover") or theme.get("primary"),
            "--accent:": theme.get("accent"),
            "--accent2:": theme.get("accent2"),
            "--bg:": theme.get("bg"),
            "--surface:": theme.get("surface"),
        }
        for token, value in replacements.items():
            if value:
                css = re.sub(
                    rf"({re.escape(token)}\s*)#[0-9a-fA-F]{{3,8}}",
                    rf"\g<1>{value}",
                    css,
                )
        css_path.write_text(css, encoding="utf-8")

    def _write_site_config(self, spec: dict) -> None:
        brand = spec.get("brand", {})
        navbar_spec = spec.get("navbar", {})
        footer_spec = spec.get("footer", {})
        theme = spec.get("theme", {})

        navbar_links = json.dumps(navbar_spec.get("links", []), ensure_ascii=False, indent=2)
        navbar_cta = json.dumps(navbar_spec.get("cta"), ensure_ascii=False) if navbar_spec.get("cta") else "undefined"
        footer_cols = json.dumps(footer_spec.get("columns", []), ensure_ascii=False, indent=4)
        footer_socials = json.dumps(footer_spec.get("socials", []), ensure_ascii=False, indent=4)
        logo_image = f', imageUrl: {json.dumps(brand.get("logoUrl"))}' if brand.get("logoUrl") else ""

        config = f"""import type {{ NavbarConfig }} from '@/blocks/layout/Navbar';
import type {{ FooterConfig }} from '@/blocks/layout/Footer';

export const SITE_CONFIG = {{
  title: {json.dumps(spec.get("title", "Site"), ensure_ascii=False)},
  navbar: {{
    logo: {{ text: {json.dumps(brand.get("name", "Brand"), ensure_ascii=False)}{logo_image} }},
    links: {navbar_links},
    cta: {navbar_cta},
  }} as NavbarConfig,
  footer: {{
    logo: {{ text: {json.dumps(brand.get("name", "Brand"), ensure_ascii=False)}, tagline: {json.dumps(brand.get("tagline", ""), ensure_ascii=False)}{logo_image} }},
    columns: {footer_cols},
    socials: {footer_socials},
    legal: {json.dumps(footer_spec.get("legal", "Tous droits réservés."), ensure_ascii=False)},
  }} as FooterConfig,
  theme: {json.dumps(theme, ensure_ascii=False, indent=2)},
}};
"""
        (self.workspace / "src" / "siteConfig.ts").write_text(config, encoding="utf-8")

    def _write_page(self, page: dict) -> None:
        blocks: list[dict] = page.get("blocks", [])
        file_name: str = page.get("file", "Page")

        used_blocks = {b["block"] for b in blocks if b["block"] in BLOCK_IMPORTS}
        imports = "\n".join(BLOCK_IMPORTS[b] for b in sorted(used_blocks))

        block_jsx = "\n      ".join(
            self._render_block(b) for b in blocks
        )

        content = f"""import React from 'react';
{imports}

export default function {file_name}() {{
  return (
    <>
      {block_jsx}
    </>
  );
}}
"""
        pages_dir = self.workspace / "src" / "pages"
        pages_dir.mkdir(exist_ok=True)
        (pages_dir / f"{file_name}.tsx").write_text(content, encoding="utf-8")

    def _render_block(self, block_spec: dict) -> str:
        name = block_spec["block"]
        props = block_spec.get("props", {})
        props_str = self._props_to_jsx(props)
        return f"<{name} {props_str}/>"

    def _props_to_jsx(self, props: dict) -> str:
        parts = []
        for k, v in props.items():
            if isinstance(v, bool):
                parts.append(f"{k}={{{str(v).lower()}}}")
            elif isinstance(v, (int, float)):
                parts.append(f"{k}={{{v}}}")
            elif isinstance(v, str):
                escaped = v.replace('"', '\\"')
                parts.append(f'{k}="{escaped}"')
            else:
                parts.append(f"{k}={{{json.dumps(v, ensure_ascii=False)}}}")
        return " ".join(parts)

    def _write_app(self, pages: list[dict], spec: dict) -> None:
        imports = "\n".join(
            f"import {p['file']} from '@/pages/{p['file']}';"
            for p in pages
        )
        routes = "\n          ".join(
            f'<Route path="{p["path"]}" element={{<{p["file"]} />}} />'
            for p in pages
        )

        app = f"""import React from 'react';
import {{ Routes, Route }} from 'react-router-dom';
import Navbar from '@/blocks/layout/Navbar';
import Footer from '@/blocks/layout/Footer';
import {{ SITE_CONFIG }} from '@/siteConfig';
{imports}

function App() {{
  return (
    <>
      <Navbar config={{SITE_CONFIG.navbar}} />
      <main>
        <Routes>
          {routes}
        </Routes>
      </main>
      <Footer config={{SITE_CONFIG.footer}} />
    </>
  );
}}

export default App;
"""
        (self.workspace / "src" / "App.tsx").write_text(app, encoding="utf-8")

    def _write_index_html(self, title: str) -> None:
        html_path = self.workspace / "index.html"
        if html_path.exists():
            html = html_path.read_text(encoding="utf-8")
            html = html.replace("{{SITE_TITLE}}", title)
            html_path.write_text(html, encoding="utf-8")
