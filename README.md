# Agent Platform ⚙️

Une plateforme locale de gestion d'agents IA multi-projets permettant de créer automatiquement des projets logiciels complets via une interface web moderne.

## 🚀 Fonctionnalités

- **Gestion Multi-projets** : Créez et gérez plusieurs projets en parallèle.
- **Agent IA Autonome** : Planification, exécution et validation automatique des tâches.
- **Dashboard Temps Réel** : Suivez l'avancement et les logs de l'agent en direct via SSE.
- **Explorateur de Fichiers** : Visualisez la structure du workspace générée par l'agent.
- **Sandbox Sécurisée** : Toutes les opérations sont confinées dans un répertoire `workspace/`.
- **Chatbot Copilot** : Interagissez avec l'agent pour modifier un projet en cours.
- **Variables d'environnement** : Gérez les `.env` de vos projets directement depuis l'interface.
- **IA DeepSeek** : Utilise DeepSeek (deepseek-chat / deepseek-reasoner) via API, ou Ollama en local.

## 🛠 Stack Technique

- **Frontend** : Next.js 14, Tailwind CSS, TypeScript.
- **Backend** : Python 3.10+, FastAPI, SQLite (aiosqlite).
- **IA** : DeepSeek (deepseek-chat / deepseek-reasoner) via API, ou Ollama en local.
- **Temps Réel** : Server-Sent Events (SSE).

## 📋 Prérequis

1. **Python 3.10+** installé.
2. **Node.js 18+** et **pnpm** (ou npm/yarn) installés.
3. Une clé API **DeepSeek** (https://platform.deepseek.com) — ou Ollama installé en local.

## ⚙️ Installation

### 1. Cloner le projet
```bash
# Extraire l'archive ZIP
cd agent-platform
```

### 2. Configurer le Backend
```bash
cd backend
# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt
```

### 3. Configurer le Frontend
```bash
cd ../frontend/next-app
# Installer les dépendances
pnpm install  # ou npm install
```

## 🚀 Lancement

### 1. Lancer le Backend
Dans le dossier `backend` (avec l'environnement virtuel activé) :
```bash
python main.py
```
Le backend sera disponible sur `http://localhost:8000`.

### 2. Lancer le Frontend
Dans le dossier `frontend/next-app` :
```bash
pnpm dev  # ou npm run dev
```
Le dashboard sera accessible sur `http://localhost:3000`.

## Configuration LLM (`backend/.env`)

Éditez `backend/.env` et renseignez votre `DEEPSEEK_API_KEY`.
Pour utiliser Ollama en local : `LLM_BACKEND=ollama` + `OLLAMA_MODEL=qwen2.5-coder:7b`.

## Utilisation de l'Agent

1. Ouvrez le dashboard sur `http://localhost:3000`.
2. Cliquez sur **"+ Nouveau projet"** et donnez-lui un nom.
3. Allez sur la page du projet.
4. Saisissez un **Objectif** (ex: "Créer un script Python qui scrappe les titres de presse et les enregistre en JSON").
5. Cliquez sur **"Démarrer le projet"**.
6. Regardez l'agent planifier les tâches, créer les fichiers et exécuter les commandes en temps réel !

## 🔐 Sécurité

- L'agent ne peut pas sortir du répertoire `workspace/`.
- Les commandes système dangereuses sont bloquées par un filtre de sécurité.
- Toutes les actions sont loguées et visibles dans le dashboard.

## 📄 Licence

MIT
