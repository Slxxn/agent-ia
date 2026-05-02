"""
Prompts de haut niveau pour chaque type de projet généré.
Injectés dans le contexte de la tâche pour guider la génération de code.
"""

# ─── Bug-prevention patterns — injected into every React project ───────────────

RECURRING_BUG_PREVENTION = """
══ RÈGLES ANTI-BUGS — OBLIGATOIRES POUR TOUT PROJET REACT ══

1) NAVBAR — isActive helper (copier-coller EXACT, ne jamais improviser) :
   import { useLocation } from 'react-router-dom';
   const location = useLocation();
   const isActive = (path: string) => {
     if (path.startsWith('/#')) return false;
     if (path === '/') return location.pathname === '/';
     return location.pathname === path || location.pathname.startsWith(path + '/');
   };
   // NE JAMAIS utiliser link.path.split('#')[0] pour détecter l'état actif.
   // NE JAMAIS utiliser key={link.path} quand plusieurs liens ont le même path → key={link.label}

2) SECTIONS — Backgrounds visuellement distincts (thème clair) :
   - JAMAIS bg-[var(--surface)] ni bg-slate-50 seul → trop proche du blanc, invisible
   - Pattern obligatoire pour thème clair :
       sections impaires  → bg-white
       sections paires    → bg-violet-50   ← clairement visible, safe avec tout texte foncé
       1 section forte    → bg-gradient-to-br from-violet-50 to-blue-50  (ex: About)
   - Pour thème sombre : alterner bg-[#09090B] / bg-[#0F0F12]
   - NAVBAR — ancres hash : utiliser onClick + scrollIntoView, JAMAIS <Link to="/#section">
     Pattern correct :
       const handleNavClick = (hash: string) => {
         if (!hash) return;
         const el = document.getElementById(hash.replace('#', ''));
         el?.scrollIntoView({ behavior: 'smooth' });
       };
     ou <a href="#section"> pour les liens simples (HTML natif).
   - SECTIONS ancres : ajouter id="about", id="contact", id="categories" sur les <section>

3) BROWSERROUTER — split obligatoire :
   main.tsx  →  <BrowserRouter><App /></BrowserRouter>   (BrowserRouter ICI uniquement)
   App.tsx   →  <Routes><Route /></Routes>              (JAMAIS de BrowserRouter ici)
   JAMAIS deux BrowserRouter imbriqués → crash React au runtime.

4) IMPORTS — toujours vérifier :
   - Chaque import dans le code doit correspondre à une dépendance dans package.json.
   - Chaque composant importé doit être créé dans la même tâche ou une tâche précédente.
   - Ne jamais importer depuis un chemin qui n'existe pas encore.

5) FRAMER MOTION — cohérence des clés de variants (CRITIQUE) :
   Les variants staggerContainer/staggerItem utilisent les clés "hidden" et "show".
   Les variants fadeInUp/scaleIn/fadeIn utilisent les clés "hidden" et "visible".
   RÈGLE ABSOLUE : la clé passée à animate= ou whileInView= DOIT correspondre
   à une clé définie dans variants=.
   - staggerContainer → toujours animate="show" ou whileInView="show"
   - staggerItem      → hérite automatiquement, ne pas mettre animate= dessus
   - fadeInUp/scaleIn → animate="visible" ou whileInView="visible"
   SI les clés ne correspondent pas → le composant reste à opacity:0 → section INVISIBLE.
   JAMAIS : variants={staggerContainer} animate="visible"  ← invisible !
   TOUJOURS : variants={staggerContainer} whileInView="show"  ← correct

   GRILLES FILTRÉES (Gallery, catalogue avec catégories) :
   - NE PAS utiliser whileInView sur les cartes d'une grille filtrée → reste invisible après filtre.
   - Pattern correct pour grilles filtrables :
       <motion.div key={activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
         {filtered.map((item, i) => (
           <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
   - La clé key={activeCategory} sur le container déclanche une ré-animation à chaque filtre.

6) CSS — toute classe custom utilisée DOIT être définie dans globals.css :
   - Si tu utilises className="gradient-text" → définir .gradient-text dans globals.css
   - Si tu utilises className="section-label" → définir .section-label dans globals.css
   - Si tu utilises className="shadow-glow"   → définir .shadow-glow dans globals.css
   - Ne jamais référencer une classe Tailwind arbitraire qui n'existe pas.
   - Les modificateurs d'opacité sur des variables CSS (bg-[var(--primary)]/10) ne
     fonctionnent PAS dans Tailwind v3 sauf si la variable est en format RGB channels.
     → Préférer : bg-primary/10 si "primary" est défini dans tailwind.config.js,
       OU utiliser color-mix() dans globals.css directement.
   - ring-2 ring-[var(--primary)] affiche BLEU par défaut si la variable n'est pas reconnue.
     Pour les cards "highlighted" (ex: pricing), utiliser style={{ boxShadow: '...' }} :
       style={{ boxShadow: '0 0 0 3px rgba(R,G,B,0.3), 0 4px 24px rgba(R,G,B,0.15)' }}

7) POLICES — cohérence obligatoire entre index.html et globals.css :
   - Les polices chargées dans <link> Google Fonts de index.html DOIVENT correspondre
     exactement aux noms dans --font-display et --font-body dans globals.css.
   - Si index.html charge "Cormorant Garamond" → globals.css doit avoir
     --font-display: 'Cormorant Garamond', serif; PAS 'Syne' ni autre.
   - Vérifier la correspondance exacte du nom de police (sensible à la casse et aux espaces).

8) LAYOUT & ESPACEMENT DES SECTIONS :
   - Si Layout.tsx ajoute pt-16 lg:pt-20 sur <main> pour compenser la navbar fixe,
     NE PAS ajouter de padding-top supplémentaire dans HeroSection ou la première section.
   - Espacement standard entre sections : py-12 lg:py-16 (jamais py-24 lg:py-32).
   - Les sections consécutives cumulent leur padding (bottom + top) → rester modéré.

9) IMAGES EXTERNES — utiliser uniquement des URLs vérifiées et publiques :
   - Unsplash : https://images.unsplash.com/photo-{ID}?w=800&q=80 → fiable
   - Wikipedia Commons : NE PAS utiliser pour des logos de marques → URLs souvent inexistantes.
   - Pour des logos de marques (OPI, Essie, etc.) → utiliser du texte stylisé, pas des images.
   - Pour des avatars/photos : Unsplash uniquement avec un vrai photo ID.
   - NE JAMAIS inventer une URL d'image → affichage cassé assuré.

10) LAYOUT PATTERN — Outlet vs children :
    - Si Layout.tsx utilise <Outlet />, alors App.tsx DOIT utiliser des routes imbriquées :
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          ...
        </Route>
    - JAMAIS <Layout><Home /></Layout> si Layout utilise Outlet → TS error + render vide.

11) HOMEPAGE STRUCTURE — Max 6-7 sections, ordre optimal :
    Ordre obligatoire : Hero → Logos/Social proof → Value proposition → Features (3 max) → CTA → Footer
    - Hero DOIT avoir : headline, sous-headline, bouton CTA principal, visuel ou image.
    - Ne JAMAIS mettre la FAQ complète, la liste complète des services, ou la galerie complète sur la homepage.
      → Utiliser des sections "teaser" (3 items max) avec un lien "Voir tout".
    - Chaque section doit avoir un fond visuellement distinct de la précédente (alternance claire/sombre).
    - Max 3 features/avantages mis en avant sur la homepage — choisir les plus impactants.
    - Une seule section CTA forte en fin de page avant le footer.

12) EXPORTS NOMMÉS — RÈGLE ABSOLUE :
    Chaque composant React DOIT avoir LES DEUX exports :
      export const MonComposant: React.FC = () => { ... };   ← export nommé
      export default MonComposant;                            ← export default
    JAMAIS uniquement "export default" — les fichiers index.ts ré-exportent via le nom.
    Idem pour les badges, contexts, hooks : toujours export nommé + export default.

13) COHÉRENCE NOMS DE CHAMPS DANS LES DATA FILES :
    Avant d'accéder à un champ dans un composant, vérifier l'interface dans le fichier data.
    Exemples d'erreurs fréquentes :
    - data/gallery.ts définit { url: string } mais composant utilise image.imageUrl → crash
    - data/homeContent.ts définit { badge: string } mais composant utilise heroContent.badges.map() → crash
    - data/services.ts définit { price, duration } mais composant appelle service.features.map() → crash
    RÈGLE : toujours inspecter l'interface TypeScript du data file avant d'écrire le composant.

14) BOUTONS DANS LES FORMULAIRES — type="button" obligatoire :
    Tout <button> qui N'EST PAS un submit DOIT avoir type="button" pour éviter une soumission accidentelle.
    JAMAIS de <button onClick={...}> sans type dans un <form>.
    SURTOUT les boutons de navigation (prev/next stepper), les filtres de galerie, les toggles.
    Pattern correct : <button type="button" onClick={handleFilter}>...</button>

15) BADGES "FEATURED" DANS LES CARDS — JAMAIS en absolute -top :
    Un badge "Le plus populaire" / "Popular" en position absolute -top-3 se superpose au contenu.
    Pattern correct : placer le badge DANS le flux normal en haut de la card :
      <div className="flex justify-center mb-4">
        <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
          Le plus populaire
        </span>
      </div>
    Ajouter pt-8 ou pt-12 sur la card non-featured pour aligner les corps de card.

16) EMOJIS — INTERDITS dans les UI de production :
    Ne jamais mettre d'emojis dans les titres de section, badges, labels, ou textes UI.
    Les emojis cassent la typographie et donnent un aspect "template bon marché".
    Si des étoiles sont requises (ratings) → utiliser des icônes Lucide (Star) ou des ★ HTML.
"""

