"""
Prompts de haut niveau pour chaque type de projet généré.
Injectés dans le contexte de la tâche pour guider la génération de code.
"""

# ─── Bug-prevention patterns — injected into every React project ───────────────

RECURRING_BUG_PREVENTION = """
══ BUG PREVENTION RULES — MANDATORY FOR ALL REACT PROJECTS ══

1) NAVBAR — isActive helper (copy-paste EXACTLY, never improvise):
   import { useLocation } from 'react-router-dom';
   const location = useLocation();
   const isActive = (path: string) => {
     if (path.startsWith('/#')) return false;
     if (path === '/') return location.pathname === '/';
     return location.pathname === path || location.pathname.startsWith(path + '/');
   };
   // NEVER use link.path.split('#')[0] to detect active state.
   // NEVER use key={link.path} when multiple links share the same path → use key={link.label}

2) SECTIONS — Visually distinct backgrounds (light theme):
   - NEVER bg-[var(--surface)] or bg-slate-50 alone → too close to white, invisible
   - Mandatory pattern for light theme:
       odd sections  → bg-white
       even sections → bg-violet-50   ← clearly visible, safe with any dark text
       1 strong section → bg-gradient-to-br from-violet-50 to-blue-50  (e.g.: About)
   - For dark theme: alternate bg-[#09090B] / bg-[#0F0F12]
   - NAVBAR — hash anchors: use onClick + scrollIntoView, NEVER <Link to="/#section">
     Correct pattern:
       const handleNavClick = (hash: string) => {
         if (!hash) return;
         const el = document.getElementById(hash.replace('#', ''));
         el?.scrollIntoView({ behavior: 'smooth' });
       };
     or <a href="#section"> for simple links (native HTML).
   - SECTION anchors: add id="about", id="contact", id="categories" on <section> elements

3) BROWSERROUTER — mandatory split:
   main.tsx  →  <BrowserRouter><App /></BrowserRouter>   (BrowserRouter HERE only)
   App.tsx   →  <Routes><Route /></Routes>              (NEVER BrowserRouter here)
   NEVER two nested BrowserRouters → React crash at runtime.

4) IMPORTS — always verify:
   - Every import in code must correspond to a dependency in package.json.
   - Every imported component must be created in the same task or a previous task.
   - Never import from a path that doesn't exist yet.

5) FRAMER MOTION — variant key consistency (CRITICAL):
   staggerContainer/staggerItem variants use keys "hidden" and "show".
   fadeInUp/scaleIn/fadeIn variants use keys "hidden" and "visible".
   ABSOLUTE RULE: the key passed to animate= or whileInView= MUST match
   a key defined in variants=.
   - staggerContainer → always animate="show" or whileInView="show"
   - staggerItem      → inherits automatically, do NOT put animate= on it
   - fadeInUp/scaleIn → animate="visible" or whileInView="visible"
   IF keys don't match → component stays at opacity:0 → section INVISIBLE.
   NEVER: variants={staggerContainer} animate="visible"  ← invisible!
   ALWAYS: variants={staggerContainer} whileInView="show"  ← correct

   FILTERED GRIDS (Gallery, catalog with categories):
   - DO NOT use whileInView on cards in a filtered grid → stays invisible after filter.
   - Correct pattern for filterable grids:
       <motion.div key={activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
         {filtered.map((item, i) => (
           <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
   - The key={activeCategory} on the container triggers re-animation on each filter.

6) CSS — every custom class used MUST be defined in globals.css:
   - If you use className="gradient-text" → define .gradient-text in globals.css
   - If you use className="section-label" → define .section-label in globals.css
   - If you use className="shadow-glow"   → define .shadow-glow in globals.css
   - Never reference an arbitrary Tailwind class that doesn't exist.
   - Opacity modifiers on CSS variables (bg-[var(--primary)]/10) do NOT
     work in Tailwind v3 unless the variable is in RGB channels format.
     → Prefer: bg-primary/10 if "primary" is defined in tailwind.config.js,
       OR use color-mix() directly in globals.css.
   - ring-2 ring-[var(--primary)] shows BLUE by default if the variable isn't recognized.
     For "highlighted" cards (e.g.: pricing), use style={{ boxShadow: '...' }}:
       style={{ boxShadow: '0 0 0 3px rgba(R,G,B,0.3), 0 4px 24px rgba(R,G,B,0.15)' }}

7) FONTS — mandatory consistency between index.html and globals.css:
   - Fonts loaded in <link> Google Fonts in index.html MUST match
     exactly the names in --font-display and --font-body in globals.css.
   - If index.html loads "Cormorant Garamond" → globals.css must have
     --font-display: 'Cormorant Garamond', serif; NOT 'Syne' or anything else.
   - Verify exact font name match (case-sensitive and space-sensitive).

8) LAYOUT & SECTION SPACING:
   - If Layout.tsx adds pt-16 lg:pt-20 on <main> to compensate for fixed navbar,
     DO NOT add extra padding-top in HeroSection or the first section.
   - Standard spacing between sections: py-12 lg:py-16 (never py-24 lg:py-32).
   - Consecutive sections accumulate their padding (bottom + top) → stay moderate.

9) EXTERNAL IMAGES — use only verified and public URLs:
   - Unsplash: https://images.unsplash.com/photo-{ID}?w=800&q=80 → reliable
   - Wikipedia Commons: DO NOT use for brand logos → URLs often non-existent.
   - For brand logos (OPI, Essie, etc.) → use styled text, not images.
   - For avatars/photos: Unsplash only with a real photo ID.
   - NEVER invent an image URL → guaranteed broken display.

10) LAYOUT PATTERN — Outlet vs children:
    - If Layout.tsx uses <Outlet />, then App.tsx MUST use nested routes:
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          ...
        </Route>
    - NEVER <Layout><Home /></Layout> if Layout uses Outlet → TS error + empty render.

11) HOMEPAGE STRUCTURE — Max 6-7 sections, optimal order:
    Mandatory order: Hero → Logos/Social proof → Value proposition → Features (3 max) → CTA → Footer
    - Hero MUST have: headline, sub-headline, primary CTA button, visual or image.
    - NEVER put the full FAQ, complete services list, or full gallery on the homepage.
      → Use "teaser" sections (3 items max) with a "See all" link.
    - Each section must have a visually distinct background from the previous (light/dark alternation).
    - Max 3 features/benefits highlighted on the homepage — choose the most impactful.
    - A single strong CTA section at the end of the page before the footer.

12) NAMED EXPORTS — ABSOLUTE RULE:
    Every React component MUST have BOTH exports:
      export const MyComponent: React.FC = () => { ... };   ← named export
      export default MyComponent;                            ← default export
    NEVER only "export default" — index.ts files re-export by name.
    Same for badges, contexts, hooks: always named export + default export.

13) FIELD NAME CONSISTENCY IN DATA FILES:
    Before accessing a field in a component, check the interface in the data file.
    Common error examples:
    - data/gallery.ts defines { url: string } but component uses image.imageUrl → crash
    - data/homeContent.ts defines { badge: string } but component uses heroContent.badges.map() → crash
    - data/services.ts defines { price, duration } but component calls service.features.map() → crash
    RULE: always inspect the TypeScript interface of the data file before writing the component.

14) FORM BUTTONS — type="button" mandatory:
    Any <button> that is NOT a submit MUST have type="button" to prevent accidental submission.
    NEVER <button onClick={...}> without type inside a <form>.
    ESPECIALLY navigation buttons (prev/next stepper), gallery filters, toggles.
    Correct pattern: <button type="button" onClick={handleFilter}>...</button>

15) "FEATURED" BADGES IN CARDS — NEVER in absolute -top:
    A "Most popular" / "Popular" badge in absolute -top-3 position overlaps content.
    Correct pattern: place the badge IN the normal flow at the top of the card:
      <div className="flex justify-center mb-4">
        <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
          Most popular
        </span>
      </div>
    Add pt-8 or pt-12 on the non-featured card to align card bodies.

16) EMOJIS — FORBIDDEN in production UIs:
    Never put emojis in section titles, badges, labels, or UI text.
    Emojis break typography and give a "cheap template" feel.
    If stars are required (ratings) → use Lucide icons (Star) or ★ HTML entities.

17) BUTTONS — valid variants ONLY (in Button.tsx):
    variant="primary"   → colored background (primary CTA)
    variant="secondary" → secondary background
    variant="outline"   → visible border, transparent background
    variant="ghost"     → no border or background
    NEVER variant="filled"     → doesn't exist, use "primary"
    NEVER variant="default"    → doesn't exist, use "primary"
    NEVER variant="contained"  → doesn't exist, use "primary"
    NEVER variant="solid"      → doesn't exist, use "primary"
    Button does NOT accept href prop → wrap in <a href="..."><Button>...</Button></a>

18) REACT IMPORTS — ALWAYS declare every API used:
    Every React hook or function MUST appear in the import:
      import { createContext, useState, useEffect, useContext, useRef } from 'react';
    Same for react-router-dom:
      import { Routes, Route, Link, useNavigate, useLocation, useParams, Navigate, Outlet } from 'react-router-dom';
    And for Firebase:
      import { initializeApp, getApps } from 'firebase/app';  ← MANDATORY if getAuth()/getFirestore() used
    RULE: if you write `createContext(` without importing it → guaranteed runtime error.
    CHECK: verify each file — the import line MUST list all names used.

19) @ ALIAS — vite.config.ts MUST have resolve.alias:
    resolve: { alias: { '@': path.resolve(__dirname, './src') } }
    If you use `import X from '@/components/...'` without this alias → build error.
    Always use relative paths (../../) OR verify the alias is configured.
    PREFERENCE: relative paths to avoid any ambiguity.
"""

