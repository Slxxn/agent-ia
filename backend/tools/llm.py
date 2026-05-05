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
GEMINI_API_KEY   = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL     = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_MODEL_FAST = os.getenv("GEMINI_MODEL_FAST", "gemini-2.0-flash")  # no thinking — for JSON-heavy tasks
GEMINI_BASE_URL  = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai")
GEMINI_TIMEOUT   = 120

# Router LLM — noms des modèles par tier
# deepseek-chat = V3 standard (flash/cheap) ; deepseek-reasoner = R1 raisonnement
# deepseek-v4-pro : à renseigner si disponible, fallback sur deepseek-chat sinon
DEEPSEEK_MODEL_FLASH    = os.getenv("DEEPSEEK_MODEL_FLASH",    "deepseek-v4-flash")
DEEPSEEK_MODEL_REASONER = os.getenv("DEEPSEEK_MODEL_REASONER", "deepseek-reasoner")
DEEPSEEK_MODEL_PRO      = os.getenv("DEEPSEEK_MODEL_PRO",      "deepseek-v4-pro")
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
MANDATORY RULES FOR REACT/TYPESCRIPT PROJECTS:
1. Every React component MUST have both a named export AND a default export:
   export const MyComponent: React.FC = () => { ... };
   export default MyComponent;
2. CartContext MUST export both the context AND the hook:
   export const CartContext = createContext(...);
   export const useCart = () => useContext(CartContext);
   export const CartProvider = ({ children }) => { ... };
   export default CartProvider;
3. ui/index.ts files MUST re-export all components:
   export { Card } from './Card';
   export { Button } from './Button';
   export { Badge } from './Badge';
4. Every file imported in App.tsx MUST be generated. NEVER leave
   an import pointing to a non-existent file.
5. package.json MUST include ALL dependencies used in code:
   vite, @vitejs/plugin-react, react, react-dom, framer-motion, etc.
6. tsconfig.json MUST always use "target": "ES2020" (NEVER "es5" or "es6").
   Use this exact model for React/Vite projects:
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
7. ROUTING — MANDATORY pattern (NEVER createBrowserRouter or RouterProvider):
   main.tsx:
     import { BrowserRouter } from 'react-router-dom';
     <BrowserRouter><App /></BrowserRouter>
   App.tsx uses ONLY <Routes> and <Route> — NO BrowserRouter in App.tsx.
   If you generate Context Providers (CartProvider, AuthProvider, etc.), wrap them in App.tsx AROUND <Routes>:
   function App() {
     return (
       <CartProvider>
         <Routes>...</Routes>
       </CartProvider>
     );
   }
   NEVER generate a Provider without adding it to App.tsx.
8. STORE TYPE CONSISTENCY — Never invent a different shape for CartItem.
   If CartItem is defined as: interface CartItem extends Product { quantity: number }
   then in components:
     - access item.id  (NOT item.product.id)
     - access item.name  (NOT item.product.name)
     - call addItem(product, quantity)  (NOT addItem({ product, quantity }))
   Always verify the function signature before calling it.

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
export const useCart = () => { const ctx = useContext(CartContext); if (!ctx) throw new Error('useCart must be used inside CartProvider'); return ctx; };
export const useCartStore = useCart;
export default CartProvider;
```
"""

ANTI_TRUNCATE_RULES = """\
MANDATORY GENERATION RULES:
1. NEVER write "...", "// rest of code", "<!-- content here -->", or any
   placeholder. All code MUST be written in full, never summarized.
2. NEVER use "TODO", "to complete", "see above".
3. Always close all HTML tags (especially </body>, </html>,
   </script>, </style>, </footer>, </section>, </a>, </div>).
4. Always close each Markdown code block with ``` (on its own line).
5. If a file is long, write it in full anyway. Size is not
   a problem.
6. For EACH file produced, use EXACTLY this format:

   ```filename:path/to/file.ext
   complete file content
   ```

7. For a shell command, use:

   ```command
   command to execute
   ```

8. NEVER write comments like "already exists", "to verify",
   "assumed present", "see existing file" or any equivalent.
   Each generated file MUST contain its COMPLETE implementation.
9. NEVER assume a file already exists in the project. If a component
   (Button, Badge, Sheet, store, context...) is imported, it MUST be generated
   in its own task with full code.
10. For React stores/contexts: ALWAYS implement with React Context +
    useState if Zustand is not explicitly in the project dependencies.
    NEVER write an empty store assuming it exists elsewhere.
11. Store/context files that use React (createContext, createElement,
    Provider) MUST have .tsx extension if JSX is used, or .ts with
    createElement() if no JSX. Simple rule: no <tags> in .ts files.
ABSOLUTE RULE FOR FILE PATHS:
- File paths are ALWAYS relative to the workspace root.
- NEVER use the project name as a path prefix.
  CORRECT: `src/main.tsx`, `package.json`, `src/components/Hero.tsx`
  FORBIDDEN: `my-project/src/main.tsx`, `tech-up-antilles/src/main.tsx`

ABSOLUTE RULE FOR SHELL COMMANDS:
- In `command` blocks, NEVER put natural language sentences.
  These blocks must contain ONLY executable shell commands.
- NEVER generate a `cd` command. All commands already execute
  at the workspace root — no need to change directory.
- NEVER generate shell commands to set environment variables.
  Always use a `.env` file.
- NEVER generate `npm install`. Dependencies are installed automatically
  by the system after file generation.
- Do NOT generate `npm run dev`, `npm start` or `npm run build`.
"""

# ─── Modular prompt system ─────────────────────────────────────────────────────
# Each module is a self-contained block injected only when relevant to the task.
# This reduces token usage by 60-80% for non-UI tasks while keeping full quality
# for sections that need design guidance.

_PROMPT_HEADER = """You are a studio-level creative director and front-end engineer.
Absolute reference standard: Vercel, Linear, Stripe Marketing, Framer.com, Lusion, Awwwards winners.
Every generated site must be visually indistinguishable from premium agency work.
Quality > speed. Originality > templates. Consistency > variety."""

_MOD_DESIGN_SYSTEM = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STEP 0 — LOCK THE DESIGN SYSTEM FIRST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEFORE generating any component, define in globals.css AND tailwind.config.js:
  1 primary color, 1-2 accents, unified backgrounds, spacing scale.
All project components MUST use these variables. No component
invents its own colors or sizes. Total consistency across 100% of the site.

▸ AVAILABLE PALETTES — choose ONE based on the domain:

  Palette OBSIDIAN (Premium SaaS, tech, AI):
    --bg: #08080A;  --surface: #111113;  --surface2: #1A1A1E;  --border: #2A2A30;
    --primary: #7C3AED;  --primary-hover: #6D28D9;  --accent: #A78BFA;  --accent2: #38BDF8;
    --text: #F4F4F5;  --muted: #8B8B96;  --success: #10B981;

  Palette MIDNIGHT (Fintech, analytics, enterprise):
    --bg: #020510;  --surface: #0A0F1E;  --surface2: #111827;  --border: #1E2A40;
    --primary: #3B82F6;  --primary-hover: #2563EB;  --accent: #60A5FA;  --accent2: #A78BFA;
    --text: #F1F5F9;  --muted: #64748B;  --success: #34D399;

  Palette FOREST (Health, nature, wellness, organic):
    --bg: #050E0A;  --surface: #0D1A10;  --surface2: #152216;  --border: #1E3322;
    --primary: #059669;  --primary-hover: #047857;  --accent: #34D399;  --accent2: #A7F3D0;
    --text: #ECFDF5;  --muted: #6EE7B7;  --success: #10B981;

  Palette EMBER (Luxury e-commerce, fashion, lifestyle):
    --bg: #0C0907;  --surface: #1A140F;  --surface2: #261E16;  --border: #3D2E21;
    --primary: #F59E0B;  --primary-hover: #D97706;  --accent: #FCD34D;  --accent2: #FB923C;
    --text: #FEF3C7;  --muted: #A1855C;  --success: #10B981;

  Palette AURORA (Creative, agency, portfolio):
    --bg: #060612;  --surface: #0E0E24;  --surface2: #16163A;  --border: #22224C;
    --primary: #EC4899;  --primary-hover: #DB2777;  --accent: #F472B6;  --accent2: #818CF8;
    --text: #FAF5FF;  --muted: #9CA3AF;  --success: #34D399;

  Palette BLANC (Light mode SaaS, B2B, corporate):
    --bg: #F8FAFC;  --surface: #FFFFFF;  --surface2: #F1F5F9;  --border: #E2E8F0;
    --primary: #6D28D9;  --primary-hover: #5B21B6;  --accent: #7C3AED;  --accent2: #0EA5E9;
    --text: #0F172A;  --muted: #64748B;  --success: #059669;

▸ IMPLEMENTATION in globals.css:
  :root {{
    --bg: [value]; --surface: [value]; /* ... all variables */
  }}
  body {{ background-color: var(--bg); color: var(--text); }}

▸ IMPLEMENTATION in tailwind.config.js:
  extend: {{ colors: {{
    bg: 'var(--bg)', surface: 'var(--surface)', surface2: 'var(--surface2)',
    border: 'var(--border)', primary: 'var(--primary)', accent: 'var(--accent)',
    text: 'var(--text)', muted: 'var(--muted)'
  }} }}

"""

