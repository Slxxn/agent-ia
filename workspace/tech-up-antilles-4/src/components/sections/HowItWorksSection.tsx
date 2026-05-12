import { motion } from 'framer-motion';
import { Search, ShoppingCart, MessageCircle, Package } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Parcourez notre catalogue',
    description: 'Explorez notre sélection de produits premium. Filtrez par catégorie, comparez les prix, lisez les avis.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: ShoppingCart,
    title: 'Ajoutez au panier',
    description: 'Sélectionnez vos articles préférés et ajoutez-les à votre panier. Simple et rapide.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: MessageCircle,
    title: 'Commandez sur WhatsApp',
    description: 'Envoyez votre panier directement sur WhatsApp. Notre équipe vous confirme la disponibilité sous 30 min.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Package,
    title: 'Recevez en 24-48h',
    description: 'Livraison rapide dans toute la Martinique ou retrait gratuit en boutique à Fort-de-France.',
    color: 'from-orange-500 to-red-500'
  }
];

const HowItWorksSection = () => {
  return (
    <section className="relative py-16 lg:py-24 bg-violet-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-[var(--accent)] bg-[var(--accent)]/8 border border-[var(--accent)]/20 rounded-full px-3 py-1.5 mb-4">
            Comment ça marche
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text)]">
            Commandez en 3 clics, reçus en 24h
          </h2>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Un processus simple et rapide pour vous faire livrer vos accessoires préférés.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-50px" }}
              className="relative text-center"
            >
              {/* Number */}
              <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[var(--primary)] text-white text-sm font-bold flex items-center justify-center">
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} p-4 mx-auto mb-6`}>
                <step.icon className="w-full h-full text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-[var(--text)] mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {step.description}
              </p>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-4 w-8 h-px bg-gradient-to-r from-[var(--border)] to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;