# ─── Firebase full stack pattern ──────────────────────────────────────────────

FIREBASE_STACK_PATTERN = """
══ COMPLETE FIREBASE STACK — AUTH + FIRESTORE + HOSTING ══

Single package: firebase (includes auth, firestore, storage, functions)

src/lib/firebase.ts (ALWAYS this file, never other names):
  import { initializeApp, getApps } from 'firebase/app';
  import { getAuth } from 'firebase/auth';
  import { getFirestore } from 'firebase/firestore';

  const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db   = getFirestore(app);

src/context/AuthContext.tsx:
  - createContext<AuthContextType | null>(null)
  - useEffect: onAuthStateChanged(auth, setUser) → unsubscribe on cleanup
  - signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider + signInWithPopup
  - Expose: user, loading, signIn(email, pw), signUp(email, pw), signInWithGoogle(), signOut()

src/components/auth/ProtectedRoute.tsx:
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;

Standard Firestore collections:
  - users/{uid}        : { email, displayName, createdAt, role }
  - products/{id}      : { name, price, category, imageUrl, inStock, description }
  - orders/{id}        : { userId, items[], total, status, createdAt, stripePaymentIntentId }
  - carts/{uid}        : { items: [{ productId, quantity, price, name }] }

.env.example :
  VITE_FIREBASE_API_KEY=AIza...
  VITE_FIREBASE_AUTH_DOMAIN=xxxx.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=xxxx
  VITE_FIREBASE_STORAGE_BUCKET=xxxx.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
  VITE_FIREBASE_APP_ID=1:123:web:abc
"""

