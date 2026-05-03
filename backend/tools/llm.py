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

# Gemini Flash (tâches simples — ultra-rapide)
GEMINI_API_KEY  = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL    = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_BASE_URL = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai")
GEMINI_TIMEOUT  = 60

# Router LLM — noms des modèles par tier
# deepseek-chat = V3 standard (flash/cheap) ; deepseek-reasoner = R1 raisonnement
# deepseek-v4-pro : à renseigner si disponible, fallback sur deepseek-chat sinon
DEEPSEEK_MODEL_FLASH    = os.getenv("DEEPSEEK_MODEL_FLASH",    "deepseek-chat")
DEEPSEEK_MODEL_REASONER = os.getenv("DEEPSEEK_MODEL_REASONER", "deepseek-reasoner")
DEEPSEEK_MODEL_PRO      = os.getenv("DEEPSEEK_MODEL_PRO",      "deepseek-chat")  # deepseek-v4-pro quand dispo
LLM_BUDGET_MODE         = os.getenv("LLM_BUDGET_MODE", "balanced")  # economy | balanced | quality


def set_budget_mode(mode: str) -> None:
    """Override LLM_BUDGET_MODE at runtime (called by runner after loading DB settings)."""
    global LLM_BUDGET_MODE
    if mode in ("economy", "balanced", "quality"):
        LLM_BUDGET_MODE = mode


def set_gemini_key(key: str) -> None:
    """Override GEMINI_API_KEY at runtime (called by runner after loading DB settings)."""
    global GEMINI_API_KEY
    GEMINI_API_KEY = key

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
7. ROUTING — Pattern OBLIGATOIRE (JAMAIS createBrowserRouter ni RouterProvider) :
   main.tsx :
     import { BrowserRouter } from 'react-router-dom';
     <BrowserRouter><App /></BrowserRouter>
   App.tsx utilise SEULEMENT <Routes> et <Route> — PAS de BrowserRouter dans App.tsx.
   Si tu génères des Context Providers (CartProvider, AuthProvider, etc.), enveloppe-les dans App.tsx AUTOUR de <Routes> :
   function App() {
     return (
       <CartProvider>
         <Routes>...</Routes>
       </CartProvider>
     );
   }
   Ne génère JAMAIS un Provider sans l'ajouter dans App.tsx.
8. COHÉRENCE DES TYPES DE STORE — Ne jamais inventer une forme différente de CartItem.
   Si CartItem est défini comme : interface CartItem extends Product { quantity: number }
   alors dans les composants :
     - accéder à item.id  (PAS item.product.id)
     - accéder à item.name  (PAS item.product.name)
     - appeler addItem(product, quantity)  (PAS addItem({ product, quantity }))
   Toujours vérifier la signature de la fonction avant de l'appeler.

