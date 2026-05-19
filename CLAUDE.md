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

## Skills disponibles

### Skills projet (dans .claude/skills/)
| Skill | Quand l'utiliser |
|-------|-----------------|
| `delivery-protocol.md` | À chaque création ou modification de site client |
| `frontend-design.md` | Avant tout travail frontend ou prompts de génération |
| `taste.md` | Pour les décisions visuelles |
| `llm-routing.md` | Avant tout travail sur llm.py |
| `prospect-hunter.md` | Développement Prospect Hunter |
| `site-guardian.md` | Développement Site Guardian |
| `video-generation.md` | Avant tout travail sur video_generator.py |
| `gsap-scrolltrigger.md` | Sites scrollytelling |
| `threejs-r3f.md` | Sites 3D (Three.js / React Three Fiber) |

### Skills globaux (~/.claude/skills/)
| Skill | Quand l'utiliser |
|-------|-----------------|
| `systematic-debugging` | Quand un bug est difficile à résoudre |
| `verification-before-completion` | Avant de terminer une tâche |
| `finishing-a-development-branch` | Avant un commit |
| `code-review-skill` | Review du code généré |

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

## Commande d'enregistrement rapide

Après chaque génération de site, toujours lancer :
```bash
# Projet test
python backend/tools/register_project.py \
  --name "{NOM}" --slug "{SLUG}" \
  --sector "{SECTEUR}" --type "{TYPE}" \
  --is-client false --notes "{DESCRIPTION}"

# Projet client
python backend/tools/register_project.py \
  --name "{NOM}" --slug "{SLUG}" \
  --sector "{SECTEUR}" --type "{TYPE}" \
  --is-client true \
  --client-email "{EMAIL}" --client-name "{NOM_CLIENT}"
```

## Workflow de génération de site

### Quand un brief.md est présent dans workspace/
1. Lire immédiatement `.claude/skills/site-generator.md`
2. Suivre le protocole `.claude/skills/delivery-protocol.md`

### Préparer un workspace depuis un brief client
```bash
# Depuis le formulaire (JSON direct)
python backend/tools/brief_to_claude.py --brief '{"businessName": "...", "sector": "beaute", ...}'

# Depuis un fichier JSON
python backend/tools/brief_to_claude.py --file briefs/salon-emma.json

# Depuis la DB (via l'ID projet)
python backend/tools/brief_to_claude.py --project-id abc123
```
→ Génère `workspace/{slug}/brief.md` + `tokens.css` depuis le starter adapté.
→ Puis : _"Lis workspace/{slug}/brief.md et génère le site complet"_

---

## Points d'attention
- Le static_post_processor applique 15+ corrections auto — ne pas dupliquer sa logique
- Le build_validator tourne jusqu'à 2 passes de repair — les prompts doivent minimiser les erreurs TS
- ProjectMemory sauvegarde le design system par projet dans .agent_memory.json
- Les SSE logs sont streamés via /api/projects/{id}/logs/stream
