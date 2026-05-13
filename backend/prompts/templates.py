"""
Prompts utilitaires injectés dans le contexte de génération.
Les grands templates visuels (SAAS, e-commerce, etc.) ont été supprimés —
le design system est maintenant généré dynamiquement par Gemini + brief client.
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
   - Standard spacing between sections: py-16 lg:py-24.
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

# ─── Payment integrations ──────────────────────────────────────────────────────

STRIPE_INTEGRATION_PROMPT = """
Integrate Stripe for payments.

Frontend (@stripe/react-stripe-js + @stripe/stripe-js):
  <Elements stripe={stripePromise}>
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
