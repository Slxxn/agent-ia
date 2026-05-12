---
name: video-generation
description: Règles de génération vidéo automatique via HyperFrames pour les sites clients. Charger avant tout travail sur video_generator.py ou l'intégration vidéo dans le pipeline.
---

# Skill — Génération Vidéo HyperFrames

## Objectif
Générer automatiquement des vidéos branded et cohérentes avec le secteur du client
quand il ne fournit pas de footage. Utilise HyperFrames (HTML → MP4) via Gemini Flash
pour la génération des specs.

## Pipeline
1. Gemini Flash analyse le brief + secteur → génère les specs JSON des vidéos
2. `_build_html()` crée le fichier HTML avec les animations CSS
3. HyperFrames CLI rend le HTML en MP4 (1920x1080, 30fps)
4. Les MP4 sont placés dans `public/videos/` du projet généré
5. executor.py les injecte dans les composants React Hero et Features

## Règles Gemini pour la génération de prompts vidéo
- Toujours inclure le nom du business ou une accroche forte dans `title_text`
- Les couleurs doivent correspondre au secteur (voir `SECTOR_STYLES` dans video_generator.py)
- `duration` : 6-8 secondes max (vidéos en loop, pas de long format)
- `animation_style` selon le secteur :
  - coiffeur/beauté → `reveal`, `typewriter`
  - restaurant → `fade-in`, `slide-up`
  - artisan → `stagger` (pour lister les services)
  - médecin → `fade-in` (sobre, rassurant)

## Règles HyperFrames
- Toujours définir `data-composition-id`, `data-start`, `data-width`, `data-height`, `data-duration`
- Résolution : 1920x1080 (1080p), FPS : 30
- Animations CSS uniquement — pas de JS dans les compositions
- Google Fonts supportées via le lien CDN

## Gestion des erreurs
- La génération vidéo est **NON BLOQUANTE** — si elle échoue, le pipeline continue
- Logger l'erreur mais ne jamais faire échouer le build pour une vidéo
- Fallback : fond coloré CSS si pas de vidéo disponible

## Dépendances système (VPS Oracle)
```bash
sudo apt update && sudo apt install -y ffmpeg
npx hyperframes browser ensure
npx hyperframes doctor  # vérifier que tout est OK
```

## Fichiers concernés
- `backend/agent/video_generator.py` — module principal
- `backend/agent/runner.py` — intégration dans le pipeline (Phase 3.4)
- `backend/agent/executor.py` — `_VIDEO_INSTRUCTION` injectée dans les prompts React
- `frontend/next-app/src/app/form/` — champ `sector` déjà présent
