# Agent Platform

Plateforme SaaS de génération automatique de sites web complets par un agent IA.
Décrivez votre projet via le formulaire client, l'agent planifie, structure, code et déploie — en temps réel.

## Fonctionnalités

- **Génération full-stack** : React/Vite + Tailwind CSS, animations Framer Motion, composants UI complets
- **Pipeline IA hybride** : Gemini Flash (planification, repair, validation) + DeepSeek Chat/Reasoner (génération de code)
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
| Déploiement | Oracle Cloud VPS, Cloudflare Tunnel, pm2 |

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
│   │   ├── llm.py                 # LLMTool — routing Gemini/DeepSeek/Reasoner
│   │   ├── filesystem.py          # Lecture/écriture fichiers workspace
│   │   └── terminal.py            # Exécution commandes (npm install, build)
│   └── main.py                    # Point d'entrée FastAPI (port 8000)
├── frontend/
│   └── next-app/                  # Dashboard Next.js (port 3000)
│       ├── src/app/
│       │   ├── page.tsx           # Dashboard principal
│       │   ├── project/           # Page détail projet (logs, fichiers, copilote)
│       │   ├── crm/               # CRM demandes clients
│       │   ├── form/              # Formulaire client multi-étapes
│       │   └── settings/          # Réglages clés API
│       └── src/components/
│           ├── LogViewer.tsx      # Logs temps réel SSE
│           └── FileExplorer.tsx   # Explorateur de fichiers
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

## Routing LLM par mode et type de tâche

| Type de tâche | `economy` | `balanced` | `quality` |
|---------------|-----------|------------|-----------|
| Sections UI (Hero, Features…) | DeepSeek Chat | DeepSeek Chat | DeepSeek Chat |
| Fichiers critiques (types, App.tsx, cartStore) | DeepSeek Chat | DeepSeek Reasoner | DeepSeek Reasoner |
| Planification | Gemini Flash | Gemini Flash | Gemini Flash |
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

## Déploiement VPS (production)

Oracle Cloud Free Tier (Ubuntu 22.04, 1 CPU, 1 GB RAM + 1 GB swap) avec Cloudflare Tunnel.

```bash
# Première fois
pm2 start 'venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000' --name backend
pm2 start npm --name frontend --cwd frontend/next-app -- start
pm2 start 'cloudflared tunnel run builderz' --name tunnel
pm2 save
```

Mise à jour :

```bash
cd ~/agent-platform && git pull origin master
cd frontend/next-app && npm run build && pm2 restart all
```

## API notable

| Endpoint | Description |
|----------|-------------|
| `GET /api/stats/fixes` | Fréquence des corrections automatiques par type |
| `GET /api/projects` | Liste des projets |
| `POST /api/projects/{id}/run` | Lancer la génération |
| `GET /api/logs/{id}/stream` | SSE — logs en temps réel |

## Licence

MIT
