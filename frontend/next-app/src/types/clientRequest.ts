export type RequestStatus = 'pending' | 'validated' | 'in_progress' | 'completed' | 'rejected';

export interface ClientRequest {
  id: string;
  createdAt: Date;
  status: RequestStatus;
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