_MOD_TYPOGRAPHY = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 TYPOGRAPHY — DUAL FONT SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALWAYS use a display + body combination to create strong visual hierarchy.

▸ RECOMMENDED PAIRINGS (by project type):

  Impact (SaaS, Tech, AI):
    Display: 'Syne' (800, 700) — for giant H1/H2
    Body:    'DM Sans' (400, 500, 600) — for paragraphs, labels

  Prestige (Luxury, Fashion, Lifestyle):
    Display: 'Cormorant Garamond' (600, 700) — elegance, serif
    Body:    'DM Sans' (400, 500)

  Clean (B2B, SaaS, Corporate):
    Display: 'Plus Jakarta Sans' (700, 800, 900)
    Body:    'Inter' (400, 500)

  Bold (Agency, Portfolio, Creative):
    Display: 'Bricolage Grotesque' (700, 800) — or 'Space Grotesk'
    Body:    'Inter' (400, 500)

▸ Import in index.html (adapt to chosen pairing):
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

▸ Define in globals.css:
  --font-display: 'Syne', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  body {{ font-family: var(--font-body); }}
  h1, h2, h3 {{ font-family: var(--font-display); }}

▸ TYPOGRAPHIC SCALE — strictly applied:
  Hero H1      → text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight leading-[0.9]
  Section H2   → text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight
  Sub-headline → text-xl lg:text-2xl font-medium text-[var(--muted)]
  Card H3      → text-xl lg:text-2xl font-semibold leading-snug
  Body         → text-base lg:text-lg leading-relaxed opacity-70
  Label/Caption → text-xs font-semibold tracking-[0.15em] uppercase text-[var(--accent)]

"""

_MOD_LAYOUTS = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 LAYOUTS — VISUAL INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⛔ FORBIDDEN: Stacking identical sections. Each section MUST have its own
   density, composition, and visual rhythm.

▸ LAYOUT VOCABULARY — must alternate:

  A) CENTERED WIDE (for Hero, CTA, impactful quotes):
    <div className="max-w-4xl mx-auto text-center">

  B) SPLIT 50/50 (for Feature showcase, About, Problem/Solution):
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
    → Alternate image left / text right AND text left / image right

  C) BENTO GRID (for Features, Services, benefits):
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
    → 1 large card (col-span-2) + small cards = intentional asymmetry

  D) FULL-BLEED (for dramatic backgrounds, immersion):
    Section with no max-width container, full-screen background with centered content

  E) TIMELINE / STEPS (for How It Works, Process):
    Vertical or horizontal line with numbered connected points

  F) MASONRY / COLUMNS (for Testimonials, Blog, Gallery):
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6">

▸ VARIABLE DENSITY — avoid monotony:
  Dense section (lots of info) → followed by an airy section (breathing room)
  Never put 2 dense grids consecutively.
  Alternate: [dense] → [airy] → [dense] → [very open] → [dense]

▸ INTENTIONAL ASYMMETRY:
  Visuals must NOT be systematically centered.
  Use offsets: translate-y, negative margins, overlapping elements.
  Ex: image that slightly overflows above its container.

"""

_MOD_VISUAL_EFFECTS = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VISUAL EFFECTS — CONSISTENT GRAPHIC LANGUAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ SECTION BACKGROUNDS — must vary:

  1. Radial glow (Hero, CTA):
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-primary/8 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
    </div>

  2. Subtle grid (Features, Tech):
    className="[background:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:40px_40px]"

  3. Noise texture (Luxury, agency):
    Apply via pseudo-element in globals.css or SVG filter

  4. Surface gradient (soft separation between sections):
    className="bg-gradient-to-b from-[var(--bg)] via-[var(--surface)] to-[var(--bg)]"

  5. Border glow (CTA sections, highlight):
    className="border border-primary/20 shadow-[0_0_80px_-10px_var(--primary)] rounded-3xl"

▸ CARD SURFACE TREATMENT:
  Dark  : "bg-surface border border-[var(--border)] rounded-2xl"
  Glass : "bg-white/[0.03] backdrop-blur-xl border border-white/8 rounded-2xl"
  Raised: "bg-surface2 shadow-xl shadow-black/40 rounded-2xl"
  Light : "bg-white border border-slate-100 rounded-2xl shadow-sm"

▸ GRADIENT TEXT (key words in titles):
  Dark  : "bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]"
  Neutral: "bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50"

▸ SECTION TRANSITIONS — never abruptly cut:
  Overlapping bottom: last section slightly with -mt-px or transparent border-b
  <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

"""

_MOD_SCROLL = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SCROLL STORYTELLING — NARRATIVE EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The site must tell a story. Each section is a chapter that flows into the next.
The user must feel a narrative progression, not a list of blocks.

▸ MANDATORY NARRATIVE ARC:
  Hero (emotional hook) →
  Logos (credibility) →
  Problem (pain identification) →
  Solution (relief) →
  Features (proof of value) →
  How It Works (simplicity) →
  Testimonials (external validation) →
  Pricing (decision) →
  CTA (call to action)

▸ VISUAL CONNECTIONS between sections:
  Use decorative elements that "cross" section boundaries:
  - A glow blob centered between 2 sections (absolute, -z-10)
  - An SVG connector line or border-l
  - A section number in the background (text-[8rem] opacity-5)

▸ SIMPLE PARALLAX (Framer Motion useScroll):
  const {{ scrollYProgress }} = useScroll({{ target: sectionRef }});
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);
  // Apply on the visual/image element for a slight offset during scroll

▸ VISUAL PROGRESSION — design evolves as you scroll:
  - Top sections: darker/denser
  - Middle sections: slightly lighter
  - CTA sections: back to impact with strong glow

"""

_MOD_ANIMATION = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ANIMATION SYSTEM — MOTION TOKENS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Import: import {{ motion, useInView, useScroll, useTransform, AnimatePresence }} from 'framer-motion'
        import {{ useRef }} from 'react'

▸ EASING TOKENS — use these values everywhere:
  const EASE_OUT_EXPO   = [0.16, 1, 0.3, 1]   // révélations, entrées
  const EASE_IN_OUT     = [0.76, 0, 0.24, 1]   // transitions, toggles
  const EASE_SPRING     = {{ type: "spring", stiffness: 300, damping: 30 }}

▸ PREFERRED METHOD — whileInView (do NOT use useInView unless logically required):
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

▸ STAGGER SYSTEM (grids, lists, cards):
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

▸ VARIED ENTRIES BY SECTION TYPE:
  Hero (scale + fade)    : initial={{ opacity: 0, scale: 0.96 }}  → {{ opacity: 1, scale: 1 }}
  Text reveal (clip)     : initial={{ clipPath: 'inset(0 100% 0 0)' }} → {{ clipPath: 'inset(0 0% 0 0)' }}
  Slide from side        : initial={{ opacity: 0, x: -60 }} → {{ opacity: 1, x: 0 }}
  Float up with blur     : initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }} → visible

▸ HOVER MICRO-INTERACTIONS:
  Card lift  : whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(0,0,0,0.3)" }}
  Button     : whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
  Icon glow  : className="transition-all duration-300 group-hover:text-[var(--accent)] group-hover:drop-shadow-[0_0_8px_var(--accent)]"
  Link arrow : className="inline-flex items-center gap-1 group-hover:gap-2 transition-all"

▸ PARALLAX (decorative elements):
  const {{ scrollYProgress }} = useScroll({{ target: ref, offset: ["start end", "end start"] }});
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  <motion.div style={{{{ y }}}}> {{'/* blob, image, decorative element */'}} </motion.div>

"""

_MOD_ARCHETYPES = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION ARCHETYPES — CONCRETE PATTERNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ NAVBAR:
  fixed top-0 z-50, backdrop-blur-xl bg-[var(--bg)]/80, border-b border-[var(--border)]
  Logo (display font, bold) + nav links (font-medium) + 2 CTAs (ghost + filled)
  Mobile: hamburger with AnimatePresence for menu

▸ HERO — 3 VARIANTS (choose based on project):

  Variant CENTERED (SaaS, product):
    min-h-screen flex flex-col items-center justify-center text-center
    Badge pill → giant H1 (8xl) → subtitle → 2 inline CTAs → social proof row
    Visual: mockup card absolutely positioned below with glow

  Variant SPLIT (Agency, service, app):
    grid grid-cols-1 lg:grid-cols-2 gap-16 items-center
    Left: badge + H1 + description + CTAs  |  Right: 3D visual / mockup / illustration

  Variant FULL-SCREEN (Portfolio, luxury, impact):
    h-screen overflow-hidden, huge title in background (opacity-10, text-[20vw])
    Content on top, parallax effects on the background title

▸ FEATURES — 2 VARIANTS:

  Asymmetric Bento Grid:
    1 large card (col-span-2 row-span-2) + 4 small = L or T pattern
    Large card: animated demo OR screenshot OR SVG illustration
    Small cards: icon + title + 1-2 lines

  Alternating split (Feature showcase):
    Each feature in 2-column grid, image/text alternated left/right
    Connected by a vertical line or numeric progression

▸ TESTIMONIALS — MASONRY:
  <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
  Each card: italic quote + rating + avatar + name + title + company
  No uniform grid — different heights for natural effect

▸ PRICING:
  3 columns, middle one highlighted with ring-2 ring-[var(--primary)] + "Most popular" badge
  Monthly/annual toggle with AnimatePresence for prices (exit: y:-10 enter: y:10)
  Each tier: name + price + description + checklist + CTA button

▸ FINAL CTA:
  Relative full-screen section, huge centered glow (w-[800px] blur-[160px])
  Short punchy H2, 1-sentence subtitle, 2 buttons, "No card required" below
  Background: isolated from previous section by gradient or border

▸ FOOTER:
  4-5 columns: Brand (logo + description + socials) + Product + Company + Resources + Legal
  Bottom bar: copyright + status indicator (●Online) + language switcher if relevant

"""

