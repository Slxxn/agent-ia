"""
Tool LLM — Interface vers le backend DeepSeek (API compatible OpenAI).

Backends supportés :
  - "deepseek" : API DeepSeek (https://api.deepseek.com) — défaut
  - "ollama"   : modèle local via Ollama (http://localhost:11434)

Configuration via variables d'environnement (chargées depuis .env) :
  LLM_BACKEND              = "deepseek" (défaut) ou "ollama"

  # DeepSeek
  DEEPSEEK_API_KEY         = sk-...
  DEEPSEEK_BASE_URL        = https://api.deepseek.com  (défaut)
  DEEPSEEK_MODEL           = deepseek-chat             (modèle rapide, défaut)
  DEEPSEEK_MODEL_POLISH    = deepseek-reasoner         (modèle qualité, polish final)

  # Ollama (local)
  OLLAMA_BASE_URL          = http://localhost:11434
  OLLAMA_MODEL             = qwen2.5-coder:7b

  # Anti-troncature
  LLM_MAX_TOKENS           = 8192
  LLM_AUTO_CONTINUE        = 1      (continuation auto si réponse tronquée)
  LLM_MAX_CONTINUATIONS    = 3

  # Polish
  POLISH_ENABLED           = 1      (passe finale de polish visuel)
"""

import os
import httpx
from typing import Dict, Any, Optional, List

# Charger automatiquement .env si python-dotenv est installé
try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except Exception:
    pass


# ─── Configuration globale ─────────────────────────────────────────────────────

LLM_BACKEND = os.getenv("LLM_BACKEND", "deepseek").lower()

# DeepSeek
DEEPSEEK_API_KEY      = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL     = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
DEEPSEEK_MODEL        = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
DEEPSEEK_MODEL_POLISH = os.getenv("DEEPSEEK_MODEL_POLISH", "deepseek-reasoner")

# Ollama
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL    = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")

# Anti-troncature
DEFAULT_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "8192"))
AUTO_CONTINUE      = os.getenv("LLM_AUTO_CONTINUE", "1") == "1"
MAX_CONTINUATIONS  = int(os.getenv("LLM_MAX_CONTINUATIONS", "3"))

DEFAULT_TIMEOUT = 240  # secondes


# ─── Système prompts ───────────────────────────────────────────────────────────

REACT_EXPORT_RULES = """\
RÈGLES IMPÉRATIVES POUR LES PROJETS REACT/TYPESCRIPT :
1. Chaque composant React DOIT avoir un export nommé ET un export default :
   export const MonComposant: React.FC = () => { ... };
   export default MonComposant;
2. CartContext DOIT exporter à la fois le contexte ET le hook :
   export const CartContext = createContext(...);
   export const useCart = () => useContext(CartContext);
   export const CartProvider = ({ children }) => { ... };
   export default CartProvider;
3. Les fichiers ui/index.ts DOIVENT ré-exporter tous les composants :
   export { Card } from './Card';
   export { Button } from './Button';
   export { Badge } from './Badge';
4. Chaque fichier importé dans App.tsx DOIT être généré. Ne laisse JAMAIS
   un import pointer vers un fichier inexistant.
5. package.json DOIT inclure TOUTES les dépendances utilisées dans le code :
   vite, @vitejs/plugin-react, react, react-dom, framer-motion, etc.
6. tsconfig.json DOIT toujours utiliser "target": "ES2020" (JAMAIS "es5" ni "es6").
   Utilise ce modèle exact pour les projets React/Vite :
   {
     "compilerOptions": {
       "target": "ES2020",
       "useDefineForClassFields": true,
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "module": "ESNext",
       "skipLibCheck": true,
       "moduleResolution": "bundler",
       "allowImportingTsExtensions": true,
       "resolveJsonModule": true,
       "isolatedModules": true,
       "noEmit": true,
       "jsx": "react-jsx",
       "strict": true
     },
     "include": ["src"]
   }
"""

