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

        brief_prompt = f"""Tu es un directeur artistique. À partir du goal ci-dessous, génère un brief créatif JSON.

Goal : {goal_text}

Palettes disponibles : {palette_names}
Font pairs disponibles : {font_pair_names}
Types de narrative disponibles : {narrative_types}

Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas d'explication) :
{{
  "project_type": "<ex: vitrine_bien_etre>",
  "metier": "<ex: masseuse>",
  "palette_key": "<une clé exacte de la liste palettes>",
  "font_pair_key": "<une clé exacte de la liste font pairs>",
  "narrative_type": "<une clé exacte de la liste narratives>",
  "photos_keywords": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "brand_details": {{
    "name": "<nom du projet ou brand déduit>",
    "city": "<ville si mentionnée, sinon vide>",
    "unique_method": "<méthode signature si mentionnée>",
    "signature_phrase": "<phrase d'accroche courte, poétique>"
  }},
  "integrations_required": ["<ex: stripe>"]
}}"""

        brief_model = route_model(task_type="brief_creation")
        result = await self.llm.call_ollama(
            brief_prompt,
            system_prompt="Tu es un directeur artistique expert. Réponds uniquement en JSON valide.",
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
            "\n\n══ CONTRAINTES TECHNIQUES IMPÉRATIVES ══"
            "\n• Stack : React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion + Lucide React"
            "\n• JAMAIS de site statique HTML/CSS basique."
            "\n• package.json DOIT lister TOUTES les dépendances importées (react, react-dom, "
            "react-router-dom, framer-motion, lucide-react, clsx, tailwind-merge, vite, "
            "@vitejs/plugin-react, tailwindcss, postcss, autoprefixer, typescript)."
            "\n• vite.config.ts DOIT toujours inclure server: { host: true }."
            "\n• Chaque import dans le code DOIT correspondre à une dépendance dans package.json."
            "\n• src/lib/utils.ts DOIT exporter cn() (clsx + tailwind-merge) et formatPrice()."
            "\n• main.tsx : <BrowserRouter><App /></BrowserRouter> — BrowserRouter ICI UNIQUEMENT."
            "\n• App.tsx : <Routes><Route /></Routes> — JAMAIS de BrowserRouter dans App.tsx."
            f"\n\n{RECURRING_BUG_PREVENTION}"
        )

        if is_landing:
            base += (
                "\n\n══ STRUCTURE LANDING PAGE SAAS — OBLIGATOIRE ══"
                "\nGénère ces composants dans src/components/sections/ :"
                "\n1. HeroSection.tsx — titre H1 géant + badge + CTA + glow background"
                "\n2. LogosSection.tsx — 'Trusted by' + 6-8 entreprises fictives"
                "\n3. ProblemSection.tsx — 3-4 pain points avec icônes"
                "\n4. SolutionSection.tsx — présentation du produit"
                "\n5. FeaturesSection.tsx — bento grid de 6+ features glassmorphism"
                "\n6. HowItWorksSection.tsx — 3 étapes numérotées"
                "\n7. TestimonialsSection.tsx — 3-6 témoignages réalistes"
                "\n8. PricingSection.tsx — 3 tiers (Free/Pro/Enterprise)"
                "\n9. CTASection.tsx — section finale avec glow"
                "\n• Navbar.tsx : fixed, backdrop-blur, hamburger mobile"
                "\n• Footer.tsx : 4 colonnes de liens + copyright"
                "\n• Home.tsx : assemble toutes les sections"
                "\n• Animations Framer Motion sur CHAQUE section (whileInView, stagger)."
                "\n• COPYWRITING : titres percutants, bénéfice-driven, JAMAIS de lorem ipsum."
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
            "\n\n══ QUALITÉ VISUELLE ══"
            "\n• Design niveau agence / Framer template. JAMAIS de page vide ou générique."
            "\n• Fond sombre (bg-[#09090B] ou équivalent) avec effets glassmorphism."
            "\n• Chaque section : animations Framer Motion entrée au scroll."
            "\n• Typo imposante : titres text-5xl+ font-black."
            "\n• Images : Unsplash URLs réelles (https://images.unsplash.com/photo-ID?w=800)."
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
                "description": "Config : package.json (toutes dépendances) + vite.config.ts (host:true) + tsconfig.json + tailwind.config.js + postcss.config.js + index.html (Google Fonts)",
                "steps": ["Créer package.json avec react, react-dom, react-router-dom, framer-motion, lucide-react, clsx, tailwind-merge, vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer, @types/react, @types/react-dom", "Créer vite.config.ts avec server.host:true", "Créer tsconfig.json", "Créer tailwind.config.js", "Créer postcss.config.js", "Créer index.html avec Google Fonts"],
                "tools": ["filesystem"],
            },
            {
                "description": "Design system : src/lib/utils.ts (cn + formatPrice) + src/index.css (@tailwind + CSS vars) + src/constants/theme.ts",
                "steps": ["Créer src/lib/utils.ts", "Créer src/index.css avec variables --bg, --primary, --accent", "Créer src/constants/theme.ts"],
                "tools": ["filesystem"],
            },
            {
                "description": "Layout : src/components/layout/Navbar.tsx (fixed, backdrop-blur, hamburger mobile) + Footer.tsx (4 colonnes)",
                "steps": ["Créer Navbar.tsx", "Créer Footer.tsx"],
                "tools": ["filesystem"],
            },
            {
                "description": "Hero + Social Proof : src/components/sections/HeroSection.tsx (titre géant + badge + CTA + glow) + LogosSection.tsx (6 entreprises fictives)",
                "steps": ["Créer HeroSection.tsx avec radial glow, titre H1 gradient, badge animé, 2 CTAs", "Créer LogosSection.tsx"],
                "tools": ["filesystem"],
            },
            {
                "description": "Problem + Solution : src/components/sections/ProblemSection.tsx + SolutionSection.tsx avec contenu marketing réel",
                "steps": ["Créer ProblemSection.tsx avec 3-4 pain points", "Créer SolutionSection.tsx"],
                "tools": ["filesystem"],
            },
            {
                "description": "Features bento grid : src/components/sections/FeaturesSection.tsx (6+ features glassmorphism cards + stagger animation)",
                "steps": ["Créer FeaturesSection.tsx avec bento grid, 6 features, hover animation, icônes Lucide"],
                "tools": ["filesystem"],
            },
            {
                "description": "How It Works + Testimonials : src/components/sections/HowItWorksSection.tsx (3 étapes) + TestimonialsSection.tsx (3-6 témoignages réalistes)",
                "steps": ["Créer HowItWorksSection.tsx", "Créer TestimonialsSection.tsx"],
                "tools": ["filesystem"],
            },
            {
                "description": "Pricing : src/components/sections/PricingSection.tsx (3 tiers Free/Pro/Enterprise, toggle mensuel/annuel, CTA par tier)",
                "steps": ["Créer PricingSection.tsx avec 3 tiers et toggle"],
                "tools": ["filesystem"],
            },
            {
                "description": "CTA final : src/components/sections/CTASection.tsx (section percutante avec gros glow)",
                "steps": ["Créer CTASection.tsx"],
                "tools": ["filesystem"],
            },
            {
                "description": "Assembly : src/main.tsx (BrowserRouter wrapping App) + src/App.tsx (Routes seulement, pas de BrowserRouter) + src/pages/Home.tsx + src/index.css",
                "steps": ["Créer main.tsx avec BrowserRouter wrapping App (JAMAIS createBrowserRouter)", "Créer App.tsx avec Routes/Route sans BrowserRouter", "Créer Home.tsx assemblant toutes les sections dans l'ordre"],
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
                "description": "Config : package.json (react, react-dom, react-router-dom, framer-motion, lucide-react, firebase, @stripe/stripe-js, @stripe/react-stripe-js) + vite.config.ts + tsconfig.json + tailwind.config.js + index.html",
                "steps": [
                    "Créer package.json avec toutes les dépendances : firebase, @stripe/stripe-js, @stripe/react-stripe-js (PAS supabase)",
                    "Créer vite.config.ts avec server.host:true et resolve.alias {'@': './src'}",
                    "Créer tsconfig.json, tailwind.config.js, postcss.config.js, index.html avec Google Fonts",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Data + utils + types + .env.example : src/data/products.ts (12+ produits) + src/lib/utils.ts + src/types/index.ts + .env.example (Firebase + Stripe vars)",
                "steps": [
                    "Créer src/data/products.ts avec 12 produits réels (nom, prix, oldPrice?, image Unsplash, catégorie, description, badge?, rating, inStock) + categories[]",
                    "Créer src/lib/utils.ts avec cn(), formatPrice(), whatsappLink()",
                    "Créer src/types/index.ts avec Product, Category, CartItem, User, Order interfaces",
                    "Créer .env.example avec VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID, VITE_STRIPE_PUBLISHABLE_KEY",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Cart context : src/context/CartContext.tsx — COMPLET : CartContext, CartProvider, CartItem, useCart, useCartStore alias, isOpen, toggleCart",
                "steps": [
                    "Créer src/context/CartContext.tsx avec CartContext + CartProvider + useState pour items et isOpen",
                    "Implémenter addItem (upsert), removeItem, updateQuantity, clearCart, toggleCart",
                    "Exporter CartProvider (default + named), useCart hook, useCartStore alias, CartItem type",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Firebase lib + Auth : src/lib/firebase.ts (initializeApp + auth + db) + src/context/AuthContext.tsx (email/password + Google) + src/pages/Login.tsx + Register.tsx + ProtectedRoute.tsx",
                "steps": [
                    "Créer src/lib/firebase.ts : initializeApp(firebaseConfig) via VITE_FIREBASE_* env vars, export auth = getAuth(app), db = getFirestore(app)",
                    "Créer src/context/AuthContext.tsx : onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider+signInWithPopup, signOut, loading state",
                    "Créer src/pages/Login.tsx : formulaire email+password + bouton Google Sign-In, gestion erreurs Firebase (auth/wrong-password, auth/user-not-found...)",
                    "Créer src/pages/Register.tsx : inscription + setDoc(doc(db,'users',uid), {email, displayName, createdAt})",
                    "Créer src/components/auth/ProtectedRoute.tsx : const {user,loading} = useAuth(); if loading return spinner; return user ? <Outlet> : <Navigate to='/login'>",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Stripe PaymentElement (Apple Pay + Google Pay + cartes) : src/lib/stripe.ts + CheckoutForm.tsx + Checkout.tsx + OrderSuccess.tsx + Firebase Cloud Function createPaymentIntent",
                "steps": [
                    "Créer src/lib/stripe.ts : export stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)",
                    "Créer src/components/checkout/CheckoutForm.tsx avec PaymentElement + confirmPayment (automatic_payment_methods active Apple Pay + Google Pay)",
                    "Créer src/pages/Checkout.tsx : fetch POST /api/create-payment-intent → clientSecret, <Elements stripe={stripePromise} options={{clientSecret}}>",
                    "Créer src/pages/OrderSuccess.tsx : confirmation + addDoc(collection(db,'orders'), {userId, items, total, status:'paid', createdAt})",
                    "Créer functions/package.json : {dependencies: {firebase-functions:'^4', firebase-admin:'^12', stripe:'^16'}}",
                    "Créer functions/src/index.ts : createPaymentIntent onRequest avec stripe.paymentIntents.create({automatic_payment_methods:{enabled:true}}) + stripeWebhook pour update Firestore",
                    "Mettre à jour firebase.json : ajouter {functions:{source:'functions'}} + rewrite {source:'/api/**', function:'createPaymentIntent'}",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Layout : src/components/layout/Navbar.tsx (isActive helper, compteur panier, hamburger mobile) + Footer.tsx + src/components/cart/CartDrawer.tsx (drawer animé)",
                "steps": [
                    "Créer Navbar.tsx avec isActive helper (path.startsWith('/#') → false, '/' → exact match), badge panier, hamburger",
                    "Créer Footer.tsx avec 3-4 colonnes de liens",
                    "Créer CartDrawer.tsx : drawer Framer Motion, items list, quantités éditables, total, bouton Checkout",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Composants produit : src/components/product/ProductCard.tsx (hover, quick-add, badge) + ProductGrid.tsx + src/components/catalogue/FilterBar.tsx",
                "steps": [
                    "Créer ProductCard.tsx avec image, nom, prix, badge, hover scale, bouton add-to-cart",
                    "Créer ProductGrid.tsx avec grid responsive",
                    "Créer FilterBar.tsx avec boutons catégories + champ recherche",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Pages Home + Products + ProductDetail : hero animé, catalogue filtrable, page détail avec galerie et bouton WhatsApp",
                "steps": [
                    "Créer src/pages/Home.tsx : hero + produits featured + catégories + CTA",
                    "Créer src/pages/Products.tsx : FilterBar + ProductGrid + état filtres",
                    "Créer src/pages/ProductDetail.tsx : galerie images, description, features, add-to-cart, bouton WhatsApp",
                ],
                "tools": ["filesystem"],
            },
            {
                "description": "Assembly : src/main.tsx (BrowserRouter wrapper) + src/App.tsx (Routes + CartProvider SANS BrowserRouter) + src/index.css (@tailwind + variables CSS)",
                "steps": [
                    "Créer main.tsx : ReactDOM.createRoot + <BrowserRouter><App /></BrowserRouter>",
                    "Créer App.tsx : <CartProvider><Navbar/><Routes><Route/></Routes><Footer/><CartDrawer/></CartProvider> — JAMAIS de BrowserRouter ici",
                    "Créer src/index.css avec @tailwind base/components/utilities + variables CSS --primary, --bg",
                ],
                "tools": ["filesystem"],
            },
        ]

        # Firebase Auth + Stripe are always included in the tasks above (not conditional)
        # needs_auth / needs_payment kept for potential future conditional enhancements
        _ = needs_auth, needs_payment

        return tasks

    def _fallback_plan(self, objective: str) -> List[Dict[str, Any]]:
        """Plan de secours générique."""
        return [
            {
                "description": "Initialiser la structure et la configuration du projet",
                "steps": ["Créer les fichiers de configuration (package.json, vite.config.ts, tsconfig.json, tailwind.config.js, index.html)"],
                "tools": ["filesystem"],
            },
            {
                "description": "Générer le code source principal avec design premium",
                "steps": ["Analyser les besoins", "Créer les composants principaux avec Framer Motion et Tailwind CSS"],
                "tools": ["filesystem", "llm"],
            },
            {
                "description": "Créer les utilitaires et données mockées réalistes",
                "steps": ["src/lib/utils.ts", "Données de contenu réalistes"],
                "tools": ["filesystem"],
            },
            {
                "description": "Assembly final : main.tsx (BrowserRouter wrapping App) + App.tsx (Routes sans BrowserRouter) + index.css",
                "steps": ["main.tsx : BrowserRouter wrapping <App />, JAMAIS createBrowserRouter", "App.tsx : <Routes><Route /></Routes> seulement"],
                "tools": ["filesystem"],
            },
        ]
