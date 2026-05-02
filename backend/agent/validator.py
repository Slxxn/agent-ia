"""
Narrative Validator — Vérifie que le projet généré couvre les sections narratives du brief.
Si des sections sont manquantes et qu'un executor est disponible, les génère automatiquement.
"""
from __future__ import annotations

import os
from typing import TYPE_CHECKING, Optional

from backend.db.database import add_log, get_brief

if TYPE_CHECKING:
    from backend.agent.executor import AgentExecutor


_SECTION_ALIASES: dict[str, list[str]] = {
    "hero":         ["hero"],
    "problem":      ["problem", "pain", "douleur"],
    "solution":     ["solution", "transition"],
    "services":     ["services", "soins", "prestations", "features"],
    "about":        ["about", "praticienne", "team", "equipe"],
    "testimonials": ["testimonials", "temoignage", "avis", "review"],
    "booking_cta":  ["booking", "cta", "contact", "reservation"],
    "savoir_faire": ["savoir", "process", "how"],
    "gallery":      ["gallery", "galerie", "portfolio"],
    "menu":         ["menu", "carte"],
    "pricing":      ["pricing", "tarif", "prix"],
    "faq":          ["faq"],
    "contact":      ["contact"],
    "ingredients":  ["ingredient", "composition"],
    "routine":      ["routine", "howto"],
    "results":      ["result", "resultat"],
}

_COMPONENT_NAMES: dict[str, str] = {
    "hero":         "HeroSection",
    "problem":      "ProblemSection",
    "solution":     "SolutionSection",
    "services":     "ServicesSection",
    "about":        "AboutSection",
    "testimonials": "TestimonialsSection",
    "booking_cta":  "BookingSection",
    "savoir_faire": "SavoirFaireSection",
    "gallery":      "GallerySection",
    "menu":         "MenuSection",
    "pricing":      "PricingSection",
    "faq":          "FAQSection",
    "contact":      "ContactSection",
    "ingredients":  "IngredientsSection",
    "routine":      "RoutineSection",
    "results":      "ResultsSection",
}


class NarrativeValidator:
    """
    Valide que les fichiers générés couvrent les sections narratives du brief.
    Génère les sections manquantes si un executor est disponible.
    """

    def __init__(self, executor: Optional["AgentExecutor"] = None):
        self.executor = executor

    async def run_validation(self, project_id: int, workspace_path: str) -> bool:
        brief = await get_brief(project_id)
        if not brief:
            return True

        narrative: list[dict] = brief.get("narrative", [])
        if not narrative:
            return True

        await add_log(project_id, "═══ PHASE 3.5 : VALIDATION NARRATIVE ═══", "info")

        tsx_files = self._collect_tsx_files(workspace_path)

        missing: list[dict] = []
        for section in narrative:
            sid = section.get("id", "")
            if not self._section_present(sid, tsx_files):
                missing.append(section)
                await add_log(
                    project_id,
                    f"  ⚠️ Section manquante : '{section.get('title', sid)}' ({sid})",
                    "warning",
                )

        if not missing:
            await add_log(project_id, "✅ Validation narrative : toutes les sections présentes.", "info")
            return True

        await add_log(
            project_id,
            f"⚠️ {len(missing)} section(s) narrative(s) manquante(s).",
            "warning",
        )

        if self.executor is None:
            return True

        for section in missing:
            await self._generate_section(project_id, workspace_path, section, brief)

        return True

    # ── helpers ────────────────────────────────────────────────────────────────

    def _collect_tsx_files(self, workspace_path: str) -> list[str]:
        result: list[str] = []
        for root, _, files in os.walk(workspace_path):
            for f in files:
                if f.endswith((".tsx", ".jsx", ".ts", ".js")):
                    rel = os.path.relpath(os.path.join(root, f), workspace_path)
                    result.append(rel.replace("\\", "/").lower())
        return result

    def _section_present(self, section_id: str, files: list[str]) -> bool:
        aliases = _SECTION_ALIASES.get(section_id, [section_id])
        for alias in aliases:
            token = alias.replace("-", "").replace("_", "")
            for f in files:
                fname = f.replace("-", "").replace("_", "").replace("/", "")
                if token in fname:
                    return True
        return False

    async def _generate_section(
        self,
        project_id: int,
        workspace_path: str,
        section: dict,
        brief: dict,
    ) -> None:
        sid = section.get("id", "")
        title = section.get("title", sid)
        emotional_goal = section.get("emotional_goal", "")
        question = section.get("question_answered", "")

        palette = brief.get("palette", {})
        fonts = brief.get("fonts", {})
        brand = brief.get("brand_details", {})

        component = _COMPONENT_NAMES.get(sid, f"{sid.replace('_', ' ').title().replace(' ', '')}Section")
        file_path = f"src/components/sections/{component}.tsx"

        description = (
            f"Créer {file_path} — Section narrative : '{title}'\n"
            f"- Objectif émotionnel : {emotional_goal}\n"
            f"- Question répondue : {question}\n"
            f"- Palette : {palette.get('name', '')} ({palette.get('mood', '')})\n"
            f"- Brand : {brand.get('name', '')} — {brand.get('signature_phrase', '')}"
        )

        await add_log(project_id, f"🔧 Génération section narrative '{title}'...", "info")
        result = await self.executor.execute_task(
            project_id=project_id,
            task_description=description,
            steps=[
                f"Créer {file_path} avec contenu réel (pas de lorem ipsum), "
                f"animations Framer Motion whileInView, palette {palette.get('name', '')}, "
                f"fonts {fonts.get('display', '')}/{fonts.get('body', '')}"
            ],
            context=(
                f"Projet : {brand.get('name', '')}\n"
                f"Métier : {brief.get('metier', '')}\n"
                f"Palette : {palette.get('name', '')} — tokens: {palette.get('tokens', {})}"
            ),
        )

        if result.get("success"):
            await add_log(project_id, f"  ✅ Section '{title}' générée.", "info")
        else:
            await add_log(project_id, f"  ❌ Échec '{title}' : {result.get('error', '')}", "error")
