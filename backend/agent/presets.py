"""
Bibliothèque de presets design pour les projets générés.
Palettes, typographies, templates narratifs, et helper pick_preset().
"""
from __future__ import annotations

from typing import Any


# ─── Palettes ──────────────────────────────────────────────────────────────────

PALETTES: dict[str, dict[str, Any]] = {
    "FOREST": {
        "name": "Forest",
        "mood": "Sérénité, nature, bien-être, chaleureux",
        "metiers": ["massage", "spa", "yoga", "naturopathe", "ostéopathe", "sophrologue", "coach bien-être", "herboriste"],
        "tokens": {
            "bg": "#0A0F0D",
            "surface": "#111A14",
            "surface2": "#182118",
            "border": "#2A3D2A",
            "primary": "#4E8B5F",
            "primary_hover": "#3D7A4E",
            "accent": "#8FBF8F",
            "accent2": "#C8E6C9",
            "gold": "#D4A96A",
            "text": "#F0F5F0",
            "text_secondary": "#C8D8C8",
            "muted": "#7A9A7A",
        },
        "suggested_fonts": "CORMORANT_DM",
    },
    "TERRACOTTA": {
        "name": "Terracotta",
        "mood": "Artisanat, chaleur, authenticité, terroir",
        "metiers": ["potier", "artisan", "céramiste", "boulangerie", "épicerie fine", "maison d'hôtes", "décoration"],
        "tokens": {
            "bg": "#100C0A",
            "surface": "#1A1410",
            "surface2": "#241C16",
            "border": "#3D2E24",
            "primary": "#C4622D",
            "primary_hover": "#B0531E",
            "accent": "#E8956A",
            "accent2": "#F5C9A0",
            "gold": "#D4A050",
            "text": "#F5F0EC",
            "text_secondary": "#D8C8BC",
            "muted": "#9A7A68",
        },
        "suggested_fonts": "FRAUNCES_MANROPE",
    },
    "IVORY": {
        "name": "Ivory",
        "mood": "Luxe discret, élégance, minimalisme, prestige",
        "metiers": ["haute couture", "bijouterie", "parfumerie", "hôtel de luxe", "consultant haut de gamme", "architecte intérieur", "galerie d'art"],
        "tokens": {
            "bg": "#FAFAF8",
            "surface": "#F4F4F0",
            "surface2": "#EBEBЕ6",
            "border": "#D8D8D0",
            "primary": "#1A1A18",
            "primary_hover": "#333330",
            "accent": "#8B7355",
            "accent2": "#B8A48A",
            "gold": "#C4A55A",
            "text": "#1A1A18",
            "text_secondary": "#4A4A45",
            "muted": "#8A8A82",
        },
        "suggested_fonts": "MARCELLUS_MONTSERRAT",
    },
    "AMBER": {
        "name": "Amber",
        "mood": "Convivialité, saveurs, générosité, chaleur humaine",
        "metiers": ["restaurant", "café", "bistrot", "traiteur", "chef cuisinier", "cave à vins", "pâtisserie"],
        "tokens": {
            "bg": "#0F0A06",
            "surface": "#1A1208",
            "surface2": "#261A0C",
            "border": "#3D2C12",
            "primary": "#D4841A",
            "primary_hover": "#C07410",
            "accent": "#F0A840",
            "accent2": "#FADA8A",
            "gold": "#E8C060",
            "text": "#F8F2E8",
            "text_secondary": "#DDD0B8",
            "muted": "#A08060",
        },
        "suggested_fonts": "PLAYFAIR_INTER",
    },
    "OCEAN": {
        "name": "Ocean",
        "mood": "Confiance, clarté, tech, professionnel moderne",
        "metiers": ["agence digitale", "startup tech", "fintech", "consulting", "logiciel", "éducation en ligne", "assurance"],
        "tokens": {
            "bg": "#060C14",
            "surface": "#0C1620",
            "surface2": "#12202E",
            "border": "#1E3048",
            "primary": "#2B7FD4",
            "primary_hover": "#1A6EC0",
            "accent": "#60AFEE",
            "accent2": "#A8D4F8",
            "gold": "#60C8C8",
            "text": "#F0F6FC",
            "text_secondary": "#C8DCF0",
            "muted": "#6A90B8",
        },
        "suggested_fonts": "LORA_INTER",
    },
    "SLATE": {
        "name": "Slate",
        "mood": "Sérieux, expertise, sobriété, confiance institutionnelle",
        "metiers": ["avocat", "notaire", "expert-comptable", "médecin", "chirurgien", "cabinet RH", "audit"],
        "tokens": {
            "bg": "#08090C",
            "surface": "#101218",
            "surface2": "#181A22",
            "border": "#282C38",
            "primary": "#4E6A9A",
            "primary_hover": "#3D5A8A",
            "accent": "#7898C8",
            "accent2": "#A8BEE0",
            "gold": "#8A9AB8",
            "text": "#F0F2F8",
            "text_secondary": "#C8CEDE",
            "muted": "#6A7890",
        },
        "suggested_fonts": "CRIMSON_POPPINS",
    },
    "COPPER": {
        "name": "Copper",
        "mood": "Chaleur industrielle, créativité, vintage chic",
        "metiers": ["tatoueur", "photographe", "studio de design", "barbier", "fleuriste", "déco intérieure"],
        "tokens": {
            "bg": "#0C0908",
            "surface": "#181210",
            "surface2": "#221A16",
            "border": "#3A2820",
            "primary": "#B87040",
            "primary_hover": "#A46030",
            "accent": "#D89868",
            "accent2": "#ECC8A0",
            "gold": "#D4A040",
            "text": "#F5F0EC",
            "text_secondary": "#D8C8B8",
            "muted": "#988070",
        },
        "suggested_fonts": "DM_SERIF_NUNITO",
    },
    "ROSE_GOLD": {
        "name": "Rose Gold",
        "mood": "Féminité douce, soin de soi, bienveillance, beauté",
        "metiers": ["esthéticienne", "maquilleuse", "nail art", "coiffeuse", "coach féminin", "sage-femme", "doula"],
        "tokens": {
            "bg": "#110C0E",
            "surface": "#1C1418",
            "surface2": "#261C22",
            "border": "#3D2830",
            "primary": "#C47888",
            "primary_hover": "#B06878",
            "accent": "#E0A0B0",
            "accent2": "#F5D0D8",
            "gold": "#D4A878",
            "text": "#F8F0F2",
            "text_secondary": "#DCC8CE",
            "muted": "#A08088",
        },
        "suggested_fonts": "LIBRE_SOURCESANS",
    },
    "MIDNIGHT": {
        "name": "Midnight",
        "mood": "Mystère, créativité nocturne, premium sombre",
        "metiers": ["DJ", "club", "bar à cocktails", "production musicale", "agence créative", "jeu vidéo", "cybersécurité"],
        "tokens": {
            "bg": "#04040A",
            "surface": "#080812",
            "surface2": "#0E0E1C",
            "border": "#1C1C30",
            "primary": "#7060C8",
            "primary_hover": "#6050B8",
            "accent": "#A090E8",
            "accent2": "#C8C0F8",
            "gold": "#E8C060",
            "text": "#F0F0FC",
            "text_secondary": "#C0C0E8",
            "muted": "#7070A0",
        },
        "suggested_fonts": "FRAUNCES_MANROPE",
    },
    "SAGE": {
        "name": "Sage",
        "mood": "Équilibre, slowlife, éco-responsable, douceur",
        "metiers": ["ferme bio", "permaculture", "chambre d'hôtes écologique", "diététicienne", "psychologue", "méditation"],
        "tokens": {
            "bg": "#0C100E",
            "surface": "#141A16",
            "surface2": "#1C2420",
            "border": "#2C3C32",
            "primary": "#688C78",
            "primary_hover": "#587C68",
            "accent": "#9AB8A4",
            "accent2": "#C4DAC8",
            "gold": "#C8B870",
            "text": "#EEF2F0",
            "text_secondary": "#C4D0C8",
            "muted": "#7A9080",
        },
        "suggested_fonts": "LORA_INTER",
    },
}


