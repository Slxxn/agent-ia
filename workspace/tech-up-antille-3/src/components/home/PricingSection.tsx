import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Shield, Zap, Infinity, Headphones, Star, Package } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: { text: string; included: boolean }[];
  highlighted?: boolean;
  badge?: string;
  cta: string;
  icon: React.ElementType;
}

const tiers: PricingTier[] = [
  {
    name: 'Standard',
    description: 'Pour les utilisateurs qui débutent avec nous.',
    monthlyPrice: 9,
    yearlyPrice: 89,
    icon: Package,
    features: [
      { text: 'Accès à la boutique en ligne', included: true },
      { text: 'Livraison standard gratuite dès 50€', included: true },
      { text: 'Garantie de 6 mois sur les accessoires', included: true },
      { text: 'Support par email sous 48h', included: true },
      { text: 'Accès aux offres exclusives', included: false },
      { text: 'Invitations aux événements boutique', included: false },
      { text: 'Garantie premium 2 ans', included: false },
    ],
    cta: 'Commencer gratuitement',
  },
  {
    name: 'Premium',
    description: 'L’expérience complète pour les passionnés de tech.',
    monthlyPrice: 19,
    yearlyPrice: 189,
    icon: Star,
    highlighted: true,
    badge: 'Populaire',
    features: [
      { text: 'Tout ce que contient Standard', included: true },
      { text: 'Livraison express gratuite illimitée', included: true },
      { text: 'Garantie premium 2 ans', included: true },
      { text: 'Support prioritaire 24/7', included: true },
      { text: 'Accès aux offres exclusives', included: true },
      { text: 'Invitations aux événements boutique', included: true },
      { text: 'Réduction de 10% sur tous les achats', included: false },
    ],
    cta: 'Passer à Premium',
  },
  {
    name: 'Elite',
    description: 'Pour les professionnels et les ultra-connectés.',
    monthlyPrice: 39,
    yearlyPrice: 389,
    icon: Shield,
    features: [
      { text: 'Tout ce que contient Premium', included: true },
      { text: 'Réduction de 20% sur tous les achats', included: true },
      { text: 'Accès aux collections privées avant tout le monde', included: true },
      { text: 'Gestionnaire de compte dédié', included: true },
      { text: 'Assurance casse et vol incluse', included: true },
      { text: 'Ateliers tech exclusifs (4 par an)', included: true },
      { text: 'Personnalisation gratuite des accessoires', included: true },
    ],
    cta: 'Devenir Elite',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden" id="pricing">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Des offres sur mesure</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Le club{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
              Tech Up
            </span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Choisis l’abonnement qui correspond à ton style. Premium ou Elite, à chaque niveau son lot d’avantages exclusifs.
          </p>

          {/* Toggle mensuel/annuel */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                !isYearly ? 'text-white' : 'text-zinc-500'
              )}
            >
              Mensuel
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isYearly}
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                'relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300',
                isYearly ? 'bg-violet-600' : 'bg-zinc-700'
              )}
            >
              <span
                className={cn(
                  'inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform duration-300',
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                isYearly ? 'text-white' : 'text-zinc-500'
              )}
            >
              Annuel
              <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                -20%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8"
        >
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              variants={cardVariants}
              className={cn(
                'relative flex flex-col rounded-2xl border p-8 transition-all duration-300',
                tier.highlighted
                  ? 'bg-gradient-to-b from-violet-500/10 to-violet-500/5 border-violet-500/30 shadow-2xl shadow-violet-500/10 scale-105 md:scale-105'
                  : 'bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20'
              )}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-semibold shadow-lg shadow-violet-500/25">
                    <Sparkles className="w-3 h-3" />
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Icon & name */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'p-2 rounded-lg',
                  tier.highlighted
                    ? 'bg-violet-500/20'
                    : 'bg-white/10'
                )}>
                  <tier.icon className={cn(
                    'w-6 h-6',
                    tier.highlighted ? 'text-violet-400' : 'text-zinc-400'
                  )} />
                </div>
                <h3 className="text-xl font-bold text-white">{tier.name}</h3>
              </div>

              <p className="text-sm text-zinc-400 mb-6">{tier.description}</p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    {isYearly ? tier.yearlyPrice : tier.monthlyPrice}€
                  </span>
                  <span className="text-sm text-zinc-500">
                    /{isYearly ? 'an' : 'mois'}
                  </span>
                </div>
                {isYearly && (
                  <p className="mt-1 text-xs text-zinc-500">
                    Soit {(tier.yearlyPrice / 12).toFixed(2)}€/mois
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 mb-8',
                  tier.highlighted
                    ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                )}
              >
                {tier.cta}
              </motion.button>

              {/* Features list */}
              <ul className="space-y-3 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-zinc-600 shrink-0 mt-0.5" />
                    )}
                    <span
                      className={cn(
                        'text-sm',
                        feature.included ? 'text-zinc-300' : 'text-zinc-600 line-through'
                      )}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional info */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center text-sm text-zinc-500 mt-12"
        >
          Tous les abonnements incluent une période d’essai de 7 jours sans engagement.
          <br />
          Paiement sécurisé par carte ou PayPal.
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;