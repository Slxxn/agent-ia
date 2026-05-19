# Agent Platform

Plateforme SaaS de génération automatique de sites web complets par un agent IA.
Décrivez votre projet via le formulaire client, l'agent planifie, structure, code et déploie — en temps réel.

## Fonctionnalités

- **3 types de sites** : Standard (React/Vite), Immersif 3D (Three.js/WebGL), Scrollytelling (narration scroll)
- **Deux modes de génération** : Agent auto (Gemini Flash + DeepSeek, pipeline VPS) ou Manuel (prompt Claude Code prêt à coller)
- **Génération full-stack** : React/Vite + Tailwind CSS, animations Framer Motion, composants UI complets
- **Pipeline IA hybride** : Gemini Flash (planification, repair, validation) + DeepSeek Chat/Reasoner (génération de code) — Claude Sonnet disponible en manuel uniquement
- **Structuration automatique du brief** : Gemini transforme la demande client en spec technique avant génération
- **Dashboard temps réel** : progression, logs en direct via SSE, copilote IA intégré
- **CRM client** : formulaire multi-étapes, gestion des demandes, lancement de projets depuis le dashboard
- **Explorateur de fichiers** : visualisez les fichiers générés directement dans l'interface
- **Variables d'environnement** : remplissez les `.env` depuis l'interface, reprise après pause
- **Static post-processor** : 15+ corrections automatiques appliquées avant npm install (imports manquants, exports, BrowserRouter, variants UI)
- **Auto-repair** : boucle de correction ciblée sur les erreurs TypeScript/build avec contexte d'erreur injecté
- **Parallel LLM** : sections indépendantes (Hero, Features, FAQ…) générées simultanément via `asyncio.gather()`
- **Reasoner routing** : DeepSeek Reasoner automatiquement sélectionné pour les fichiers critiques (types, App.tsx, cartStore)
- **ProjectMemory** : mémoire persistante par projet — design system, types, état build sauvegardés pour le copilote
- **Déploiement Firebase** : publication automatique en un clic depuis le dashboard
- **Auth Firebase** : accès sécurisé au dashboard

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Frontend dashboard | Next.js 14, Tailwind CSS, TypeScript, Firebase Auth |
| Backend API | Python 3.10+, FastAPI, SQLite (aiosqlite), SSE |
| IA génération | DeepSeek Chat (sections) / DeepSeek Reasoner (fichiers critiques) |
| IA rapide | Gemini Flash 2.0 (planification, repair, validation, copilote) |
| Projets générés | React + Vite + Tailwind + Framer Motion |
| Frontend hosting | Firebase Hosting (builderz.shop), export statique Next.js |
| Déploiement backend | Oracle Cloud VPS, Cloudflare Tunnel (`api.builderz.shop`), pm2 |

## Architecture

```
agent-platform/
├── backend/
│   ├── agent/
│   │   ├── runner.py              # Orchestration complète — boucle principale
│   │   ├── planner.py             # Génération du plan de tâches
│   │   ├── executor.py            # Exécution tâche par tâche + prefetch parallèle
│   │   ├── build_validator.py     # Validation TypeScript / build (boucle 2 passes)
│   │   ├── static_post_processor.py # 15+ corrections auto avant npm install
│   │   ├── project_memory.py      # Mémoire persistante par projet (.agent_memory.json)
│   │   ├── validator.py           # Validation narrative
│   │   └── visual_validator.py    # Validation visuelle par screenshot
│   ├── api/
│   │   ├── projects.py            # CRUD projets + actions
│   │   ├── logs.py                # Streaming SSE des logs
│   │   ├── settings.py            # Gestion des clés API (chiffrées)
│   │   └── crm.py                 # Demandes clients
│   ├── core/
│   │   ├── project_manager.py     # Gestion workspace + état
│   │   └── settings_crypto.py     # Chiffrement AES des secrets
│   ├── db/                        # SQLite — projets, tâches, logs, settings, fix_stats
│   ├── prompts/                   # Templates de prompts + règles anti-bugs + few-shot
│   ├── templates/
│   │   └── react-vite/            # Configs canoniques pré-validées (tsconfig, vite, postcss)
│   ├── tools/
│   │   ├── llm.py                 # LLMTool — routing Gemini/DeepSeek/Reasoner + AGENT_ROUTE_TABLE
│   │   ├── brief_to_claude.py     # Prépare workspace depuis brief JSON (tokens CSS, brief.md)
│   │   ├── register_project.py    # Enregistre un site généré dans le dashboard
│   │   ├── filesystem.py          # Lecture/écriture fichiers workspace
│   │   └── terminal.py            # Exécution commandes (npm install, build)
│   └── main.py                    # Point d'entrée FastAPI (port 8000)
├── frontend/
│   └── next-app/                  # Dashboard Next.js (port 3000)
│       ├── src/app/app/
│       │   ├── platform/          # Web Platform — liste projets + boutons Prompt/Agent
│       │   ├── prospects/         # Prospect Hunter
│       │   └── guardian/          # Site Guardian
│       └── src/components/
│           ├── ProjectCard.tsx    # Carte projet + badges Mode/Client + boutons dual-mode
│           ├── LogViewer.tsx      # Logs temps réel SSE
│           └── FileExplorer.tsx   # Explorateur de fichiers
├── starters/
│   ├── vitrine-standard/          # Starter React/Vite + Tailwind + Framer Motion + React Router
│   ├── scrollytelling/            # Starter + GSAP ScrollTrigger (pas de React Router)
│   └── 3d-immersif/               # Starter + Three.js / React Three Fiber + GSAP
├── .claude/skills/                # Skills Claude Code (chargés automatiquement)
│   ├── site-generator.md          # Protocole génération site depuis brief.md
│   ├── delivery-protocol.md       # Checklist livraison client
│   └── ...                        # frontend-design, taste, llm-routing, etc.
└── workspace/                     # Projets générés (sandboxé)
```

