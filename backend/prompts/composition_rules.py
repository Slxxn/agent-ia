from typing import TypedDict

class CompositionRule(TypedDict):
    hero: str
    sections: list[str]
    pages: list[str]
    css_accent: str

COMPOSITION_RULES: dict[tuple[str, str], CompositionRule] = {
    # ── BEAUTE ──────────────────────────────────────────────────────────────
    ("beaute", "vitrine"): {
        "hero": "HeroBeaute",
        "sections": ["Services", "Gallery", "Testimonials", "Pricing", "BookingCTA"],
        "pages": ["accueil", "prestations", "galerie", "contact"],
        "css_accent": "rose",
    },
    ("beaute", "ecommerce"): {
        "hero": "HeroBeaute",
        "sections": ["ProductGrid", "Services", "Gallery", "Testimonials"],
        "pages": ["accueil", "boutique", "panier", "checkout", "compte"],
        "css_accent": "rose",
    },
    ("beaute", "booking"): {
        "hero": "HeroBeaute",
        "sections": ["Services", "Pricing", "Team", "BookingForm", "Testimonials"],
        "pages": ["accueil", "prestations", "reservation", "contact"],
        "css_accent": "rose",
    },
    # ── RESTAURANT ──────────────────────────────────────────────────────────
    ("restaurant", "vitrine"): {
        "hero": "HeroRestaurant",
        "sections": ["MenuHighlights", "About", "Gallery", "Location", "ReservationCTA"],
        "pages": ["accueil", "menu", "galerie", "reservation", "contact"],
        "css_accent": "amber",
    },
    ("restaurant", "booking"): {
        "hero": "HeroRestaurant",
        "sections": ["ReservationForm", "MenuHighlights", "Gallery", "Location"],
        "pages": ["accueil", "menu", "reservation", "contact"],
        "css_accent": "amber",
    },
    # ── ARTISAN ─────────────────────────────────────────────────────────────
    ("artisan", "vitrine"): {
        "hero": "HeroArtisan",
        "sections": ["Services", "Process", "Gallery", "Testimonials", "ContactCTA"],
        "pages": ["accueil", "services", "realisations", "contact"],
        "css_accent": "orange",
    },
    ("artisan", "ecommerce"): {
        "hero": "HeroArtisan",
        "sections": ["ProductGrid", "Services", "Gallery", "Testimonials"],
        "pages": ["accueil", "boutique", "panier", "checkout", "contact"],
        "css_accent": "orange",
    },
    # ── MEDICAL ─────────────────────────────────────────────────────────────
    ("medical", "vitrine"): {
        "hero": "HeroMedical",
        "sections": ["Services", "Team", "Process", "Certifications", "BookingCTA"],
        "pages": ["accueil", "cabinet", "soins", "equipe", "contact"],
        "css_accent": "blue",
    },
    ("medical", "booking"): {
        "hero": "HeroMedical",
        "sections": ["BookingForm", "Services", "Team", "Certifications"],
        "pages": ["accueil", "soins", "equipe", "rendez-vous", "contact"],
        "css_accent": "blue",
    },
    # ── COACH ───────────────────────────────────────────────────────────────
    ("coach", "vitrine"): {
        "hero": "HeroCoach",
        "sections": ["Benefits", "Method", "Testimonials", "Pricing", "BookingCTA"],
        "pages": ["accueil", "methode", "temoignages", "tarifs", "contact"],
        "css_accent": "violet",
    },
    ("coach", "booking"): {
        "hero": "HeroCoach",
        "sections": ["BookingForm", "Benefits", "Method", "Testimonials", "Pricing"],
        "pages": ["accueil", "methode", "reservation", "contact"],
        "css_accent": "violet",
    },
    # ── PHOTO ───────────────────────────────────────────────────────────────
    ("photo", "portfolio"): {
        "hero": "HeroPhoto",
        "sections": ["Gallery", "Services", "About", "Testimonials", "ContactCTA"],
        "pages": ["accueil", "portfolio", "services", "contact"],
        "css_accent": "neutral",
    },
    ("photo", "vitrine"): {
        "hero": "HeroPhoto",
        "sections": ["Gallery", "Services", "Process", "Pricing", "ContactCTA"],
        "pages": ["accueil", "portfolio", "tarifs", "contact"],
        "css_accent": "neutral",
    },
    # ── MODE ────────────────────────────────────────────────────────────────
    ("mode", "vitrine"): {
        "hero": "HeroMode",
        "sections": ["Collections", "FeaturedProducts", "About", "Press"],
        "pages": ["accueil", "collections", "about", "contact"],
        "css_accent": "neutral",
    },
    ("mode", "ecommerce"): {
        "hero": "HeroMode",
        "sections": ["FeaturedProducts", "Collections", "About", "Testimonials"],
        "pages": ["accueil", "boutique", "collections", "panier", "checkout", "compte"],
        "css_accent": "neutral",
    },
    # ── SPORT ───────────────────────────────────────────────────────────────
    ("sport", "vitrine"): {
        "hero": "HeroSport",
        "sections": ["Services", "Schedule", "Team", "Testimonials", "Pricing"],
        "pages": ["accueil", "activites", "planning", "equipe", "contact"],
        "css_accent": "green",
    },
    ("sport", "booking"): {
        "hero": "HeroSport",
        "sections": ["BookingForm", "Schedule", "Services", "Team", "Pricing"],
        "pages": ["accueil", "activites", "reservation", "contact"],
        "css_accent": "green",
    },
    # ── ASSOCIATION ─────────────────────────────────────────────────────────
    ("association", "vitrine"): {
        "hero": "HeroAssociation",
        "sections": ["Mission", "Actions", "Team", "Impact", "DonateCTA"],
        "pages": ["accueil", "mission", "actions", "equipe", "contact"],
        "css_accent": "teal",
    },
    ("association", "ecommerce"): {
        "hero": "HeroAssociation",
        "sections": ["Mission", "DonationForm", "Actions", "Impact", "Team"],
        "pages": ["accueil", "mission", "boutique", "dons", "contact"],
        "css_accent": "teal",
    },
    # ── IMMOBILIER ──────────────────────────────────────────────────────────
    ("immobilier", "vitrine"): {
        "hero": "HeroImmobilier",
        "sections": ["PropertyGrid", "Services", "Team", "Testimonials", "EstimationCTA"],
        "pages": ["accueil", "biens", "services", "equipe", "contact"],
        "css_accent": "blue",
    },
    # ── TECH ────────────────────────────────────────────────────────────────
    ("tech", "vitrine"): {
        "hero": "HeroTech",
        "sections": ["Features", "HowItWorks", "Pricing", "Testimonials", "ContactCTA"],
        "pages": ["accueil", "produit", "tarifs", "blog", "contact"],
        "css_accent": "indigo",
    },
    ("tech", "ecommerce"): {
        "hero": "HeroTech",
        "sections": ["ProductGrid", "Features", "Pricing", "Testimonials"],
        "pages": ["accueil", "produits", "tarifs", "panier", "checkout", "compte"],
        "css_accent": "indigo",
    },
}

_DEFAULT_RULE: CompositionRule = {
    "hero": "HeroMode",
    "sections": ["Services", "About", "Testimonials", "ContactCTA"],
    "pages": ["accueil", "services", "contact"],
    "css_accent": "neutral",
}

def get_composition(sector: str, goal: str) -> CompositionRule:
    key = (sector.lower().strip(), goal.lower().strip())
    if key in COMPOSITION_RULES:
        return COMPOSITION_RULES[key]
    sector_default = next((v for (s, _), v in COMPOSITION_RULES.items() if s == key[0]), None)
    return sector_default or _DEFAULT_RULE