9. EXEMPLE CANONIQUE — main.tsx (COPIER EXACTEMENT ce pattern) :
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>
);
```

10. EXEMPLE CANONIQUE — App.tsx (providers AUTOUR de Routes, jamais de BrowserRouter) :
```tsx
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './stores/cartStore';
import Home from './pages/Home';
function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </CartProvider>
  );
}
export default App;
```

11. EXEMPLE CANONIQUE — cartStore.tsx (TOUS ces exports sont obligatoires) :
```tsx
import { createContext, useContext, useState, ReactNode } from 'react';
interface CartItem { id: string; name: string; price: number; image: string; quantity: number; }
interface CartCtx { items: CartItem[]; addItem: (p: Omit<CartItem,'quantity'>) => void; removeItem: (id: string) => void; clearCart: () => void; total: number; itemCount: number; }
const CartContext = createContext<CartCtx | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const addItem = (p: Omit<CartItem,'quantity'>) => setItems(prev => { const ex = prev.find(i => i.id === p.id); return ex ? prev.map(i => i.id === p.id ? {...i, quantity: i.quantity+1} : i) : [...prev, {...p, quantity: 1}]; });
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setItems([]);
  const total = items.reduce((s,i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s,i) => s + i.quantity, 0);
  return <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, itemCount }}>{children}</CartContext.Provider>;
}
export const useCart = () => { const ctx = useContext(CartContext); if (!ctx) throw new Error('useCart hors CartProvider'); return ctx; };
export const useCartStore = useCart;
export default CartProvider;
```
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
    Provider) DOIVENT avoir l'extension .tsx si JSX est utilisé, ou .ts avec
    createElement() si pas de JSX. Règle simple : pas de <balises> dans les fichiers .ts.
RÈGLE ABSOLUE POUR LES CHEMINS DE FICHIERS :
- Les chemins de fichiers sont TOUJOURS relatifs à la racine du workspace.
- N'utilise JAMAIS le nom du projet comme préfixe de chemin.
  CORRECT : `src/main.tsx`, `package.json`, `src/components/Hero.tsx`
  INTERDIT : `mon-projet/src/main.tsx`, `tech-up-antilles/src/main.tsx`

RÈGLE ABSOLUE POUR LES COMMANDES SHELL :
- Dans les blocs `command`, ne mets JAMAIS de phrases en langage naturel.
  Ces blocs ne doivent contenir QUE des commandes shell exécutables.
- Ne génère JAMAIS de commande `cd`. Toutes les commandes s'exécutent déjà
  à la racine du workspace — inutile de changer de répertoire.
- Ne génère JAMAIS de commandes shell pour définir des variables d'environnement.
  Utilise toujours un fichier `.env`.
- Ne génère JAMAIS `npm install`. Les dépendances sont installées automatiquement
  par le système après la génération des fichiers.
- Ne génère PAS `npm run dev`, `npm start` ni `npm run build`.
"""

CODE_SYSTEM_PROMPT = f"""Tu es un directeur créatif et ingénieur front-end de niveau studio.
Standard de référence absolu : Vercel, Linear, Stripe Marketing, Framer.com, Lusion, Awwwards winners.
Chaque site généré doit être visuellement indiscernable d'une production d'agence premium.
Qualité > vitesse. Originalité > templates. Cohérence > variété.

{ANTI_TRUNCATE_RULES}
{REACT_EXPORT_RULES}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ÉTAPE 0 — VERROUILLER LE DESIGN SYSTEM EN PREMIER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AVANT de générer le moindre composant, définir dans globals.css ET tailwind.config.js :
  1 couleur primaire, 1-2 accents, fonds unifiés, échelle de spacing.
Tous les composants du projet DOIVENT utiliser ces variables. Aucun composant
n'invente ses propres couleurs ou tailles. Cohérence totale sur 100% du site.

▸ PALETTES DISPONIBLES — choisir UNE en fonction du domaine :

  Palette OBSIDIAN (SaaS premium, tech, IA) :
    --bg: #08080A;  --surface: #111113;  --surface2: #1A1A1E;  --border: #2A2A30;
    --primary: #7C3AED;  --primary-hover: #6D28D9;  --accent: #A78BFA;  --accent2: #38BDF8;
    --text: #F4F4F5;  --muted: #8B8B96;  --success: #10B981;

  Palette MIDNIGHT (Fintech, analytics, entreprise) :
    --bg: #020510;  --surface: #0A0F1E;  --surface2: #111827;  --border: #1E2A40;
    --primary: #3B82F6;  --primary-hover: #2563EB;  --accent: #60A5FA;  --accent2: #A78BFA;
    --text: #F1F5F9;  --muted: #64748B;  --success: #34D399;

  Palette FOREST (Santé, nature, bien-être, bio) :
    --bg: #050E0A;  --surface: #0D1A10;  --surface2: #152216;  --border: #1E3322;
    --primary: #059669;  --primary-hover: #047857;  --accent: #34D399;  --accent2: #A7F3D0;
    --text: #ECFDF5;  --muted: #6EE7B7;  --success: #10B981;

  Palette EMBER (E-commerce luxe, mode, lifestyle) :
    --bg: #0C0907;  --surface: #1A140F;  --surface2: #261E16;  --border: #3D2E21;
    --primary: #F59E0B;  --primary-hover: #D97706;  --accent: #FCD34D;  --accent2: #FB923C;
    --text: #FEF3C7;  --muted: #A1855C;  --success: #10B981;

  Palette AURORA (Créatif, agence, portfolio) :
    --bg: #060612;  --surface: #0E0E24;  --surface2: #16163A;  --border: #22224C;
    --primary: #EC4899;  --primary-hover: #DB2777;  --accent: #F472B6;  --accent2: #818CF8;
    --text: #FAF5FF;  --muted: #9CA3AF;  --success: #34D399;

  Palette BLANC (SaaS light mode, B2B, corporate) :
    --bg: #F8FAFC;  --surface: #FFFFFF;  --surface2: #F1F5F9;  --border: #E2E8F0;
    --primary: #6D28D9;  --primary-hover: #5B21B6;  --accent: #7C3AED;  --accent2: #0EA5E9;
    --text: #0F172A;  --muted: #64748B;  --success: #059669;

▸ IMPLÉMENTATION dans globals.css :
  :root {{
    --bg: [valeur]; --surface: [valeur]; /* ... toutes les variables */
  }}
  body {{ background-color: var(--bg); color: var(--text); }}

▸ IMPLÉMENTATION dans tailwind.config.js :
  extend: {{ colors: {{
    bg: 'var(--bg)', surface: 'var(--surface)', surface2: 'var(--surface2)',
    border: 'var(--border)', primary: 'var(--primary)', accent: 'var(--accent)',
    text: 'var(--text)', muted: 'var(--muted)'
  }} }}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 TYPOGRAPHIE — SYSTEM DUAL FONT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Utiliser TOUJOURS une combinaison display + body pour créer une hiérarchie visuelle forte.

▸ PAIRINGS RECOMMANDÉS (selon le projet) :

  Impact (SaaS, Tech, IA) :
    Display : 'Syne' (800, 700) — pour les H1/H2 gigantesques
    Body    : 'DM Sans' (400, 500, 600) — pour les paragraphes, labels

  Prestige (Luxe, Mode, Lifestyle) :
    Display : 'Cormorant Garamond' (600, 700) — élégance, serif
    Body    : 'DM Sans' (400, 500)

  Clean (B2B, SaaS, Corporate) :
    Display : 'Plus Jakarta Sans' (700, 800, 900)
    Body    : 'Inter' (400, 500)

  Bold (Agence, Portfolio, Créatif) :
    Display : 'Bricolage Grotesque' (700, 800) — ou 'Space Grotesk'
    Body    : 'Inter' (400, 500)

▸ Import dans index.html (adapter au pairing choisi) :
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

▸ Définir dans globals.css :
  --font-display: 'Syne', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  body {{ font-family: var(--font-body); }}
  h1, h2, h3 {{ font-family: var(--font-display); }}

▸ ÉCHELLE TYPOGRAPHIQUE — strictement appliquée :
  Hero H1      → text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight leading-[0.9]
  Section H2   → text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight
  Sub-headline → text-xl lg:text-2xl font-medium text-[var(--muted)]
  Card H3      → text-xl lg:text-2xl font-semibold leading-snug
  Body         → text-base lg:text-lg leading-relaxed opacity-70
  Label/Caption → text-xs font-semibold tracking-[0.15em] uppercase text-[var(--accent)]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 LAYOUTS — INTELLIGENCE VISUELLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⛔ INTERDIT : Empiler des sections identiques. Chaque section DOIT avoir sa propre
   densité, sa propre composition, son propre rythme visuel.

▸ VOCABULAIRE DE LAYOUTS — alterner obligatoirement :

  A) CENTRÉ LARGE (pour Hero, CTA, citations marquantes) :
    <div className="max-w-4xl mx-auto text-center">

  B) SPLIT 50/50 (pour Feature showcase, About, Problem/Solution) :
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
    → Alterner image à gauche / texte à droite ET texte à gauche / image à droite

  C) BENTO GRID (pour Features, Services, avantages) :
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
    → 1 grande card (col-span-2) + petites cards = asymétrie intentionnelle

  D) FULL-BLEED (pour backgrounds dramatiques, immersion) :
    Section sans container max-width, fond plein écran avec contenu centré

  E) TIMELINE / STEPS (pour How It Works, Process) :
    Ligne verticale ou horizontale avec points numérotés connectés

  F) MASONRY / COLUMNS (pour Testimonials, Blog, Galerie) :
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6">

▸ DENSITÉ VARIABLE — éviter la monotonie :
  Section dense (beaucoup d'info) → suivie d'une section aérée (breathing room)
  Ne jamais mettre 2 grilles denses consécutives.
  Alterner : [dense] → [respirant] → [dense] → [très aéré] → [dense]

▸ ASYMÉTRIE INTENTIONNELLE :
  Les visuels ne doivent PAS être centrés de façon systématique.
  Utiliser des décalages : translate-y, negative margins, overlapping elements.
  Ex: image qui déborde légèrement au-dessus de son container.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 EFFETS VISUELS — LANGAGE GRAPHIQUE COHÉRENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ BACKGROUNDS DE SECTION — varier obligatoirement :

  1. Radial glow (Hero, CTA) :
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-primary/8 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
    </div>

  2. Grid subtle (Features, Tech) :
    className="[background:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:40px_40px]"

  3. Noise texture (Luxe, agence) :
    Appliquer via pseudo-element dans globals.css ou SVG filter

  4. Gradient de surface (séparation douce entre sections) :
    className="bg-gradient-to-b from-[var(--bg)] via-[var(--surface)] to-[var(--bg)]"

  5. Border glow (sections CTA, highlight) :
    className="border border-primary/20 shadow-[0_0_80px_-10px_var(--primary)] rounded-3xl"

▸ SURFACE TREATMENT DES CARDS :
  Dark  : "bg-surface border border-[var(--border)] rounded-2xl"
  Glass : "bg-white/[0.03] backdrop-blur-xl border border-white/8 rounded-2xl"
  Raised: "bg-surface2 shadow-xl shadow-black/40 rounded-2xl"
  Light : "bg-white border border-slate-100 rounded-2xl shadow-sm"

▸ GRADIENT TEXT (mots clés dans titres) :
  Foncé : "bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]"
  Neutre: "bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50"

▸ TRANSITIONS DE SECTIONS — ne pas abruptement couper :
  Overlapping bottom : dernière section légèrement en -mt-px ou border-b transparent
  <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STORYTELLING SCROLL — EXPÉRIENCE NARRATIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Le site doit raconter une histoire. Chaque section est un chapitre qui s'enchaîne.
L'utilisateur doit sentir une progression narrative, pas une liste de blocs.

▸ ARC NARRATIF OBLIGATOIRE :
  Hero (accroche émotionnelle) →
  Logos (légitimité) →
  Problem (identification douleur) →
  Solution (soulagement) →
  Features (preuve de valeur) →
  How It Works (simplicité) →
  Testimonials (validation externe) →
  Pricing (décision) →
  CTA (passage à l'action)

▸ CONNEXIONS VISUELLES entre sections :
  Utiliser des éléments décoratifs qui "traversent" les frontières de sections :
  - Un glow blob centré entre 2 sections (absolute, -z-10)
  - Une ligne connectrice SVG ou border-l
  - Un numéro de section en arrière-plan (text-[8rem] opacity-5)

▸ PARALLAX SIMPLE (Framer Motion useScroll) :
  const {{ scrollYProgress }} = useScroll({{ target: sectionRef }});
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);
  // Appliquer sur l'élément visuel/image pour un léger décalage pendant le scroll

▸ PROGRESSION VISUELLE — le design évolue en scrollant :
  - Sections du haut : plus sombres/denses
  - Sections du milieu : s'éclaircissent légèrement
  - Sections CTA : retour à l'impact avec glow fort

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SYSTÈME D'ANIMATION — MOTION TOKENS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Importer : import {{ motion, useInView, useScroll, useTransform, AnimatePresence }} from 'framer-motion'
           import {{ useRef }} from 'react'

▸ TOKENS D'EASING — utiliser ces valeurs partout :
  const EASE_OUT_EXPO   = [0.16, 1, 0.3, 1]   // révélations, entrées
  const EASE_IN_OUT     = [0.76, 0, 0.24, 1]   // transitions, toggles
  const EASE_SPRING     = {{ type: "spring", stiffness: 300, damping: 30 }}

▸ MÉTHODE PRÉFÉRÉE — whileInView (ne PAS utiliser useInView sauf besoin logique) :
  <motion.div
    initial={{ opacity: 0, y: 48 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    viewport={{ once: true, margin: "-100px" }}
  >

  ⛔ INTERDIT — Ne JAMAIS faire :
  const ref = useInView({{ once: true }});    // FAUX
  const [ref, inView] = useInView();          // FAUX

  ✓ Si besoin du booléen inView :
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {{ once: true, margin: '-100px' }});

▸ STAGGER SYSTEM (grilles, listes, cards) :
  const container = {{
    hidden: {{ opacity: 0 }},
    show: {{ opacity: 1, transition: {{ staggerChildren: 0.09, delayChildren: 0.1 }} }}
  }}
  const item = {{
    hidden: {{ opacity: 0, y: 32, filter: 'blur(4px)' }},
    show: {{ opacity: 1, y: 0, filter: 'blur(0px)', transition: {{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} }}
  }}
  <motion.div variants={{container}} initial="hidden" whileInView="show" viewport={{{{ once: true }}}}>
    <motion.div variants={{item}}> ... </motion.div>
  </motion.div>

▸ ENTRÉES VARIÉES PAR TYPE DE SECTION :
  Hero (scale + fade)    : initial={{ opacity: 0, scale: 0.96 }}  → {{ opacity: 1, scale: 1 }}
  Text reveal (clip)     : initial={{ clipPath: 'inset(0 100% 0 0)' }} → {{ clipPath: 'inset(0 0% 0 0)' }}
  Slide from side        : initial={{ opacity: 0, x: -60 }} → {{ opacity: 1, x: 0 }}
  Float up with blur     : initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }} → visible

▸ HOVER MICRO-INTERACTIONS :
  Card lift  : whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(0,0,0,0.3)" }}
  Button     : whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
  Icon glow  : className="transition-all duration-300 group-hover:text-[var(--accent)] group-hover:drop-shadow-[0_0_8px_var(--accent)]"
  Link arrow : className="inline-flex items-center gap-1 group-hover:gap-2 transition-all"

▸ PARALLAX (éléments décoratifs) :
  const {{ scrollYProgress }} = useScroll({{ target: ref, offset: ["start end", "end start"] }});
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  <motion.div style={{{{ y }}}}> {{'/* blob, image, élément déco */'}} </motion.div>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ARCHETYPES DE SECTIONS — PATTERNS CONCRETS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ NAVBAR :
  fixed top-0 z-50, backdrop-blur-xl bg-[var(--bg)]/80, border-b border-[var(--border)]
  Logo (font display, bold) + nav links (font-medium) + 2 CTAs (ghost + filled)
  Mobile : hamburger avec AnimatePresence pour le menu

▸ HERO — 3 VARIANTS (choisir selon le projet) :

  Variant CENTERED (SaaS, produit) :
    min-h-screen flex flex-col items-center justify-center text-center
    Badge pill → H1 géant (8xl) → sous-titre → 2 CTAs inline → social proof row
    Visuel : mockup card absolument positionné en dessous avec glow

  Variant SPLIT (Agence, service, app) :
    grid grid-cols-1 lg:grid-cols-2 gap-16 items-center
    Gauche : badge + H1 + description + CTAs  |  Droite : visual 3D / mockup / illustration

  Variant FULL-SCREEN (Portfolio, luxe, impact) :
    h-screen overflow-hidden, titre énorme en background (opacity-10, text-[20vw])
    Contenu par-dessus, effets parallax sur le titre de fond

▸ FEATURES — 2 VARIANTS :

  Bento Grid asymétrique :
    1 grande card (col-span-2 row-span-2) + 4 petites = pattern L ou T
    Grande card : démo animée OU screenshot OU illustration SVG
    Petites cards : icône + titre + 1-2 lignes

  Split alternant (Feature showcase) :
    Chaque feature en grid 2 colonnes, image/texte alterné gauche/droite
    Connectées par une ligne verticale ou une progression numérique

▸ TESTIMONIALS — MASONRY :
  <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
  Chaque card : citation en italique + rating + avatar + nom + titre + entreprise
  Pas de grille uniforme — hauteurs différentes pour effet naturel

▸ PRICING :
  3 colonnes, celle du milieu highlighted avec ring-2 ring-[var(--primary)] + badge "Most popular"
  Toggle mensuel/annuel avec AnimatePresence pour les prix (exit: y:-10 enter: y:10)
  Chaque tier : nom + prix + description + checklist + CTA bouton

▸ CTA FINAL :
  Section plein écran relative, glow centré énorme (w-[800px] blur-[160px])
  H2 court et percutant, sous-titre 1 phrase, 2 boutons, "No card required" en dessous
  Fond : isolé de la section précédente par un gradient ou border

▸ FOOTER :
  4-5 colonnes : Brand (logo + description + socials) + Product + Company + Resources + Legal
  Bottom bar : copyright + status indicator (●Online) + changeur de langue si pertinent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 COMPOSANTS UI — SYSTÈME RÉUTILISABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ BOUTONS (dans src/components/ui/Button.tsx) :
  Variant FILLED  : bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white
                    px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20
                    transition-all duration-200 hover:shadow-primary/30 hover:scale-[1.02]
  Variant OUTLINE : border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text)]
                    bg-transparent hover:bg-[var(--surface)]
  Variant GHOST   : text-[var(--muted)] hover:text-[var(--text)] bg-transparent

▸ CARDS :
  className="group relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl
             p-6 lg:p-8 transition-all duration-300
             hover:border-[var(--accent)]/30 hover:bg-[var(--surface2)]
             hover:shadow-xl hover:shadow-[var(--primary)]/5"

▸ BADGES / LABELS :
  Section label: "inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em]
                  uppercase text-[var(--accent)] bg-[var(--accent)]/8
                  border border-[var(--accent)]/20 rounded-full px-3 py-1.5"

▸ INPUTS :
  "w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3
   text-[var(--text)] placeholder:text-[var(--muted)]
   focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)]
   transition-all duration-200"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 COPYWRITING — MARKETING QUALITY REQUISE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tout le texte DOIT être adapté au domaine spécifique du projet.
JAMAIS de lorem ipsum, placeholder, ou texte générique.

✓ FORMULES H1 puissantes (adapter au sujet) :
  "[Résultat fort]. [Bénéfice clé]. [Différenciateur]."  → "Ship faster. Break nothing. Sleep well."
  "The [superlative] [product] for [audience]."           → "The sharpest analytics for growth teams."
  "[Verbe fort] [résultat] without [douleur]."            → "Scale globally without complexity."

✓ DESCRIPTIONS de features — format BÉNÉFICE, pas fonctionnalité :
  ✗ "Real-time data synchronization"
  ✓ "Your team stays in sync, even across 12 time zones. No conflicts, ever."

✓ CTAs orientés action + urgence douce :
  "Start building for free" | "Get early access" | "See it in 2 minutes"
  "Join 10,000+ teams" | "Book a 15-min demo" | "Try it free — no card needed"

✗ JAMAIS : "Learn more" seul, "Click here", "Coming soon", "Our product", "Lorem ipsum"

▸ DONNÉES MOCK réalistes (e-commerce) :
  8+ produits avec vrais noms marketing, prix cohérents, descriptions séduisantes
  Images Unsplash réelles, ratings 4.2–4.9, review counts 47–2847

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ARCHITECTURE TECHNIQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ ROUTING : App.tsx définit toutes les routes. Jamais de lien mort.
▸ DÉPENDANCES : react, react-dom, react-router-dom, framer-motion, lucide-react, clsx, tailwind-merge
▸ VITE CONFIG : server: {{ host: true }} obligatoire
▸ RESPONSIVE : mobile-first, hamburger mobile, textes fluides (text-4xl sm:text-6xl lg:text-8xl)
▸ PERFORMANCE : viewport={{ once: true }} sur toutes les animations, loading="lazy" sur les images
▸ NO STATE INUTILE : useState uniquement si interaction réelle
"""


# ─── Routing par complexité ────────────────────────────────────────────────────

def get_model_for_complexity(complexity: str) -> Optional[str]:
    """
    Returns model_override for the given task complexity tier, or None for default.

    creative → deepseek-reasoner  (slow, architectural quality)
    standard → None               (default deepseek-chat)
    simple   → gemini-2.0-flash   (fast, if GEMINI_API_KEY set) else None
    """
    if complexity == "creative":
        return DEEPSEEK_MODEL_POLISH
    if complexity == "simple" and GEMINI_API_KEY:
        return GEMINI_MODEL
    return None


def _gemini_or(fallback: str) -> str:
    """Return Gemini model name if API key is set, else fallback DeepSeek model."""
    return GEMINI_MODEL if GEMINI_API_KEY else fallback


_ROUTE_TABLE: dict[str, dict[str, str]] = {
    # task_type -> {economy, balanced, quality}
    # Gemini Flash used for short structured tasks (planning, repair, validation)
    # DeepSeek used for long code generation (components, sections)
    "brief_creation":    {"economy": _gemini_or(DEEPSEEK_MODEL_FLASH), "balanced": _gemini_or(DEEPSEEK_MODEL_FLASH),    "quality": _gemini_or(DEEPSEEK_MODEL_FLASH)},
    "planning":          {"economy": _gemini_or(DEEPSEEK_MODEL_FLASH), "balanced": _gemini_or(DEEPSEEK_MODEL_FLASH),    "quality": DEEPSEEK_MODEL_REASONER},
    "scaffold":          {"economy": DEEPSEEK_MODEL_FLASH, "balanced": DEEPSEEK_MODEL_FLASH,    "quality": DEEPSEEK_MODEL_FLASH},
    "config":            {"economy": DEEPSEEK_MODEL_FLASH, "balanced": DEEPSEEK_MODEL_FLASH,    "quality": DEEPSEEK_MODEL_FLASH},
    "component_ui":      {"economy": DEEPSEEK_MODEL_FLASH, "balanced": DEEPSEEK_MODEL_FLASH,    "quality": DEEPSEEK_MODEL_FLASH},
    "critical_structure":{"economy": DEEPSEEK_MODEL_FLASH, "balanced": DEEPSEEK_MODEL_REASONER, "quality": DEEPSEEK_MODEL_REASONER},
    "section_emotional": {"economy": DEEPSEEK_MODEL_FLASH, "balanced": DEEPSEEK_MODEL_FLASH,    "quality": DEEPSEEK_MODEL_REASONER},
    "section_complex":   {"economy": DEEPSEEK_MODEL_FLASH, "balanced": DEEPSEEK_MODEL_REASONER, "quality": DEEPSEEK_MODEL_REASONER},
    "validator_check":   {"economy": _gemini_or(DEEPSEEK_MODEL_FLASH), "balanced": _gemini_or(DEEPSEEK_MODEL_FLASH),    "quality": _gemini_or(DEEPSEEK_MODEL_FLASH)},
    "polish_final":      {"economy": DEEPSEEK_MODEL_FLASH, "balanced": DEEPSEEK_MODEL_PRO,      "quality": DEEPSEEK_MODEL_PRO},
    "repair":            {"economy": _gemini_or(DEEPSEEK_MODEL_FLASH), "balanced": _gemini_or(DEEPSEEK_MODEL_FLASH),    "quality": _gemini_or(DEEPSEEK_MODEL_FLASH)},
}

# Tâches section_emotional phase-4 : en balanced on force PRO pour le polish
_POLISH_OVERRIDE_TYPES = {"section_emotional"}


def route_model(task_type: str, complexity: str = "normal", phase: int = 0) -> str:
    """
    Retourne le nom du modèle DeepSeek à utiliser selon :
    - task_type  : catégorie sémantique de la tâche
    - complexity : "normal" | "simple" | "creative"
    - phase      : numéro de phase (4 = polish final)

    Mode economy   → tout en flash sauf polish_final
    Mode balanced  → règles du tableau ; section_emotional phase-4 → PRO
    Mode quality   → reasoner pour sections émotionnelles ; PRO pour polish
    """
    mode = LLM_BUDGET_MODE if LLM_BUDGET_MODE in ("economy", "balanced", "quality") else "balanced"

    # Forçage phase 4 : section_emotional passe en pro en balanced/quality
    if phase == 4 and task_type in _POLISH_OVERRIDE_TYPES and mode != "economy":
        return DEEPSEEK_MODEL_PRO

    table_entry = _ROUTE_TABLE.get(task_type)
    if table_entry:
        return table_entry[mode]

    # Fallback sur la logique complexity existante
    if mode == "economy":
        return DEEPSEEK_MODEL_FLASH
    if mode == "quality" and complexity == "creative":
        return DEEPSEEK_MODEL_REASONER
    return DEEPSEEK_MODEL_FLASH


# ─── Liste interdite de phrases génériques ──────────────────────────────────
FORBIDDEN_PHRASES = [
    "bienvenue dans notre univers",
    "une expérience unique",
    "notre passion à votre service",
    "nous vous offrons le meilleur",
    "chez nous, vous êtes au cœur",
    "votre satisfaction est notre priorité",
    "nous mettons tout en œuvre",
    "une équipe de professionnels",
    "des services de qualité",
    "découvrez notre savoir-faire",
    "à votre écoute",
    "des années d'expérience",
    "parce que vous le méritez",
    "pour tous vos besoins",
    "n'hésitez pas à nous contacter",
]


def build_section_system_prompt(brief: dict, task: dict) -> str:
    """
    Construit un system prompt enrichi pour les tâches section_* et component_ui.
    Injecte les tokens de la palette, les fonts, les détails de marque et les règles éditoriales.
    """
    palette_tokens = brief.get("palette", {}).get("tokens", {})
    fonts = brief.get("fonts", {})
    brand = brief.get("brand_details", {})
    narrative_act = next(
        (n for n in brief.get("narrative", []) if n.get("id") == task.get("section_id", "")),
        {}
    )

    css_vars = "\n".join(
        f"  --{k.replace('_', '-')}: {v};" for k, v in palette_tokens.items()
    ) if palette_tokens else "  (tokens non définis — utilise var(--primary), var(--accent), etc.)"

    brand_name    = brand.get("name", "")
    brand_city    = brand.get("city", "")
    brand_method  = brand.get("unique_method", "")
    brand_phrase  = brand.get("signature_phrase", "")

    emotional_goal = narrative_act.get("emotional_goal", "")
    question       = narrative_act.get("question_answered", "")

    forbidden_list = "\n".join(f'  ✗ "{p}"' for p in FORBIDDEN_PHRASES[:8])

    display_font = fonts.get("display", "inherit")
    body_font    = fonts.get("body", "inherit")
    font_import  = fonts.get("import_url", "")

    return f"""{CODE_SYSTEM_PROMPT}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BRIEF PROJET — RÈGLES SPÉCIFIQUES À CETTE SECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ MARQUE : {brand_name}{f' ({brand_city})' if brand_city else ''}
  Méthode signature : {brand_method or '(non précisée)'}
  Phrase clé : {brand_phrase or '(non précisée)'}

▸ OBJECTIF ÉMOTIONNEL DE CETTE SECTION :
  {emotional_goal or '(non précisé)'}
  Question à laquelle répondre : {question or '(non précisée)'}

▸ TOKENS CSS — utiliser EXCLUSIVEMENT ces variables, JAMAIS de hex en dur :
  :root {{
{css_vars}
  }}
  --font-display: '{display_font}', serif;
  --font-body:    '{body_font}', sans-serif;
{f'  /* Google Fonts : {font_import} */' if font_import else ''}

▸ PATTERN OBLIGATOIRE PAR SECTION :
  1. Eyebrow  : <span> uppercase, tracking-[0.25em], font-body, text-[var(--accent)]
  2. H2       : font-display, font-bold, text-[var(--text)]
  3. Lead     : paragraphe d'intro en text-lg text-[var(--muted)]
  4. Body     : contenu principal

▸ RÈGLE COPYWRITING — au moins 1 détail concret UNIQUE par paragraphe :
  Mentionner au moins une fois : nom de la marque, ville, méthode, chiffre ou année.

▸ PHRASES GÉNÉRIQUES ABSOLUMENT INTERDITES :
{forbidden_list}
  → Remplace chaque généralité par un détail propre à {brand_name or 'cette marque'}.

▸ IMAGES — sections émotionnelles (Hero, About, Services) :
  Au moins 1 image Unsplash (URL complète en dur dans le code), ex :
  https://images.unsplash.com/photo-[ID]?w=1200&h=800&fit=crop
  Utiliser les mots-clés : {', '.join(brief.get('photos_keywords', ['wellness', 'nature'])[:5])}

▸ ANIMATIONS — max 2 intentionnelles par section (les ambiantes de fond sont OK en plus).

▸ LAYOUT — créé UNE seule fois dans src/components/layout/, importé via <Layout> dans chaque page.
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

        if model_override and model_override.startswith("gemini-"):
            return await self._call_gemini_flash(
                prompt, system_prompt, temperature, max_tokens, model_override
            )
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

            # Stitch: if the prior chunk ended with a closing ``` fence and the
            # continuation starts with raw code (no new fence header), the LLM
            # emitted a spurious close fence — remove it before appending.
            cont_chunk = cont_result.get("content", "")
            prior_stripped = full_content.rstrip()
            if prior_stripped.endswith("```") and cont_chunk and not cont_chunk.lstrip().startswith("```"):
                full_content = prior_stripped[:-3]  # strip spurious closing fence
            full_content += cont_chunk
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

    # ─── Backend Gemini Flash ──────────────────────────────────────────────

    async def _call_gemini_flash(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float,
        max_tokens: int,
        model_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Appelle Gemini via l'endpoint compatible OpenAI de Google AI Studio."""
        if not GEMINI_API_KEY:
            # Fallback silencieux vers le backend principal
            if self.backend == "deepseek":
                return await self._call_deepseek_with_continuation(
                    prompt, system_prompt, temperature, max_tokens, None
                )
            return await self._call_ollama(prompt, system_prompt, temperature, max_tokens, None)

        model = model_override or GEMINI_MODEL
        messages: List[Dict[str, str]] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            headers = {
                "Authorization": f"Bearer {GEMINI_API_KEY}",
                "Content-Type": "application/json",
            }
            payload: Dict[str, Any] = {
                "model": model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            }

            async with httpx.AsyncClient(timeout=GEMINI_TIMEOUT) as client:
                response = await client.post(
                    f"{GEMINI_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                if response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Erreur Gemini ({response.status_code}) : {response.text}",
                    }
                data = response.json()
                choice = data.get("choices", [{}])[0]
                content = choice.get("message", {}).get("content", "")
                return {
                    "success": True,
                    "content": content,
                    "model": model,
                    "backend": "gemini",
                    "finish_reason": choice.get("finish_reason", "stop"),
                    "truncated": False,
                    "continuations": 0,
                }

        except httpx.ConnectError:
            return {
                "success": False,
                "error": f"Impossible de se connecter à Gemini ({GEMINI_BASE_URL}).",
            }
        except httpx.TimeoutException:
            return {
                "success": False,
                "error": f"Timeout Gemini : la requête a dépassé {GEMINI_TIMEOUT}s.",
            }
        except Exception as e:
            return {"success": False, "error": f"Erreur Gemini inattendue : {str(e)}"}

    # ─── Méthodes de haut niveau ───────────────────────────────────────────

    async def generate_plan(self, objective: str) -> Dict[str, Any]:
        """Générer un plan structuré pour un objectif donné."""
        system_prompt = """Tu es un directeur créatif et architecte front-end de niveau studio.
Standard de qualité : Vercel, Linear, Stripe Marketing, Framer.com, Awwwards.

Tu génères un plan JSON structuré découpé en tâches FINES et autonomes.
Chaque tâche est un groupe cohérent de fichiers (max 2-3 composants par tâche).

══════════════════════════════════════════════
ÉTAPE 0 — ANALYSE DU PROJET (AVANT TOUT)
══════════════════════════════════════════════

Avant de lister les tâches, décide mentalement :
1. DOMAINE → SaaS tech / Luxe / E-commerce / Santé & bien-être / Créatif / B2B
2. PALETTE → Choisir parmi : OBSIDIAN / MIDNIGHT / FOREST / EMBER / AURORA / BLANC
3. FONT PAIRING → Choisir : Syne+DM Sans / Cormorant+DM Sans / Plus Jakarta+Inter / Bricolage+Inter
4. HERO VARIANT → Centered / Split / Full-Screen (selon impact désiré)
5. AMBIANCE → Premium & froid / Chaleureux & luxueux / Dynamique & coloré / Épuré & minimaliste

Ces décisions DOIVENT apparaître dans la description de la TÂCHE 1 (config) pour guider
tous les composants suivants.

══════════════════════════════════════════════
RÈGLES DE PLANIFICATION
══════════════════════════════════════════════
- 1 tâche = 1 responsabilité claire
- Tâche max : 2 composants React + 1 fichier de données
- TOUS les fichiers importés dans App.tsx ont leur propre tâche
- Ordre : config → design-system → layout → sections → assembly → install
- Décrire dans chaque tâche : contenu spécifique + layout variant + ambiance visuelle

══════════════════════════════════════════════
PLAN LANDING PAGE / SAAS / SERVICE / STARTUP
══════════════════════════════════════════════

TÂCHE 1 — Configuration complète
  package.json : react, react-dom, react-router-dom, framer-motion, lucide-react, clsx, tailwind-merge
  vite.config.ts : server: { host: true }
  tsconfig.json, postcss.config.js
  tailwind.config.js : étendre colors avec les variables CSS du design system
  index.html : Google Fonts (2 fonts du pairing choisi)
  ⚑ Préciser dans la description : palette choisie + font pairing + ambiance

TÂCHE 2 — Design system + utilitaires
  src/styles/globals.css : @tailwind directives + toutes variables CSS (--bg, --surface, --surface2,
    --border, --primary, --primary-hover, --accent, --accent2, --text, --muted)
    + font-family sur body et h1/h2/h3
  src/lib/utils.ts : cn(), formatPrice(), formatDate()
  src/constants/theme.ts : motion tokens (EASE_OUT_EXPO, EASE_SPRING), animation variants réutilisables
  ⚑ Préciser : couleurs exactes hex de la palette

TÂCHE 3 — Layout global : Navbar + Footer
  Navbar : fixed, backdrop-blur, logo + nav + 2 CTAs + hamburger mobile animé
  Footer : 4 colonnes + socials + copyright + gradient divider top
  ⚑ Préciser : noms des liens de nav adaptés au projet

TÂCHE 4 — Hero + Logos/Social proof
  HeroSection : variant choisi (Centered/Split/Full-Screen) + badge animé + H1 (8xl, gradient text)
    + sous-titre + 2 CTAs + social proof row (avatars + compteur) + visuel mockup + radial glow bg
  LogosSection : "Trusted by" + 6-8 entreprises fictives réalistes en grille horizontale
  ⚑ Préciser : variant hero + accroche H1 spécifique au projet + visuel hero

TÂCHE 5 — Problem + Solution
  ProblemSection : layout SPLIT ou CENTERED LARGE, 3-4 pain points avec icônes
  SolutionSection : layout alternant par rapport à Problem, liste bénéfices ou before/after
  ⚑ Préciser : problèmes et solutions SPÉCIFIQUES au domaine (pas génériques)

TÂCHE 6 — Features Grid
  FeaturesSection : bento grid asymétrique (1 grande card col-span-2 + 4-5 petites)
    OU feature showcase split (alternance gauche/droite), 6+ features
    glassmorphism cards + hover lift + stagger animation + icônes Lucide pertinentes
  ⚑ Préciser : 6 features réelles du projet avec descriptions bénéfice

TÂCHE 7 — How It Works + Testimonials
  HowItWorksSection : timeline layout, 3 étapes numérotées (01/02/03 en grand), connectées visuellement
  TestimonialsSection : masonry layout (columns CSS), 4-6 témoignages réalistes et variés en longueur
  ⚑ Préciser : étapes logiques du produit + profils témoins réalistes

TÂCHE 8 — Pricing
  PricingSection : 3 tiers (nommer avec noms liés au projet, pas Free/Pro/Enterprise générique)
    toggle mensuel/annuel + AnimatePresence pour les prix + tier central highlighted
  ⚑ Préciser : noms des tiers + prix cohérents avec le marché + features différenciatrices

TÂCHE 9 — CTA Final
  CTASection : plein écran, glow centré énorme, titre court et percutant, 2 CTAs, "No card required"
  ⚑ Préciser : CTA text adapté au produit (pas "Get started" générique)

TÂCHE 10 — Assembly : App.tsx + Home.tsx
  App.tsx : BrowserRouter + CartProvider/ContextProvider si nécessaire + Routes
  Home.tsx : assemblage dans l'ordre narratif avec Navbar/Footer
  ⚑ Vérifier : chaque composant importé a bien été créé dans les tâches précédentes

TÂCHE 11 — Installation
  Commande npm install

══════════════════════════════════════════════
PLAN E-COMMERCE
══════════════════════════════════════════════

TÂCHE 1 — Config (idem + même choix palette/fonts)
TÂCHE 2 — Design system + utils
TÂCHE 3 — Data : src/data/products.ts (12+ produits avec noms marketing, prix, images Unsplash, ratings)
TÂCHE 4 — Store panier : src/stores/cartStore.tsx (CartProvider + useCart + aliases useCartStore)
TÂCHE 5 — Layout Navbar (avec badge panier animé) + Footer
TÂCHE 6 — Composants produit : ProductCard (hover reveal, quick-add) + ProductGrid + FilterBar
TÂCHE 7 — HomePage : Hero immersif + FeaturedProducts + CategoryGrid + PromoBanner
TÂCHE 8 — ProductsPage : catalogue complet avec filtres
TÂCHE 9 — ProductDetailPage : galerie + description + add to cart + related products
TÂCHE 10 — CartPage + CheckoutPage
TÂCHE 11 — App.tsx avec toutes les routes
TÂCHE 12 — npm install

══════════════════════════════════════════════
QUALITÉ DES DESCRIPTIONS DE TÂCHES
══════════════════════════════════════════════

Chaque description de tâche DOIT être spécifique et actionnable :
- Mentionner le layout variant (Centered / Split / Bento / Masonry / Timeline)
- Mentionner l'ambiance visuelle (glassmorphism / elevated / minimal / bold)
- Mentionner les animations attendues (stagger / parallax / reveal / hover-lift)
- Mentionner le copywriting attendu (spécifique au domaine, pas générique)

Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après.

Format :
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
        # Use Gemini Flash for planning when available (fast + free); fall back to deepseek-reasoner
        model_override = route_model(task_type="planning")
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
        task_type: str = "component_ui",
        phase: int = 0,
        brief: Optional[Dict[str, Any]] = None,
        task: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Générer du code pour une tâche donnée, avec anti-troncature.

        task_type : catégorie sémantique (route_model) — voir _ROUTE_TABLE
        phase     : phase d'exécution (4 = polish final)
        brief     : brief projet complet (injecté dans le system prompt si fourni)
        task      : dict de la tâche courante (pour section_id)
        """
        SELF_CHECK = (
            "\n\n✅ AVANT DE GÉNÉRER — vérifie mentalement :\n"
            "□ Chaque hook React (useState/useEffect/useContext/useRef/useCallback) est importé depuis 'react'\n"
            "□ Chaque composant Router (Routes/Route/Link/NavLink/Navigate/Outlet) est importé depuis 'react-router-dom'\n"
            "□ Les champs accédés (item.X) correspondent EXACTEMENT à l'interface TypeScript définie\n"
            "□ Toutes les balises JSX sont fermées et les accolades équilibrées\n"
            "□ Aucun '...', 'TODO', placeholder ni fichier fantôme"
        )
        prompt = task_description + SELF_CHECK
        if context:
            prompt = f"Contexte du projet :\n{context}\n\nTâche : {task_description}{SELF_CHECK}"

        # Choisir le modèle via le router (sauf si explicitement overridé)
        if model_override is None:
            model_override = route_model(task_type=task_type, phase=phase)

        # Enrichir le system prompt si brief disponible et section émotionnelle
        if brief and task_type in ("section_emotional", "section_complex", "component_ui"):
            system = build_section_system_prompt(brief, task or {})
        else:
            system = CODE_SYSTEM_PROMPT

        return await self.call_ollama(
            prompt,
            system_prompt=system,
            temperature=0.4,
            model_override=model_override,
        )

    async def generate_targeted_fix(
        self,
        file_path: str,
        content: str,
        errors: str,
        extra_context: str = "",
    ) -> Dict[str, Any]:
        """
        Ask the LLM to fix a specific file with specific compiler errors.
        extra_context may include definitions of types/hooks used in the file.
        Returns the same structure as call_ollama() — check result["content"].
        """
        ext = file_path.rsplit(".", 1)[-1] if "." in file_path else "ts"
        context_block = f"\n\nContexte supplémentaire (types/hooks référencés) :\n{extra_context}" if extra_context else ""
        prompt = (
            f"Le fichier `{file_path}` produit les erreurs TypeScript suivantes :\n\n"
            f"{errors}"
            f"{context_block}\n\n"
            f"Contenu actuel du fichier :\n"
            f"```{ext}\n{content}\n```\n\n"
            f"Corrige UNIQUEMENT les erreurs listées. Ne modifie rien d'autre.\n"
            f"Renvoie le fichier entier corrigé dans un bloc de code :\n"
            f"```{ext}\n[contenu corrigé]\n```"
        )
        system = (
            "Tu es un expert TypeScript/React. "
            "Corrige exactement les erreurs indiquées en tenant compte du contexte fourni. "
            "Retourne le fichier complet sans explication, dans un bloc ```."
        )
        repair_model = route_model(task_type="repair")
        return await self.call_ollama(prompt, system_prompt=system, temperature=0.1, model_override=repair_model)

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
        validator_model = route_model(task_type="validator_check")
        return await self.call_ollama(prompt, system_prompt=system_prompt, temperature=0.2, model_override=validator_model)

    async def generate_image_keywords(self, objective: str, sector: str = "") -> Dict[str, str]:
        """Gemini identifie les besoins en images et génère les keywords Unsplash."""
        system = """Tu es un directeur artistique. Tu reçois un brief de site web et tu identifies les images nécessaires.
Réponds UNIQUEMENT en JSON : { "slot_name": "unsplash search query in english", ... }
Max 8 images. Slots typiques : hero, about, service_1, service_2, gallery_1, gallery_2, team, background.
Les queries doivent être précises et en anglais pour Unsplash."""
        prompt = f"Brief : {objective}\nSecteur : {sector}\nIdentifie les images nécessaires avec leurs keywords Unsplash."
        model = _gemini_or(DEEPSEEK_MODEL_FLASH)
        result = await self.call_ollama(prompt, system_prompt=system, temperature=0.2, model_override=model)
        content = result.get("content", "{}")
        import json, re
        try:
            m = re.search(r'\{[\s\S]*\}', content)
            return json.loads(m.group()) if m else {}
        except Exception:
            return {}

    async def generate_copywriting(self, objective: str, sector: str = "", brand_name: str = "") -> str:
        """Gemini génère tous les textes réalistes du site avant la génération DeepSeek."""
        system = """Tu es un copywriter expert. Tu génères du contenu textuel réaliste et percutant pour un site web.
Génère :
- Titre hero accrocheur (max 8 mots)
- Sous-titre hero (1-2 phrases)
- 3-4 services/produits avec nom, description courte et prix indicatif
- 2-3 témoignages clients réalistes avec prénom et ville
- Section "À propos" (3-4 phrases)
- 3-4 FAQ pertinentes avec réponses
- CTA principal et secondaire

Adapte 100% au secteur et à la marque. Pas de texte générique.
Réponds en français, en texte structuré avec des titres clairs."""
        prompt = f"Marque : {brand_name}\nSecteur : {sector}\nBrief : {objective}\n\nGénère tout le contenu textuel du site."
        model = _gemini_or(DEEPSEEK_MODEL_FLASH)
        result = await self.call_ollama(prompt, system_prompt=system, temperature=0.5, model_override=model)
        return result.get("content", "")

    async def check_missing_tasks(self, objective: str, tasks: list) -> str:
        """Gemini relit le plan et identifie les tâches manquantes."""
        import json
        system = """Tu es un architecte front-end. Tu reçois un brief et une liste de tâches planifiées.
Tu identifies ce qui manque : composants oubliés, pages non créées, hooks non définis, fichiers de données manquants.
Sois concis. Si tout est complet, réponds "RAS".
Réponds avec une liste courte des manques critiques uniquement."""
        tasks_str = "\n".join([f"- {t.get('description', t)}" for t in tasks[:20]])
        prompt = f"Brief : {objective}\n\nTâches planifiées :\n{tasks_str}\n\nQu'est-ce qui manque ?"
        model = _gemini_or(DEEPSEEK_MODEL_FLASH)
        result = await self.call_ollama(prompt, system_prompt=system, temperature=0.2, model_override=model)
        return result.get("content", "RAS")

    async def structure_brief(self, raw_objective: str) -> str:
        """Passe le brief brut par Gemini Flash pour le transformer en spec technique claire."""
        system = """Tu es un architecte front-end senior. Tu reçois une demande client brute et tu la transformes en spec technique précise pour un agent de génération de code.

Règles :
- Traduis les termes vagues en éléments concrets (ex: "moderne" → glassmorphism + transitions fluides, "professionnel" → palette neutre + typographie sans-serif)
- Identifie les sections de la page à créer (Hero, Features, Pricing, Contact, etc.)
- Déduis les composants React nécessaires
- Précise les couleurs si mentionnées, sinon déduis une palette cohérente
- Identifie les animations appropriées
- Mentionne explicitement les intégrations nécessaires (formulaire, paiement, auth, etc.)
- Reste concis — max 300 mots
- Réponds en français

Format de réponse :
## Sections
[liste des sections]

## Composants clés
[liste des composants React]

## Style visuel
[palette, typo, ambiance]

## Fonctionnalités
[interactions, formulaires, animations]

## Notes techniques
[points d'attention pour le dev]"""

        prompt = f"Demande client :\n{raw_objective}\n\nGénère la spec technique."
        model = _gemini_or(DEEPSEEK_MODEL_FLASH)
        result = await self.call_ollama(prompt, system_prompt=system, temperature=0.2, model_override=model)
        return result.get("content", raw_objective)

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