ANTI_TRUNCATE_RULES = """\
RÈGLES IMPÉRATIVES DE GÉNÉRATION :
1. Ne JAMAIS écrire "...", "// reste du code", "<!-- contenu ici -->", ou tout
   placeholder. Tout le code DOIT être écrit en entier, jamais résumé.
2. Ne JAMAIS utiliser "TODO", "à compléter", "voir plus haut".
3. Toujours fermer toutes les balises HTML (notamment </body>, </html>,
   </script>, </style>, </footer>, </section>, </a>, </div>).
4. Toujours fermer chaque bloc de code Markdown par ``` (sur une ligne dédiée).
5. Si un fichier est long, écris-le quand même en entier. La taille n'est pas
   un problème.
6. Pour CHAQUE fichier produit, utilise EXACTEMENT le format suivant :

   ```filename:chemin/du/fichier.ext
   contenu complet du fichier
   ```

7. Pour une commande shell, utilise :

   ```command
   commande à exécuter
   ```

8. Ne JAMAIS écrire des commentaires du type "déjà existant", "à vérifier",
   "supposé présent", "voir fichier existant" ou tout équivalent.
   Chaque fichier généré DOIT contenir son implémentation COMPLÈTE.
9. Ne JAMAIS supposer qu'un fichier existe déjà dans le projet. Si un composant
   (Button, Badge, Sheet, store, context...) est importé, il DOIT être généré
   dans sa propre tâche avec son code complet.
10. Pour les stores/contexts React : TOUJOURS implémenter avec React Context +
    useState si Zustand n'est pas explicitement dans les dépendances du projet.
    Ne JAMAIS écrire un store vide en supposant qu'il existe ailleurs.
11. Les fichiers stores/contexts qui utilisent React (createContext, createElement,
    Provider) DOIVENT avoir l'extension .ts avec createElement() — JAMAIS de JSX
    dans un fichier .ts. Si tu as besoin de JSX (<Component>), utilise l'extension
    .tsx. Règle simple : pas de <balises> dans les fichiers .ts.11. Les fichiers stores/contexts qui utilisent React (createContext, createElement,
    Provider) DOIVENT avoir l'extension .ts avec createElement() — JAMAIS de JSX
    dans un fichier .ts. Si tu as besoin de JSX (<Component>), utilise l'extension
    .tsx. Règle simple : pas de <balises> dans les fichiers .ts.
RÈGLE ABSOLUE POUR LES COMMANDES SHELL :
- Dans les blocs `command`, ne mets JAMAIS de phrases en langage naturel.
  Ces blocs ne doivent contenir QUE des commandes shell exécutables.
- Ne génère JAMAIS de commande `cd nom_dossier` seule. Chaîne toujours avec &&
  (ex: `cd mon-dossier && npm install`).
- Ne génère JAMAIS de commandes shell pour définir des variables d'environnement.
  Utilise toujours un fichier `.env`.
- Ne génère JAMAIS de commandes npm install, npm run, npm build, pnpm install
  ou yarn. L'utilisateur les lance manuellement. Génère uniquement les fichiers.
"""

CODE_SYSTEM_PROMPT = f"""Tu es un développeur expert. Tu génères du code propre,
fonctionnel, soigné et COMPLET.

{ANTI_TRUNCATE_RULES}
{REACT_EXPORT_RULES}

DESIGN (sites web) :
- Utilise Tailwind via CDN dès que tu produis du HTML : ajoute la balise
  <script src="https://cdn.tailwindcss.com"></script> dans le <head>.
- Soigne la typographie (Google Fonts), les couleurs (palette cohérente),
  les espaces, les transitions et les micro-interactions.
- Toutes les pages d'un même site doivent partager le MÊME header et le
  MÊME footer.

QUALITÉ :
- Pas de lorem ipsum. Du vrai contenu réaliste partout.
- Code commenté brièvement aux endroits non triviaux.
- Validation des entrées utilisateur, gestion des erreurs.
"""


# ─── Classe principale ─────────────────────────────────────────────────────────