_MOD_UI_COMPONENTS = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UI COMPONENTS — REUSABLE SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ BUTTONS (in src/components/ui/Button.tsx):
  Variant FILLED  : bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white
                    px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20
                    transition-all duration-200 hover:shadow-primary/30 hover:scale-[1.02]
  Variant OUTLINE : border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text)]
                    bg-transparent hover:bg-[var(--surface)]
  Variant GHOST   : text-[var(--muted)] hover:text-[var(--text)] bg-transparent

▸ CARDS:
  className="group relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl
             p-6 lg:p-8 transition-all duration-300
             hover:border-[var(--accent)]/30 hover:bg-[var(--surface2)]
             hover:shadow-xl hover:shadow-[var(--primary)]/5"

▸ BADGES / LABELS:
  Section label: "inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em]
                  uppercase text-[var(--accent)] bg-[var(--accent)]/8
                  border border-[var(--accent)]/20 rounded-full px-3 py-1.5"

▸ INPUTS:
  "w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3
   text-[var(--text)] placeholder:text-[var(--muted)]
   focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)]
   transition-all duration-200"

"""

_MOD_COPYWRITING = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 COPYWRITING — MARKETING QUALITY REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All text MUST be adapted to the specific domain of the project.
NEVER use lorem ipsum, placeholder, or generic text.

✓ Powerful H1 formulas (adapt to the subject):
  "[Strong result]. [Key benefit]. [Differentiator]."  → "Ship faster. Break nothing. Sleep well."
  "The [superlative] [product] for [audience]."        → "The sharpest analytics for growth teams."
  "[Strong verb] [result] without [pain]."             → "Scale globally without complexity."

✓ Feature descriptions — BENEFIT format, not feature:
  ✗ "Real-time data synchronization"
  ✓ "Your team stays in sync, even across 12 time zones. No conflicts, ever."

✓ Action-oriented CTAs + soft urgency:
  "Start building for free" | "Get early access" | "See it in 2 minutes"
  "Join 10,000+ teams" | "Book a 15-min demo" | "Try it free — no card needed"

✗ NEVER: "Learn more" alone, "Click here", "Coming soon", "Our product", "Lorem ipsum"

▸ Realistic MOCK DATA (e-commerce):
  8+ products with real marketing names, coherent prices, enticing descriptions
  Real Unsplash images, ratings 4.2–4.9, review counts 47–2847

"""

_MOD_TECH_ARCH = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 TECHNICAL ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ ROUTING: App.tsx defines all routes. Never leave dead links.
▸ DEPENDENCIES: react, react-dom, react-router-dom, framer-motion, lucide-react, clsx, tailwind-merge
▸ VITE CONFIG: server: {{ host: true }} mandatory
▸ RESPONSIVE: mobile-first, mobile hamburger, fluid text (text-4xl sm:text-6xl lg:text-8xl)
▸ PERFORMANCE: viewport={{ once: true }} on all animations, loading="lazy" on images
▸ NO USELESS STATE: useState only when there is a real interaction

▸ FIREBASE CONFIG — always use import.meta.env:
```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};
const app = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

▸ DEMO AUTH — MANDATORY when authentication is required:
The project runs in preview mode (VITE_DEMO_AUTH=true). Always implement a demo
fallback in the auth context so the preview works without real user accounts:
```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

const DEMO_MODE  = import.meta.env.VITE_DEMO_AUTH === 'true';
const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL ?? 'demo@preview.com';
const DEMO_PASS  = import.meta.env.VITE_DEMO_PASSWORD ?? 'preview';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return unsub;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (DEMO_MODE && email === DEMO_EMAIL && password === DEMO_PASS) {
      // Mock user for preview — no Firebase call needed
      setUser({ email, uid: 'demo-uid', displayName: 'Demo User' } as unknown as User);
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    if (DEMO_MODE) { setUser(null); return; }
    await fbSignOut(auth);
  };

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth outside AuthProvider'); return ctx; };
export default AuthProvider;
```
The login form must pre-fill the demo credentials visually:
```tsx
// Show demo hint on the login page
{import.meta.env.VITE_DEMO_AUTH === 'true' && (
  <p className="text-xs text-center text-muted mt-2 opacity-60">
    Mode démo — {import.meta.env.VITE_DEMO_EMAIL} / {import.meta.env.VITE_DEMO_PASSWORD}
  </p>
)}
```
"""

_MOD_FEWSHOT = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 FEW-SHOT QUALITY REFERENCE — COPY THESE EXACT PATTERNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ RADIAL GLOW BACKGROUND (mandatory for Hero + CTA):
```tsx
<section className="relative overflow-hidden py-32">
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[var(--primary)]/10 rounded-full blur-[120px]" />
    <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-[var(--accent)]/6 rounded-full blur-[100px]" />
  </div>
  <div className="relative z-10 max-w-7xl mx-auto px-6">{{/* content */}}</div>
</section>
```

▸ STAGGER GRID (mandatory for Features, Testimonials, Cards):
```tsx
const container = {{ hidden: {{ opacity: 0 }}, show: {{ opacity: 1, transition: {{ staggerChildren: 0.09, delayChildren: 0.15 }} }} }}
const item = {{ hidden: {{ opacity: 0, y: 32, filter: 'blur(4px)' }}, show: {{ opacity: 1, y: 0, filter: 'blur(0px)', transition: {{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} }} }}

<motion.div variants={{container}} initial="hidden" whileInView="show" viewport={{{{ once: true }}}}>
  {{cards.map((c, i) => (
    <motion.div key={{i}} variants={{item}}
      className="group bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6
                 hover:border-[var(--accent)]/30 hover:bg-[var(--surface2)] transition-all duration-300
                 hover:shadow-xl hover:shadow-[var(--primary)]/5">
      {{/* card content */}}
    </motion.div>
  ))}}
</motion.div>
```

▸ SECTION EYEBROW + HEADLINE (copy this structure every time):
```tsx
<motion.span initial={{{{ opacity: 0, y: 10 }}}} whileInView={{{{ opacity: 1, y: 0 }}}} viewport={{{{ once: true }}}}
  className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase
             text-[var(--accent)] bg-[var(--accent)]/8 border border-[var(--accent)]/20 rounded-full px-3 py-1.5 mb-6">
  ✦ SECTION LABEL
</motion.span>
<motion.h2 initial={{{{ opacity: 0, y: 24 }}}} whileInView={{{{ opacity: 1, y: 0 }}}}
  transition={{{{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}}} viewport={{{{ once: true }}}}
  className="text-4xl lg:text-6xl font-bold tracking-tight text-[var(--text)] leading-[1.1] mb-6">
  Headline with{{' '}}
  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]">
    gradient accent
  </span>
</motion.h2>
```

▸ CTA BUTTON PAIR (always use this exact pattern):
```tsx
<div className="flex flex-wrap gap-4">
  <motion.button whileHover={{{{ scale: 1.03 }}}} whileTap={{{{ scale: 0.97 }}}}
    className="inline-flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)]
               text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-[var(--primary)]/20
               hover:shadow-[var(--primary)]/30 transition-all duration-200">
    Primary CTA <ArrowRight size={{18}} />
  </motion.button>
  <motion.button whileHover={{{{ scale: 1.02 }}}}
    className="inline-flex items-center gap-2 border border-[var(--border)] hover:border-[var(--accent)]/50
               text-[var(--text)] font-medium px-8 py-4 rounded-xl hover:bg-[var(--surface)] transition-all duration-200">
    Secondary CTA
  </motion.button>
</div>
```

▸ GLASSMORPHISM CARD (for pricing, hero cards, featured boxes):
```tsx
<div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/8 rounded-2xl p-8
               shadow-2xl shadow-black/40 hover:border-[var(--accent)]/20 transition-all duration-300">
  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--accent)]/5 to-transparent pointer-events-none" />
  {{/* content */}}
</div>
```
"""

_MOD_3D_DEPTH = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 3D / IMMERSIVE EXPERIENCE — MANDATORY RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This project is a 3D immersive React/Vite experience. Apply every rule below without exception.

▸ STACK
- Three.js via @react-three/fiber (Canvas) + @react-three/drei helpers
- package.json MUST include: three, @react-three/fiber, @react-three/drei, @types/three
- Smooth scroll: @studio-freight/lenis OR framer-motion scroll — pick one, stay consistent
- Animations: framer-motion (priority) + GSAP for complex scroll timelines if needed

▸ HERO CANVAS
```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { Suspense } from 'react';

