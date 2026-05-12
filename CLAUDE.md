# Agent Platform — CLAUDE.md

## Description
Plateforme SaaS de génération automatique de sites web pour TPE/PME.
Pipeline IA : Gemini Flash (planification/repair) + DeepSeek/Claude (génération).

## Stack
- Backend : Python 3.10+, FastAPI, SQLite (aiosqlite), SSE (port 8000)
- Frontend : Next.js 14, TypeScript, Tailwind CSS (port 3000)
- LLMs : Gemini Flash 2.0, DeepSeek Chat, DeepSeek Reasoner, Claude Sonnet
- Infra : Oracle Cloud VPS, Cloudflare Tunnel, Firebase Hosting

## Conventions backend
- Tout le code Python est async (asyncio)
- Les routes FastAPI sont dans backend/api/
- Le routing LLM central est dans backend/tools/llm.py
- Les prompts système sont dans backend/prompts/ (fichiers .txt ou .md)
- Ne jamais modifier static_post_processor.py sans tester le build complet

## Conventions frontend
- Composants dans src/components/, pages dans src/app/
- Toujours TypeScript strict
- Tailwind CSS pour le style, pas de CSS custom sauf si nécessaire

## Skills à charger selon la tâche
- Avant tout travail sur les prompts de génération → lire skills/frontend-design.md
- Avant tout travail sur llm.py → lire skills/llm-routing.md
- Avant tout travail sur Prospect Hunter → lire skills/prospect-hunter.md
- Avant tout travail sur Site Guardian → lire skills/site-guardian.md
- Avant tout travail sur video_generator.py ou l'intégration vidéo → lire skills/video-generation.md

## MCPs installés et leur usage

| MCP | Quand l'utiliser |
|---|---|
| context7 | Avant tout code Next.js, FastAPI, React, Tailwind — ajoute "use context7" dans le prompt |
| github | Créer des branches, commiter, ouvrir des PRs, chercher du code |
| firecrawl | Scraper des sites pour Prospect Hunter, analyser la concurrence |
| memory | Sauvegarder les décisions d'architecture, les préférences client, le design system |
| playwright | Tester visuellement les sites générés, faire des screenshots |
| higgsfield | Générer des vidéos et images pour les sites clients et builderz.shop |
| 21st-dev-magic | Composants React production-ready pour les sites générés |
| n8n | Automatiser les workflows (scraping prospects, rapports Guardian, onboarding) |

## Règle d'usage des MCPs
- Ne pas charger tous les MCPs à chaque session — utiliser uniquement ceux nécessaires à la tâche
- Max 4-5 MCPs actifs simultanément pour ne pas surcharger le contexte
- Pour la génération de sites : context7 + playwright + 21st-dev-magic
- Pour Prospect Hunter : firecrawl + brave-search + memory
- Pour le dev de la plateforme : github + context7 + sqlite

## Points d'attention
- Le static_post_processor applique 15+ corrections auto — ne pas dupliquer sa logique
- Le build_validator tourne jusqu'à 2 passes de repair — les prompts doivent minimiser les erreurs TS
- ProjectMemory sauvegarde le design system par projet dans .agent_memory.json
- Les SSE logs sont streamés via /api/projects/{id}/logs/stream
