"""
Helpers pour l'arbre de questions du formulaire conversationnel.
"""

GOAL_CHOICES_BY_SECTOR = {
    "beaute":      ["bookings", "showcase", "portfolio"],
    "restaurant":  ["bookings", "showcase"],
    "artisan":     ["prospects", "showcase", "portfolio"],
    "coach":       ["bookings", "prospects", "ecommerce"],
    "photo":       ["portfolio", "bookings", "prospects"],
    "medical":     ["bookings", "showcase"],
    "immobilier":  ["prospects", "showcase"],
    "mode":        ["ecommerce", "showcase", "portfolio"],
    "sport":       ["bookings", "ecommerce", "showcase"],
    "tech":        ["prospects", "ecommerce", "showcase"],
    "association": ["showcase", "prospects"],
    "autre":       ["showcase", "prospects", "ecommerce", "portfolio", "bookings"],
}

GOAL_LABELS = {
    "bookings":  {"label": "Prendre des rendez-vous",  "icon": "📅"},
    "prospects": {"label": "Trouver des clients",       "icon": "🎯"},
    "ecommerce": {"label": "Vendre mes produits",       "icon": "🛒"},
    "portfolio": {"label": "Montrer mes réalisations",  "icon": "🖼️"},
    "showcase":  {"label": "Présenter mon activité",    "icon": "🏪"},
}


def get_goal_choices(sector: str) -> list:
    goals = GOAL_CHOICES_BY_SECTOR.get(sector, GOAL_CHOICES_BY_SECTOR["autre"])
    return [{"value": g, **GOAL_LABELS[g]} for g in goals]