# ─── Firebase full stack pattern ──────────────────────────────────────────────

FIREBASE_STACK_PATTERN = """
══ STACK FIREBASE COMPLÈTE — AUTH + FIRESTORE + HOSTING ══

Package unique : firebase (inclut auth, firestore, storage, functions)

src/lib/firebase.ts (TOUJOURS ce fichier, jamais d'autres noms) :
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

src/context/AuthContext.tsx :
  - createContext<AuthContextType | null>(null)
  - useEffect : onAuthStateChanged(auth, setUser) → unsubscribe on cleanup
  - signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider + signInWithPopup
  - Exposer : user, loading, signIn(email, pw), signUp(email, pw), signInWithGoogle(), signOut()

src/components/auth/ProtectedRoute.tsx :
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;

Firestore collections standards :
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
══ PAIEMENTS STRIPE — APPLE PAY + GOOGLE PAY + CARTES — PATTERN OBLIGATOIRE ══

Architecture : React (frontend) + Firebase Cloud Functions (backend serverless)
Packages frontend : @stripe/stripe-js @stripe/react-stripe-js
Package backend   : stripe (dans functions/package.json)

━━━ FRONTEND ━━━

src/lib/stripe.ts :
  import { loadStripe } from '@stripe/stripe-js';
  export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

src/components/checkout/CheckoutForm.tsx :
  import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
  // PaymentElement affiche AUTOMATIQUEMENT : Apple Pay, Google Pay, cartes, Link
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
        {loading ? 'Traitement...' : 'Payer'}
      </button>
      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
    </form>
  );

src/pages/Checkout.tsx :
  import { Elements } from '@stripe/react-stripe-js';
  // clientSecret récupéré via la Cloud Function createPaymentIntent
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

src/pages/OrderSuccess.tsx :
  - Affiche un message de confirmation de commande
  - Lit l'orderId depuis les query params Stripe (payment_intent)
  - Sauvegarde la commande dans Firestore orders/{id}

━━━ BACKEND (Firebase Cloud Functions) ━━━

functions/package.json : { "dependencies": { "firebase-functions": "^4", "firebase-admin": "^12", "stripe": "^16" } }

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
      automatic_payment_methods: { enabled: true },  // active Apple Pay + Google Pay
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  });

  export const stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature']!;
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      // Mettre à jour le statut de la commande dans Firestore
      const admin = await import('firebase-admin');
      await admin.firestore().collection('orders').doc(pi.metadata.orderId).update({ status: 'paid' });
    }
    res.json({ received: true });
  });

firebase.json (ajouter) :
  "functions": { "source": "functions" },
  "hosting": {
    "rewrites": [
      { "source": "/api/**", "function": "createPaymentIntent" },
      { "source": "**", "destination": "/index.html" }
    ]
  }

.env.example :
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...         (Firebase Functions config, JAMAIS dans src/)
  STRIPE_WEBHOOK_SECRET=whsec_...

IMPORTANT :
  - JAMAIS STRIPE_SECRET_KEY dans src/ — uniquement dans les Firebase Functions
  - automatic_payment_methods: { enabled: true } active Apple Pay + Google Pay automatiquement
  - Apple Pay nécessite un domaine vérifié (Firebase Hosting vérifie automatiquement *.web.app)
  - Google Pay fonctionne sur Chrome desktop et Android sans configuration supplémentaire
  - En mode test : cartes test Stripe → 4242 4242 4242 4242
"""

