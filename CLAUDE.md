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

## Outils MCP disponibles
- Playwright MCP — utiliser après chaque génération de site pour screenshot + audit visuel automatique

## Points d'attention
- Le static_post_processor applique 15+ corrections auto — ne pas dupliquer sa logique
- Le build_validator tourne jusqu'à 2 passes de repair — les prompts doivent minimiser les erreurs TS
- ProjectMemory sauvegarde le design system par projet dans .agent_memory.json
- Les SSE logs sont streamés via /api/projects/{id}/logs/stream
