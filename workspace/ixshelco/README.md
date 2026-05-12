# IXSHEL&CO.

**L'art de la manucure, réinventé. Des ongles parfaits, sans compromis.**

IXSHEL&CO. est une plateforme de réservation en ligne pour un studio de manucure et nail art à domicile. Offrez-vous une expérience beauté sur-mesure, de la réservation à la prestation, en passant par le suivi de vos rendez-vous et l'historique de vos soins.

## Présentation

IXSHEL&CO. est née d'une passion : sublimer les mains avec des créations uniques, dans le confort d'un studio privé. Notre plateforme vous permet de réserver votre créneau en toute simplicité, de choisir parmi une gamme de services de manucure et de nail art, et de gérer l'intégralité de votre parcours client. Plus besoin d'attente ou de files, votre prochaine séance de beauté est à portée de clic.

Notre proposition de valeur repose sur trois piliers : une **réservation intuitive** via un calendrier interactif, une **expérience personnalisée** avec un suivi de votre historique et de vos préférences, et une **communication fluide** par email, SMS et WhatsApp. Que vous soyez une habituée ou une nouvelle cliente, IXSHEL&CO. vous offre un service premium, pensé pour vous.

## Fonctionnalités

- **Réservation en ligne** : Système de réservation complet avec calendrier interactif pour choisir votre date et votre créneau.
- **Paiement sécurisé** : Paiement en ligne intégré pour valider votre réservation en toute sérénité.
- **Authentification & Profil** : Créez votre compte, gérez vos informations personnelles et suivez l'historique de vos rendez-vous.
- **Notifications** : Recevez des confirmations et rappels par email, SMS et WhatsApp.
- **Galerie & Services** : Découvrez les prestations proposées et inspirez-vous de la galerie de réalisations.
- **FAQ** : Trouvez rapidement les réponses à vos questions les plus fréquentes.
- **Espace Admin** : Interface d'administration pour gérer les réservations, les services et les clients.

## Stack technique

| Technologie | Utilisation |
|---|---|
| [React 18](https://reactjs.org/) | Bibliothèque UI |
| [Vite](https://vitejs.dev/) | Bundler et serveur de développement |
| [TypeScript](https://www.typescriptlang.org/) | Langage de programmation |
| [Tailwind CSS](https://tailwindcss.com/) | Framework CSS utilitaire |
| [Framer Motion](https://www.framer.com/motion/) | Bibliothèque d'animations |
| [React Router](https://reactrouter.com/) | Routage côté client |
| [Zustand](https://github.com/pmndrs/zustand) | Gestion d'état |
| [Lucide React](https://lucide.dev/) | Icônes |
| [date-fns](https://date-fns.org/) | Manipulation de dates |

## Prérequis

- **Node.js** version 18 ou supérieure
- **npm** (généralement installé avec Node.js)

## Installation & Lancement

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── auth/            #   - Authentification (Login, Register)
│   ├── layout/          #   - Mise en page (Navbar, Footer)
│   ├── profile/         #   - Profil utilisateur
│   ├── sections/        #   - Sections de page (Hero, Services, etc.)
│   └── ui/              #   - Composants d'interface (Button, Card, etc.)
├── data/                # Données statiques (services, FAQ, avis)
├── lib/                 # Utilitaires (cn, formatPrice, thème)
├── pages/               # Pages de l'application (Home, Booking, Admin)
├── stores/              # Stores Zustand (auth, booking, appointments)
├── App.tsx              # Point d'entrée de l'application
├── main.tsx             # Point d'entrée React
└── index.css            # Styles globaux et variables CSS
```

## Variables d'environnement

Un fichier `.env.example` est fourni à la racine du projet. Copiez-le en `.env` et renseignez les valeurs nécessaires :

```bash
cp .env.example .env
```

Les variables suivantes sont utilisées :

- `VITE_APP_NAME` : Nom de l'application (défaut : `IXSHEL&CO.`)
- `VITE_WHATSAPP_NUMBER` : Numéro de téléphone pour le lien WhatsApp (format international, ex : `33612345678`)

## Déploiement

**Frontend (Vite) :**

Le déploiement est optimisé pour [Vercel](https://vercel.com/). Connectez votre dépôt Git et Vercel détectera automatiquement la configuration Vite.

1.  Poussez le projet sur un dépôt GitHub/GitLab.
2.  Importez le dépôt dans Vercel.
3.  Les variables d'environnement doivent être configurées dans le tableau de bord Vercel.

**Backend (si applicable) :**

Pour un backend Node.js, des plateformes comme [Railway](https://railway.app/) ou [Render](https://render.com/) sont recommandées.

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.