# Alias pour compatibilité avec l'ancien nom
SUPABASE_AUTH_PATTERN = FIREBASE_STACK_PATTERN

# ─── Generic static ────────────────────────────────────────────────────────────

STATIC_PROJECT_PROMPT = """
Tu génères un site web statique HTML/CSS/JS pur (Tailwind via CDN).
Standards : moderne, responsive, aucun placeholder, vrai contenu métier.

Structure index.html :
- Google Fonts via <link> (Inter ou Plus Jakarta Sans)
- Tailwind Play CDN
- Navigation sticky + hero + sections de contenu + footer
- Animations CSS (transitions, keyframes) ou Alpine.js si interactivité

Lancement : ouvrir index.html directement dans le navigateur.
Hébergement gratuit : Cloudflare Pages, Netlify, Vercel (drag & drop).
"""

# ─── SaaS Landing Page (principal template premium) ───────────────────────────

SAAS_LANDING_PAGE_PROMPT = """
══════════════════════════════════════════════════════════════════════
 TEMPLATE LANDING PAGE SAAS — QUALITÉ AGENCE / FRAMER PREMIUM
══════════════════════════════════════════════════════════════════════

Stack : React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion + Lucide React

━━━ STACK EXACT À GÉNÉRER ━━━

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

━━━ STRUCTURE DES FICHIERS OBLIGATOIRE ━━━

src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx         ← fixed, backdrop-blur, hamburger mobile
│   │   └── Footer.tsx         ← 4 colonnes, liens, copyright
│   └── sections/
│       ├── HeroSection.tsx    ← titre géant + CTA + visuel + glow bg
│       ├── LogosSection.tsx   ← "trusted by" + 6-8 logos texte
│       ├── ProblemSection.tsx ← 3-4 pain points avec icônes
│       ├── SolutionSection.tsx
│       ├── FeaturesSection.tsx ← bento grid 6+ cards glassmorphism
│       ├── HowItWorksSection.tsx ← 3 étapes numérotées
│       ├── TestimonialsSection.tsx ← 3-6 quotes réalistes
│       ├── PricingSection.tsx ← 3 tiers avec toggle mensuel/annuel
│       └── CTASection.tsx     ← section finale avec glow
├── lib/
│   └── utils.ts               ← cn() helper + formatPrice()
├── constants/
│   └── theme.ts               ← palette + variants réutilisables
├── pages/
│   └── Home.tsx               ← assemble toutes les sections
├── App.tsx                    ← BrowserRouter + Routes
├── main.tsx                   ← ReactDOM.createRoot
└── index.css                  ← @tailwind + variables CSS custom

━━━ PALETTE DE COULEURS ━━━

Choisir UNE palette et la définir dans index.css en variables CSS :

  Dark SaaS (par défaut) :
    --bg: #09090B;
    --surface: #18181B;
    --border: rgba(255,255,255,0.08);
    --primary: #8B5CF6;
    --primary-hover: #7C3AED;
    --accent: #A78BFA;
    --text: #FAFAFA;
    --text-muted: #A1A1AA;

tailwind.config.js doit étendre les couleurs avec ces variables.

━━━ COMPOSANTS CLÉS — PATTERNS EXACT ━━━

NAVBAR :
  - position: fixed, top: 0, z-index: 50
  - bg: backdrop-blur-xl bg-black/80 border-b border-white/8
  - Logo : nom + Zap icon (ou similaire)
  - Nav links : Features, Pricing, About (hidden sur mobile)
  - CTAs : "Log in" (ghost) + "Get started" (filled primary)
  - Mobile : icône Menu/X pour toggle, drawer ou dropdown

HERO :
  - Plein écran : min-h-screen flex items-center justify-center
  - Badge animé : pulsing dot + texte court (ex: "Now in public beta")
  - H1 : 5xl/7xl/8xl, font-black, tracking-tight, 2-3 lignes max
    → 1-2 mots en gradient violet→cyan ou violet→pink
  - Subheadline : max-w-xl text-lg text-white/70
  - CTA row : bouton filled + bouton outline ghost
  - Social proof row : "5,000+ teams" + 5 avatars (initiales colorées)
  - Hero visual : card/dashboard mockup ou abstract shape en absolute
  - Background : 2 radial glow blobs en absolute, pointer-events-none

FEATURES SECTION — Bento Grid :
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
    {/* Big card */}
    <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
    {/* Standard cards */}
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">

TESTIMONIALS :
  Grid 3 colonnes (lg:grid-cols-3), chaque card :
  - Quote en italique
  - Avatar (initiales dans cercle coloré OU image Unsplash face)
  - Nom + Rôle + Entreprise
  - 5 étoiles dorées (★★★★★)

PRICING — Toggle mensuel/annuel :
  const [annual, setAnnual] = useState(false)
  3 tiers : Free ($0) / Pro ($29/mois ou $19 annuel) / Enterprise (custom)
  Tier Pro highlighted : ring-2 ring-violet-500 shadow-lg shadow-violet-500/20

━━━ COPYWRITING ━━━

Adapter le copy au domaine du projet. Style : bénéfice-driven, émotionnel, concret.

Pour le Hero, s'inspirer de ces patterns (ADAPTER au vrai sujet) :
  "Ship faster. Break nothing. Sleep well." (DevTools)
  "Your analytics, finally making sense." (Analytics)
  "Stop losing leads. Start closing deals." (CRM/Sales)
  "The creative workspace your team deserves." (Design/PM)

Pour les features, structurer ainsi :
  TITRE COURT (3-5 mots max) + DESCRIPTION 1 phrase bénéfice
  Ex: "Zero-latency sync" → "Collaborate without the lag. Your team stays in sync, always."

Pour les témoignages, inventer des profils réalistes :
  - Sarah Chen, Engineering Lead @ Datastream
  - Marcus Okonkwo, Founder @ BuildFast
  - Julie Marchand, Head of Product @ Nexus AI

━━━ ANIMATIONS ━━━

Chaque section DOIT avoir :
1. motion.div avec whileInView {{ opacity: 0→1, y: 40→0 }} viewport once
2. Stagger sur les grilles (staggerChildren: 0.08)
3. whileHover sur les cards et boutons

━━━ RESPONSIVE ━━━

Navbar : hamburger sur mobile (useState toggle)
Hero : text-4xl sm:text-6xl lg:text-8xl — titre toujours lisible
Grid : grid-cols-1 md:grid-cols-2 lg:grid-cols-3 partout
Padding : px-4 sm:px-6 lg:px-8 — jamais de débordement horizontal

Lancement : npm run dev → http://localhost:5173
Hébergement : Vercel (vercel deploy), Netlify, Cloudflare Pages

{RECURRING_BUG_PREVENTION}
"""

