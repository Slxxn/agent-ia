"""
Agent Planner — Génère un plan structuré à partir d'un objectif utilisateur.
Utilise le LLM pour décomposer l'objectif en tâches exécutables.
"""
from __future__ import annotations

import json
import re
from typing import List, Dict, Any, Optional
from backend.tools.llm import LLMTool, route_model
from backend.db.database import add_log, save_brief, add_tokens_used
from backend.agent.presets import PALETTES, FONT_PAIRS, NARRATIVE_TEMPLATES, pick_preset


# Keywords that trigger React full-stack mode
_COMPLEX_KEYWORDS = [
    "boutique", "shop", "e-commerce", "ecommerce", "dashboard", "admin",
    "authentification", "authentication", "paiement", "payment", "stripe",
    "supabase", "react", "vite", "saas", "startup", "landing", "app",
    "application", "platform", "plateforme", "portfolio",
]

# Keywords that specifically trigger the full SaaS landing page template
_LANDING_KEYWORDS = [
    "landing", "saas", "startup", "landing page", "marketing", "produit",
    "product", "service", "agence", "agency", "portfolio",
]

# Keywords that specifically trigger e-commerce mode
_ECOMMERCE_KEYWORDS = [
    "boutique", "shop", "e-commerce", "ecommerce", "store", "produits",
    "products", "panier", "cart", "vente", "vendre", "sell",
]


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

        obj_lower = objective.lower()
        is_complex   = any(kw in obj_lower for kw in _COMPLEX_KEYWORDS)
        is_landing   = any(kw in obj_lower for kw in _LANDING_KEYWORDS)
        is_ecommerce = any(kw in obj_lower for kw in _ECOMMERCE_KEYWORDS)

        enhanced_objective = objective

        # ── Injection des contraintes architecturales ───────────────────────
        if is_complex:
            enhanced_objective += self._build_react_constraints(is_landing, is_ecommerce)
            project_type = "landing page SaaS" if is_landing else ("e-commerce" if is_ecommerce else "React")
            await add_log(project_id, f"Détection : projet {project_type} → contraintes premium injectées.", "info")

        result = await self.llm.generate_plan(enhanced_objective)

        if not result.get("success"):
            await add_log(project_id, f"Erreur de planification : {result.get('error', 'Inconnue')}", "error")
            if is_landing:
                return self._landing_page_fallback(objective)
            if is_ecommerce:
                return self._ecommerce_fallback(objective)
            return self._fallback_plan(objective)

        content = result.get("content", "")
        tasks = self._parse_plan(content)

        if not tasks:
            await add_log(project_id, "Plan LLM non parsable, utilisation du plan de secours.", "warning")
            if is_landing:
                return self._landing_page_fallback(objective)
            if is_ecommerce:
                return self._ecommerce_fallback(objective)
            return self._fallback_plan(objective)

        # ── Post-traitement : garantir les tâches critiques ─────────────────
        tasks = self._ensure_critical_tasks(tasks, enhanced_objective, is_landing, is_ecommerce)

        await add_log(project_id, f"Plan généré avec {len(tasks)} tâches.", "info")
        for i, task in enumerate(tasks):
            await add_log(project_id, f"  Tâche {i+1}: {task['description']}", "debug")

        return tasks

    # ── build_plan : brief créatif + liste de tâches ──────────────────────

    async def build_plan(
        self,
        goal_text: str,
        settings: dict | None = None,
        project_id: int | None = None,
    ) -> dict:
        """
        Génère un brief créatif complet + la liste de tâches ordonnée.
        Retourne {"brief": {...}, "tasks": [...]}.

        Le brief est généré via un appel LLM flash (task_type="brief_creation")
        avec response_format JSON. Fallback sur pick_preset() si le LLM échoue.
        """
        settings = settings or {}
        palette_names   = list(PALETTES.keys())
        font_pair_names = list(FONT_PAIRS.keys())
        narrative_types = list(NARRATIVE_TEMPLATES.keys())

        brief_prompt = f"""You are an art director. From the goal below, generate a creative JSON brief.

Goal: {goal_text}

Available palettes: {palette_names}
Available font pairs: {font_pair_names}
Available narrative types: {narrative_types}

Respond ONLY with a valid JSON object (no markdown, no explanation):
{{
  "project_type": "<e.g.: wellness_showcase>",
  "metier": "<e.g.: massage therapist>",
  "palette_key": "<an exact key from the palettes list>",
  "font_pair_key": "<an exact key from the font pairs list>",
  "narrative_type": "<an exact key from the narratives list>",
  "photos_keywords": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "brand_details": {{
    "name": "<project name or deduced brand>",
    "city": "<city if mentioned, otherwise empty>",
    "unique_method": "<signature method if mentioned>",
    "signature_phrase": "<short poetic tagline>"
  }},
  "integrations_required": ["<e.g.: stripe>"]
}}"""

        brief_model = route_model(task_type="brief_creation")
        result = await self.llm.call_ollama(
            brief_prompt,
            system_prompt="You are an expert art director. Respond only in valid JSON.",
            temperature=0.4,
            model_override=brief_model,
        )

        tokens = (result.get("prompt_tokens", 0) or 0) + (result.get("completion_tokens", 0) or 0)
        if tokens > 0 and project_id:
            await add_tokens_used(project_id, tokens)

        # Parser le JSON du brief
        llm_brief: dict = {}
        if result.get("success"):
            raw = result.get("content", "")
            for pattern in (r'\{[\s\S]*\}',):
                try:
                    m = re.search(pattern, raw)
                    if m:
                        llm_brief = json.loads(m.group())
                        break
                except Exception:
                    pass

        # Valider les clés et appliquer le fallback preset si hors-liste
        preset = pick_preset(goal_text)
        palette_key = llm_brief.get("palette_key", "")
        if palette_key not in PALETTES:
            palette_key = preset["palette"]["key"]

        font_key = llm_brief.get("font_pair_key", "")
        if font_key not in FONT_PAIRS:
            font_key = PALETTES[palette_key]["suggested_fonts"]

        narrative_type = llm_brief.get("narrative_type", "")
        if narrative_type not in NARRATIVE_TEMPLATES:
            narrative_type = list(NARRATIVE_TEMPLATES.keys())[0]
            for nt in NARRATIVE_TEMPLATES:
                if nt in llm_brief.get("project_type", ""):
                    narrative_type = nt
                    break

        palette_data = PALETTES[palette_key]
        font_data    = FONT_PAIRS[font_key]
        narrative    = NARRATIVE_TEMPLATES[narrative_type]

        # Détecter les intégrations requises depuis le goal
        integrations = list(llm_brief.get("integrations_required", []))
        goal_lower = goal_text.lower()
        if any(k in goal_lower for k in ("stripe", "paiement", "payer", "vente", "boutique", "shop")):
            if "stripe" not in integrations:
                integrations.append("stripe")
        if any(k in goal_lower for k in ("supabase", "base de données", "inscription", "utilisateur")):
            if "supabase" not in integrations:
                integrations.append("supabase")

        # Avertissements intégrations manquantes
        integration_warnings: list[str] = []
        if "stripe" in integrations:
            from backend.db.database import get_setting
            stripe_key = await get_setting("STRIPE_SECRET_KEY")
            if not stripe_key:
                integration_warnings.append(
                    "⚠️ STRIPE_SECRET_KEY non configurée — ajoutez vos clés dans Réglages avant déploiement."
                )

        brand_details = llm_brief.get("brand_details", {})
        if not isinstance(brand_details, dict):
            brand_details = {}
        # Valeurs par défaut
        brand_details.setdefault("name", goal_text.split("pour")[-1].strip()[:40] if "pour" in goal_text else "")
        brand_details.setdefault("city", "")
        brand_details.setdefault("unique_method", "")
        brand_details.setdefault("signature_phrase", "")

        brief: dict = {
            "project_type": llm_brief.get("project_type", narrative_type),
            "metier": llm_brief.get("metier", ""),
            "palette": {
                "key": palette_key,
                "name": palette_data["name"],
                "mood": palette_data["mood"],
                "tokens": palette_data["tokens"],
            },
            "fonts": font_data,
            "narrative": narrative,
            "components_to_create": list(set(
                [act["id"] for act in narrative]
                + ["Navbar", "Footer", "Layout", "Button", "Badge", "Card"]
            )),
            "photos_keywords": llm_brief.get("photos_keywords", ["wellness", "nature", "light"]),
            "brand_details": brand_details,
            "integrations_required": integrations,
            "integration_warnings": integration_warnings,
        }

        # Enrichir l'objectif avec le brief pour le planner
        enhanced_goal = goal_text + f"\n\nDESIGN BRIEF:\n- Palette: {palette_data['name']} ({palette_data['mood']})\n- Fonts: {font_data['display']} / {font_data['body']}\n- Narrative: {narrative_type}\n- Brand: {brand_details.get('name', '')}"
        if project_id:
            enhanced_goal += f"\n- Intégrations: {', '.join(integrations) if integrations else 'aucune'}"

        tasks = await self.generate_plan(project_id or 0, enhanced_goal)

        # Sauvegarder le brief en DB
        if project_id:
            await save_brief(project_id, brief)
            await add_log(project_id, f"📋 Brief généré — Palette: {palette_data['name']}, Fonts: {font_data['display']}/{font_data['body']}", "info")
            for warning in integration_warnings:
                await add_log(project_id, warning, "warning")

        return {"brief": brief, "tasks": tasks}

    # ── Contraintes injectées dans l'objectif ──────────────────────────────

    def _build_react_constraints(self, is_landing: bool, is_ecommerce: bool) -> str:
        from backend.prompts.templates import RECURRING_BUG_PREVENTION
        base = (
            "\n\n══ MANDATORY TECHNICAL CONSTRAINTS ══"
            "\n• Stack: React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion + Lucide React"
            "\n• NEVER a basic static HTML/CSS site."
            "\n• package.json MUST list ALL imported dependencies (react, react-dom, "
            "react-router-dom, framer-motion, lucide-react, clsx, tailwind-merge, vite, "
            "@vitejs/plugin-react, tailwindcss, postcss, autoprefixer, typescript)."
            "\n• vite.config.ts MUST always include server: { host: true }."
            "\n• Every import in code MUST correspond to a dependency in package.json."
            "\n• src/lib/utils.ts MUST export cn() (clsx + tailwind-merge) and formatPrice()."
            "\n• main.tsx: <BrowserRouter><App /></BrowserRouter> — BrowserRouter HERE ONLY."
            "\n• App.tsx: <Routes><Route /></Routes> — NEVER BrowserRouter in App.tsx."
            f"\n\n{RECURRING_BUG_PREVENTION}"
        )

        if is_landing:
            base += (
                "\n\n══ SAAS LANDING PAGE STRUCTURE — MANDATORY ══"
                "\nGenerate these components in src/components/sections/:"
                "\n1. HeroSection.tsx — giant H1 title + badge + CTA + glow background"
                "\n2. LogosSection.tsx — 'Trusted by' + 6-8 fictional companies"
                "\n3. ProblemSection.tsx — 3-4 pain points with icons"
                "\n4. SolutionSection.tsx — product presentation"
                "\n5. FeaturesSection.tsx — bento grid of 6+ glassmorphism features"
                "\n6. HowItWorksSection.tsx — 3 numbered steps"
                "\n7. TestimonialsSection.tsx — 3-6 realistic testimonials"
                "\n8. PricingSection.tsx — 3 tiers (Free/Pro/Enterprise)"
                "\n9. CTASection.tsx — final section with glow"
                "\n• Navbar.tsx: fixed, backdrop-blur, mobile hamburger"
                "\n• Footer.tsx: 4 columns of links + copyright"
                "\n• Home.tsx: assembles all sections"
                "\n• Framer Motion animations on EVERY section (whileInView, stagger)."
                "\n• COPYWRITING: punchy titles, benefit-driven, NEVER lorem ipsum."
            )
        elif is_ecommerce:
            from backend.prompts.templates import ECOMMERCE_PREMIUM_PROMPT, STRIPE_CHECKOUT_PATTERN, FIREBASE_STACK_PATTERN
            base += f"\n\n{ECOMMERCE_PREMIUM_PROMPT}"
            base += (
                "\n\n══ CONTRAINTES E-COMMERCE SUPPLÉMENTAIRES ══"
                "\n• Minimum 12 produits avec vrais noms, prix, descriptions marketing, images Unsplash."
                "\n• CartContext (src/context/CartContext.tsx) : CartProvider + useCart + useCartStore alias."
                "\n• Pages obligatoires : Home, Products, ProductDetail, Cart, Checkout, Login, Register, OrderSuccess."
                "\n• Navbar avec compteur panier dynamique + isActive helper (voir règles anti-bugs)."
                "\n• ProductCard avec hover animation + quick-add to cart + badge (Nouveau/Promo)."
                "\n• CartDrawer : drawer latéral animé avec liste items, quantités éditables, total, CTA."
                "\n• Firebase Auth (email/password + Google Sign-In) via src/lib/firebase.ts."
                "\n• Firestore pour users, orders, carts (sync panier utilisateur connecté)."
                "\n• Stripe PaymentElement (Apple Pay + Google Pay + cartes) via Firebase Cloud Functions."
                "\n• functions/ dossier avec createPaymentIntent Cloud Function (stripe npm package)."
                "\n• COPYWRITING : descriptions produits réalistes, prix en €, JAMAIS de lorem ipsum."
                f"\n\n{FIREBASE_STACK_PATTERN}"
                f"\n\n{STRIPE_CHECKOUT_PATTERN}"
            )

        base += (
            "\n\n══ VISUAL QUALITY ══"
            "\n• Agency-level design / Framer template. NEVER an empty or generic page."
            "\n• Dark background (bg-[#09090B] or equivalent) with glassmorphism effects."
            "\n• Each section: Framer Motion scroll-entry animations."
            "\n• Strong typography: titles text-5xl+ font-black."
            "\n• Images: real Unsplash URLs (https://images.unsplash.com/photo-ID?w=800)."
        )
        return base

    # ── Post-traitement : garanties ────────────────────────────────────────

    def _ensure_critical_tasks(
        self,
        tasks: List[Dict[str, Any]],
        objective: str,
        is_landing: bool,
        is_ecommerce: bool,
    ) -> List[Dict[str, Any]]:
        """Garantit la présence des tâches critiques manquantes."""
        descriptions = " ".join(t.get("description", "").lower() for t in tasks)
        obj_lower = objective.lower()

        is_react = any(kw in obj_lower for kw in ["react", "vite", "e-commerce", "boutique", "shop", "landing", "saas"])

        # ── utils.ts ────────────────────────────────────────────────────────
        if is_react and "utils" not in descriptions:
            tasks.insert(0, {
                "description": "Créer src/lib/utils.ts (cn + formatPrice) et src/index.css (@tailwind + variables CSS custom --bg, --primary, --accent)",
                "steps": ["Créer src/lib/utils.ts avec cn() clsx+tailwind-merge et formatPrice()", "Créer src/index.css avec @tailwind base/components/utilities et variables CSS"],
                "tools": ["filesystem"],
            })

        # ── Landing page : garantir sections critiques ──────────────────────
        if is_landing:
            has_hero       = any("hero" in t.get("description", "").lower() for t in tasks)
            has_features   = any("feature" in t.get("description", "").lower() for t in tasks)
            has_pricing    = any("pricing" in t.get("description", "").lower() or "prix" in t.get("description", "").lower() for t in tasks)
            has_testimon   = any("testimon" in t.get("description", "").lower() or "témoignage" in t.get("description", "").lower() for t in tasks)

            if not has_hero:
                tasks.insert(1, {
                    "description": "Créer HeroSection.tsx avec titre H1 géant (gradient text), badge animé, 2 CTAs, visuel hero et radial glow background",
                    "steps": ["Créer src/components/sections/HeroSection.tsx", "Ajouter LogosSection.tsx avec 6-8 entreprises fictives"],
                    "tools": ["filesystem"],
                })

            if not has_features:
                tasks.append({
                    "description": "Créer FeaturesSection.tsx en bento grid (6 features glassmorphism) + HowItWorksSection.tsx (3 étapes)",
                    "steps": ["Créer src/components/sections/FeaturesSection.tsx", "Créer src/components/sections/HowItWorksSection.tsx"],
                    "tools": ["filesystem"],
                })

            if not has_testimon:
                tasks.append({
                    "description": "Créer TestimonialsSection.tsx avec 3-6 témoignages réalistes (nom, rôle, entreprise, citation)",
                    "steps": ["Créer src/components/sections/TestimonialsSection.tsx"],
                    "tools": ["filesystem"],
                })

            if not has_pricing:
                tasks.append({
                    "description": "Créer PricingSection.tsx avec 3 tiers (Free/Pro/Enterprise), toggle mensuel/annuel, feature lists",
                    "steps": ["Créer src/components/sections/PricingSection.tsx"],
                    "tools": ["filesystem"],
                })

        # ── E-commerce : garantir le store panier, auth, paiement ─────────
        if is_ecommerce:
            has_store = any(kw in descriptions for kw in ["store", "context", "cart", "panier", "cartcontext"])
            if not has_store:
                insert_pos = 1
                for i, t in enumerate(tasks):
                    if any(kw in t.get("description", "").lower() for kw in ["package.json", "config", "tsconfig"]):
                        insert_pos = i + 1
                        break
                tasks.insert(insert_pos, {
                    "description": "Créer src/context/CartContext.tsx — COMPLET : CartContext, CartProvider, useState, useCart hook, useCartStore alias, CartItem interface, isOpen/toggleCart pour le drawer",
                    "steps": [
                        "Créer src/context/CartContext.tsx avec CartContext + CartProvider + useCart + useCartStore",
                        "Exporter CartProvider (default + named), useCart, useCartStore, CartItem",
                        "Inclure isOpen, toggleCart pour le CartDrawer",
                    ],
                    "tools": ["filesystem"],
                })

            # Garantir CartDrawer
            has_drawer = any(kw in descriptions for kw in ["drawer", "cartdrawer"])
            if not has_drawer:
                tasks.append({
                    "description": "Créer src/components/cart/CartDrawer.tsx — drawer latéral animé (Framer Motion) avec liste d'items, quantités éditables, total, bouton Checkout",
                    "steps": ["Créer CartDrawer.tsx avec animation slide-in, useCart(), affichage items, total"],
                    "tools": ["filesystem"],
                })

            # Garantir Firebase Auth (toujours pour e-commerce)
            has_auth = any(kw in descriptions for kw in ["auth", "firebase", "authcontext", "login"])
            if not has_auth:
                tasks.append({
                    "description": "Firebase Auth + Firestore : src/lib/firebase.ts + src/context/AuthContext.tsx (email/password + Google) + src/pages/Login.tsx + Register.tsx + ProtectedRoute.tsx",
                    "steps": [
                        "Créer src/lib/firebase.ts : initializeApp(firebaseConfig) + export auth, db — config via VITE_FIREBASE_* vars",
                        "Créer src/context/AuthContext.tsx : onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider+signInWithPopup, signOut",
                        "Créer src/pages/Login.tsx : formulaire email/password + bouton Google, gestion codes erreur Firebase",
                        "Créer src/pages/Register.tsx : inscription + création doc users/{uid} dans Firestore avec setDoc",
                        "Créer src/components/auth/ProtectedRoute.tsx",
                        "Ajouter VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID dans .env.example",
                    ],
                    "tools": ["filesystem"],
                })

            # Garantir page Checkout + Stripe PaymentElement (Apple Pay + Google Pay + cartes)
            has_checkout = any(kw in descriptions for kw in ["checkout", "paiement", "stripe", "payment"])
            if not has_checkout:
                tasks.append({
                    "description": "Stripe PaymentElement (Apple Pay + Google Pay + cartes) : src/lib/stripe.ts + CheckoutForm.tsx (PaymentElement) + src/pages/Checkout.tsx + OrderSuccess.tsx + Firebase Cloud Function createPaymentIntent",
                    "steps": [
                        "Créer src/lib/stripe.ts : export stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)",
                        "Créer src/components/checkout/CheckoutForm.tsx avec PaymentElement + confirmPayment — PaymentElement gère automatiquement Apple Pay, Google Pay, cartes",
                        "Créer src/pages/Checkout.tsx : useEffect fetch POST /api/create-payment-intent → clientSecret, puis <Elements stripe={stripePromise} options={{clientSecret}}>",
                        "Créer src/pages/OrderSuccess.tsx : confirmation + sauvegarde commande dans Firestore orders/{id}",
                        "Créer functions/package.json avec firebase-functions, firebase-admin, stripe",
                        "Créer functions/src/index.ts : createPaymentIntent Cloud Function avec automatic_payment_methods:{enabled:true} + stripeWebhook",
                        "Mettre à jour firebase.json : ajouter functions config + rewrite /api/** vers createPaymentIntent",
                        "Ajouter VITE_STRIPE_PUBLISHABLE_KEY dans .env.example (STRIPE_SECRET_KEY uniquement dans Firebase Functions config)",
                    ],
                    "tools": ["filesystem"],
                })

        # npm install est géré automatiquement par le runner (Phase 3.5)
        # Filtrer toute tâche npm install résiduelle générée par le LLM
        tasks = [t for t in tasks if "npm install" not in t.get("description", "").lower()]

        # ── Enforce canonical generation order ──────────────────────────────
        def _task_priority(task: dict) -> int:
            d = task.get("description", "").lower()
            # 0: config files — must exist before anything can import
            if any(k in d for k in ("package.json", "tsconfig", "vite.config", "tailwind.config", "postcss")):
                return 0
            # 1: design system — CSS vars, utils (cn, formatPrice)
            if any(k in d for k in ("utils.ts", "index.css", "globals.css", "design system", "variables css")):
                return 1
            # 2: context / store — must be ready before App.tsx imports them
            if any(k in d for k in ("context", "store", "provider", "authcontext", "cartcontext", "bookingcontext")):
                return 2
            # 3: layout shell (navbar, footer, layout wrapper)
            if any(k in d for k in ("navbar", "footer", "layout")):
                return 3
            # 4: data / types / constants
            if any(k in d for k in ("types", "constants", "data/", "services.ts", "products.ts")):
                return 4
            # 5: components and pages (bulk of content)
            if any(k in d for k in ("section", "component", "page", "hero", "feature", "pricing", "testimonial", "admin", "booking", "profile")):
                return 5
            # 9: assembly — App.tsx and main.tsx always last
            if any(k in d for k in ("app.tsx", "main.tsx", "assembly", "routing", "assembl")):
                return 9
            return 5

        tasks.sort(key=_task_priority)

        return tasks

    # ── Parsers JSON ───────────────────────────────────────────────────────

    def _parse_plan(self, content: str) -> List[Dict[str, Any]]:
        """Parser la réponse JSON du LLM en liste de tâches."""
        for pattern in (r'\{[\s\S]*\}', r'\[[\s\S]*\]'):
            try:
                json_match = re.search(pattern, content)
                if not json_match:
                    continue
                data = json.loads(json_match.group())
                tasks = data.get("tasks", data) if isinstance(data, dict) else data
                if isinstance(tasks, list) and tasks:
                    return [
                        {
                            "description": t["description"],
                            "steps": t.get("steps", []),
                            "tools": t.get("tools", []),
                        }
                        for t in tasks
                        if isinstance(t, dict) and "description" in t
                    ]
            except (json.JSONDecodeError, KeyError, TypeError):
                continue
        return []

    # ── Plans de secours ───────────────────────────────────────────────────

    def _landing_page_fallback(self, objective: str) -> List[Dict[str, Any]]:
        """Plan de secours complet pour une landing page SaaS."""
        return [
            {
                "description": "Config: package.json (all deps) + vite.config.ts (host:true) + tsconfig.json + tailwind.config.js + postcss.config.js + index.html (Google Fonts)",
                "steps": ["Create package.json with react, react-dom, react-router-dom, framer-motion, lucide-react, clsx, tailwind-merge, vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer, @types/react, @types/react-dom", "Create vite.config.ts with server.host:true", "Create tsconfig.json", "Create tailwind.config.js", "Create postcss.config.js", "Create index.html with Google Fonts"],
                "tools": ["filesystem"],
            },
            {
                "description": "Design system: src/lib/utils.ts (cn + formatPrice) + src/index.css (@tailwind + CSS vars) + src/constants/theme.ts",
                "steps": ["Create src/lib/utils.ts", "Create src/index.css with variables --bg, --primary, --accent", "Create src/constants/theme.ts"],
                "tools": ["filesystem"],
            },
            {
                "description": "Layout: src/components/layout/Navbar.tsx (fixed, backdrop-blur, mobile hamburger) + Footer.tsx (4 columns)",
                "steps": ["Create Navbar.tsx", "Create Footer.tsx"],
                "tools": ["filesystem"],
            },
            {
                "description": "Hero + Social Proof: src/components/sections/HeroSection.tsx (giant title + badge + CTA + glow) + LogosSection.tsx (6 fictional companies)",
                "steps": ["Create HeroSection.tsx with radial glow, H1 gradient title, animated badge, 2 CTAs", "Create LogosSection.tsx"],
                "tools": ["filesystem"],
            },
            {
                "description": "Problem + Solution: src/components/sections/ProblemSection.tsx + SolutionSection.tsx with real marketing content",
                "steps": ["Create ProblemSection.tsx with 3-4 pain points", "Create SolutionSection.tsx"],
                "tools": ["filesystem"],
            },
            {
                "description": "Features bento grid: src/components/sections/FeaturesSection.tsx (6+ glassmorphism cards + stagger animation)",
                "steps": ["Create FeaturesSection.tsx with bento grid, 6 features, hover animation, Lucide icons"],
                "tools": ["filesystem"],
            },
            {
                "description": "How It Works + Testimonials: src/components/sections/HowItWorksSection.tsx (3 steps) + TestimonialsSection.tsx (3-6 realistic testimonials)",
                "steps": ["Create HowItWorksSection.tsx", "Create TestimonialsSection.tsx"],
                "tools": ["filesystem"],
            },
            {
                "description": "Pricing: src/components/sections/PricingSection.tsx (3 tiers Free/Pro/Enterprise, monthly/annual toggle, CTA per tier)",
                "steps": ["Create PricingSection.tsx with 3 tiers and toggle"],
                "tools": ["filesystem"],
            },
            {
                "description": "Final CTA: src/components/sections/CTASection.tsx (impactful section with large glow)",
                "steps": ["Create CTASection.tsx"],
                "tools": ["filesystem"],
            },
            {
                "description": "Assembly: src/main.tsx (BrowserRouter wrapping App) + src/App.tsx (Routes only, no BrowserRouter) + src/pages/Home.tsx + src/index.css",
                "steps": ["Create main.tsx with BrowserRouter wrapping App (NEVER createBrowserRouter)", "Create App.tsx with Routes/Route without BrowserRouter", "Create Home.tsx assembling all sections in order"],
                "tools": ["filesystem"],
            },
        ]

    def _ecommerce_fallback(self, objective: str) -> List[Dict[str, Any]]:
        """Plan de secours pour un e-commerce."""
        obj_lower = objective.lower()
        needs_auth = any(kw in obj_lower for kw in ["auth", "login", "connexion", "inscription", "compte", "utilisateur"])
        needs_payment = any(kw in obj_lower for kw in ["paiement", "stripe", "payment", "checkout", "acheter", "vendre"])

        tasks = [
            {
                "description": "Config: package.json (react, react-dom, react-router-dom, framer-motion, lucide-react, firebase, @stripe/stripe-js, @stripe/react-stripe-js) + vite.config.ts + tsconfig.json + tailwind.config.js + index.html",
                "steps": [
                    "Create package.json with all deps: firebase, @stripe/stripe-js, @stripe/react-stripe-js (NOT supabase)",
                    "Create vite.config.ts with server.host:true and resolve.alias {'@': './src'}",
                    "Create tsconfig.json, tailwind.config.js, postcss.config.js, index.html with Google Fonts",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Data + utils + types + .env.example: src/data/products.ts (12+ products) + src/lib/utils.ts + src/types/index.ts + .env.example (Firebase + Stripe vars)",
                "steps": [
                    "Create src/data/products.ts with 12 real products (name, price, oldPrice?, Unsplash image, category, description, badge?, rating, inStock) + categories[]",
                    "Create src/lib/utils.ts with cn(), formatPrice(), whatsappLink()",
                    "Create src/types/index.ts with Product, Category, CartItem, User, Order interfaces",
                    "Create .env.example with VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID, VITE_STRIPE_PUBLISHABLE_KEY",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Cart context: src/context/CartContext.tsx — COMPLETE: CartContext, CartProvider, CartItem, useCart, useCartStore alias, isOpen, toggleCart",
                "steps": [
                    "Create src/context/CartContext.tsx with CartContext + CartProvider + useState for items and isOpen",
                    "Implement addItem (upsert), removeItem, updateQuantity, clearCart, toggleCart",
                    "Export CartProvider (default + named), useCart hook, useCartStore alias, CartItem type",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Firebase lib + Auth: src/lib/firebase.ts (initializeApp + auth + db) + src/context/AuthContext.tsx (email/password + Google) + src/pages/Login.tsx + Register.tsx + ProtectedRoute.tsx",
                "steps": [
                    "Create src/lib/firebase.ts: initializeApp(firebaseConfig) via VITE_FIREBASE_* env vars, export auth = getAuth(app), db = getFirestore(app)",
                    "Create src/context/AuthContext.tsx: onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider+signInWithPopup, signOut, loading state",
                    "Create src/pages/Login.tsx: email+password form + Google Sign-In button, Firebase error handling (auth/wrong-password, auth/user-not-found...)",
                    "Create src/pages/Register.tsx: registration + setDoc(doc(db,'users',uid), {email, displayName, createdAt})",
                    "Create src/components/auth/ProtectedRoute.tsx: const {user,loading} = useAuth(); if loading return spinner; return user ? <Outlet> : <Navigate to='/login'>",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Stripe PaymentElement (Apple Pay + Google Pay + cards): src/lib/stripe.ts + CheckoutForm.tsx + Checkout.tsx + OrderSuccess.tsx + Firebase Cloud Function createPaymentIntent",
                "steps": [
                    "Create src/lib/stripe.ts: export stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)",
                    "Create src/components/checkout/CheckoutForm.tsx with PaymentElement + confirmPayment (automatic_payment_methods enables Apple Pay + Google Pay)",
                    "Create src/pages/Checkout.tsx: fetch POST /api/create-payment-intent → clientSecret, <Elements stripe={stripePromise} options={{clientSecret}}>",
                    "Create src/pages/OrderSuccess.tsx: confirmation + addDoc(collection(db,'orders'), {userId, items, total, status:'paid', createdAt})",
                    "Create functions/package.json: {dependencies: {firebase-functions:'^4', firebase-admin:'^12', stripe:'^16'}}",
                    "Create functions/src/index.ts: createPaymentIntent onRequest with stripe.paymentIntents.create({automatic_payment_methods:{enabled:true}}) + stripeWebhook to update Firestore",
                    "Update firebase.json: add {functions:{source:'functions'}} + rewrite {source:'/api/**', function:'createPaymentIntent'}",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Layout: src/components/layout/Navbar.tsx (isActive helper, cart counter, mobile hamburger) + Footer.tsx + src/components/cart/CartDrawer.tsx (animated drawer)",
                "steps": [
                    "Create Navbar.tsx with isActive helper (path.startsWith('/#') → false, '/' → exact match), cart badge, hamburger",
                    "Create Footer.tsx with 3-4 columns of links",
                    "Create CartDrawer.tsx: Framer Motion drawer, items list, editable quantities, total, Checkout button",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Product components: src/components/product/ProductCard.tsx (hover, quick-add, badge) + ProductGrid.tsx + src/components/catalogue/FilterBar.tsx",
                "steps": [
                    "Create ProductCard.tsx with image, name, price, badge, hover scale, add-to-cart button",
                    "Create ProductGrid.tsx with responsive grid",
                    "Create FilterBar.tsx with category buttons + search field",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Pages Home + Products + ProductDetail: animated hero, filterable catalog, detail page with gallery and WhatsApp button",
                "steps": [
                    "Create src/pages/Home.tsx: hero + featured products + categories + CTA",
                    "Create src/pages/Products.tsx: FilterBar + ProductGrid + filter state",
                    "Create src/pages/ProductDetail.tsx: image gallery, description, features, add-to-cart, WhatsApp button",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Assembly: src/main.tsx (BrowserRouter wrapper) + src/App.tsx (Routes + CartProvider WITHOUT BrowserRouter) + src/index.css (@tailwind + CSS variables)",
                "steps": [
                    "Create main.tsx: ReactDOM.createRoot + <BrowserRouter><App /></BrowserRouter>",
                    "Create App.tsx: <CartProvider><Navbar/><Routes><Route/></Routes><Footer/><CartDrawer/></CartProvider> — NEVER BrowserRouter here",
                    "Create src/index.css with @tailwind base/components/utilities + CSS variables --primary, --bg",
                ],
                "tools": ["filesystem"],
            },
        ]

        # Firebase Auth + Stripe are always included in the tasks above (not conditional)
        # needs_auth / needs_payment kept for potential future conditional enhancements
        _ = needs_auth, needs_payment

        return tasks

    def _fallback_plan(self, objective: str) -> List[Dict[str, Any]]:
        """Generic fallback plan."""
        return [
            {
                "description": "Initialize project structure and configuration",
                "steps": ["Create config files (package.json, vite.config.ts, tsconfig.json, tailwind.config.js, index.html)"],
                "tools": ["filesystem"],
            },
            {
                "description": "Generate main source code with premium design",
                "steps": ["Analyze requirements", "Create main components with Framer Motion and Tailwind CSS"],
                "tools": ["filesystem", "llm"],
            },
            {
                "description": "Create utilities and realistic mock data",
                "steps": ["src/lib/utils.ts", "Realistic content data"],
                "tools": ["filesystem"],
            },
            {
                "description": "Final assembly: main.tsx (BrowserRouter wrapping App) + App.tsx (Routes without BrowserRouter) + index.css",
                "steps": ["main.tsx: BrowserRouter wrapping <App />, NEVER createBrowserRouter", "App.tsx: <Routes><Route /></Routes> only"],
                "tools": ["filesystem"],
            },
        ]
