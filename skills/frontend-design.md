---
name: frontend-design
description: Génération de composants React/Vite/Tailwind de qualité maximale pour les sites clients. Charger avant toute génération de code frontend.
---

# Skill — Frontend Design Qualité Maximale

## Objectif
Générer du code React/TypeScript/Tailwind qui produit des sites visuellement professionnels,
distinctifs et sans erreurs de build. Éviter absolument l'esthétique "AI slop" générique.

## Règles typographie
- Toujours utiliser Google Fonts avec une paire distincte : display font + body font
- Exemples de paires fortes : Playfair Display + DM Sans, Syne + Inter, Cabinet Grotesk + Satoshi
- Jamais Arial, Roboto, system-ui seul
- Tailles : heading xl = clamp(2.5rem, 5vw, 4rem), body = 1.125rem, line-height = 1.7

## Règles couleurs
- Toujours définir les couleurs en variables CSS dans index.css ou App.css
- Palette cohérente : 1 couleur dominante + 1 accent + neutres
- Préférer des palettes inattendues plutôt que bleu/blanc générique
- Toujours prévoir dark mode via prefers-color-scheme ou classe .dark

## Règles animations
- Utiliser Framer Motion (déjà dans le stack) pour les animations d'entrée
- Pattern standard : variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
- Stagger les éléments de liste : staggerChildren: 0.1
- Transitions : duration 0.6, ease: [0.22, 1, 0.36, 1] (ease out expo)
- Scroll animations via whileInView + viewport={{ once: true }}

## Règles layout
- Sections avec padding-y généreux : py-16 minimum, py-24 sur desktop (py-16 lg:py-24)
- Max-width container : max-w-7xl mx-auto px-6
- Grilles responsives : grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Éviter les layouts trop centrés/symétriques — chercher l'asymétrie intentionnelle

## Règles composants React/TypeScript
- Toujours typer les props avec interface, jamais any
- Utiliser les variantes de className avec cn() ou clsx si plusieurs états
- Exports nommés pour les composants, default export pour les pages
- Toujours un fichier index.ts pour les dossiers de composants

## Checklist avant de soumettre du code
- [ ] Pas d'import manquant (React, useState, useEffect, Framer Motion)
- [ ] Pas de type any
- [ ] Toutes les images ont un attribut alt
- [ ] Les couleurs sont en variables CSS, pas hardcodées
- [ ] Les animations ont un fallback si prefers-reduced-motion
- [ ] BrowserRouter est dans main.tsx, pas dans App.tsx

## Règles brief client (obligatoires)
- Toujours exiger dans le brief : 1 URL de référence + 2 adjectifs visuels (ex. "éditorial & brutaliste")
- Sans ces éléments, le rendu sera générique — relancer le client pour les obtenir
- 1 émotion cible à définir (ex. "confiance", "excitation", "sérénité")

## Règles animations — limite stricte
- Maximum 3 types d'animation sur tout le site :
  1. Apparition au scroll (whileInView)
  2. Hover sur éléments interactifs
  3. Transition de page
- Au-delà de 3 types, le site perd en crédibilité — supprimer les animations superflues
- Pas d'animations en cascade sur plus de 5 éléments simultanément

## Audit obligatoire avant déploiement
Avant tout build final, vérifier :
- Responsive : breakpoints mobile (375px), tablet (768px), desktop (1280px)
- Lighthouse : performance > 80, a11y > 90, SEO > 90
- Liens : aucun lien mort ou href="#" en production
