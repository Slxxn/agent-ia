---
name: prospect-hunter
description: Architecture et règles pour construire l'application Prospect Hunter. Charger au démarrage de tout travail sur cette feature.
---

# Skill — Prospect Hunter

## Objectif produit
Trouver automatiquement des TPE/PME dans la région Montpellier/Occitanie
qui n'ont pas de site web ou ont des sites obsolètes, et générer des pitchs personnalisés.

## Architecture recommandée

```
backend/
└── prospect_hunter/
    ├── scraper.py          # Scraping Google Maps / Pages Jaunes
    ├── analyzer.py         # Analyse site existant via Playwright
    ├── scorer.py           # Scoring opportunité (0-100)
    ├── pitch_generator.py  # Génération pitch via Claude Haiku
    └── api.py              # Routes FastAPI /api/prospects/
```

## Sources de données à scraper
1. Google Maps API (Places API) — recherche par catégorie + zone géo
2. Pages Jaunes scraping (Playwright headless)
3. Kompass.com pour les entreprises B2B

## Scoring d'un prospect (0-100)
- Pas de site web : +40 points
- Site non responsive : +25 points
- Site sans SSL : +15 points
- Lighthouse score < 50 : +20 points
- Dernière mise à jour > 3 ans : +15 points
- Score > 60 → prospect chaud, contacter en priorité

## Intégration Claude Haiku pour les pitchs
- Utiliser claude-haiku-4-5-20251001 (moins cher, suffisant pour génération de texte)
- Prompt : analyse du site + secteur d'activité → pitch email personnalisé en français
- Ton : professionnel, local, sans jargon technique

## Modèle de données SQLite à créer
```sql
CREATE TABLE prospects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sector TEXT,
    address TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    score INTEGER,
    status TEXT DEFAULT 'new',  -- new, contacted, converted, rejected
    pitch TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Intégration dashboard
- Nouvelle page /prospects dans Next.js
- Tableau avec filtres (score, statut, secteur, ville)
- Action "Générer pitch" → appel API → affichage modal
- Action "Lancer un projet" → crée un projet dans Agent Platform