# ─── Font Pairs ────────────────────────────────────────────────────────────────

FONT_PAIRS: dict[str, dict[str, str]] = {
    "CORMORANT_DM": {
        "display": "Cormorant Garamond",
        "body": "DM Sans",
        "import_url": "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap",
    },
    "PLAYFAIR_INTER": {
        "display": "Playfair Display",
        "body": "Inter",
        "import_url": "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap",
    },
    "FRAUNCES_MANROPE": {
        "display": "Fraunces",
        "body": "Manrope",
        "import_url": "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,400&family=Manrope:wght@300;400;500;600&display=swap",
    },
    "DM_SERIF_NUNITO": {
        "display": "DM Serif Display",
        "body": "Nunito Sans",
        "import_url": "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Nunito+Sans:wght@300;400;500;600&display=swap",
    },
    "LORA_INTER": {
        "display": "Lora",
        "body": "Inter",
        "import_url": "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap",
    },
    "MARCELLUS_MONTSERRAT": {
        "display": "Marcellus",
        "body": "Montserrat",
        "import_url": "https://fonts.googleapis.com/css2?family=Marcellus&family=Montserrat:wght@300;400;500;600&display=swap",
    },
    "CRIMSON_POPPINS": {
        "display": "Crimson Pro",
        "body": "Poppins",
        "import_url": "https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400;1,600&family=Poppins:wght@300;400;500;600&display=swap",
    },
    "LIBRE_SOURCESANS": {
        "display": "Libre Baskerville",
        "body": "Source Sans 3",
        "import_url": "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap",
    },
}