// Hero must wrap Canvas in Suspense with a dark CSS fallback for mobile/no-WebGL:
<section className="relative w-full h-screen bg-[var(--bg)]">
  <Suspense fallback={<div className="absolute inset-0 bg-[var(--bg)]" />}>
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="var(--primary)" />
      <Stars radius={100} depth={50} count={3000} factor={4} fade />
      <Environment preset="night" />
      {/* scene mesh or model here */}
    </Canvas>
  </Suspense>
  {/* overlay text on top of canvas */}
  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
    {/* headline, subline, CTA */}
  </div>
</section>
```

▸ PARTICLE SYSTEM (instanced, GPU-friendly)
```tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 2000 }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(() => {
    return Array.from({ length: count }, () => [
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
    ]);
  }, [count]);
  useFrame(({ clock }) => {
    positions.forEach(([x, y, z], i) => {
      dummy.position.set(x, y + Math.sin(clock.elapsedTime * 0.3 + i) * 0.1, z);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.015, 8, 8]} />
      <meshBasicMaterial color="var(--primary)" transparent opacity={0.7} />
    </instancedMesh>
  );
}
```

▸ SCROLL PARALLAX (framer-motion)
```tsx
import { useScroll, useTransform, motion } from 'framer-motion';
const { scrollYProgress } = useScroll();
const y = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
// <motion.div style={{ y, opacity }}> ... </motion.div>
```

▸ CUSTOM CURSOR
```tsx
// Track mouse position, render a div via React portal — no CSS cursor override
const [pos, setPos] = useState({ x: 0, y: 0 });
useEffect(() => {
  const update = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
  window.addEventListener('mousemove', update);
  return () => window.removeEventListener('mousemove', update);
}, []);
// Portal: <div style={{ left: pos.x, top: pos.y }} className="custom-cursor" />
// globals.css: body { cursor: none; } .custom-cursor { position: fixed; pointer-events: none; ... }
```

▸ COLOR SYSTEM (3D dark theme)
CSS --bg must be very dark (≈ #05050f – #0a0a0a). Use:
- --bg: #05050f (deep space) or client-provided dark tone
- --surface: #0e0e1a
- --primary: client accent (bright, saturated — it must pop on dark bg)
- --text: #e8e8f0
- All gradients: from-[var(--primary)]/20 to-transparent — subtle, not garish

▸ MOBILE FALLBACK
Wrap heavy Canvas scenes:
```tsx
const isMobile = /Mobi/i.test(navigator.userAgent);
// If isMobile, render a styled CSS fallback instead of Canvas
```
Or use Suspense + an ErrorBoundary that falls back to a CSS gradient hero.

▸ PERFORMANCE
- dpr={[1, 2]} on Canvas — caps pixel ratio
- Use instancedMesh for particle systems, never spawn hundreds of individual meshes
- Lazy-load 3D components: React.lazy + Suspense
- Keep polygon count < 50k total for the hero scene
"""

# ─── Module registry & assembly ────────────────────────────────────────────────

_ALL_MODULES = {
    "design_system":  _MOD_DESIGN_SYSTEM,
    "typography":     _MOD_TYPOGRAPHY,
    "layouts":        _MOD_LAYOUTS,
    "visual_effects": _MOD_VISUAL_EFFECTS,
    "scroll":         _MOD_SCROLL,
    "animation":      _MOD_ANIMATION,
    "archetypes":     _MOD_ARCHETYPES,
    "ui_components":  _MOD_UI_COMPONENTS,
    "copywriting":    _MOD_COPYWRITING,
    "tech_arch":      _MOD_TECH_ARCH,
    "fewshot":        _MOD_FEWSHOT,
    "3d_depth":       _MOD_3D_DEPTH,
}

# Which modules each task type receives (ordered, subset of _ALL_MODULES)
_TASK_MODULES: dict[str, list[str]] = {
    "scaffold":           [],
    "config":             ["design_system", "typography"],
    "data":               [],
    "utility":            ["tech_arch"],
    "critical_structure": ["tech_arch", "ui_components"],
    "component_ui":       ["ui_components", "visual_effects", "animation", "fewshot"],
    "section_emotional":  ["design_system", "typography", "layouts", "visual_effects",
                           "scroll", "animation", "archetypes", "ui_components", "copywriting", "fewshot"],
    "section_complex":    ["animation", "archetypes", "ui_components", "tech_arch", "copywriting", "fewshot"],
    "repair":             [],
    "planning":           [],
    "validator_check":    [],
    "polish_final":       ["visual_effects", "animation", "copywriting"],
}


def _build_design_tokens_module(design_system: dict) -> str:
    """Build a dynamic design tokens module from the client-specific design system."""
    palette = design_system.get("palette", {})
    tokens = palette.get("tokens", {})
    fonts = design_system.get("fonts", {})
    mood = design_system.get("mood", "")
    visual_style = design_system.get("visual_style", "")

    if not tokens:
        return _MOD_DESIGN_SYSTEM

    css_vars = "\n".join(f"  --{k}: {v};" for k, v in tokens.items())
    display_font = fonts.get("display", "Syne")
    body_font = fonts.get("body", "DM Sans")
    import_url = fonts.get("import_url", "")
    font_link = f'<link href="{import_url}" rel="stylesheet" />' if import_url else ""

    return f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CLIENT DESIGN SYSTEM — MANDATORY (overrides all palette defaults)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These tokens were generated specifically for this client. Use them EXCLUSIVELY.
NEVER hardcode hex colors. ALWAYS use var(--token-name).
Mood: {mood} | Visual: {visual_style}

▸ globals.css — :root block (copy EXACTLY):
:root {{
{css_vars}
  --font-display: '{display_font}', sans-serif;
  --font-body: '{body_font}', sans-serif;
}}
body {{ background-color: var(--bg); color: var(--text); font-family: var(--font-body); }}
h1, h2, h3 {{ font-family: var(--font-display); }}

▸ index.html — Google Fonts (in <head>):
  {font_link}

▸ tailwind.config.js — extend.colors:
  bg: 'var(--bg)', surface: 'var(--surface)', surface2: 'var(--surface2)',
  border: 'var(--border)', primary: 'var(--primary)', 'primary-hover': 'var(--primary-hover)',
  accent: 'var(--accent)', accent2: 'var(--accent2)', text: 'var(--text)', muted: 'var(--muted)'

▸ Typography (apply to ALL headings):
  H1 hero: text-5xl lg:text-7xl xl:text-9xl font-black tracking-tight leading-[0.9]
  H2:      text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight
  Body:    text-base lg:text-lg leading-relaxed opacity-80
"""


def get_system_prompt(
    task_type: str,
    brief: dict | None = None,
    task: dict | None = None,
    design_system: dict | None = None,
    is_3d: bool = False,
) -> str:
    """
    Assemble the system prompt from only the modules relevant to this task type.
    If design_system is provided, replaces the generic design_system module with
    client-specific tokens. For section tasks with a brief, appends brand context.
    If is_3d, prepends the 3D/immersive module.
    """
    modules = _TASK_MODULES.get(task_type, list(_ALL_MODULES.keys()))
    parts = [_PROMPT_HEADER, "\n", ANTI_TRUNCATE_RULES, "\n", REACT_EXPORT_RULES]
    if is_3d:
        parts.append(_MOD_3D_DEPTH)
    for mod_key in modules:
        if mod_key == "design_system" and design_system:
            parts.append(_build_design_tokens_module(design_system))
        else:
            parts.append(_ALL_MODULES[mod_key])

    base = "\n".join(parts)

    # Append brief-specific context for section tasks
    if brief and task_type in ("section_emotional", "section_complex", "component_ui"):
        base = _append_brief_context(base, brief, task or {})

    return base


def _append_brief_context(base: str, brief: dict, task: dict) -> str:
    """Append project-specific palette/font/brand block to the assembled prompt."""
    palette_tokens = brief.get("palette", {}).get("tokens", {})
    fonts = brief.get("fonts", {})
    brand = brief.get("brand_details", {})
    narrative_act = next(
        (n for n in brief.get("narrative", []) if n.get("id") == task.get("section_id", "")),
        {}
    )
    css_vars = "\n".join(
        f"  --{k.replace('_', '-')}: {v};" for k, v in palette_tokens.items()
    ) if palette_tokens else "  (use var(--primary), var(--accent), etc.)"

    brand_name   = brand.get("name", "")
    brand_city   = brand.get("city", "")
    brand_method = brand.get("unique_method", "")
    brand_phrase = brand.get("signature_phrase", "")
    emotional_goal = narrative_act.get("emotional_goal", "")
    question       = narrative_act.get("question_answered", "")
    forbidden_list = "\n".join(f'  ✗ "{p}"' for p in FORBIDDEN_PHRASES[:8])
    display_font = fonts.get("display", "inherit")
    body_font    = fonts.get("body", "inherit")
    font_import  = fonts.get("import_url", "")

    return base + f"""

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PROJECT BRIEF — SECTION-SPECIFIC RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ BRAND: {brand_name}{f' ({brand_city})' if brand_city else ''}
  Signature method: {brand_method or '(not specified)'}
  Key phrase: {brand_phrase or '(not specified)'}

▸ EMOTIONAL GOAL FOR THIS SECTION:
  {emotional_goal or '(not specified)'}
  Question to answer: {question or '(not specified)'}

▸ CSS TOKENS — use EXCLUSIVELY these variables, NEVER hardcoded hex:
  :root {{
{css_vars}
  }}
  --font-display: '{display_font}', serif;
  --font-body:    '{body_font}', sans-serif;
{f'  /* Google Fonts: {font_import} */' if font_import else ''}

▸ MANDATORY SECTION PATTERN:
  1. Eyebrow  : <span> uppercase, tracking-[0.25em], font-body, text-[var(--accent)]
  2. H2       : font-display, font-bold, text-[var(--text)]
  3. Lead     : intro paragraph text-lg text-[var(--muted)]
  4. Body     : main content

▸ COPYWRITING RULE — at least 1 concrete unique detail per paragraph:
  Mention at least once: brand name, city, method, number or year.

▸ ABSOLUTELY FORBIDDEN GENERIC PHRASES:
{forbidden_list}
  → Replace each generality with a detail specific to {brand_name or 'this brand'}.

▸ IMAGES — emotional sections (Hero, About, Services):
  At least 1 Unsplash image (full URL hardcoded), e.g.:
  https://images.unsplash.com/photo-[ID]?w=1200&h=800&fit=crop
  Keywords: {', '.join(brief.get('photos_keywords', ['wellness', 'nature'])[:5])}

▸ ANIMATIONS — max 2 intentional per section (ambient background effects are OK in addition).

▸ LAYOUT — created ONCE in src/components/layout/, imported via <Layout> in each page.
"""


# Backwards-compatible alias — full prompt assembled from all modules
CODE_SYSTEM_PROMPT = get_system_prompt("section_emotional")
CODE_SYSTEM_PROMPT_LITE = f"""{_PROMPT_HEADER}
Generate the requested file exactly as specified — complete, correct, no placeholders.

{ANTI_TRUNCATE_RULES}
{REACT_EXPORT_RULES}"""

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
    """Backwards-compatible wrapper — now delegates to get_system_prompt()."""
    return get_system_prompt("section_emotional", brief=brief, task=task)


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
        system_prompt = """You are a studio-level creative director and front-end architect.
Quality standard: Vercel, Linear, Stripe Marketing, Framer.com, Awwwards.

You generate a structured JSON plan broken down into FINE-grained, autonomous tasks.
Each task is a coherent group of files (max 2-3 components per task).

══════════════════════════════════════════════
STEP 0 — ANALYZE THE PROJECT (BEFORE ANYTHING)
══════════════════════════════════════════════

Before listing tasks, decide mentally:
1. DOMAIN → SaaS tech / Luxury / E-commerce / Health & wellness / Creative / B2B
2. PALETTE → Choose from: OBSIDIAN / MIDNIGHT / FOREST / EMBER / AURORA / BLANC
3. FONT PAIRING → Choose: Syne+DM Sans / Cormorant+DM Sans / Plus Jakarta+Inter / Bricolage+Inter
4. HERO VARIANT → Centered / Split / Full-Screen (based on desired impact)
5. AMBIANCE → Premium & cold / Warm & luxurious / Dynamic & colorful / Clean & minimalist

These decisions MUST appear in the TASK 1 description (config) to guide
all subsequent components.

══════════════════════════════════════════════
PLANNING RULES
══════════════════════════════════════════════
- 1 task = 1 clear responsibility
- Max per task: 2 React components + 1 data file
- ALL files imported in App.tsx have their own task
- Order: config → design-system → layout → sections → assembly → install
- Describe in each task: specific content + layout variant + visual ambiance

══════════════════════════════════════════════
LANDING PAGE / SAAS / SERVICE / STARTUP PLAN
══════════════════════════════════════════════

TASK 1 — Full configuration
  package.json: react, react-dom, react-router-dom, framer-motion, lucide-react, clsx, tailwind-merge
  vite.config.ts: server: { host: true }
  tsconfig.json, postcss.config.js
  tailwind.config.js: extend colors with design system CSS variables
  index.html: Google Fonts (2 fonts from chosen pairing)
  ⚑ Specify in description: chosen palette + font pairing + ambiance

TASK 2 — Design system + utilities
  src/styles/globals.css: @tailwind directives + all CSS variables (--bg, --surface, --surface2,
    --border, --primary, --primary-hover, --accent, --accent2, --text, --muted)
    + font-family on body and h1/h2/h3
  src/lib/utils.ts: cn(), formatPrice(), formatDate()
  src/constants/theme.ts: motion tokens (EASE_OUT_EXPO, EASE_SPRING), reusable animation variants
  ⚑ Specify: exact hex colors of the palette

TASK 3 — Global layout: Navbar + Footer
  Navbar: fixed, backdrop-blur, logo + nav + 2 CTAs + animated mobile hamburger
  Footer: 4 columns + socials + copyright + top gradient divider
  ⚑ Specify: nav link names adapted to the project

TASK 4 — Hero + Logos/Social proof
  HeroSection: chosen variant (Centered/Split/Full-Screen) + animated badge + H1 (8xl, gradient text)
    + subtitle + 2 CTAs + social proof row (avatars + counter) + mockup visual + radial glow bg
  LogosSection: "Trusted by" + 6-8 realistic fictional companies in horizontal grid
  ⚑ Specify: hero variant + project-specific H1 headline + hero visual

TASK 5 — Problem + Solution
  ProblemSection: SPLIT or CENTERED LARGE layout, 3-4 pain points with icons
  SolutionSection: alternating layout vs Problem, benefits list or before/after
  ⚑ Specify: problems and solutions SPECIFIC to the domain (not generic)

TASK 6 — Features Grid
  FeaturesSection: asymmetric bento grid (1 large col-span-2 card + 4-5 small)
    OR feature showcase split (left/right alternation), 6+ features
    glassmorphism cards + hover lift + stagger animation + relevant Lucide icons
  ⚑ Specify: 6 real project features with benefit descriptions

TASK 7 — How It Works + Testimonials
  HowItWorksSection: timeline layout, 3 numbered steps (01/02/03 large), visually connected
  TestimonialsSection: masonry layout (CSS columns), 4-6 realistic testimonials varied in length
  ⚑ Specify: logical product steps + realistic testimonial profiles

TASK 8 — Pricing
  PricingSection: 3 tiers (name them with project-related names, not generic Free/Pro/Enterprise)
    monthly/annual toggle + AnimatePresence for prices + highlighted center tier
  ⚑ Specify: tier names + market-coherent prices + differentiating features

TASK 9 — Final CTA
  CTASection: full-screen, huge centered glow, short punchy title, 2 CTAs, "No card required"
  ⚑ Specify: CTA text adapted to product (not generic "Get started")

TASK 10 — Assembly: App.tsx + Home.tsx
  App.tsx: BrowserRouter + CartProvider/ContextProvider if needed + Routes
  Home.tsx: assembly in narrative order with Navbar/Footer
  ⚑ Verify: every imported component was created in previous tasks

TASK 11 — Installation
  npm install command

══════════════════════════════════════════════
E-COMMERCE PLAN
══════════════════════════════════════════════

TASK 1 — Config (same + palette/fonts choice)
TASK 2 — Design system + utils
TASK 3 — Data: src/data/products.ts (12+ products with marketing names, prices, Unsplash images, ratings)
TASK 4 — Cart store: src/stores/cartStore.tsx (CartProvider + useCart + useCartStore aliases)
TASK 5 — Layout Navbar (with animated cart badge) + Footer
TASK 6 — Product components: ProductCard (hover reveal, quick-add) + ProductGrid + FilterBar
TASK 7 — HomePage: immersive Hero + FeaturedProducts + CategoryGrid + PromoBanner
TASK 8 — ProductsPage: full catalog with filters
TASK 9 — ProductDetailPage: gallery + description + add to cart + related products
TASK 10 — CartPage + CheckoutPage
TASK 11 — App.tsx with all routes
TASK 12 — npm install

══════════════════════════════════════════════
TASK DESCRIPTION QUALITY
══════════════════════════════════════════════

Each task description MUST be specific and actionable:
- Mention layout variant (Centered / Split / Bento / Masonry / Timeline)
- Mention visual ambiance (glassmorphism / elevated / minimal / bold)
- Mention expected animations (stagger / parallax / reveal / hover-lift)
- Mention expected copywriting (domain-specific, not generic)

Respond ONLY with valid JSON, no text before or after.

Format:
{
  "tasks": [
    {
      "description": "...",
      "steps": ["...", "..."],
      "tools": ["filesystem", "terminal"]
    }
  ]
}"""
        prompt = f"Project objective: {objective}\n\nGenerate the implementation plan."
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
        design_system: Optional[Dict[str, Any]] = None,
        is_3d: bool = False,
    ) -> Dict[str, Any]:
        """Générer du code pour une tâche donnée, avec anti-troncature.

        task_type : catégorie sémantique (route_model) — voir _ROUTE_TABLE
        phase     : phase d'exécution (4 = polish final)
        brief     : brief projet complet (injecté dans le system prompt si fourni)
        task      : dict de la tâche courante (pour section_id)
        """
        SELF_CHECK = (
            "\n\n✅ BEFORE GENERATING — check mentally:\n"
            "□ Every React hook (useState/useEffect/useContext/useRef/useCallback) is imported from 'react'\n"
            "□ Every Router component (Routes/Route/Link/NavLink/Navigate/Outlet) is imported from 'react-router-dom'\n"
            "□ Accessed fields (item.X) match EXACTLY the defined TypeScript interface\n"
            "□ All JSX tags are closed and braces are balanced\n"
            "□ No '...', 'TODO', placeholders or ghost files"
        )
        prompt = task_description + SELF_CHECK
        if context:
            prompt = f"Project context:\n{context}\n\nTask: {task_description}{SELF_CHECK}"

        # Choisir le modèle via le router (sauf si explicitement overridé)
        if model_override is None:
            model_override = route_model(task_type=task_type, phase=phase)

        system = get_system_prompt(task_type, brief=brief, task=task, design_system=design_system, is_3d=is_3d)

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
        context_block = f"\n\nAdditional context (referenced types/hooks):\n{extra_context}" if extra_context else ""
        prompt = (
            f"File `{file_path}` produces the following TypeScript errors:\n\n"
            f"{errors}"
            f"{context_block}\n\n"
            f"Current file content:\n"
            f"```{ext}\n{content}\n```\n\n"
            f"Fix ONLY the listed errors. Do not change anything else.\n"
            f"Return the complete fixed file in a code block:\n"
            f"```{ext}\n[fixed content]\n```"
        )
        system = (
            "You are a TypeScript/React expert. "
            "Fix exactly the listed errors taking the provided context into account. "
            "Return the complete file without explanation, in a ``` block."
        )
        repair_model = route_model(task_type="repair")
        return await self.call_ollama(prompt, system_prompt=system, temperature=0.1, model_override=repair_model)

    async def validate_result(self, task: str, result: str) -> Dict[str, Any]:
        """Valider le résultat d'une tâche."""
        system_prompt = """You are a software quality checker.
Analyze the task result and indicate whether it is correct.
Respond ONLY in JSON:
{
  "valid": true/false,
  "reason": "explanation",
  "suggestions": ["suggestion 1", "suggestion 2"]
}"""
        prompt = f"Task: {task}\n\nResult obtained:\n{result}\n\nIs this result correct?"
        validator_model = route_model(task_type="validator_check")
        return await self.call_ollama(prompt, system_prompt=system_prompt, temperature=0.2, model_override=validator_model)

    async def generate_image_keywords(self, objective: str, sector: str = "") -> Dict[str, str]:
        """Gemini identifie les besoins en images et génère les keywords Unsplash."""
        system = """You are an art director. You receive a website brief and identify the necessary images.
Respond ONLY in JSON: { "slot_name": "unsplash search query in english", ... }
Max 8 images. Typical slots: hero, about, service_1, service_2, gallery_1, gallery_2, team, background.
Queries must be precise and in English for Unsplash."""
        prompt = f"Brief: {objective}\nSector: {sector}\nIdentify the necessary images with their Unsplash keywords."
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
        system = """You are an expert copywriter. Generate realistic and impactful text content for a website.
Generate:
- Catchy hero title (max 8 words)
- Hero subtitle (1-2 sentences)
- 3-4 services/products with name, short description and indicative price
- 2-3 realistic client testimonials with first name and city
- "About" section (3-4 sentences)
- 3-4 relevant FAQs with answers
- Primary and secondary CTA

Adapt 100% to the sector and brand. No generic text.
Respond in French, in structured text with clear headings."""
        prompt = f"Brand: {brand_name}\nSector: {sector}\nBrief: {objective}\n\nGenerate all the website text content."
        model = _gemini_or(DEEPSEEK_MODEL_FLASH)
        result = await self.call_ollama(prompt, system_prompt=system, temperature=0.5, model_override=model)
        return result.get("content", "")

    async def check_missing_tasks(self, objective: str, tasks: list) -> str:
        """Gemini relit le plan et identifie les tâches manquantes."""
        import json
        system = """You are a front-end architect. You receive a brief and a list of planned tasks.
Identify what is missing: forgotten components, uncreated pages, undefined hooks, missing data files.
Be concise. If everything is complete, respond "NONE".
Respond with a short list of critical gaps only."""
        tasks_str = "\n".join([f"- {t.get('description', t)}" for t in tasks[:20]])
        prompt = f"Brief: {objective}\n\nPlanned tasks:\n{tasks_str}\n\nWhat is missing?"
        model = _gemini_or(DEEPSEEK_MODEL_FLASH)
        result = await self.call_ollama(prompt, system_prompt=system, temperature=0.2, model_override=model)
        return result.get("content", "RAS")

    async def structure_brief(self, raw_objective: str) -> str:
        """Passe le brief brut par Gemini Flash pour le transformer en spec technique claire."""
        system = """You are a senior front-end architect. You receive a raw client request and transform it into a precise technical spec for a code generation agent.

Rules:
- Translate vague terms into concrete elements (e.g. "modern" → glassmorphism + smooth transitions, "professional" → neutral palette + sans-serif typography)
- Identify the page sections to create (Hero, Features, Pricing, Contact, etc.)
- Deduce the necessary React components
- Specify colors if mentioned, otherwise deduce a coherent palette
- Identify appropriate animations
- Explicitly mention required integrations (form, payment, auth, etc.)
- Stay concise — max 300 words
- Respond in French

Response format:
## Sections
[section list]

## Key Components
[React component list]

## Visual Style
[palette, typography, ambiance]

## Features
[interactions, forms, animations]

## Technical Notes
[dev attention points]"""

        prompt = f"Client request:\n{raw_objective}\n\nGenerate the technical spec."
        model = _gemini_or(DEEPSEEK_MODEL_FLASH)
        result = await self.call_ollama(prompt, system_prompt=system, temperature=0.2, model_override=model)
        return result.get("content", raw_objective)

    async def generate_site_spec(self, objective: str, design_system: dict | None = None, is_3d: bool = False, is_scrollytelling: bool = False, project_id: int | None = None) -> dict | None:
        """
        Generate a structured JSON site spec from the client brief.
        Returns a dict matching the Assembler spec format, or None on failure.
        """
        ds_hint = ""
        if design_system:
            tokens = design_system.get("palette", {}).get("tokens", {})
            fonts = design_system.get("fonts", {})
            ds_hint = f"""
Design system already generated:
- Primary: {tokens.get("primary", "#6366f1")}
- Accent: {tokens.get("accent", "#818cf8")}
- Accent2: {tokens.get("accent2", "#38bdf8")}
- Background: {tokens.get("bg", "#0f0f12")}
- Surface: {tokens.get("surface", "#1a1a1f")}
- Display font: {fonts.get("display", "Plus Jakarta Sans")}
- Body font: {fonts.get("body", "Inter")}
Use EXACTLY these values in the theme object.
"""

        three_blocks = """
3D BLOCKS (use ONLY when is_3d=true):
- Hero3D: Three.js particle field hero. Props: badge?, headline, headlineAccent?, sub, cta{label,href}, ctaSecondary?, particleColor?, particleCount?
- Scene3D: Interactive 3D objects + feature list side by side. Props: badge?, headline, headlineAccent?, sub?, features[{icon,title,description}], accentColor?
- ParallaxSection: Deep parallax scroll with floating layers. Props: badge?, headline, headlineAccent?, sub?, backgroundImageUrl?, accentColor?, items?[{icon,title,description}]
- WaveSection: Animated Three.js wire-frame wave in background with centered text + optional feature grid. Props: badge?, headline, headlineAccent?, sub?, cta?, ctaSecondary?, waveColor?, features?[{icon,title,description}]
- MorphBlob: Morphing 3D blob (WebGL) side-by-side with text + stats. Props: badge?, headline, headlineAccent?, sub?, cta?, ctaSecondary?, blobColor?, blobColor2?, stats?[{value,label}]
- FloatingCards3D: Cards with mouse-tracked 3D tilt effect (no Three.js). Props: badge?, headline, headlineAccent?, sub?, cards[{icon,title,description,accentColor?}]
""" if is_3d else """
- FloatingCards3D: Cards with mouse-tracked 3D tilt effect. Props: badge?, headline, headlineAccent?, sub?, cards[{icon,title,description,accentColor?}]
"""

        scrollytelling_blocks = """
SCROLLYTELLING BLOCKS (use ONLY when is_scrollytelling=true — single page, no routing):
- ScrollHero: Full-viewport parallax hero with scroll-linked fade. Props: badge?, headline, headlineAccent?, sub?, cta?, backgroundImageUrl?, overlayColor?
- ScrollChapter: Alternating text + parallax image sections for storytelling. Props: chapterNumber?, headline, headlineAccent?, body, imageUrl?, imageAlt?, reverse?, accentColor?
- ScrollReveal: Animated vertical timeline/steps revealed as user scrolls. Props: badge?, headline, headlineAccent?, items[{icon?,title,description}], accentColor?
- ScrollOutro: Full-screen scroll-scaled final CTA. Props: headline, headlineAccent?, sub?, cta{label,href}, ctaSecondary?, accentColor?
""" if is_scrollytelling else ""

        if is_scrollytelling:
            hero_rule = "3. This is a SCROLLYTELLING site: ONE page only (path '/'), start with ScrollHero, use ScrollChapter + ScrollReveal for the body, end with ScrollOutro. No other pages."
            extra_3d_rule = ""
        elif is_3d:
            hero_rule = "3. Every page must start with a Hero3D block"
            extra_3d_rule = "8. MANDATORY for 3D: use Hero3D on Home page, WaveSection or MorphBlob on at least 1 other page, Scene3D and ParallaxSection spread across pages. Very dark bg (#060608 to #0a0a10)."
        else:
            hero_rule = "3. Every page must start with a Hero block (HeroA, HeroB, or HeroC)"
            extra_3d_rule = ""

        _json_example = '''OUTPUT FORMAT (JSON):
{
  "title": "Site Name",
  "brand": { "name": "BrandName", "tagline": "Short tagline", "logoUrl": null },
  "theme": {
    "primary": "#6366f1",
    "primaryHover": "#4f46e5",
    "accent": "#818cf8",
    "accent2": "#38bdf8",
    "bg": "#0f0f12",
    "surface": "#1a1a1f"
  },
  "navbar": {
    "links": [{"label": "Accueil", "href": "/"}, ...],
    "cta": {"label": "Réserver", "href": "/contact"}
  },
  "footer": {
    "columns": [
      {"title": "Navigation", "links": [{"label": "Accueil", "href": "/"}]},
      {"title": "Contact", "links": [{"label": "Nous contacter", "href": "/contact"}]}
    ],
    "socials": [{"platform": "instagram", "url": "https://instagram.com"}],
    "legal": "Tous droits réservés."
  },
  "pages": [
    {
      "path": "/",
      "name": "Accueil",
      "file": "Home",
      "blocks": [
        { "block": "HeroA", "props": { "headline": "...", "sub": "...", "cta": {"label": "...", "href": "/contact"} } },
        { "block": "FeaturesGrid", "props": { "headline": "...", "features": [...] } }
      ]
    }
  ]
}'''

        system = (
            "You are a senior front-end architect. Given a client brief, produce a JSON site spec that assembles a website from pre-built React blocks.\n\n"
            "AVAILABLE BLOCKS:\n"
            "- HeroA: centered hero, gradient orbs. Props: badge?, headline, headlineAccent?, sub, cta{label,href}, ctaSecondary?{label,href}, showScrollIndicator?, stats?[{value,label}]\n"
            "- HeroB: split hero (text left, image right). Props: badge?, headline, headlineAccent?, sub, cta, ctaSecondary?, imageUrl, imageAlt?, trustText?, avatarUrls?[]\n"
            "- HeroC: full-bleed background image hero. Props: headline, headlineAccent?, sub, cta, ctaSecondary?, backgroundImageUrl, overlayOpacity?, showScrollIndicator?\n"
            "- FeaturesGrid: 3-col icon grid. Props: badge?, headline, headlineAccent?, sub?, features[{icon,title,description}], columns?(2|3|4)\n"
            "- FeaturesCards: numbered or alternating steps. Props: badge?, headline, headlineAccent?, sub?, items[{icon?,title,description,imageUrl?}], layout?(\"numbered\"|\"alternating\")\n"
            "- TestimonialsGrid: masonry testimonials. Props: badge?, headline, headlineAccent?, items[{quote,author,role?,company?,avatarUrl?,rating?}]\n"
            "- PricingCards: 2-3 tier pricing. Props: badge?, headline, headlineAccent?, sub?, plans[{name,price{monthly,yearly},description,features[],cta{label,href},highlighted?,badge?}]\n"
            "- FaqAccordion: expandable FAQ. Props: badge?, headline, headlineAccent?, items[{question,answer}]\n"
            "- CtaBanner: call to action. Props: headline, headlineAccent?, sub?, cta{label,href}, ctaSecondary?, variant?(\"gradient\"|\"bordered\"|\"dark\")\n"
            "- ContactForm: contact section with form. Props: badge?, headline, headlineAccent?, sub?, info?{address?,email?,phone?}, submitLabel?, successMessage?\n"
            "- GalleryGrid: image grid with lightbox. Props: badge?, headline, headlineAccent?, sub?, images[{url,alt?,caption?}], columns?(2|3|4)\n"
            "- LogoStrip: client/partner logos strip. Props: badge?, headline?, logos[{name,url?}]\n"
            "- StatsRow: key metrics in a grid row. Props: badge?, headline?, stats[{value,label,description?}]\n"
            "- TeamGrid: team member cards. Props: badge?, headline, headlineAccent?, sub?, members[{name,role,bio?,avatarUrl?}]\n"
            "- Timeline: company history / roadmap. Props: badge?, headline, headlineAccent?, sub?, events[{year,title,description,icon?}]\n"
            "- ReviewsCarousel: animated reviews carousel. Props: badge?, headline, headlineAccent?, reviews[{name,role?,company?,avatarUrl?,rating?,text}]\n"
            "- BlogGrid: article/blog card grid with optional CTA. Props: badge?, headline, headlineAccent?, sub?, posts[{title,excerpt,category?,date?,author?,imageUrl?,href?}], ctaLabel?, ctaHref?\n"
            "- NewsletterSignup: email subscription section. Props: badge?, headline, headlineAccent?, sub?, placeholder?, ctaLabel?, successMessage?\n"
            "- VideoSection: video player with thumbnail. Props: badge?, headline, headlineAccent?, sub?, videoUrl, thumbnailUrl?, aspectRatio?(\"16/9\"|\"4/3\"|\"1/1\")\n"
            "- BeforeAfter: interactive drag-to-compare slider. Props: badge?, headline, headlineAccent?, sub?, beforeImage, afterImage, beforeLabel?, afterLabel?\n"
            "- ProductGrid: e-commerce product cards. Props: badge?, headline, headlineAccent?, sub?, products[{name,description?,price,priceOld?,badge?,imageUrl?,ctaLabel?,ctaHref?}]\n"
            + three_blocks
            + scrollytelling_blocks +
            "\nRULES:\n"
            "1. For images use picsum with a descriptive seed: https://picsum.photos/seed/{descriptive-english-word}/1200/800 (e.g. /seed/swimwear/1200/800, /seed/fashion-model/1200/800). Never invent Unsplash photo IDs.\n"
            "2. Choose seeds that match the brand/sector visually\n"
            + hero_rule + "\n"
            "4. Create 4-6 pages minimum: Home (most blocks), + 2-4 other pages\n"
            "5. All text must be in French unless the brief specifies otherwise\n"
            "6. Theme colors must be dark: bg between #060608 and #141420\n"
            "7. Output ONLY valid JSON, no markdown, no explanation\n"
            "8. CONTENT UNIQUENESS: Every page must have DIFFERENT content from every other page. The 'about' page must NOT reuse the hero or features from the home page — it must show team, story, values, or mission-specific content. Never duplicate headlines, blocks, or text across pages.\n"
            "9. CTA LINKS: Any button/CTA labeled 'Démarrer', 'Commencer', 'Lancer', 'Devis', 'Essayer', 'Créer mon site' must link to href '/form'. Do NOT create a separate page for these — link directly to /form.\n"
            "10. PAGE BLOCKS VARIETY: Avoid repeating the same block type more than once per page. Each page should feel visually distinct.\n"
            "11. TEXT QUALITY: Headlines must be benefit-driven (e.g. 'Doublez votre trafic en 30 jours' not 'Notre solution'). Sub-headlines must explain the benefit in 1-2 concrete sentences. CTAs must be action verbs with clear outcome ('Obtenir mon audit gratuit' not 'En savoir plus'). All copy must feel written by a senior copywriter — no generic filler.\n"
            "12. BLOCK SELECTION: Match blocks to the project type. E-commerce sites → use ProductGrid. Agencies/studios → use BeforeAfter, GalleryGrid, FloatingCards3D. SaaS → use StatsRow, FeaturesGrid, PricingCards, MorphBlob. Local businesses → use ReviewsCarousel, ContactForm, StatsRow. Portfolio → use GalleryGrid, Timeline. Corporate/About page → use TeamGrid, Timeline, StatsRow, LogoStrip.\n"
            "13. VISUAL STYLE SEED: Pick ONE distinct visual direction and apply it consistently. Options: (A) Brutalist — raw typography, stark contrast; (B) Glassmorphism — frosted glass cards, blur effects; (C) Editorial — magazine layout, strong hierarchy; (D) Neon Cyber — bright neons on deep black; (E) Organic — soft shapes, warm tones; (F) Corporate Premium — clean, authoritative; (G) Playful Bold — bold colors, rounded shapes; (H) Minimal Luxury — negative space, refined. Encode the chosen direction as a comment in 'brand.tagline' like '(style: Neon Cyber)' so it is visible in config.\n"
            "14. ANTI-REPETITION: Never use the same block twice on the same page. Never use the same hero variant (HeroA/B/C) on more than one page. Rotate image seeds — every imageUrl must have a unique seed word.\n"
            + (extra_3d_rule + "\n" if extra_3d_rule else "") +
            "\n" + _json_example
        )

        prompt = f"Client brief:\n{objective}\n{ds_hint}\nGenerate the JSON site spec:"
        import logging as _logging
        # Try fast model first, fall back to standard Gemini if it fails
        model = GEMINI_MODEL_FAST if GEMINI_API_KEY else DEEPSEEK_MODEL_PRO
        result = await self.call_ollama(prompt, system_prompt=system, temperature=0.3,
                                        max_tokens=16000, model_override=model)
        if not result.get("success") and GEMINI_API_KEY and model != GEMINI_MODEL:
            _logging.warning(f"generate_site_spec: fast model {model!r} failed ({result.get('error','')}), retrying with {GEMINI_MODEL}")
            result = await self.call_ollama(prompt, system_prompt=system, temperature=0.3,
                                            max_tokens=16000, model_override=GEMINI_MODEL)
        if not result.get("success"):
            _logging.error(f"generate_site_spec: LLM error — {result.get('error','unknown')}")
        if project_id:
            _tok = result.get("prompt_tokens", 0) + result.get("completion_tokens", 0)
            if _tok > 0:
                from backend.db.database import add_tokens_used as _add_tok
                await _add_tok(project_id, _tok)
        raw = result.get("content", "")

        import re as _re, json as _json

        # Strip markdown code fences
        raw = _re.sub(r'^```(?:json)?\s*', '', raw.strip(), flags=_re.MULTILINE)
        raw = _re.sub(r'```\s*$', '', raw.strip(), flags=_re.MULTILINE)
        raw = raw.strip()

        def _try_parse(s: str):
            try:
                p = _json.loads(s)
                return p if p.get("pages") else None
            except Exception:
                return None

        # 1. Direct parse
        result = _try_parse(raw)
        if result:
            return result

        # 2. Extract largest {...} block
        json_match = _re.search(r'\{[\s\S]*\}', raw)
        if json_match:
            result = _try_parse(json_match.group(0))
            if result:
                return result

            # 3. String-aware truncation repair
            chunk = json_match.group(0)

            # Pass 1: find last position where the top-level object is fully closed
            best = None
            depth_b = depth_a = 0
            in_str = esc = False
            for i, ch in enumerate(chunk):
                if esc:            esc = False; continue
                if ch == '\\' and in_str: esc = True; continue
                if ch == '"':      in_str = not in_str; continue
                if in_str:         continue
                if   ch == '{':    depth_b += 1
                elif ch == '}':
                    depth_b -= 1
                    if depth_b == 0: best = i + 1
                elif ch == '[':    depth_a += 1
                elif ch == ']':    depth_a -= 1
            if best:
                result = _try_parse(chunk[:best])
                if result:
                    _logging.info("generate_site_spec: repaired — found last complete top-level object")
                    return result

            # Pass 2: find last character that is NOT inside a string, close open brackets
            safe_end = 0
            in_str = esc = False
            for i, ch in enumerate(chunk):
                if esc:            esc = False; continue
                if ch == '\\' and in_str: esc = True; continue
                if ch == '"':      in_str = not in_str; continue
                if not in_str:     safe_end = i + 1
            candidate = chunk[:safe_end]
            opens     = candidate.count('{') - candidate.count('}')
            arr_opens = candidate.count('[') - candidate.count(']')
            if opens >= 0 and arr_opens >= 0:
                repaired = candidate + (']' * arr_opens) + ('}' * opens)
                result = _try_parse(repaired)
                if result:
                    _logging.info("generate_site_spec: repaired via string-safe bracket closing")
                    return result

        _logging.warning(f"generate_site_spec: could not parse JSON. Raw[:400]: {raw[:400]}")
        return None

    async def generate_design_system(self, objective: str, project_id: int | None = None) -> dict:
        """
        Generate a client-specific design system from the brief/objective text.
        Extracts explicit colors (#RRGGBB), visual style, sector, mood.
        Uses Gemini Flash for speed. Returns {} on failure.
        """
        import json as _json
        import re as _re

        hex_colors = _re.findall(r'#[0-9a-fA-F]{6}\b', objective)
        hex_hint = (
            f"\nClient specified these exact colors (use as primary/accent): {', '.join(hex_colors[:4])}"
            if hex_colors else ""
        )

        system = """You are an expert art director and brand designer.
Given a client brief, generate a precise design system for their website.

Rules:
- If the client specified hex colors, use them as primary/accent and derive bg, surface, border, muted to complement
- Match color temperature and mode (dark/light) to the described visual style
- Choose fonts matching the brand personality: luxury=serif display, tech=geometric sans, agency=bold grotesque
- Be specific with hex values — no vague color names

Respond ONLY with valid JSON, no markdown fences, no explanation."""

        prompt = f"""Client brief:
{objective[:2500]}{hex_hint}

Generate this JSON exactly:
{{
  "palette": {{
    "name": "descriptive palette name",
    "mood": "2-3 mood adjectives",
    "tokens": {{
      "bg": "#hex",
      "surface": "#hex",
      "surface2": "#hex",
      "border": "#hex",
      "primary": "#hex",
      "primary-hover": "#hex",
      "accent": "#hex",
      "accent2": "#hex",
      "text": "#hex",
      "muted": "#hex",
      "success": "#10B981"
    }}
  }},
  "fonts": {{
    "display": "Font Name",
    "body": "Font Name",
    "import_url": "https://fonts.googleapis.com/css2?family=..."
  }},
  "mood": "brief mood description",
  "visual_style": "glassmorphism / elevated / minimal / bold / luxury / organic"
}}"""

        model = _gemini_or(DEEPSEEK_MODEL_FLASH)
        result = await self.call_ollama(
            prompt, system_prompt=system, temperature=0.2, model_override=model
        )
        if project_id:
            _tok = result.get("prompt_tokens", 0) + result.get("completion_tokens", 0)
            if _tok > 0:
                from backend.db.database import add_tokens_used as _add_tok
                await _add_tok(project_id, _tok)
        content = result.get("content", "").strip()
        try:
            content = _re.sub(r'^```[a-zA-Z]*\n?', '', content)
            content = _re.sub(r'\n?```$', '', content)
            m = _re.search(r'\{[\s\S]*\}', content)
            if m:
                return _json.loads(m.group())
        except Exception:
            pass
        return {}

    async def critique_section(
        self,
        component_code: str,
        design_system: dict,
        section_name: str = "",
    ) -> Optional[str]:
        """
        Fast aesthetic critique of a generated section component using Gemini Flash.
        Scores visual quality and returns improved code if avg score < 7.
        Targets only visual/animation weaknesses — never restructures logic.
        Returns improved code string or None if acceptable / Gemini unavailable.
        """
        if not GEMINI_API_KEY:
            return None
        if len(component_code) > 7000:
            return None

        import json as _json
        import re as _re

        tokens = design_system.get("palette", {}).get("tokens", {})
        primary = tokens.get("primary", "var(--primary)")
        accent = tokens.get("accent", "var(--accent)")
        mood = design_system.get("mood", "")

        system = """You are a senior UI critic specializing in React/Tailwind visual quality.
Score the component and optionally return targeted improvements.
Focus ONLY on: visual depth (glows/gradients/shadows), animations (Framer Motion), typography hierarchy, design token compliance.
NEVER restructure component logic or change data/props.
Respond ONLY with valid JSON."""

        prompt = f"""Evaluate this React/Tailwind component ({section_name}):

```tsx
{component_code[:5000]}
```

Project mood: {mood} | Primary: {primary} | Accent: {accent}

Score 1-10 for each dimension:
- visual_depth: background glows, gradients, shadows, glassmorphism effects
- animations: Framer Motion entrance animations, hover states, micro-interactions
- typography: size hierarchy, gradient text on key words, tracking/leading
- design_tokens: uses var(--xxx) not hardcoded hex colors

If average < 7: provide improved code targeting the single weakest area.
If average >= 7: set improved_code to null.
Do NOT repeat the whole file — only return if genuinely improved.

JSON:
{{
  "scores": {{"visual_depth": 7, "animations": 6, "typography": 8, "design_tokens": 9}},
  "avg": 7.5,
  "weak_area": "animations",
  "improved_code": null
}}"""

        result = await self.call_ollama(
            prompt, system_prompt=system, temperature=0.15,
            model_override=GEMINI_MODEL,
        )
        content = result.get("content", "").strip()
        try:
            m = _re.search(r'\{[\s\S]*\}', content)
            if m:
                data = _json.loads(m.group())
                avg = float(data.get("avg", 10))
                improved = data.get("improved_code")
                if avg < 7 and improved and isinstance(improved, str) and len(improved) > 300:
                    code_m = _re.search(r'```[a-zA-Z]*\n([\s\S]+?)```', improved)
                    return code_m.group(1).strip() if code_m else improved.strip()
        except Exception:
            pass
        return None

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
