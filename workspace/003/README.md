# Tech Up Antilles

Site e-commerce moderne, premium et dynamique pour la boutique de produits technologiques **Tech Up Antilles**. Inspiré de l’univers Instagram, il allie style urbain, tech, lifestyle et ambiance des îles.

| 🎯 Objectif                                                                 |
|----------------------------------------------------------------------------|
| Créer un site qui donne envie d’acheter immédiatement, reflète une marque moderne et fiable, et convertit via mobile (principal canal). |

---

## 🚀 Fonctionnalités

- **Panier e‑commerce** complet avec gestion des quantités
- **Paiements sécurisés** via Stripe et PayPal
- **Animations fluides** (Framer Motion)
- **Design responsif** (mobile‑first)
- **Bannière locale** : *Disponible en Guadeloupe & Martinique 🇬🇵🇲🇶*
- **CTA WhatsApp** pour commander rapidement
- **Section avis clients** avec slider
- **Intégration Instagram** (feed mockup)

---

## 📋 Prérequis

- [Node.js](https://nodejs.org/) version 18 ou supérieure
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Comptes développeur **Stripe** et **PayPal** (pour les paiements)

---

## 🔧 Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-depot>
cd 003
```

### 2. Installer les dépendances du frontend

```bash
npm install
```

### 3. Installer les dépendances du backend

```bash
cd server
npm install
cd ..
```

### 4. Configurer les variables d’environnement

#### Frontend (à la racine)

Créez un fichier `.env` à la racine du projet :

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXX
VITE_PAYPAL_CLIENT_ID=AYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_BASE_URL=http://localhost:3000
```

#### Backend (dans `server/`)

Créez un fichier `.env` dans le dossier `server` :

```
PORT=3000
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
PAYPAL_CLIENT_ID=AYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_SECRET=ECxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **⚠️ Important** : Ne commitez jamais les vraies clés. Utilisez des variables d’environnement.

---

## ▶️ Utilisation

### Lancer le backend

```bash
cd server
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`.

### Lancer le frontend (dans un autre terminal)

```bash
cd 003
npm run dev
```

Le site sera accessible sur `http://localhost:5173`.

---

## 🗂️ Structure du projet

```
003/
├── .env                          # Variables d’env frontend
├── components.json
├── index.html                    # Point d’entrée HTML
├── package.json                  # Dépendances frontend
├── postcss.config.js
├── server/                       # Backend Node.js / Express
│   ├── .env
│   ├── config/
│   │   └── stripe.js             # Config Stripe
│   ├── data/
│   │   └── products.json         # Données produits
│   ├── index.js                  # Serveur Express principal
│   ├── package.json
│   └── routes/
│       ├── payment.js            # Routes de paiement Stripe / PayPal
│       └── products.js           # Routes produits
├── src/
│   ├── App.tsx                   # Composant racine
│   ├── components/
│   │   ├── CartDrawer.tsx        # Tiroir du panier
│   │   ├── FeaturedProducts.tsx  # Produits en vedette
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx       # Section héro
│   │   ├── Navbar.tsx            # Barre de navigation
│   │   ├── ReviewsSlider.tsx     # Avis clients
│   │   ├── SocialSection.tsx     # Instagram & réseaux
│   │   ├── WhyChooseUs.tsx       # Pourquoi nous choisir ?
│   │   └── ui/                   # Composants UI réutilisables
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── index.ts
│   │       ├── input.tsx
│   │       └── sheet.tsx
│   ├── data/
│   │   └── products.ts          # Données produits (version statique)
│   ├── index.css                 # Styles globaux
│   ├── lib/
│   │   └── utils.ts             # Utilitaires
│   ├── main.tsx                  # Entrée React
│   ├── stores/
│   │   └── cartStore.ts         # Store panier (Zustand)
│   └── vite-env.d.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## ☁️ Déploiement et hébergement

### Frontend (Vite)

Nous recommandons **Netlify** ou **Vercel** pour un déploiement rapide du frontend.

1. Construire l’application :
   ```bash
   npm run build
   ```
2. Déployer le dossier `dist/` sur Netlify / Vercel.
3. Configurer les variables d’environnement du frontend (clés Stripe publique, PayPal Client ID, URL de l’API backend).

> 💡 **Astuce** : En production, pensez à utiliser les clés **live** (pk_live_...).

### Backend (Node.js / Express)

Vous pouvez héberger le backend sur :
- **Railway**
- **Render**
- **Heroku**
- **VPS (DigitalOcean, OVH, etc.)**

1. Dans le dossier `server/`, construisez le projet (si nécessaire).
2. Définissez les variables d’environnement (clés secrètes Stripe, PayPal, etc.)
3. Lancez le serveur :
   ```bash
   npm start
   ```

⚠️ **Ne jamais exposer les clés secrètes côté client.**

### Configuration CORS

Assurez-vous que le backend accepte les requêtes depuis l’URL de votre frontend. Dans `server/index.js`, configurez CORS avec :

```javascript
app.use(cors({ origin: 'https://votre-frontend.netlify.app' }));
```

---

## 💳 Configuration des paiements

### Stripe

#### Obtenir les clés
1. Créez un compte sur [Stripe Dashboard](https://dashboard.stripe.com/).
2. Allez dans **Developers → API Keys**.
3. Copiez la **Publishable key** (commence par `pk_`).
4. Copiez la **Secret key** (commence par `sk_`).

#### Configurer les variables
- **Frontend** `.env` : `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
- **Backend** `.env` : `STRIPE_SECRET_KEY=sk_live_...`

#### Mode test → production
1. Passez votre compte Stripe en **mode live** (Activez votre compte).
2. Générez de nouvelles clés **live** dans le dashboard.
3. Mettez à jour les variables d’environnement (frontend et backend).
4. Testez avec une vraie carte de crédit.

> Les clés de test (`pk_test_...`) fonctionnent uniquement avec les cartes de test de Stripe.

#### Endpoint API
Le backend expose une route `POST /api/create-payment-intent` qui crée une session de paiement Stripe. Le frontend utilise Stripe.js pour collecter les informations de carte et confirmer le paiement.

### PayPal

#### Obtenir les clés
1. Créez un compte développeur sur [PayPal Developer](https://developer.paypal.com/).
2. Allez dans **Dashboard → My Apps & Credentials**.
3. Créez une application **REST API**.
4. Copiez le **Client ID** (commence par `A`).
5. Copiez le **Secret** (pour le backend).

#### Configurer les variables
- **Frontend** `.env` : `VITE_PAYPAL_CLIENT_ID=AXXXXXXXXXXXXX`
- **Backend** `.env` : `PAYPAL_CLIENT_ID=AXXXXXXXXXXXXX` et `PAYPAL_SECRET=ECXXXXXXXXXXXXX`

#### Mode test → production
1. Dans votre application PayPal, passez du mode **Sandbox** à **Live**.
2. Générez un nouveau Client ID et Secret **live**.
3. Mettez à jour les variables d’environnement.
4. Le bouton PayPal côté client utilise le Client ID pour afficher le bouton ; le backend valide le paiement via l’API PayPal.

#### Endpoint API
Le backend expose `POST /api/create-paypal-order` et `POST /api/capture-paypal-order`. Le frontend utilise le SDK PayPal pour initier le flux de paiement.

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Ouvrez une issue ou une pull request.

---

## 📱 Contact

Pour toute question, contactez-nous via WhatsApp (lien dans le footer) ou par email : contact@techupantilles.com

---

*Site généré avec ❤️ pour Tech Up Antilles.*