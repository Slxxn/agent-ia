export type RequestStatus = 'pending' | 'validated' | 'in_progress' | 'completed' | 'rejected';
export type SiteType = 'standard' | '3d';

export interface ClientRequest {
  id: string;
  createdAt: Date;
  status: RequestStatus;
  siteType: SiteType;
  businessName: string;
  sector: string;
  siteGoal: string;
  tagline: string;
  description: string;
  targetAudience: string;
  uniqueValue: string;
  logoUrl: string;
  primaryColor: string;
  colorTheme: string;
  visualStyle: string;
  inspirationSites: string;
  pages: string[];
  features: string[];
  competitors: string;
  budget: string;
  notes: string;
}

export const SITE_TYPES: { key: SiteType; label: string; desc: string; icon: string }[] = [
  {
    key: 'standard',
    label: 'Site Web Standard',
    desc: 'Design moderne, animations fluides, sections élégantes — idéal pour la majorité des projets.',
    icon: '🖥️',
  },
  {
    key: '3d',
    label: 'Expérience 3D / Immersive',
    desc: 'Scènes Three.js, parallax profond, WebGL — pour des projets qui marquent les esprits.',
    icon: '🌐',
  },
];

export const SITE_GOALS: { key: string; label: string; desc: string }[] = [
  { key: 'bookings',  label: 'Réservations / RDV',    desc: 'Permettre aux clients de réserver ou prendre RDV en ligne' },
  { key: 'ecommerce', label: 'Vendre en ligne',         desc: 'Boutique avec panier et paiement intégré' },
  { key: 'portfolio', label: 'Présenter mon portfolio', desc: 'Montrer mes réalisations et attirer des clients' },
  { key: 'leads',     label: 'Générer des prospects',   desc: 'Collecter des contacts qualifiés via formulaires' },
  { key: 'showcase',  label: 'Vitrine & information',   desc: 'Présenter mon activité, fidéliser ma clientèle' },
];

export const SECTORS: { key: string; label: string; emoji: string }[] = [
  { key: 'beauty',      label: 'Beauté & Bien-être',        emoji: '💅' },
  { key: 'restaurant',  label: 'Restaurant & Traiteur',     emoji: '🍽️' },
  { key: 'fashion',     label: 'Mode & Accessoires',        emoji: '👗' },
  { key: 'artisan',     label: 'Artisan & Créateur',        emoji: '🎨' },
  { key: 'coach',       label: 'Coach & Consultant',        emoji: '🧠' },
  { key: 'photo',       label: 'Studio & Photographe',      emoji: '📸' },
  { key: 'medical',     label: 'Médical & Paramédical',     emoji: '🩺' },
  { key: 'realestate',  label: 'Immobilier & Architecture', emoji: '🏠' },
  { key: 'sport',       label: 'Sport & Fitness',           emoji: '💪' },
  { key: 'tech',        label: 'Tech & SaaS',               emoji: '💻' },
  { key: 'association', label: 'Association & ONG',         emoji: '🤝' },
  { key: 'other',       label: 'Autre',                     emoji: '✨' },
];

export const COLOR_THEMES: { key: string; label: string; desc: string; preview: string }[] = [
  { key: 'light',   label: 'Clair',   desc: 'Fond blanc / beige',     preview: '#f8f8f7' },
  { key: 'dark',    label: 'Sombre',  desc: 'Fond noir / anthracite', preview: '#0f0f12' },
  { key: 'neutral', label: 'Neutre',  desc: 'Fond gris doux',         preview: '#f4f4f5' },
];

