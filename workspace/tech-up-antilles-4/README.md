# TECH-UP Antilles 4

**Vos accessoires mobiles au meilleur prix en Martinique.**

Site vitrine premium pour TECH-UP Antilles, boutique spécialisée en accessoires mobiles située au 93 Rue Victor Hugo, 97200 Fort-de-France. Une expérience d'achat moderne, fluide et 100% responsive, conçue pour connecter les Martiniquais aux meilleurs accessoires pour leurs appareils mobiles.

---

## Présentation

TECH-UP Antilles est la référence en Martinique pour les accessoires mobiles de qualité. Coques, chargeurs, écouteurs, protections écran… chaque produit est sélectionné pour offrir le meilleur rapport qualité-prix à nos clients.

Ce site vitrine a été pensé comme une véritable vitrine digitale premium : navigation intuitive, catalogue filtré par catégorie, fiches produit détaillées, panier fonctionnel et intégration WhatsApp pour une commande en un clic. L'expérience utilisateur est au cœur de chaque pixel, avec des animations fluides et un design moderne qui reflète l'identité dynamique de la boutique.

Notre promesse : trouver l'accessoire parfait pour votre smartphone, rapidement et sans stress, avec la proximité et la réactivité d'un commerce de proximité martiniquais.

---

## Fonctionnalités

- **Hero plein écran** — accroche forte, badge de localisation Fort-de-France, double CTA (produits + WhatsApp)
- **Catalogue produits** — 12+ produits avec images Unsplash, prix en €, filtres par catégorie (coques, chargeurs, écouteurs, protections, divers)
- **Fiche produit individuelle** — galerie d'images, description détaillée, prix, bouton "Commander sur WhatsApp"
- **Panier fonctionnel** — drawer latéral avec résumé, quantité, total, lien direct WhatsApp
- **Catégories visuelles** — cards cliquables par type d'accessoire
- **Section À propos** — histoire de la boutique, engagement qualité, livraison rapide
- **Avis clients authentiques** — 5 témoignages de clients martiniquais (noms créoles)
- **Infos pratiques** — carte, adresse, horaires, contacts
- **CTA final** — appel à l'action WhatsApp + téléphone
- **Footer complet** — navigation, horaires, réseaux sociaux, copyright
- **Animations Framer Motion** — entrées fluides, stagger, parallaxe subtile
- **Responsive mobile-first** — hamburger menu, grilles adaptatives, textes fluides
- **Design clair et moderne** — palette blanc/violet #6D28D9/bleu ciel, typographie Plus Jakarta Sans + Inter

---

## Stack technique

| Technologie       | Utilisation                          |
|-------------------|--------------------------------------|
| React 18          | Bibliothèque UI                      |
| TypeScript        | Typage statique                      |
| Vite              | Bundler et dev server                |
| Tailwind CSS      | Styles utilitaires                   |
| Framer Motion     | Animations et transitions            |
| React Router DOM  | Routage client-side                  |
| Lucide React      | Icônes                               |
| clsx + tailwind-merge | Gestion de classes conditionnelles |

---

## Prérequis

- **Node.js** 18 ou supérieur
- **npm** (inclus avec Node.js)

---

## Installation & Lancement

```bash
npm install
npm run dev
# → http://localhost:5173
```

Le serveur de développement démarre sur `http://localhost:5173`. Ouvrir cette URL dans le navigateur pour voir le site.

---

## Structure du projet

```
tech-up-antilles-4/
├── index.html                    # Point d'entrée HTML
├── package.json                  # Dépendances et scripts
├── tailwind.config.js            # Configuration Tailwind (couleurs, fonts)
├── vite.config.ts                # Configuration Vite
├── tsconfig.json                 # Configuration TypeScript
├── src/
│   ├── main.tsx                  # Point d'entrée React (BrowserRouter)
│   ├── App.tsx                   # Routes principales
│   ├── index.css                 # Styles globaux + variables CSS
│   ├── types/index.ts            # Types TypeScript (Product, CartItem, etc.)
│   ├── constants/theme.ts        # Constantes de design system
│   ├── lib/
│   │   ├── utils.ts              # Utilitaires (formatage prix, etc.)
│   │   └── utils.tsx             # Utilitaires JSX
│   ├── data/
│   │   ├── products.ts           # Données des 12+ produits
│   │   └── testimonials.ts       # Témoignages clients
│   ├── context/
│   │   └── CartContext.tsx        # Contexte du panier (Provider + hook)
│   ├── components/
│   │   ├── ui/                   # Composants atomiques (Button, Badge, Card)
│   │   ├── layout/               # Navbar, Footer
│   │   ├── sections/             # Sections de la page d'accueil (Hero, About, etc.)
│   │   ├── catalogue/            # ProductCard, FilterBar, ProductGrid
│   │   └── cart/                 # CartDrawer (panier latéral)
│   └── pages/                    # Pages (Home, ProductDetail)
```

---

## Variables d'environnement

Aucune variable d'environnement n'est requise pour le fonctionnement du site.  
Toutes les données (produits, témoignages, informations de contact) sont intégrées directement dans le code source.

---

## Déploiement

Le site est conçu pour un déploiement statique sur **Vercel** (recommandé) ou tout autre hébergeur statique (Netlify, Cloudflare Pages, etc.).

### Déploiement sur Vercel

1. Connecter le dépôt GitHub à Vercel
2. Framework : **Vite**
3. Build command : `npm run build`
4. Output directory : `dist`
5. Déployer

Aucune variable d'environnement supplémentaire n'est nécessaire.

---

## Licence

**MIT** — libre utilisation, modification et distribution.  
Développé avec ❤️ pour TECH-UP Antilles.