import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Alexandre Mercier',
    role: 'Community Manager',
    company: 'FDB Media',
    quote: 'Les coques Tech Up Antilles sont les seules qui tiennent le choc après deux mois d’utilisation quotidienne. Le design est incroyable et la livraison en 24h, un vrai plus.',
    rating: 5,
  },
  {
    name: 'Camille Desrosiers',
    role: 'Freelance Tech Journalist',
    company: 'L’Écho Numérique',
    quote: 'Un site qui respire la qualité du choix à la livraison. La boutique en ligne est aussi stylée que la vitrine de Fort-de-France. Recommandé à tous les passionnés.',
    rating: 5,
  },
  {
    name: 'Lucas Dorival',
    role: 'Entrepreneur / Podcaster',
    company: 'Matnik Audio',
    quote: 'J’ai commandé des écouteurs sans fil pour mes trajets. La qualité sonore est top, l’autonomie dingue et le packaging digne d’une marque premium. Je suis client fidèle.',
    rating: 5,
  },
  {
    name: 'Sophie Jean-Pierre',
    role: 'Influenceuse Tech & Lifestyle',
    company: 'Tech & Tropiques',
    quote: 'Enfin une boutique locale qui propose des accessoires iPhone de qualité. Le service client est réactif et les produits sont encore mieux en vrai. Fière de soutenir cette marque.',
    rating: 5,
  },
  {
    name: 'Romain Leblanc',
    role: 'Développeur Freelance',
    company: 'WebDesign972',
    quote: 'Le chargeur 65W GaN est le meilleur achat tech de mon année. Charge rapide, design compact et finition métal. Expérience d’achat fluide du début à la fin.',
    rating: 5,
  },
  {
    name: 'Élodie Gervais',
    role: 'Responsable e-commerce',
    company: 'Air Antilles Hub',
    quote: 'Nous avons équipé toute l’équipe avec les protections écran Tech Up. Qualité professionnelle, pose facile et prix plus que correct. Le suivi client est exemplaire.',
    rating: 5,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-[#09090B]">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Ils parlent de nous
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Ce que nos clients disent
          </h2>
          <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
            Plus de 5 000 clients à travers les Antilles et la France nous font confiance. Découvrez pourquoi.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 shadow-xl hover:border-white/20 transition-all duration-300"
            >
              {/* Decorative quote */}
              <div className="absolute top-4 right-4 text-white/5 pointer-events-none select-none">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M10 11H6C5.44772 11 5 10.5523 5 10V7C5 6.44772 5.44772 6 6 6H9C9.55228 6 10 6.44772 10 7V11ZM10 11C10 13 9 14 8 15M14 11H18C18.5523 11 19 10.5523 19 10V7C19 6.44772 18.5523 6 18 6H15C14.4477 6 14 6.44772 14 7V11ZM14 11C14 13 15 14 16 15" />
                </svg>
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-white text-white" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-base lg:text-lg text-white/80 leading-relaxed mb-6">
                “{t.quote}”
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 font-semibold text-sm ring-1 ring-white/20">
                  {t.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{t.name}</p>
                  <p className="text-white/50 text-xs">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
          viewport={{ once: true, margin: '-80px' }}
          className="mt-16 text-center"
        >
          <p className="text-white/50 text-sm mb-2">
            Rejoignez les milliers de clients satisfaits.
          </p>
          <p className="text-white/80 text-lg">
            Vous aussi, donnez votre avis après votre prochain achat.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;