export const VISUAL_STYLES: { key: string; label: string; desc: string }[] = [
  { key: 'luxe_elegant',   label: 'Luxe & Élégant',      desc: 'Typographie raffinée, tons sobres, espace négatif maîtrisé' },
  { key: 'minimal_clean',  label: 'Minimaliste',          desc: "Épuré, beaucoup d'espace blanc, focus sur le contenu" },
  { key: 'modern_bold',    label: 'Moderne & Audacieux',  desc: 'Contrastes forts, animations dynamiques, typographie imposante' },
  { key: 'warm_natural',   label: 'Naturel & Chaleureux', desc: 'Tons terre, textures organiques, ambiance douce' },
  { key: 'colorful_vivid', label: 'Coloré & Vibrant',     desc: 'Palette vive, énergique, pop' },
  { key: 'corporate_pro',  label: 'Professionnel',        desc: 'Sobre, structuré, inspire confiance' },
];

export const VISUAL_STYLES_3D: { key: string; label: string; desc: string }[] = [
  { key: 'immersive_dark',  label: 'Immersif & Sombre',   desc: 'Scènes 3D profondes, volumétrie, lumières dynamiques' },
  { key: 'spatial_minimal', label: 'Spatial Minimal',     desc: 'Géométries flottantes, espace infini, épuré et impactant' },
  { key: 'holographic',     label: 'Holographique',       desc: 'Effets néon, scanlines, glassmorphisme cyber' },
  { key: 'organic_3d',      label: 'Organique 3D',        desc: 'Formes fluides, blobs animés, morphing doux' },
  { key: 'cinematic',       label: 'Cinématique',         desc: 'Séquences filmic, slow-motion, storytelling visuel' },
  { key: 'futuristic_ui',   label: 'Futuriste / HUD',     desc: "Interface futuriste, particules, effets tech sci-fi" },
];

export const COLOR_THEMES_3D: { key: string; label: string; desc: string; preview: string }[] = [
  { key: 'deep_space',   label: 'Cosmos',       desc: 'Quasi-noir, accents lumineux stellaires', preview: '#05050f' },
  { key: 'neon_dark',    label: 'Néon Sombre',  desc: 'Noir profond, accents néon vifs',          preview: '#0a0a0a' },
  { key: 'midnight',     label: 'Minuit',        desc: 'Bleu nuit profond, teintes froides',       preview: '#060818' },
  { key: 'vantablack',   label: 'Pure Black',    desc: 'Fond pur noir, contraste maximal',         preview: '#000000' },
];

export const FEATURE_GROUPS_3D: { label: string; items: { key: string; label: string }[] }[] = [
  {
    label: 'Scène 3D & WebGL',
    items: [
      { key: 'hero_threejs',   label: 'Scène Three.js / R3F en hero' },
      { key: 'particles',      label: 'Système de particules animé' },
      { key: 'model_3d',       label: 'Modèle 3D custom (GLTF/GLB)' },
      { key: 'scroll_scene',   label: 'Scroll storytelling 3D' },
    ],
  },
  {
    label: 'Interactions & UX',
    items: [
      { key: 'custom_cursor',  label: 'Curseur custom animé' },
      { key: 'parallax_deep',  label: 'Parallax multi-couches avancé' },
      { key: 'morph_transition',label: 'Transitions morphing entre pages' },
      { key: 'tilt_hover',     label: 'Effet tilt au survol (react-tilt)' },
    ],
  },
  {
    label: 'Médias Immersifs',
    items: [
      { key: 'gallery_3d',     label: 'Galerie 3D interactive' },
      { key: 'video_bg',       label: 'Vidéo plein-écran en fond' },
      { key: 'lottie_anim',    label: 'Animations Lottie / SVG avancées' },
      { key: 'audio_reactive', label: 'Visuels réactifs au son' },
    ],
  },
  {
    label: 'Navigation & Structure',
    items: [
      { key: 'loading_screen', label: 'Loading screen animé' },
      { key: 'smooth_scroll',  label: 'Smooth scroll (Lenis/GSAP)' },
      { key: 'page_transitions',label: 'Transitions de pages cinématiques' },
      { key: 'fullscreen_nav', label: 'Navigation plein écran' },
    ],
  },
  {
    label: 'Contact & Conversion',
    items: [
      { key: 'contact',        label: 'Formulaire de contact stylisé' },
      { key: 'newsletter',     label: 'Newsletter' },
      { key: 'whatsapp',       label: 'Bouton WhatsApp' },
      { key: 'cta_immersive',  label: 'CTA avec scène 3D intégrée' },
    ],
  },
  {
    label: 'Performance & Technique',
    items: [
      { key: 'webgl_fallback', label: 'Fallback mobile (sans WebGL)' },
      { key: 'seo',            label: 'Optimisation SEO' },
      { key: 'analytics',      label: 'Google Analytics' },
      { key: 'pwa',            label: 'PWA (appli installable)' },
    ],
  },
];