# ─── Payment pattern (Stripe + Firebase Cloud Functions) ──────────────────────

STRIPE_CHECKOUT_PATTERN = """
══ STRIPE PAYMENTS — APPLE PAY + GOOGLE PAY + CARDS — MANDATORY PATTERN ══

Architecture: React (frontend) + Firebase Cloud Functions (serverless backend)
Frontend packages: @stripe/stripe-js @stripe/react-stripe-js
Backend package: stripe (in functions/package.json)

━━━ FRONTEND ━━━

src/lib/stripe.ts :
  import { loadStripe } from '@stripe/stripe-js';
  export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

src/components/checkout/CheckoutForm.tsx :
  import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
  // PaymentElement AUTOMATICALLY shows: Apple Pay, Google Pay, cards, Link
  const stripe = useStripe();
  const elements = useElements();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/order-success' },
    });
    if (error) setErrorMsg(error.message ?? 'Paiement échoué');
    setLoading(false);
  };
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay'}
      </button>
      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
    </form>
  );

src/pages/Checkout.tsx:
  import { Elements } from '@stripe/react-stripe-js';
  // clientSecret retrieved via the Cloud Function createPaymentIntent
  const [clientSecret, setClientSecret] = useState('');
  useEffect(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: totalPrice * 100, currency: 'eur' }),
    }).then(r => r.json()).then(d => setClientSecret(d.clientSecret));
  }, [totalPrice]);

  return clientSecret ? (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  ) : <LoadingSpinner />;

src/pages/OrderSuccess.tsx:
  - Displays an order confirmation message
  - Reads orderId from Stripe query params (payment_intent)
  - Saves order to Firestore orders/{id}

━━━ BACKEND (Firebase Cloud Functions) ━━━

functions/package.json: { "dependencies": { "firebase-functions": "^4", "firebase-admin": "^12", "stripe": "^16" } }

functions/src/index.ts :
  import * as functions from 'firebase-functions';
  import Stripe from 'stripe';
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  export const createPaymentIntent = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    const { amount, currency = 'eur' } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },  // enables Apple Pay + Google Pay
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  });

  export const stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature']!;
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      // Update order status in Firestore
      const admin = await import('firebase-admin');
      await admin.firestore().collection('orders').doc(pi.metadata.orderId).update({ status: 'paid' });
    }
    res.json({ received: true });
  });

firebase.json (add):
  "functions": { "source": "functions" },
  "hosting": {
    "rewrites": [
      { "source": "/api/**", "function": "createPaymentIntent" },
      { "source": "**", "destination": "/index.html" }
    ]
  }

.env.example :
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...         (Firebase Functions config, NEVER in src/)
  STRIPE_WEBHOOK_SECRET=whsec_...

IMPORTANT:
  - NEVER put STRIPE_SECRET_KEY in src/ — only in Firebase Functions
  - automatic_payment_methods: { enabled: true } automatically enables Apple Pay + Google Pay
  - Apple Pay requires a verified domain (Firebase Hosting auto-verifies *.web.app)
  - Google Pay works on Chrome desktop and Android with no extra configuration
  - In test mode: Stripe test card → 4242 4242 4242 4242
"""

