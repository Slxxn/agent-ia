"""
Grille tarifaire builderz.shop.
Calcule le prix suggéré selon les réponses du formulaire.
"""

BASE_PRICES = {
    "vitrine_simple":   290,
    "vitrine_complet":  390,
    "scrollytelling":   490,
    "3d":               690,
}

OPTIONS_PRICES = {
    "logo_generation":     90,
    "ecommerce_catalogue": 200,
    "payment_stripe":      100,
    "booking_system":       80,
    "blog":                 60,
    "gallery_advanced":     40,
    "devis_form":           40,
    "multilingual":        120,
    "gsap_animations":      80,
    "seo_local":            60,
}

PRICE_CAP = 990

MONTHLY_PLANS = {
    "essential": {"price": 29,  "label": "Maintenance essentielle",
                  "includes": ["Hébergement", "SSL", "Sauvegardes", "Uptime monitoring"]},
    "standard":  {"price": 49,  "label": "Maintenance + modifications",
                  "includes": ["Tout Essentiel", "2 modifications/mois", "Rapport mensuel"]},
    "premium":   {"price": 79,  "label": "Maintenance + contenu",
                  "includes": ["Tout Standard", "2 articles blog/mois", "4 posts réseaux sociaux"]},
}

DISCOUNTS = {
    "ami":   0.40,
    "early": 0.10,
}


def calculate_price(answers: dict) -> dict:
    site_type = answers.get("site_type", "vitrine_simple")
    options = answers.get("options", [])
    has_logo = answers.get("has_logo", "yes")

    base = BASE_PRICES.get(site_type, 290)

    auto_options = []
    if has_logo == "no":
        auto_options.append("logo_generation")
    goal = answers.get("goal", "")
    if goal in ("ecommerce",):
        auto_options.append("ecommerce_catalogue")
        auto_options.append("payment_stripe")
    if goal in ("bookings", "reservations", "rdv"):
        auto_options.append("booking_system")

    all_options = list(set(auto_options + list(options)))
    options_total = sum(OPTIONS_PRICES.get(opt, 0) for opt in all_options)
    subtotal = base + options_total
    suggested = min(subtotal, PRICE_CAP)

    breakdown = {
        "base": {"label": _get_site_label(site_type), "price": base},
        "options": [
            {"key": opt, "label": _get_option_label(opt), "price": OPTIONS_PRICES.get(opt, 0)}
            for opt in all_options
        ],
        "cap_applied": subtotal > PRICE_CAP,
        "saved": max(0, subtotal - PRICE_CAP),
    }

    return {
        "base": base,
        "options_total": options_total,
        "subtotal": subtotal,
        "suggested": suggested,
        "breakdown": breakdown,
        "all_options": all_options,
    }


def get_site_type_from_answers(answers: dict) -> str:
    goal = answers.get("goal", "showcase")
    sector = answers.get("sector", "autre")
    style = answers.get("style_vibe", "pro")

    if goal == "ecommerce":
        return "vitrine_complet"
    if goal == "portfolio" and sector in ("photo", "tech", "mode") and style in ("luxe", "moderne"):
        return "scrollytelling"
    if goal in ("bookings",) or sector in ("medical", "immobilier"):
        return "vitrine_complet"
    return "vitrine_simple"


def _get_site_label(site_type: str) -> str:
    return {
        "vitrine_simple":  "Site vitrine simple (1-3 pages)",
        "vitrine_complet": "Site vitrine complet (4-6 pages)",
        "scrollytelling":  "Site Scrollytelling (one page narratif)",
        "3d":              "Site 3D Immersif (canvas WebGL)",
    }.get(site_type, "Site web professionnel")


def _get_option_label(option: str) -> str:
    return {
        "logo_generation":     "Création logo professionnel",
        "ecommerce_catalogue": "Boutique e-commerce + catalogue",
        "payment_stripe":      "Paiement en ligne Stripe/PayPal",
        "booking_system":      "Système de réservation / RDV",
        "blog":                "Blog intégré",
        "gallery_advanced":    "Galerie photos avancée",
        "devis_form":          "Formulaire devis avancé",
        "multilingual":        "Site bilingue (2 langues)",
        "gsap_animations":     "Animations avancées",
        "seo_local":           "SEO local optimisé",
    }.get(option, option)