export const FEATURE_GROUPS: { label: string; items: { key: string; label: string }[] }[] = [
  {
    label: 'Boutique en ligne',
    items: [
      { key: 'catalog',       label: 'Catalogue produits avec catégories' },
      { key: 'cart',          label: "Panier d'achat" },
      { key: 'stripe',        label: 'Paiement en ligne (Stripe)' },
      { key: 'promo',         label: 'Codes promo / réductions' },
      { key: 'orders',        label: 'Gestion des commandes' },
    ],
  },
  {
    label: 'Réservation & RDV',
    items: [
      { key: 'booking',       label: 'Prise de rendez-vous en ligne' },
      { key: 'calendar',      label: 'Calendrier interactif' },
      { key: 'email_confirm', label: 'Confirmation email automatique' },
      { key: 'booking_pay',   label: 'Paiement à la réservation' },
    ],
  },
  {
    label: 'Espace membres',
    items: [
      { key: 'auth',     label: 'Inscription & connexion' },
      { key: 'profile',  label: 'Profil utilisateur' },
      { key: 'history',  label: 'Historique & suivi' },
      { key: 'wishlist', label: 'Liste de favoris' },
    ],
  },
  {
    label: 'Contenu & Médias',
    items: [
      { key: 'gallery',   label: 'Galerie photos / vidéos' },
      { key: 'blog',      label: 'Blog / actualités' },
      { key: 'reviews',   label: 'Témoignages clients' },
      { key: 'instagram', label: 'Flux Instagram' },
    ],
  },
  {
    label: 'Contact & Communication',
    items: [
      { key: 'contact',    label: 'Formulaire de contact' },
      { key: 'whatsapp',   label: 'Bouton WhatsApp' },
      { key: 'livechat',   label: 'Chat en direct' },
      { key: 'newsletter', label: 'Newsletter' },
    ],
  },
  {
    label: 'Performance & SEO',
    items: [
      { key: 'seo',      label: 'Optimisation SEO' },
      { key: 'analytics',label: 'Google Analytics' },
      { key: 'darkmode', label: 'Mode sombre / clair' },
      { key: 'pwa',      label: 'PWA (appli installable)' },
    ],
  },
];

export const PAGE_OPTIONS: { key: string; label: string; desc: string }[] = [
  { key: 'home',      label: 'Accueil',                desc: 'Toujours incluse' },
  { key: 'about',     label: 'À propos',               desc: 'Histoire, équipe, valeurs' },
  { key: 'services',  label: 'Services / Prestations', desc: 'Liste complète des services' },
  { key: 'shop',      label: 'Boutique / Produits',    desc: 'Catalogue et fiches produits' },
  { key: 'booking',   label: 'Réservation en ligne',   desc: 'Agenda et prise de RDV' },
  { key: 'portfolio', label: 'Portfolio / Galerie',    desc: 'Réalisations et photos' },
  { key: 'blog',      label: 'Blog / Actualités',      desc: 'Articles et contenus' },
  { key: 'pricing',   label: 'Tarifs',                 desc: 'Grille tarifaire détaillée' },
  { key: 'faq',       label: 'FAQ',                    desc: 'Questions fréquentes' },
  { key: 'contact',   label: 'Contact',                desc: 'Formulaire et coordonnées' },
  { key: 'legal',     label: 'Mentions légales',       desc: 'CGU, confidentialité' },
];

export const BUDGETS = ['< 500€', '500 – 1 500€', '1 500 – 3 000€', '3 000€+', 'À discuter'];