# Alias pour compatibilité avec l'ancien nom
SUPABASE_AUTH_PATTERN = FIREBASE_STACK_PATTERN

# ─── Generic static ────────────────────────────────────────────────────────────

STATIC_PROJECT_PROMPT = """
Generate a pure HTML/CSS/JS static website (Tailwind via CDN).
Standards: modern, responsive, no placeholders, real business content.

index.html structure:
- Google Fonts via <link> (Inter or Plus Jakarta Sans)
- Tailwind Play CDN
- Sticky navigation + hero + content sections + footer
- CSS animations (transitions, keyframes) or Alpine.js for interactivity

Launch: open index.html directly in browser.
Free hosting: Cloudflare Pages, Netlify, Vercel (drag & drop).
"""

# ─── SaaS Landing Page (principal template premium) ───────────────────────────

SAAS_LANDING_PAGE_PROMPT = """
══════════════════════════════════════════════════════════════════════
 SAAS LANDING PAGE TEMPLATE — AGENCY QUALITY / PREMIUM FRAMER
══════════════════════════════════════════════════════════════════════

Stack: React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion + Lucide React

━━━ EXACT STACK TO GENERATE ━━━

package.json doit contenir EXACTEMENT ces dépendances :
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "framer-motion": "^11.3.21",
    "lucide-react": "^0.424.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "vite": "^5.4.1",
    "@vitejs/plugin-react": "^4.3.1",
    "tailwindcss": "^3.4.10",
    "postcss": "^8.4.41",
    "autoprefixer": "^10.4.20",
    "@types/react": "^18.3.4",
    "@types/react-dom": "^18.3.0"
  }
}

━━━ MANDATORY FILE STRUCTURE ━━━

src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx         ← fixed, backdrop-blur, mobile hamburger
│   │   └── Footer.tsx         ← 4 columns, links, copyright
│   └── sections/
│       ├── HeroSection.tsx    ← giant title + CTA + visual + glow bg
│       ├── LogosSection.tsx   ← "trusted by" + 6-8 text logos
│       ├── ProblemSection.tsx ← 3-4 pain points with icons
│       ├── SolutionSection.tsx
│       ├── FeaturesSection.tsx ← bento grid 6+ glassmorphism cards
│       ├── HowItWorksSection.tsx ← 3 numbered steps
│       ├── TestimonialsSection.tsx ← 3-6 realistic quotes
│       ├── PricingSection.tsx ← 3 tiers with monthly/annual toggle
│       └── CTASection.tsx     ← final section with glow
├── lib/
│   └── utils.ts               ← cn() helper + formatPrice()
├── constants/
│   └── theme.ts               ← palette + reusable variants
├── pages/
│   └── Home.tsx               ← assembles all sections
├── App.tsx                    ← BrowserRouter + Routes
├── main.tsx                   ← ReactDOM.createRoot
└── index.css                  ← @tailwind + custom CSS variables

━━━ COLOR PALETTE ━━━

Choose ONE palette and define it in index.css as CSS variables:

  Dark SaaS (default):
    --bg: #09090B;
    --surface: #18181B;
    --border: rgba(255,255,255,0.08);
    --primary: #8B5CF6;
    --primary-hover: #7C3AED;
    --accent: #A78BFA;
    --text: #FAFAFA;
    --text-muted: #A1A1AA;

tailwind.config.js must extend colors with these variables.

━━━ KEY COMPONENTS — EXACT PATTERNS ━━━

NAVBAR:
  - position: fixed, top: 0, z-index: 50
  - bg: backdrop-blur-xl bg-black/80 border-b border-white/8
  - Logo: name + Zap icon (or similar)
  - Nav links: Features, Pricing, About (hidden on mobile)
  - CTAs: "Log in" (ghost) + "Get started" (filled primary)
  - Mobile: Menu/X icon toggle, drawer or dropdown

HERO:
  - Full screen: min-h-screen flex items-center justify-center
  - Animated badge: pulsing dot + short text (e.g.: "Now in public beta")
  - H1: 5xl/7xl/8xl, font-black, tracking-tight, 2-3 lines max
    → 1-2 words in violet→cyan or violet→pink gradient
  - Subheadline: max-w-xl text-lg text-white/70
  - CTA row: filled button + ghost outline button
  - Social proof row: "5,000+ teams" + 5 avatars (colored initials)
  - Hero visual: card/dashboard mockup or abstract shape in absolute position
  - Background: 2 radial glow blobs in absolute, pointer-events-none

FEATURES SECTION — Bento Grid:
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
    {/* Big card */}
    <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
    {/* Standard cards */}
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">

TESTIMONIALS:
  3-column grid (lg:grid-cols-3), each card:
  - Quote in italic
  - Avatar (initials in colored circle OR Unsplash face image)
  - Name + Role + Company
  - 5 gold stars (★★★★★)

PRICING — Monthly/annual toggle:
  const [annual, setAnnual] = useState(false)
  3 tiers: Free ($0) / Pro ($29/mo or $19 annual) / Enterprise (custom)
  Pro tier highlighted: ring-2 ring-violet-500 shadow-lg shadow-violet-500/20

━━━ COPYWRITING ━━━

Adapt copy to the project domain. Style: benefit-driven, emotional, concrete.

For the Hero, draw from these patterns (ADAPT to the actual subject):
  "Ship faster. Break nothing. Sleep well." (DevTools)
  "Your analytics, finally making sense." (Analytics)
  "Stop losing leads. Start closing deals." (CRM/Sales)
  "The creative workspace your team deserves." (Design/PM)

For features, structure as:
  SHORT TITLE (3-5 words max) + DESCRIPTION 1 benefit sentence
  Ex: "Zero-latency sync" → "Collaborate without the lag. Your team stays in sync, always."

For testimonials, invent realistic profiles:
  - Sarah Chen, Engineering Lead @ Datastream
  - Marcus Okonkwo, Founder @ BuildFast
  - Julie Marchand, Head of Product @ Nexus AI

━━━ ANIMATIONS ━━━

Every section MUST have:
1. motion.div with whileInView {{ opacity: 0→1, y: 40→0 }} viewport once
2. Stagger on grids (staggerChildren: 0.08)
3. whileHover on cards and buttons

━━━ RESPONSIVE ━━━

Navbar: hamburger on mobile (useState toggle)
Hero: text-4xl sm:text-6xl lg:text-8xl — title always readable
Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 everywhere
Padding: px-4 sm:px-6 lg:px-8 — no horizontal overflow

Launch: npm run dev → http://localhost:5173
Hosting: Vercel (vercel deploy), Netlify, Cloudflare Pages

{RECURRING_BUG_PREVENTION}
"""

