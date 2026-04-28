
"""
Contient les prompts détaillés pour la génération de différents types de projets.
"""

STATIC_PROJECT_PROMPT = """
Tu vas générer un site web statique en HTML, CSS et JavaScript pur.
Utilise Tailwind CSS via CDN pour le stylisme.
Assure-toi que le code est moderne, responsive et respecte les bonnes pratiques.
Le site doit être complet et fonctionnel, sans aucun placeholder.

Instructions spécifiques pour le README.md :
- Comment lancer le projet en local (ouvrir index.html).
- Options d'hébergement gratuit : Cloudflare Pages, Netlify, Vercel.
"""

REACT_NODE_SQLITE_PROJECT_PROMPT = """
Tu vas générer une application web en React (Vite, Tailwind v4, Framer Motion, lucide-react, Radix UI) pour le frontend,
avec un backend Node.js (Express ou Fastify) et une base de données SQLite.

Le frontend doit être interactif et utiliser les bibliothèques spécifiées.
Le backend doit gérer les API nécessaires à la persistance des données via SQLite.

Instructions spécifiques pour le README.md :
- Comment lancer le projet en local (frontend et backend).
- Options d'hébergement gratuit :
  - Frontend : Vercel, Netlify, Cloudflare Pages.
  - Backend : Railway, Render, Fly.io.
"""

REACT_SUPABASE_PROJECT_PROMPT = """
Tu vas générer une application web en React (Vite, Tailwind v4, Framer Motion, lucide-react, Radix UI) pour le frontend,
avec Supabase pour le backend (authentification, base de données, stockage).

Le frontend doit intégrer le client Supabase et utiliser ses fonctionnalités (auth, CRUD).

Instructions spécifiques pour le README.md :
- Comment lancer le projet en local.
- Options d'hébergement gratuit : Supabase (pour le backend), Vercel, Netlify, Cloudflare Pages (pour le frontend).
- Comment configurer les clés API Supabase.
"""

STRIPE_INTEGRATION_PROMPT = """
Intègre Stripe pour les paiements dans l'application.
Crée les endpoints API nécessaires pour la création de sessions de paiement.
Implémente le processus de checkout côté client.

Instructions spécifiques pour le README.md :
- Où obtenir les clés API Stripe (publishable key, secret key).
- Comment configurer les variables d'environnement pour les clés de test et de production.
- Étapes pour passer du mode test au mode production.
"""

PAYPAL_INTEGRATION_PROMPT = """
Intègre PayPal comme méthode de paiement alternative.
Crée les endpoints API nécessaires pour la création de commandes PayPal.
Implémente le bouton de paiement côté client.

Instructions spécifiques pour le README.md :
- Où obtenir les clés API PayPal (Client ID, Secret).
- Comment configurer les variables d'environnement pour les clés de test et de production.
- Étapes pour passer du mode test au mode production.
"""
