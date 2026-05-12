import { motion } from 'framer-motion';
import { Shield, Truck, Clock, Star, CreditCard, Headphones } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Produits Authentiques',
    description: 'Tous nos produits sont certifiés d\'origine, garantis sans contrefaçon.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Truck,
    title: 'Livraison Rapide',
    description: 'Livraison en 24-48h dans toute la Martinique. Retrait gratuit en magasin.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Clock,
    title: 'Service Client',
    description: 'Une équipe à votre écoute du lundi au samedi pour vous conseiller.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Star,
    title: 'Qualité Premium',
    description: 'Nous sélectionnons les meilleurs accessoires pour votre mobile.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: CreditCard,
    title: 'Paiement Sécurisé',
    description: 'CB, espèces, virement. Paiement en plusieurs fois possible.',
    color: 'from-red-500 to-rose-500'
  },
  {
    icon: Headphones,
    title: 'Conseils Experts',
    description: 'Des passionnés à votre service pour trouver le produit idéal.',
    color: 'from-indigo-500 to-violet-500'
  }
];

const FeaturesSection = () => {
  return (
    <section className="relative py-16 lg:py-24 overflow-hidden bg-violet-100">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[var(--primary)]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-[var(--accent)] bg-[var(--accent)]/8 border border-[var(--accent)]/20 rounded-full px-3 py-1.5 mb-4">
            Pourquoi nous choisir
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text)]">
            L'excellence à votre service
          </h2>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Découvrez pourquoi TECH-UP Antilles est la référence en accessoires mobiles en Martinique.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-50px" }}
              className="group relative p-6 lg:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]/30 hover:bg-[var(--surface2)] transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-2.5 mb-4`}>
                <feature.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-2">
                {feature.title}
              </h3>
              <p className="text-[var(--muted)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;