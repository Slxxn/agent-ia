import { motion } from 'framer-motion';
import { MapPin, Heart, Users, Award } from 'lucide-react';

const stats = [
  { icon: Users, value: '500+', label: 'Clients satisfaits' },
  { icon: Award, value: '4.8/5', label: 'Note moyenne' },
  { icon: Heart, value: '100%', label: 'Satisfaction' },
  { icon: MapPin, value: '1', label: 'Boutique à Fort-de-France' },
];

const AboutSection = () => {
  return (
    <section id="about" className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[var(--surface)] border border-[var(--border)]">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
                alt="Boutique TECH-UP Antilles"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)]/40 to-transparent" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-[var(--accent)] bg-[var(--accent)]/8 border border-[var(--accent)]/20 rounded-full px-3 py-1.5 mb-4">
              À propos
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text)] mb-6">
              La passion des accessoires mobiles, made in Martinique
            </h2>
            <div className="space-y-4 text-[var(--muted)] leading-relaxed">
              <p>
                TECH-UP Antilles est née d'un constat simple : en Martinique, il était trop difficile 
                de trouver des accessoires mobiles de qualité à prix justes. Entre les contrefaçons 
                et les délais de livraison interminables, les consommateurs méritaient mieux.
              </p>
              <p>
                Située au cœur de Fort-de-France, notre boutique sélectionne avec soin chaque 
                produit que nous proposons. Coques, chargeurs, écouteurs, protections... Chaque 
                référence est testée et approuvée par notre équipe.
              </p>
              <p>
                Notre engagement : vous offrir le meilleur rapport qualité-prix, avec des produits 
                authentiques, livrés rapidement, et un service client qui vous accompagne avant 
                et après votre achat.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-8 border-t border-[var(--border)]">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <stat.icon className="w-5 h-5 text-[var(--accent)] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[var(--text)]">{stat.value}</div>
                  <div className="text-xs text-[var(--muted)]">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;