# TechUp Antilles – Boutique Tech Premium

Bienvenue dans **TechUp Antilles**, votre boutique en ligne spécialisée dans la vente de smartphones, accessoires et gadgets high-tech aux Antilles (Guadeloupe, Martinique).  
Design moderne, dark néon, et expérience mobile-first pour convertir facilement vos visiteurs Instagram en clients.  
Le site propose un catalogue dynamique, des fiches produits détaillées, et un contact direct via WhatsApp pour commander.  

> 💡 **Version actuelle** : MVP avec paiement manuel (WhatsApp).  
> Intégration **Stripe** et **PayPal** documentée prête à l'emploi pour une future mise en production.

## Fonctionnalités principales
- Catalogue complet avec filtres (catégorie, prix)
- Fiches produits détaillées (images, description, badge promo/best‑seller)
- Bouton flottant WhatsApp + message pré‑rempli
- Simulation de panier (store React)
- Animations fluides (Framer Motion)
- Design responsive mobile-first
- FAQ interactive, témoignages clients, lazy loading
- Backend Node.js/Express avec API JSON (simulé pour MVP)

---

## Prérequis

Avant de commencer, assurez-vous d’avoir installé :

- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [npm](https://www.npmjs.com/) (vient avec Node.js)
- Un compte [Stripe](https://stripe.com) (pour les paiements, optionnel)
- Un compte [PayPal Developer](https://developer.paypal.com) (pour PayPal, optionnel)
- Un compte [WhatsApp Business API](https://www.whatsapp.com/business) (recommandé pour le CTA)

---

## Installation

### 1. Cloner le dépôt
```bash
git clone https://github.com/votre-organisation/techup-antilles.git
cd techup-antilles
```

### 2. Installer les dépendances

**Frontend (React/Vite)**
```bash
npm install
```

**Backend (serveur Express)**
```bash
cd server
npm install
cd ..
```

### 3. Variables d’environnement

Créez un fichier `.env` à la racine du projet et renseignez les clés suivantes (optionnelles pour le MVP) :

```env
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE

# PayPal
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
```

> **Important** : Ces clés ne sont utilisées que si vous implémentez les paiements en ligne.  
> Actuellement, le site redirige vers WhatsApp.

### 4. Démarrer le serveur backend (API simulée)
```bash
cd server
npm start   # ou node index.js
```
Le serveur écoute sur `http://localhost:5000`.

### 5. Démarrer le frontend (dans un autre terminal)
```bash
npm run dev
```
Le site est accessible sur `http://localhost:5173`.

---

## Utilisation

1. Parcourir le catalogue complet (`/products`)
2. Filtrer par catégorie ou prix
3. Cliquer sur un produit pour voir le détail (`/product/:id`)
4. Cliquer sur le bouton **Commander via WhatsApp** – le message inclut le nom du produit et le prix
5. Le panier s’affiche via le bouton panier (sidebar). Il est possible d’ajouter/supprimer des articles (simulation).
6. Les pages Contact, À propos et FAQ sont accessibles depuis la navbar.

---

## Structure du projet

```
📁 techup-antilles/
├── index.html
├── package.json
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── server/
│   ├── package.json
│   ├── index.js
│   ├── data/
│   │   └── products.json
│   └── routes/
│       ├── products.js
│       └── contact.js
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── lib/
    │   └── utils.ts
    ├── data/
    │   └── products.ts
    ├── stores/
    │   └── cartStore.tsx
    ├── components/
    │   ├── ui/
    │   │   ├── Badge.tsx
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Input.tsx
    │   │   ├── Sheet.tsx
    │   │   └── index.ts
    │   ├── Navbar.tsx
    │   ├── HeroSection.tsx
    │   ├── ProductCard.tsx
    │   ├── ProductGrid.tsx
    │   ├── ProductFilters.tsx
    │   ├── ProductDetail.tsx
    │   ├── WhatsAppButton.tsx
    │   ├── Footer.tsx
    │   ├── BadgePromo.tsx
    │   ├── TestimonialSection.tsx
    │   └── FAQAccordion.tsx
    └── pages/
        ├── Home.tsx
        ├── Products.tsx
        ├── ProductPage.tsx
        ├── Contact.tsx
        ├── About.tsx
        └── FAQ.tsx
```

---

## Instructions de déploiement et d’hébergement

### Hébergement du frontend (React/Vite)

Le build de production se fait avec :
```bash
npm run build
```
Les fichiers statiques sont générés dans le dossier `dist/`.

#### Options d’hébergement
- **Vercel** : idéal pour les sites statiques. Connectez votre dépôt Git et déployez automatiquement.  
  *Astuce* : pensez à configurer les redirections pour le routage SPA (fichier `vercel.json`).
- **Netlify** : similaire à Vercel. Déployez via Git ou glisser‑déposer le dossier `dist`.
- **O2Switch / Hostinger** : copiez le contenu de `dist` dans le dossier public du serveur.  
  Ajoutez une règle de réécriture pour l’historique de React Router (fichier `.htaccess`).

### Hébergement du backend (Express)

Le serveur peut être déployé sur :
- **Heroku** (avec `Procfile`)
- **Railway** / **Render** : déploiement simple depuis Git.
- **VPS** (DigitalOcean, OVH) : copiez le dossier `server`, installez les dépendances et lancez `node index.js` avec pm2.

Pour la production, pensez à :
- Mettre les variables d’environnement (notamment les clés Stripe/PayPal).
- Utiliser un reverse proxy (Nginx) pour gérer le SSL et le routage.
- Configurer CORS pour autoriser votre domaine frontend.

### Base de données
Le projet utilise un fichier JSON local (`server/data/products.json`) en guise de base de données.  
Pour évoluer, vous pouvez le remplacer par une vraie base (MongoDB, PostgreSQL) et modifier les routes.

---

## Configuration des paiements

Bien que la version actuelle n’intègre pas de paiement en ligne, le projet est prêt à recevoir **Stripe** et **PayPal**.  
Voici comment les activer.

### Stripe

#### Obtenir les clés API
1. Créez un compte sur [stripe.com](https://stripe.com).
2. Allez dans le **Dashboard** > **Developers** > **API keys**.
3. Récupérez votre **clé publiable** (pk_test_...) et votre **clé secrète** (sk_test_...).

#### Configuration
Ajoutez ces lignes dans votre fichier `.env` (racine du projet) :
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXX
```

#### Implémentation
- **Frontend** : utilisez `@stripe/react-stripe-js` et `@stripe/stripe-js`.
- **Backend** : créez une route `/api/create-checkout-session` qui utilise `stripe.checkout.sessions.create`.

#### Passer en production
1. Passez votre compte Stripe en **mode live** (activation nécessaire).
2. Remplacez les clés `pk_test_...` par `pk_live_...` et `sk_test_...` par `sk_live_...`.
3. Mettez à jour `.env` et redéployez.

### PayPal

#### Obtenir les clés API
1. Allez sur [developer.paypal.com](https://developer.paypal.com).
2. Connectez-vous, puis **Dashboard** > **My Apps & Credentials**.
3. Créez une application **REST API** pour obtenir un **Client ID** et un **Secret**.

#### Configuration
Dans votre `.env` (racine) :
```env
VITE_PAYPAL_CLIENT_ID=your_client_id
PAYPAL_SECRET=your_secret
```

#### Implémentation
- **Frontend** : utilisez `@paypal/react-paypal-js` pour afficher le bouton.
- **Backend** : créez une route `/api/paypal/order/create` et `/api/paypal/order/capture` pour gérer le cycle de commande.

#### Passer en production
1. Dans votre compte PayPal Developer, activez le **Live mode**.
2. Récupérez les **Live credentials** (Client ID et Secret).
3. Mettez à jour vos variables d’environnement et redéployez.

---

## Licence

Ce projet est sous licence **MIT**.  
Vous êtes libre de l’utiliser, le modifier et le redistribuer, à condition de mentionner l’auteur original.

---

**TechUp Antilles** – *La tech premium aux Antilles, livrée en 24h.*  
📍 Pointe-à-Pitre / Fort-de-France  
📱 Contactez-nous sur [WhatsApp](https://wa.me/590690000000) ou [Instagram](https://instagram.com/techupantilles)