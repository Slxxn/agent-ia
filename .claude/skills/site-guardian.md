---
name: site-guardian
description: Architecture et règles pour construire Site Guardian, le service de maintenance automatisée. Charger au démarrage de tout travail sur cette feature.
---

# Skill — Site Guardian

## Objectif produit
Surveillance et maintenance automatisée des sites générés par Agent Platform.
Rapports mensuels intelligents, alertes proactives, mises à jour automatiques.

## Architecture recommandée

```
backend/
└── site_guardian/
    ├── monitor.py          # Vérification uptime + performance
    ├── updater.py          # Mise à jour dépendances npm
    ├── report_generator.py # Génération rapport mensuel via Claude
    ├── scheduler.py        # Tâches planifiées (APScheduler)
    └── api.py              # Routes FastAPI /api/guardian/
```

## Checks automatiques (quotidiens)
- Uptime HTTP (timeout 10s, alerte si down)
- Lighthouse score via Playwright (performance, SEO, accessibilité)
- Certificat SSL (alerte si expiration < 30 jours)
- Core Web Vitals (LCP, FID, CLS)

## Checks automatiques (mensuels)
- Audit dépendances npm (npm audit)
- Mise à jour mineures/patch automatiques
- Re-build + re-deploy si mises à jour appliquées
- Génération rapport PDF via Claude Sonnet

## Format rapport mensuel (généré par Claude)
Le rapport doit être compréhensible par un non-technicien (TPE/PME).
Inclure :
- Score de santé global (A/B/C/D)
- Résumé en langage simple des actions effectuées
- Métriques de performance (vitesse, disponibilité)
- Recommandations actionnables (max 3, priorisées)
- Comparaison avec le mois précédent

## Modèle de données SQLite

```sql
CREATE TABLE guardian_sites (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    plan TEXT DEFAULT 'essential',  -- essential, growth
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE guardian_checks (
    id TEXT PRIMARY KEY,
    site_id TEXT REFERENCES guardian_sites(id),
    check_type TEXT,  -- uptime, lighthouse, ssl, npm_audit
    status TEXT,      -- ok, warning, error
    score INTEGER,
    details TEXT,     -- JSON
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE guardian_reports (
    id TEXT PRIMARY KEY,
    site_id TEXT REFERENCES guardian_sites(id),
    month TEXT,  -- YYYY-MM
    report_text TEXT,
    pdf_path TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Intégration dashboard
- Nouvelle page /guardian dans Next.js
- Vue par site : historique des checks, dernier rapport, statut
- Envoi rapport par email automatique (SendGrid ou Resend)