# ─── React + Node.js + SQLite ──────────────────────────────────────────────────

REACT_NODE_SQLITE_PROJECT_PROMPT = """
Stack: React (Vite, Tailwind, Framer Motion, Lucide React) + Node.js (Express) + SQLite

FRONTEND — same visual quality level as the SaaS Landing Page template.
BACKEND — REST API Express with SQLite (via better-sqlite3 or sqlite3).

vite.config.ts MUST contain server: { host: true }

Backend structure:
  server/
  ├── index.js       ← Express app, CORS, routes
  ├── db.js          ← SQLite init + migrations
  └── routes/        ← CRUD endpoints

Launch:
  - Frontend: npm run dev (port 5173)
  - Backend: node server/index.js (port 3001)

Hosting:
  - Frontend: Vercel, Netlify, Cloudflare Pages
  - Backend: Railway, Render, Fly.io

{RECURRING_BUG_PREVENTION}
"""

# ─── React + Supabase ──────────────────────────────────────────────────────────

REACT_SUPABASE_PROJECT_PROMPT = """
Stack: React (Vite, Tailwind, Framer Motion, Lucide React) + Supabase

FRONTEND — same visual quality level as the SaaS Landing Page template.
BACKEND — Supabase (auth, PostgreSQL, Storage, Realtime).

vite.config.ts MUST contain server: { host: true }

Supabase client in src/lib/supabase.ts:
  import {{ createClient }} from '@supabase/supabase-js'
  export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

Environment variables (.env):
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...

Hosting: Supabase (backend) + Vercel (frontend)
"""