# ─── Narrative Templates ────────────────────────────────────────────────────────

NARRATIVE_TEMPLATES: dict[str, list[dict[str, str]]] = {
    "vitrine_bien_etre": [
        {
            "id": "hero",
            "title": "L'appel",
            "emotional_goal": "Provoquer un sentiment immédiat de paix et d'envie",
            "question_answered": "Est-ce que ce lieu est fait pour moi ?",
        },
        {
            "id": "problem",
            "title": "La douleur",
            "emotional_goal": "Nommer les tensions, la fatigue, le stress du quotidien",
            "question_answered": "Est-ce qu'ils comprennent vraiment ce que je vis ?",
        },
        {
            "id": "solution",
            "title": "La transition",
            "emotional_goal": "Présenter l'espace comme sanctuaire de transformation",
            "question_answered": "En quoi c'est différent des autres ?",
        },
        {
            "id": "services",
            "title": "Les soins",
            "emotional_goal": "Faire rêver sur chaque prestation, détailler les bénéfices",
            "question_answered": "Qu'est-ce qui correspond à mon besoin du moment ?",
        },
        {
            "id": "about",
            "title": "La praticienne",
            "emotional_goal": "Créer la confiance humaine et l'empathie",
            "question_answered": "Puis-je lui faire confiance ? Est-elle vraiment experte ?",
        },
        {
            "id": "testimonials",
            "title": "La preuve sociale",
            "emotional_goal": "Rassurer par des témoignages authentiques",
            "question_answered": "D'autres personnes comme moi ont-elles vécu ça ?",
        },
        {
            "id": "booking_cta",
            "title": "L'invitation",
            "emotional_goal": "Donner l'élan final pour réserver, sans pression",
            "question_answered": "Comment je commence ? C'est simple ?",
        },
    ],
    "vitrine_artisan": [
        {
            "id": "hero",
            "title": "L'œuvre",
            "emotional_goal": "Montrer la beauté du fait-main, l'unicité de chaque pièce",
            "question_answered": "Pourquoi choisir un artisan plutôt qu'une grande surface ?",
        },
        {
            "id": "savoir_faire",
            "title": "Le geste",
            "emotional_goal": "Transmettre la passion, la minutie, les années de pratique",
            "question_answered": "Comment est-ce fabriqué ? Qui le fabrique ?",
        },
        {
            "id": "creations",
            "title": "La galerie",
            "emotional_goal": "Séduire visuellement, donner envie de posséder",
            "question_answered": "Qu'est-ce que je pourrais commander ?",
        },
        {
            "id": "matieres",
            "title": "Les matières",
            "emotional_goal": "Valoriser la qualité des matériaux, l'éco-responsabilité",
            "question_answered": "C'est durable ? De bonne qualité ?",
        },
        {
            "id": "about",
            "title": "L'artisan",
            "emotional_goal": "Humaniser, raconter le parcours, l'atelier, la philosophie",
            "question_answered": "Qui est derrière ces créations ? Puis-je lui parler ?",
        },
        {
            "id": "commande_cta",
            "title": "La commande",
            "emotional_goal": "Déclencher l'achat ou la prise de contact pour sur-mesure",
            "question_answered": "Comment commander ou demander une pièce unique ?",
        },
    ],
    "vitrine_restaurant": [
        {
            "id": "hero",
            "title": "Le premier regard",
            "emotional_goal": "Mettre l'eau à la bouche immédiatement, chaleur et ambiance",
            "question_answered": "Est-ce que j'ai envie d'aller là ce soir ?",
        },
        {
            "id": "ambiance",
            "title": "L'atmosphère",
            "emotional_goal": "Vendre l'expérience sensorielle totale, pas juste la nourriture",
            "question_answered": "Comment vais-je me sentir là-bas ?",
        },
        {
            "id": "menu_phare",
            "title": "La cuisine",
            "emotional_goal": "Présenter les plats signatures, les produits locaux, la philosophie culinaire",
            "question_answered": "Qu'est-ce qu'on mange ? C'est bon ? C'est original ?",
        },
        {
            "id": "chef",
            "title": "Le chef",
            "emotional_goal": "Humaniser et légitimer par le parcours et la passion",
            "question_answered": "Qui cuisine ? A-t-il de l'expérience ?",
        },
        {
            "id": "avis",
            "title": "Les habitués",
            "emotional_goal": "Valider le choix par la communauté de fidèles",
            "question_answered": "Est-ce que les gens y reviennent ?",
        },
        {
            "id": "reservation_cta",
            "title": "La table",
            "emotional_goal": "Rendre la réservation simple et désirable",
            "question_answered": "Comment réserver ? Est-il souvent complet ?",
        },
    ],
    "boutique_ecommerce": [
        {
            "id": "hero",
            "title": "La proposition",
            "emotional_goal": "Communiquer la valeur en 5 secondes, déclencher la curiosité",
            "question_answered": "Pourquoi acheter ici plutôt qu'ailleurs ?",
        },
        {
            "id": "bestsellers",
            "title": "Les stars",
            "emotional_goal": "Montrer les produits les plus aimés pour rassurer le choix",
            "question_answered": "Qu'est-ce qui se vend le mieux ? Par où commencer ?",
        },
        {
            "id": "benefices",
            "title": "Pourquoi nous",
            "emotional_goal": "Différencier sur la qualité, l'engagement, les valeurs",
            "question_answered": "En quoi vos produits sont-ils meilleurs / différents ?",
        },
        {
            "id": "categories",
            "title": "La collection",
            "emotional_goal": "Orienter vers les bonnes catégories selon les besoins",
            "question_answered": "Qu'est-ce que vous vendez exactement ?",
        },
        {
            "id": "social_proof",
            "title": "La communauté",
            "emotional_goal": "Montrer des clients satisfaits, des photos réelles",
            "question_answered": "Est-ce que d'autres l'ont acheté et aimé ?",
        },
        {
            "id": "garanties",
            "title": "Sans risque",
            "emotional_goal": "Éliminer les freins à l'achat (retour, livraison, paiement sécurisé)",
            "question_answered": "Et si ça ne me convient pas ?",
        },
        {
            "id": "achat_cta",
            "title": "L'action",
            "emotional_goal": "Déclencher l'achat avec urgence légère ou offre de bienvenue",
            "question_answered": "Je me lance ? Y a-t-il une offre spéciale ?",
        },
    ],
    "saas_landing": [
        {
            "id": "hero",
            "title": "Le problème résolu",
            "emotional_goal": "Nommer le pain point principal, promettre la solution en une phrase",
            "question_answered": "Est-ce que ça résout MON problème ?",
        },
        {
            "id": "demo",
            "title": "La démo",
            "emotional_goal": "Montrer le produit en action, réduire l'abstraction",
            "question_answered": "À quoi ça ressemble concrètement ?",
        },
        {
            "id": "features",
            "title": "Les fonctionnalités",
            "emotional_goal": "Présenter les 3-4 super-pouvoirs clés avec leur bénéfice",
            "question_answered": "Quelles sont les fonctionnalités différenciantes ?",
        },
        {
            "id": "social_proof",
            "title": "La preuve",
            "emotional_goal": "Clients logos + témoignages + chiffres clés",
            "question_answered": "Des entreprises comme la mienne l'utilisent-elles ?",
        },
        {
            "id": "pricing",
            "title": "Les tarifs",
            "emotional_goal": "Rendre le prix évident et le ROI immédiat",
            "question_answered": "Combien ça coûte ? Est-ce que ça vaut le coup ?",
        },
        {
            "id": "faq",
            "title": "Les objections",
            "emotional_goal": "Anticiper et lever les dernières hésitations",
            "question_answered": "Qu'est-ce qui pourrait m'empêcher de m'inscrire ?",
        },
        {
            "id": "cta_final",
            "title": "L'inscription",
            "emotional_goal": "Déclencher le signup avec essai gratuit ou démo",
            "question_answered": "Comment je commence sans risque ?",
        },
    ],
    "portfolio_creatif": [
        {
            "id": "hero",
            "title": "L'identité",
            "emotional_goal": "Poser le ton créatif, qui je suis en une phrase mémorable",
            "question_answered": "Quel genre de créatif est-il/elle ?",
        },
        {
            "id": "projets_phares",
            "title": "Le meilleur travail",
            "emotional_goal": "Montrer les 3-4 projets les plus impressionnants immédiatement",
            "question_answered": "Suis-je capable de faire ce dont j'ai besoin ?",
        },
        {
            "id": "process",
            "title": "La méthode",
            "emotional_goal": "Expliquer comment je travaille, rassurer sur le process",
            "question_answered": "Comment se passe une collaboration ?",
        },
        {
            "id": "about",
            "title": "L'histoire",
            "emotional_goal": "Raconter le parcours, créer la connexion humaine",
            "question_answered": "Qui est vraiment cette personne ?",
        },
        {
            "id": "clients",
            "title": "Ils m'ont fait confiance",
            "emotional_goal": "Logos + témoignages pour légitimer",
            "question_answered": "Pour qui a-t-il/elle déjà travaillé ?",
        },
        {
            "id": "contact_cta",
            "title": "Collaborons",
            "emotional_goal": "Rendre le contact simple et accueillant",
            "question_answered": "Comment le contacter pour démarrer ?",
        },
    ],
}