# ─── React + Node.js + SQLite ──────────────────────────────────────────────────

REACT_NODE_SQLITE_PROJECT_PROMPT = """
Stack : React (Vite, Tailwind, Framer Motion, Lucide React) + Node.js (Express) + SQLite

FRONTEND — même niveau de qualité visuelle que le template SaaS Landing Page.
BACKEND — API REST Express avec SQLite (via better-sqlite3 ou sqlite3).

vite.config.ts DOIT contenir server: { host: true }

Structure backend :
  server/
  ├── index.js       ← Express app, CORS, routes
  ├── db.js          ← SQLite init + migrations
  └── routes/        ← endpoints CRUD

Lancement :
  - Frontend : npm run dev (port 5173)
  - Backend : node server/index.js (port 3001)

Hébergement :
  - Frontend : Vercel, Netlify, Cloudflare Pages
  - Backend : Railway, Render, Fly.io

{RECURRING_BUG_PREVENTION}
"""

# ─── React + Supabase ──────────────────────────────────────────────────────────

REACT_SUPABASE_PROJECT_PROMPT = """
Stack : React (Vite, Tailwind, Framer Motion, Lucide React) + Supabase

FRONTEND — même niveau de qualité visuelle que le template SaaS Landing Page.
BACKEND — Supabase (auth, PostgreSQL, Storage, Realtime).

vite.config.ts DOIT contenir server: { host: true }

Client Supabase dans src/lib/supabase.ts :
  import {{ createClient }} from '@supabase/supabase-js'
  export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

Variables d'environnement (.env) :
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...

Hébergement : Supabase (backend) + Vercel (frontend)
"""