# ─── E-commerce premium template ──────────────────────────────────────────────

ECOMMERCE_PREMIUM_PROMPT = """
══════════════════════════════════════════════════════════════════════
 PREMIUM E-COMMERCE TEMPLATE — AGENCY QUALITY
 Stack: React 18 + Vite + TypeScript + Tailwind + Firebase + Stripe
══════════════════════════════════════════════════════════════════════

━━━ MANDATORY STRUCTURE ━━━

src/
├── lib/
│   ├── firebase.ts              ← initializeApp, getAuth, getFirestore (ALWAYS this name)
│   ├── stripe.ts                ← loadStripe(VITE_STRIPE_PUBLISHABLE_KEY)
│   └── utils.ts                 ← cn(), formatPrice(), whatsappLink()
├── context/
│   ├── CartContext.tsx          ← CartProvider + useCart + CartItem
│   └── AuthContext.tsx          ← Firebase Auth (email + Google) + useAuth
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx           ← fixed, cart counter, isActive helper, hamburger
│   │   └── Footer.tsx
│   ├── product/
│   │   ├── ProductCard.tsx      ← hover anim, quick-add, New/Sale badge
│   │   └── ProductGrid.tsx
│   ├── cart/
│   │   └── CartDrawer.tsx       ← Framer Motion drawer, items, quantities, total
│   ├── checkout/
│   │   └── CheckoutForm.tsx     ← Stripe PaymentElement (Apple Pay + Google Pay + cards)
│   └── auth/
│       └── ProtectedRoute.tsx   ← checks useAuth().user
├── pages/
│   ├── Home.tsx                 ← hero + featured products + categories + CTA
│   ├── Products.tsx             ← filterable catalog (category + search)
│   ├── ProductDetail.tsx        ← gallery, specs, add-to-cart, WhatsApp button
│   ├── Cart.tsx                 ← editable cart summary
│   ├── Checkout.tsx             ← Elements wrapper + clientSecret from Cloud Function
│   ├── OrderSuccess.tsx         ← order confirmation + Firestore save
│   ├── Login.tsx                ← email/password + Google button
│   └── Register.tsx             ← registration + Firestore profile creation
├── data/
│   └── products.ts              ← 12+ products with REAL names/prices/Unsplash images
├── types/
│   └── index.ts                 ← Product, Category, CartItem, User, Order
functions/                       ← Firebase Cloud Functions (serverless backend)
├── package.json                 ← firebase-functions, firebase-admin, stripe
└── src/
    └── index.ts                 ← createPaymentIntent + stripeWebhook

━━━ CART CONTEXT — EXACT PATTERN ━━━

src/context/CartContext.tsx :
  interface CartItem { id: string; name: string; price: number; image: string; quantity: number; }
  const CartContext = createContext<CartContextType | null>(null);
  export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const totalItems = items.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const addItem = (product: Product, qty = 1) => { /* upsert logic */ };
    const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
    const updateQuantity = (id: string, qty: number) => { /* clamp to 0 */ };
    const clearCart = () => setItems([]);
    const [isOpen, setIsOpen] = useState(false);
    const toggleCart = () => setIsOpen(v => !v);
    return <CartContext.Provider value={{items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart, isOpen, toggleCart}}>{children}</CartContext.Provider>;
  };
  export const useCart = () => { const ctx = useContext(CartContext); if (!ctx) throw new Error('useCart must be used inside CartProvider'); return ctx; };
  export const useCartStore = useCart;

━━━ PRODUCTS — EXACT FORMAT ━━━

src/data/products.ts :
  export interface Product { id: string; name: string; price: number; oldPrice?: number; image: string; images?: string[]; category: string; description: string; badge?: string; rating: number; reviewCount?: number; features?: string[]; inStock: boolean; }
  export const products: Product[] = [ /* 12+ produits avec VRAIS noms, VRAIS prix, images Unsplash */ ];
  export const categories: Category[] = [ /* 5+ catégories avec id, name, icon, count */ ];

━━━ VISUAL RULES ━━━

• Visually DISTINCT BACKGROUNDS between sections:
  Hero → dark gradient | LogosSection → bg-slate-50 | FeaturesSection → bg-white |
  ProblemSection → bg-violet-50 | SolutionSection → bg-white |
  CategoriesSection → bg-slate-50 | AboutSection → bg-gradient-to-br from-violet-50 to-blue-50 |
  HowItWorksSection → bg-violet-50 | TestimonialsSection → bg-gradient-to-b from-violet-50 to-white |
  PricingSection → bg-violet-50 | InfosSection → bg-slate-50 | CTA → strong violet gradient
• NEVER bg-[var(--surface)] or bg-slate-50 alone for "off" sections → use bg-violet-50
• IDs on all anchor sections: id="categories", id="about", id="contact"
• html { scroll-behavior: smooth; } in index.css

{RECURRING_BUG_PREVENTION}
"""

# ─── Stripe ────────────────────────────────────────────────────────────────────

STRIPE_INTEGRATION_PROMPT = """
Integrate Stripe for payments.

Frontend (@stripe/react-stripe-js + @stripe/stripe-js):
  <Elements stripe={{stripePromise}}>
    <CheckoutForm />
  </Elements>

Backend (stripe npm package):
  POST /api/create-payment-intent
  POST /api/create-checkout-session

.env:
  STRIPE_SECRET_KEY=sk_test_...
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

Never expose the secret key client-side.
Test mode → prod mode: change keys, enable webhooks.
"""

# ─── PayPal ────────────────────────────────────────────────────────────────────

PAYPAL_INTEGRATION_PROMPT = """
Integrate PayPal as an alternative payment method.

SDK @paypal/react-paypal-js:
  <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
    <PayPalButtons createOrder={{...}} onApprove={{...}} />
  </PayPalScriptProvider>

Backend:
  POST /api/paypal/create-order
  POST /api/paypal/capture-order

.env:
  PAYPAL_CLIENT_ID=...
  PAYPAL_CLIENT_SECRET=...
  VITE_PAYPAL_CLIENT_ID=...

Sandbox mode → live: change keys and environment.
"""