## Pipeline de génération

```
Brief client (formulaire)
        ↓
Gemini Flash — Structuration du brief → spec technique
        ↓
Gemini Flash — Planification → liste de tâches ordonnées
        ↓
Configs canoniques copiées (tsconfig, vite.config, postcss) ← base template
        ↓
DeepSeek Chat/Reasoner — Génération fichier par fichier
  · Fichiers critiques (types, App.tsx, cartStore) → Reasoner
  · Sections indépendantes (Hero, Features, FAQ…) → parallèle asyncio.gather()
  · Self-check checklist injecté dans chaque prompt
  · Few-shot examples canoniques dans le system prompt
        ↓
Static post-processor — 15+ corrections automatiques (imports, exports, BrowserRouter…)
        ↓
Build validator — npm install + tsc --noEmit
        ↓
Gemini Flash — Repair ciblé avec contexte d'erreur (jusqu'à 2 passes)
        ↓
ProjectMemory — Sauvegarde design/types/état build dans .agent_memory.json
        ↓
Déploiement Firebase (optionnel)
```

## Deux modes de génération

### Mode Agent Auto (pipeline VPS)
Déclenché depuis le dashboard — bouton **Agent auto** sur chaque projet avec brief.
Gemini Flash + DeepSeek uniquement. Claude n'est pas dans ce pipeline.

| Type de tâche | Modèle |
|---------------|--------|
| Planification / Design system | Gemini Flash |
| Sections UI (Hero, Features…) | DeepSeek Chat |
| Fichiers critiques (types, App.tsx, store) | DeepSeek Reasoner |
| Repair / Validation | Gemini Flash |
| Polish final | DeepSeek Chat |

### Mode Manuel (Claude Code VS Code)
Bouton **Prompt Claude** — génère et copie un prompt complet dans le presse-papier.
À coller dans Claude Code (VS Code). Suit les skills `.claude/skills/site-generator.md`.

```bash
# Ou depuis la CLI directement :
python backend/tools/brief_to_claude.py --project-id {id}
# → prépare workspace/{slug}/ + brief.md + tokens.css
# → "Lis workspace/{slug}/brief.md et génère le site complet"
```

## Routing LLM par budget (mode agent)

| Type de tâche | `economy` | `balanced` | `quality` |
|---------------|-----------|------------|-----------|
| Sections UI (Hero, Features…) | DeepSeek Flash | DeepSeek Flash | DeepSeek Pro |
| Fichiers critiques (types, App.tsx, cartStore) | DeepSeek Flash | DeepSeek Reasoner | DeepSeek Reasoner |
| Planification | Gemini Flash | Gemini Flash | DeepSeek Reasoner |
| Repair / Validation | Gemini Flash | Gemini Flash | Gemini Flash |

## Installation locale

### Backend

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
```

Créez `backend/.env` :

```env
LLM_BACKEND=deepseek
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MODEL_REASONER=deepseek-reasoner
GEMINI_API_KEY=...
LLM_MAX_TOKENS=8192
LLM_AUTO_CONTINUE=1
LLM_MAX_CONTINUATIONS=3
```

### Frontend

```bash
cd frontend/next-app
cp .env.local.example .env.local  # Remplir les clés Firebase
npm install
npm run dev
```

### Lancement

```bash
# Terminal 1 — Backend
uvicorn backend.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend/next-app && npm run dev
```

## Déploiement

### Frontend — Firebase Hosting

Le dashboard Next.js est exporté en statique et hébergé sur Firebase Hosting (`builderz.shop`).

```bash
cd frontend/next-app
npm run build                        # génère out/
firebase deploy --only hosting       # publie sur Firebase
```

Les appels API en production pointent vers `https://api.builderz.shop` via `NEXT_PUBLIC_API_URL` dans `.env.production`.

### Backend — VPS Oracle Cloud

Oracle Cloud Free Tier (Ubuntu 22.04, 1 CPU, 1 GB RAM + 1 GB swap).  
L'API est exposée via Cloudflare Tunnel sur `api.builderz.shop`.

```bash
# Première fois
pm2 start 'venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000' --name backend
pm2 start 'cloudflared tunnel run builderz' --name tunnel
pm2 save
```

Mise à jour backend :

```bash
cd ~/agent-platform && git pull origin master && pm2 restart backend
```

## API notable

| Endpoint | Description |
|----------|-------------|
| `GET /api/stats/fixes` | Fréquence des corrections automatiques par type |
| `GET /api/projects` | Liste des projets |
| `POST /api/projects/{id}/start` | Lancer la génération (mode agent) |
| `POST /api/projects/{id}/generate-claude-prompt` | Générer le prompt Claude Code (mode manuel) |
| `POST /api/projects/{id}/prepare-workspace` | Préparer le workspace depuis le brief |
| `GET /api/projects/{id}/logs/stream` | SSE — logs en temps réel |
| `POST /api/projects/{id}/deploy` | Déploiement Firebase |
| `GET /api/settings` | Clés API (chiffrées) |

## Licence

MIT