# ─── Bibliothèque de composants ────────────────────────────────────────────────

COMPONENT_LIBRARY: list[str] = [
    "Button",
    "Badge",
    "Card",
    "Eyebrow",
    "SectionShell",
    "TrustRow",
    "StatCounter",
    "TestimonialCard",
    "PricingCard",
    "CTABanner",
    "SectionDivider",
    "Navbar",
    "Footer",
    "Layout",
]


# ─── Mapping mots-clés → palette ──────────────────────────────────────────────

_KEYWORD_MAP: list[tuple[list[str], str, str]] = [
    # (mots_cles, palette, narrative_type)
    (["massage", "spa", "soin", "bien-être", "bien être", "bienetre", "relaxation",
      "yoga", "méditation", "sophrologie", "ostéopathe", "naturopathe"],
     "FOREST", "vitrine_bien_etre"),
    (["esthétique", "esthéticienne", "beauté", "nail", "maquillage", "coiffure",
      "coiffeuse", "doula", "sage-femme"],
     "ROSE_GOLD", "vitrine_bien_etre"),
    (["restaurant", "café", "bistro", "bistrot", "brasserie", "traiteur", "chef",
      "cuisine", "gastronomie", "pizzeria", "crêperie"],
     "AMBER", "vitrine_restaurant"),
    (["pâtisserie", "boulangerie", "artisan", "potier", "céramique", "créateur",
      "fait main", "fait-main", "atelier", "savoir-faire"],
     "TERRACOTTA", "vitrine_artisan"),
    (["luxe", "prestige", "hôtel", "haute couture", "joaillerie", "bijoux", "parfum",
      "galerie", "architecte", "intérieur"],
     "IVORY", "vitrine_artisan"),
    (["avocat", "notaire", "médecin", "cabinet", "expert-comptable", "audit",
      "conseil", "consulting", "institutionnel"],
     "SLATE", "saas_landing"),
    (["tatoueur", "photographe", "studio", "barbier", "fleuriste", "décoration",
      "artiste"],
     "COPPER", "portfolio_creatif"),
    (["ferme", "bio", "écologie", "permaculture", "slowlife", "diététicien",
      "psychologue"],
     "SAGE", "vitrine_bien_etre"),
    (["startup", "saas", "logiciel", "app", "application", "tech", "digital",
      "agence web", "développeur", "plateforme"],
     "OCEAN", "saas_landing"),
    (["boutique", "shop", "e-commerce", "ecommerce", "vente en ligne", "produits",
      "magasin"],
     "IVORY", "boutique_ecommerce"),
    (["dj", "club", "bar", "cocktail", "musique", "production", "jeu vidéo",
      "gaming"],
     "MIDNIGHT", "portfolio_creatif"),
    (["portfolio", "créatif", "designer", "graphiste", "illustrateur", "vidéaste"],
     "COPPER", "portfolio_creatif"),
]


def pick_preset(goal_text: str) -> dict[str, Any]:
    """
    Sélectionne automatiquement palette, fonts, narrative et composants
    en fonction du texte d'objectif.
    Retourne un dict prêt à injecter dans le brief.
    """
    text_lower = goal_text.lower()

    palette_key = "FOREST"
    narrative_key = "vitrine_bien_etre"

    for keywords, pal, narr in _KEYWORD_MAP:
        if any(kw in text_lower for kw in keywords):
            palette_key = pal
            narrative_key = narr
            break

    palette = PALETTES[palette_key]
    fonts = FONT_PAIRS[palette["suggested_fonts"]]
    narrative = NARRATIVE_TEMPLATES[narrative_key]

    return {
        "palette": {
            "key": palette_key,
            "name": palette["name"],
            "mood": palette["mood"],
            "tokens": palette["tokens"],
        },
        "fonts": fonts,
        "narrative": narrative,
        "components": COMPONENT_LIBRARY,
    }


if __name__ == "__main__":
    import json
    result = pick_preset("masseuse à Montpellier")
    print(json.dumps(result, indent=2, ensure_ascii=False))