# ─── E-commerce premium template ──────────────────────────────────────────────

ECOMMERCE_PREMIUM_PROMPT = """
══════════════════════════════════════════════════════════════════════
 TEMPLATE E-COMMERCE PREMIUM — QUALITÉ AGENCE
 Stack : React 18 + Vite + TypeScript + Tailwind + Firebase + Stripe
══════════════════════════════════════════════════════════════════════

━━━ STRUCTURE OBLIGATOIRE ━━━

src/
├── lib/
│   ├── firebase.ts              ← initializeApp, getAuth, getFirestore (TOUJOURS ce nom)
│   ├── stripe.ts                ← loadStripe(VITE_STRIPE_PUBLISHABLE_KEY)
│   └── utils.ts                 ← cn(), formatPrice(), whatsappLink()
├── context/
│   ├── CartContext.tsx          ← CartProvider + useCart + CartItem
│   └── AuthContext.tsx          ← Firebase Auth (email + Google) + useAuth
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx           ← fixed, compteur panier, isActive helper, hamburger
│   │   └── Footer.tsx
│   ├── product/
│   │   ├── ProductCard.tsx      ← hover anim, quick-add, badge Nouveau/Promo
│   │   └── ProductGrid.tsx
│   ├── cart/
│   │   └── CartDrawer.tsx       ← drawer Framer Motion, items, quantités, total
│   ├── checkout/
│   │   └── CheckoutForm.tsx     ← Stripe PaymentElement (Apple Pay + Google Pay + cartes)
│   └── auth/
│       └── ProtectedRoute.tsx   ← vérifie useAuth().user
├── pages/
│   ├── Home.tsx                 ← hero + produits featured + catégories + CTA
│   ├── Products.tsx             ← catalogue filtrable (catégorie + recherche)
│   ├── ProductDetail.tsx        ← galerie, specs, add-to-cart, bouton WhatsApp
│   ├── Cart.tsx                 ← résumé panier éditable
│   ├── Checkout.tsx             ← Elements wrapper + clientSecret depuis Cloud Function
│   ├── OrderSuccess.tsx         ← confirmation commande + sauvegarde Firestore
│   ├── Login.tsx                ← email/password + bouton Google
│   └── Register.tsx             ← inscription + création profil Firestore
├── data/
│   └── products.ts              ← 12+ produits avec VRAIS noms/prix/images Unsplash
├── types/
│   └── index.ts                 ← Product, Category, CartItem, User, Order
functions/                       ← Firebase Cloud Functions (backend serverless)
├── package.json                 ← firebase-functions, firebase-admin, stripe
└── src/
    └── index.ts                 ← createPaymentIntent + stripeWebhook

━━━ CART CONTEXT — PATTERN EXACT ━━━

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

━━━ PRODUITS — FORMAT EXACT ━━━

src/data/products.ts :
  export interface Product { id: string; name: string; price: number; oldPrice?: number; image: string; images?: string[]; category: string; description: string; badge?: string; rating: number; reviewCount?: number; features?: string[]; inStock: boolean; }
  export const products: Product[] = [ /* 12+ produits avec VRAIS noms, VRAIS prix, images Unsplash */ ];
  export const categories: Category[] = [ /* 5+ catégories avec id, name, icon, count */ ];

━━━ RÈGLES VISUELLES ━━━

• BACKGROUNDS visuellement distincts entre sections :
  Hero → gradient sombre | LogosSection → bg-slate-50 | FeaturesSection → bg-white |
  ProblemSection → bg-violet-50 | SolutionSection → bg-white |
  CategoriesSection → bg-slate-50 | AboutSection → bg-gradient-to-br from-violet-50 to-blue-50 |
  HowItWorksSection → bg-violet-50 | TestimonialsSection → bg-gradient-to-b from-violet-50 to-white |
  PricingSection → bg-violet-50 | InfosSection → bg-slate-50 | CTA → gradient violet fort
• JAMAIS bg-[var(--surface)] ni bg-slate-50 seul pour les sections "off" → utiliser bg-violet-50
• IDs sur toutes les sections d'ancre : id="categories", id="about", id="contact"
• html { scroll-behavior: smooth; } dans index.css

{RECURRING_BUG_PREVENTION}
"""