class LLMTool:
    """Outil d'appel au LLM — DeepSeek (défaut) ou Ollama (local)."""

    def __init__(
        self,
        backend: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
    ):
        self.backend = (backend or LLM_BACKEND).lower()
        # Compatibilité : anciens .env avec LLM_BACKEND=openai
        if self.backend == "openai":
            self.backend = "deepseek"
        self.timeout = DEFAULT_TIMEOUT

        if self.backend == "deepseek":
            self.model    = model or DEEPSEEK_MODEL
            self.base_url = (base_url or DEEPSEEK_BASE_URL).rstrip("/")
            # Priorité : DEEPSEEK_API_KEY, puis ancienne OPENAI_API_KEY pour compat
            self.api_key  = api_key or DEEPSEEK_API_KEY or os.getenv("OPENAI_API_KEY", "")
        else:
            self.backend  = "ollama"
            self.model    = model or OLLAMA_MODEL
            self.base_url = (base_url or OLLAMA_BASE_URL).rstrip("/")
            self.api_key  = None

    # ─── Dispatch principal ────────────────────────────────────────────────

    async def call_ollama(
        self,
        prompt: str,
        system_prompt: str = "",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        model_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Point d'entrée principal (nom historique conservé pour compatibilité)."""
        if max_tokens is None:
            max_tokens = DEFAULT_MAX_TOKENS

        if self.backend == "deepseek":
            return await self._call_deepseek_with_continuation(
                prompt, system_prompt, temperature, max_tokens, model_override
            )
        return await self._call_ollama(
            prompt, system_prompt, temperature, max_tokens, model_override
        )

    # ─── Backend Ollama ────────────────────────────────────────────────────

    async def _call_ollama(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float,
        max_tokens: int,
        model_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        try:
            messages: List[Dict[str, str]] = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            model = model_override or self.model
            payload = {
                "model": model,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens,
                },
            }

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(f"{self.base_url}/api/chat", json=payload)
                if response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Erreur Ollama ({response.status_code}) : {response.text}",
                    }
                data = response.json()
                content = data.get("message", {}).get("content", "")
                return {
                    "success": True,
                    "content": content,
                    "model": model,
                    "backend": "ollama",
                    "total_duration": data.get("total_duration", 0),
                    "eval_count": data.get("eval_count", 0),
                    "truncated": False,
                    "continuations": 0,
                }

        except httpx.ConnectError:
            return {
                "success": False,
                "error": (
                    f"Impossible de se connecter à Ollama ({self.base_url}). "
                    "Vérifiez qu'Ollama est lancé avec 'ollama serve'."
                ),
            }
        except httpx.TimeoutException:
            return {
                "success": False,
                "error": f"Timeout Ollama : la requête a dépassé {self.timeout}s.",
            }
        except Exception as e:
            return {"success": False, "error": f"Erreur Ollama inattendue : {str(e)}"}

    # ─── Backend DeepSeek (avec continuation auto) ─────────────────────────

    async def _call_deepseek_with_continuation(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float,
        max_tokens: int,
        model_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Appelle l'API DeepSeek et, si la réponse a été tronquée
        (finish_reason == "length"), relance jusqu'à MAX_CONTINUATIONS fois
        pour récupérer la suite, en concaténant les morceaux.
        """
        result = await self._call_deepseek(
            prompt, system_prompt, temperature, max_tokens, model_override
        )
        if not result.get("success"):
            return result

        if not AUTO_CONTINUE:
            return result

        full_content = result.get("content", "")
        continuations = 0
        finish_reason = result.get("finish_reason", "stop")
        total_prompt_tokens     = result.get("prompt_tokens", 0)
        total_completion_tokens = result.get("completion_tokens", 0)

        while finish_reason == "length" and continuations < MAX_CONTINUATIONS:
            continuations += 1
            cont_messages: List[Dict[str, str]] = []
            if system_prompt:
                cont_messages.append({"role": "system", "content": system_prompt})
            cont_messages.append({"role": "user", "content": prompt})
            cont_messages.append({"role": "assistant", "content": full_content})
            cont_messages.append({
                "role": "user",
                "content": (
                    "Continue EXACTEMENT là où tu t'es arrêté. "
                    "Ne répète pas ce qui précède. "
                    "Reprends directement la suite du code ou du texte."
                ),
            })

            cont_result = await self._call_deepseek_raw(
                cont_messages, temperature, max_tokens,
                model_override or self.model
            )
            if not cont_result.get("success"):
                break

            full_content += cont_result.get("content", "")
            finish_reason = cont_result.get("finish_reason", "stop")
            total_prompt_tokens     += cont_result.get("prompt_tokens", 0)
            total_completion_tokens += cont_result.get("completion_tokens", 0)

        return {
            "success": True,
            "content": full_content,
            "model": result.get("model"),
            "backend": "deepseek",
            "finish_reason": finish_reason,
            "truncated": finish_reason == "length",
            "continuations": continuations,
            "prompt_tokens": total_prompt_tokens,
            "completion_tokens": total_completion_tokens,
        }

    async def _call_deepseek(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float,
        max_tokens: int,
        model_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        messages: List[Dict[str, str]] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        return await self._call_deepseek_raw(
            messages, temperature, max_tokens, model_override or self.model
        )

    async def _call_deepseek_raw(
        self,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int,
        model: str,
    ) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "success": False,
                "error": (
                    "Clé API DeepSeek absente. "
                    "Renseignez DEEPSEEK_API_KEY dans le fichier .env du backend."
                ),
            }
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
            payload: Dict[str, Any] = {
                "model": model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            }

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                if response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Erreur DeepSeek ({response.status_code}) : {response.text}",
                    }
                data = response.json()
                choice = data.get("choices", [{}])[0]
                content = choice.get("message", {}).get("content", "")
                finish_reason = choice.get("finish_reason", "stop")
                usage = data.get("usage", {})
                return {
                    "success": True,
                    "content": content,
                    "model": data.get("model", model),
                    "backend": "deepseek",
                    "finish_reason": finish_reason,
                    "truncated": finish_reason == "length",
                    "continuations": 0,
                    "prompt_tokens": usage.get("prompt_tokens", 0),
                    "completion_tokens": usage.get("completion_tokens", 0),
                }

        except httpx.ConnectError:
            return {
                "success": False,
                "error": (
                    f"Impossible de se connecter à DeepSeek ({self.base_url}). "
                    "Vérifiez votre connexion internet."
                ),
            }
        except httpx.TimeoutException:
            return {
                "success": False,
                "error": f"Timeout DeepSeek : la requête a dépassé {self.timeout}s.",
            }
        except Exception as e:
            return {"success": False, "error": f"Erreur DeepSeek inattendue : {str(e)}"}

    # ─── Méthodes de haut niveau ───────────────────────────────────────────

    async def generate_plan(self, objective: str) -> Dict[str, Any]:
        """Générer un plan structuré pour un objectif donné."""
        system_prompt = """Tu es un agent de planification de projets logiciels.
Tu dois générer un plan structuré en JSON pour réaliser l'objectif donné.
Le plan doit contenir une liste de tâches, chacune avec :
- "description" : description claire de la tâche
- "steps" : liste des étapes concrètes à réaliser
- "tools" : liste des outils nécessaires ("filesystem", "terminal", "llm")

IMPORTANT :
- Découpe le projet en tâches FINES : 1 fichier ou 1 groupe de petits fichiers par tâche.
- Pour un projet React/Vite, chaque tâche doit générer AU MAXIMUM 2 composants.
- TOUS les fichiers importés dans App.tsx doivent avoir leur propre tâche de génération.
- Inclure une tâche dédiée pour : package.json + vite.config.ts + tsconfig.json + index.html.
- Inclure une tâche dédiée pour : tous les fichiers ui/ (Card, Button, Badge, index.ts).
- Inclure une tâche dédiée pour : le store/context (CartContext, etc.) avec implémentation
  COMPLÈTE React Context + hooks. Ne jamais générer un store vide ou supposé existant.
- Inclure une tâche dédiée pour : les données (data/products.ts, lib/utils.ts, etc.).
- Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après.

Format attendu :
{
  "tasks": [
    {
      "description": "...",
      "steps": ["...", "..."],
      "tools": ["filesystem", "terminal"]
    }
  ]
}"""
        prompt = f"Objectif du projet : {objective}\n\nGénère le plan de réalisation."
        # Utiliser le modèle pro (deepseek-reasoner) pour la planification/architecture
        model_override = DEEPSEEK_MODEL_POLISH if self.backend == "deepseek" else None
        return await self.call_ollama(
            prompt,
            system_prompt=system_prompt,
            temperature=0.3,
            model_override=model_override,
        )

    async def generate_code(
        self,
        task_description: str,
        context: str = "",
        model_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Générer du code pour une tâche donnée, avec anti-troncature."""
        prompt = task_description
        if context:
            prompt = f"Contexte du projet :\n{context}\n\nTâche : {task_description}"

        return await self.call_ollama(
            prompt,
            system_prompt=CODE_SYSTEM_PROMPT,
            temperature=0.4,
            model_override=model_override,
        )

    async def validate_result(self, task: str, result: str) -> Dict[str, Any]:
        """Valider le résultat d'une tâche."""
        system_prompt = """Tu es un vérificateur de qualité logicielle.
Analyse le résultat de la tâche et indique si c'est correct.
Réponds UNIQUEMENT en JSON :
{
  "valid": true/false,
  "reason": "explication",
  "suggestions": ["suggestion 1", "suggestion 2"]
}"""
        prompt = f"Tâche : {task}\n\nRésultat obtenu :\n{result}\n\nCe résultat est-il correct ?"
        return await self.call_ollama(prompt, system_prompt=system_prompt, temperature=0.2)

    # ─── Connexion / health ────────────────────────────────────────────────

    async def check_connection(self) -> Dict[str, Any]:
        """Vérifier la connexion au backend configuré."""
        if self.backend == "deepseek":
            return await self._check_deepseek()
        return await self._check_ollama()

    async def _check_deepseek(self) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "connected": False,
                "backend": "deepseek",
                "error": "DEEPSEEK_API_KEY non définie.",
            }
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(
                    f"{self.base_url}/models", headers=headers
                )
                if response.status_code == 200:
                    models = [
                        m.get("id", "") for m in response.json().get("data", [])
                    ]
                    return {
                        "connected": True,
                        "backend": "deepseek",
                        "target_model": self.model,
                        "model_available": self.model in models,
                        "available_models": models,
                    }
                return {
                    "connected": False,
                    "backend": "deepseek",
                    "error": f"HTTP {response.status_code}",
                }
        except Exception as e:
            return {"connected": False, "backend": "deepseek", "error": str(e)}

    async def _check_ollama(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    models = [
                        m.get("name", "") for m in response.json().get("models", [])
                    ]
                    return {
                        "connected": True,
                        "backend": "ollama",
                        "target_model": self.model,
                        "model_available": self.model in models,
                        "available_models": models,
                    }
                return {
                    "connected": False,
                    "backend": "ollama",
                    "error": f"HTTP {response.status_code}",
                }
        except Exception as e:
            return {"connected": False, "backend": "ollama", "error": str(e)}
