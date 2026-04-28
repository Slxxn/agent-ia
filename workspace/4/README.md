# Tech Up Antilles — Site E-Commerce 🛸

**Tech Up Antilles** est une boutique en ligne premium dédiée aux produits technologiques, pensée pour les jeunes des Antilles (Guadeloupe, Martinique).  
Design **dark / néon / glassmorphism** — animations fluides (Framer Motion) — responsive mobile-first — paiement **Stripe** et **PayPal** intégrés.

---

## 🎯 Objectif

Créer une expérience d’achat immersive qui :
- donne envie d’acheter immédiatement,
- reflète une marque moderne, fiable et stylée,
- convertit via mobile (principal canal aux Antilles).

---

## 📦 Prérequis

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x ou **yarn** / **pnpm**
- Compte [Stripe](https://stripe.com) (pour les paiements)
- Compte [PayPal Developer](https://developer.paypal.com) (pour le paiement alternatif)
- Connaissance de base de React, Vite, Tailwind CSS

---

## 🚀 Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/votre-utilisateur/tech-up-antilles.git
   cd tech-up-antilles
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d’environnement**  
   Créez un fichier `.env` à la racine du projet (voir `.env.example` si présent) :
   ```env
   # Stripe
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
   VITE_STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx

   # PayPal
   VITE_PAYPAL_CLIENT_ID=AW7QIH..................
   VITE_PAYPAL_SECRET=EN7J..................

   # URL du site (production)
   VITE_BASE_URL=http://localhost:5173
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

   L’application sera accessible sur `http://localhost:5173`.

---

## 🧭 Utilisation

- **Navigation** : barre de navigation avec logo, liens vers les sections, panier.
- **Ajout au panier** : cliquez sur "Ajouter au panier" sur une fiche produit. Le panier s’affiche via un modal.
- **Paiement** : deux méthodes disponibles — Stripe (carte bancaire) ou PayPal (compte PayPal).
- **Responsive** : testez sur mobile, tablette et desktop.

---

## 📁 Structure du projet

```
tech-up-antilles/
├── components.json
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── components/
    │   ├── index.ts
    │   ├── Banner.tsx             # Bannière "Disponible en Guadeloupe & Martinique"
    │   ├── CartModal.tsx          # Modal panier
    │   ├── FeaturedProducts.tsx   # Produits en vedette
    │   ├── Footer.tsx             # Footer complet
    │   ├── HeroSection.tsx        # Section hero
    │   ├── Navbar.tsx             # Barre de navigation
    │   ├── ProductCard.tsx        # Carte produit individuelle
    │   ├── SocialMedia.tsx        # Section réseaux sociaux / Instagram
    │   ├── Testimonials.tsx       # Avis clients (slider)
    │   ├── WhyChooseUs.tsx        # Pourquoi nous choisir
    │   └── ui/
    │       ├── index.ts
    │       ├── Badge.tsx
    │       ├── Button.tsx
    │       └── Card.tsx
    ├── context/
    │   └── CartContext.tsx        # Contexte du panier
    ├── data/
    │   └── products.ts           # Données des produits (fichier statique)
    └── lib/
        └── utils.ts              # Fonctions utilitaires (génération de clés, parsing classe etc.)
```

---

## 🌐 Déploiement et hébergement

### Options conseillées

| Plateforme   | Avantages                          |
|--------------|------------------------------------|
| **Vercel**   | Gratuit pour les petits projets, déploiement instantané depuis GitHub |
| **Netlify**  | Similaire, support des formulaires |
| **OVH** / **Alwaysdata** | Hébergement mutualisé français (antilles friendly) |

### Procédure générique (Vercel)

1. **Pousser le code sur GitHub** (ou GitLab/Bitbucket).
2. **Créer un compte sur [Vercel](https://vercel.com)** et connecter votre dépôt.
3. **Configurer les variables d’environnement** dans le dashboard Vercel :
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_STRIPE_SECRET_KEY`
   - `VITE_PAYPAL_CLIENT_ID`
   - `VITE_PAYPAL_SECRET`
   - `VITE_BASE_URL` (ex : `https://techupantilles.vercel.app`)
4. **Déployer** : Vercel détecte automatiquement Vite et lance la build.
5. **Activer le domaine personnalisé** (optionnel).

### Backend pour les paiements (Stripe / PayPal)

> ⚠️ **Important** : Les clés secrètes (Stripe `sk_test_*` ou PayPal `secret`) ne doivent **jamais** être exposées côté client.  
> Pour une utilisation en production, vous devez mettre en place un backend minimal (ex : avec Node.js + Express) qui appelle les endpoints Stripe/PayPal et protège les clés secrètes.  
> Cependant, dans cette version de démo, les clés sont stockées côté client via `VITE_*` (uniquement pour le développement/test). **Passez impérativement par un backend en production.**

---

## 💳 Configuration des paiements

### Stripe

#### Obtenir les clés
1. Connectez-vous sur [Stripe Dashboard](https://dashboard.stripe.com).
2. Allez dans **Developers** → **API keys**.
3. Copiez la **publishable key** (commençant par `pk_test_` ou `pk_live_`) et la **secret key** (`sk_test_` ou `sk_live_`).

#### Variables d’environnement
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
```

#### Mode test → Mode production
- En mode test, utilisez `pk_test_…` et `sk_test_…`. Vous pouvez payer avec la carte de test `4242 4242 4242 4242`, date future, CVC quelconque.
- Pour passer en production :
  1. Activez votre compte Stripe (formulaire complet).
  2. Remplacez les clés test par les clés **live** (commençant par `pk_live_` et `sk_live_`).
  3. Mettez à jour les variables d’environnement et redéployez.

### PayPal

#### Obtenir les clés
1. Allez sur [PayPal Developer Dashboard](https://developer.paypal.com/dashboard).
2. Créez une application **REST API apps**.
3. Copiez le **Client ID** et le **Secret**.

#### Variables d’environnement
```env
VITE_PAYPAL_CLIENT_ID=AW7QIH..................
VITE_PAYPAL_SECRET=EN7J..................
```

#### Mode test → Mode production
- En mode test, les clés fonctionnent avec un compte sandbox PayPal.
- Pour la production :
  1. Allez dans le dashboard PayPal → **Live** (basculez depuis Sandbox).
  2. Générez des clés **live** (Client ID + Secret).
  3. Remplacez les variables d’environnement et redéployez.

---

## 👩‍💻 Développement

### Commandes utiles

| Commande              | Description                               |
|-----------------------|-------------------------------------------|
| `npm run dev`         | Lance le serveur de développement (Vite)  |
| `npm run build`       | Build de production dans `dist/`          |
| `npm run preview`     | Prévisualisation locale du build          |
| `npm run lint`        | Lint du code (si ESLint configuré)        |

### Technologies utilisées

- **React 18** + **TypeScript**
- **Vite 5** (bundler)
- **Tailwind CSS 3** (via CDN ou PostCSS)
- **Framer Motion** (animations)
- **Stripe Elements** (paiement par carte)
- **PayPal JS SDK** (bouton PayPal)
- **React Context** (gestion d’état du panier)

---

## 📜 Licence

Ce projet est distribué sous licence **MIT**.  
Vous êtes libre de l’utiliser, le modifier et le redistribuer.  
Voir le fichier [LICENSE](./LICENSE) pour plus d’informations.

---

## 🙏 Remerciements

- L’univers Instagram de **Tech Up Antilles** pour l’inspiration.
- La communauté React et Tailwind CSS.
- Stripe et PayPal pour leurs API généreuses.

---

**Prêt à coder ?**  
*“Upgrade ton quotidien avec la tech ultime.”* 🚀