# ─── Stripe ────────────────────────────────────────────────────────────────────

STRIPE_INTEGRATION_PROMPT = """
Intègre Stripe pour les paiements.

Frontend (@stripe/react-stripe-js + @stripe/stripe-js) :
  <Elements stripe={{stripePromise}}>
    <CheckoutForm />
  </Elements>

Backend (stripe npm package) :
  POST /api/create-payment-intent
  POST /api/create-checkout-session

.env :
  STRIPE_SECRET_KEY=sk_test_...
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

Ne jamais exposer la clé secrète côté client.
Mode test → mode prod : changer les clés, activer les webhooks.
"""

# ─── PayPal ────────────────────────────────────────────────────────────────────

PAYPAL_INTEGRATION_PROMPT = """
Intègre PayPal comme méthode de paiement alternative.

SDK @paypal/react-paypal-js :
  <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
    <PayPalButtons createOrder={{...}} onApprove={{...}} />
  </PayPalScriptProvider>

Backend :
  POST /api/paypal/create-order
  POST /api/paypal/capture-order

.env :
  PAYPAL_CLIENT_ID=...
  PAYPAL_CLIENT_SECRET=...
  VITE_PAYPAL_CLIENT_ID=...

Mode sandbox → live : changer les clés et l'environment.
"""
