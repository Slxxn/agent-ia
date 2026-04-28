"""
Agent Planner — Génère un plan structuré à partir d'un objectif utilisateur.
Utilise le LLM pour décomposer l'objectif en tâches exécutables.
"""

import json
import re
from typing import List, Dict, Any, Optional
from backend.tools.llm import LLMTool
from backend.db.database import add_log


class AgentPlanner:
    """Planificateur de l'agent : transforme un objectif en plan structuré."""

    def __init__(self, llm: LLMTool):
        self.llm = llm

    async def generate_plan(self, project_id: int, objective: str) -> List[Dict[str, Any]]:
        """
        Générer un plan de tâches à partir d'un objectif.
        Retourne une liste de tâches avec description et étapes.
        """
        await add_log(project_id, f"Planification en cours pour : {objective}", "info")

        # Analyse sémantique de l'objectif pour forcer un type de projet complexe
        complex_keywords = [
            "boutique", "shop", "e-commerce", "dashboard", "admin",
            "authentification", "paiement", "stripe", "supabase", "react", "vite",
        ]
        is_complex = any(kw in objective.lower() for kw in complex_keywords)

        enhanced_objective = objective
        if is_complex:
            enhanced_objective += (
                "\n\nCONTRAINTE ARCHITECTURALE : Ce projet DOIT être généré comme une "
                "application React Full-Stack (avec Vite). Utilise Tailwind CSS, Framer Motion, "
                "et Shadcn/UI pour un rendu moderne. Ne génère SURTOUT PAS un simple site "
                "statique (HTML/CSS/JS basique)."
                "\n\nCONTRAINTE STORES/CONTEXTS : Chaque store ou context React (panier, auth, "
                "etc.) DOIT être une tâche dédiée avec son implémentation COMPLÈTE utilisant "
                "React Context + useState + hooks exportés. Ne génère JAMAIS un fichier store "
                "vide ou avec seulement un commentaire."
                "\n\nCONTRAINTE NOMMAGE : Les hooks exportés par les stores DOIVENT s'appeler "
                "exactement comme ils sont importés dans les composants. Si un composant importe "
                "'useCart', le store DOIT exporter 'useCart'. Exporte TOUJOURS des alias pour "
                "les variantes courantes : si tu exportes 'useCart', exporte aussi "
                "'useCartStore' comme alias, et vice-versa."
            )
            await add_log(project_id, "Détection de projet complexe : Application React Full-Stack forcée.", "info")

        result = await self.llm.generate_plan(enhanced_objective)

        if not result.get("success"):
            await add_log(project_id, f"Erreur de planification : {result.get('error', 'Inconnue')}", "error")
            return self._fallback_plan(objective)

        content = result.get("content", "")
        tasks = self._parse_plan(content)

        if not tasks:
            await add_log(project_id, "Plan LLM non parsable, utilisation du plan de secours.", "warning")
            return self._fallback_plan(objective)

        # Post-traitement : injecter des tâches manquantes critiques
        tasks = self._ensure_critical_tasks(tasks, enhanced_objective)

        await add_log(project_id, f"Plan généré avec {len(tasks)} tâches.", "info")
        for i, task in enumerate(tasks):
            await add_log(project_id, f"  Tâche {i+1}: {task['description']}", "debug")

        return tasks

    def _ensure_critical_tasks(
        self, tasks: List[Dict[str, Any]], objective: str
    ) -> List[Dict[str, Any]]:
        """
        Vérifie que les tâches critiques sont présentes dans le plan.
        Injecte les tâches manquantes si nécessaire.
        """
        descriptions = " ".join(t.get("description", "").lower() for t in tasks)
        obj_lower = objective.lower()

        # Si c'est un projet React et qu'il n'y a pas de tâche store/context explicite
        is_react = any(kw in obj_lower for kw in ["react", "vite", "e-commerce", "boutique", "shop"])
        has_store_task = any(
            kw in descriptions for kw in ["store", "context", "cart", "panier", "zustand"]
        )

        if is_react and not has_store_task:
            store_task = {
                "description": (
                    "Créer le store/context du panier (src/stores/cartStore.ts) avec "
                    "implémentation COMPLÈTE : React Context, useState, hooks useCart ET "
                    "useCartStore exportés, CartProvider, CartItem interface."
                ),
                "steps": [
                    "Créer src/stores/cartStore.ts",
                    "Implémenter CartContext avec createContext",
                    "Implémenter CartProvider avec useState",
                    "Exporter useCart, useCartStore (alias), CartProvider, CartItem",
                ],
                "tools": ["filesystem"],
            }
            # Insérer après la tâche de config (package.json, vite.config, etc.)
            insert_pos = 1
            for i, t in enumerate(tasks):
                desc = t.get("description", "").lower()
                if any(kw in desc for kw in ["package.json", "vite.config", "tsconfig", "config"]):
                    insert_pos = i + 1
                    break
            tasks.insert(insert_pos, store_task)

        # Vérifier que lib/utils.ts est présent si c'est un projet Shadcn/Tailwind
        has_utils = any("utils" in t.get("description", "").lower() for t in tasks)
        if is_react and not has_utils:
            tasks.insert(
                0,
                {
                    "description": (
                        "Créer src/lib/utils.ts avec les fonctions utilitaires : "
                        "cn() (clsx + tailwind-merge) et formatPrice()."
                    ),
                    "steps": ["Créer src/lib/utils.ts", "Exporter cn et formatPrice"],
                    "tools": ["filesystem"],
                },
            )

        return tasks

    def _parse_plan(self, content: str) -> List[Dict[str, Any]]:
        """Parser la réponse JSON du LLM en liste de tâches."""
        try:
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                data = json.loads(json_match.group())
                tasks = data.get("tasks", [])
                if isinstance(tasks, list) and len(tasks) > 0:
                    normalized = []
                    for task in tasks:
                        if isinstance(task, dict) and "description" in task:
                            normalized.append({
                                "description": task["description"],
                                "steps": task.get("steps", []),
                                "tools": task.get("tools", []),
                            })
                    return normalized
        except (json.JSONDecodeError, KeyError, TypeError):
            pass

        try:
            json_match = re.search(r'\[[\s\S]*\]', content)
            if json_match:
                tasks = json.loads(json_match.group())
                if isinstance(tasks, list):
                    normalized = []
                    for task in tasks:
                        if isinstance(task, dict) and "description" in task:
                            normalized.append({
                                "description": task["description"],
                                "steps": task.get("steps", []),
                                "tools": task.get("tools", []),
                            })
                    return normalized
        except (json.JSONDecodeError, KeyError, TypeError):
            pass

        return []

    def _fallback_plan(self, objective: str) -> List[Dict[str, Any]]:
        """Plan de secours si le LLM ne répond pas correctement."""
        return [
            {
                "description": "Initialiser la structure du projet",
                "steps": [
                    "Créer les répertoires nécessaires",
                    "Initialiser les fichiers de configuration",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Générer le code source principal",
                "steps": [
                    "Analyser les besoins du projet",
                    "Créer les fichiers source principaux",
                    "Implémenter la logique métier",
                ],
                "tools": ["filesystem", "llm"],
            },
            {
                "description": "Configurer les dépendances et l'environnement",
                "steps": [
                    "Créer les fichiers de dépendances",
                    "Configurer l'environnement de développement",
                ],
                "tools": ["filesystem", "terminal"],
            },
            {
                "description": "Tester et valider le projet",
                "steps": ["Exécuter les tests", "Vérifier le fonctionnement"],
                "tools": ["terminal"],
            },
            {
                "description": "Générer la documentation README",
                "steps": [
                    "Créer le fichier README.md",
                    "Documenter l'installation et l'utilisation",
                ],
                "tools": ["filesystem", "llm"],
            },
        ]
