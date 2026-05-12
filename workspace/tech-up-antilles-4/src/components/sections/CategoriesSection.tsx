import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Battery, Headphones, Shield, Package } from 'lucide-react';
import { categories } from '../../data/products';

const categoryIcons: Record<string, React.ElementType> = {
  'Coques & Protections': Smartphone,
  'Chargeurs & Câbles': Battery,
  'Écouteurs & Casques': Headphones,
  'Protections Écran': Shield,
  'Accessoires Divers': Package,
};

const CategoriesSection = () => {
  return (
    <section id="categories" className="relative py-16 lg:py-24 bg-violet-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-[var(--accent)] bg-[var(--accent)]/8 border border-[var(--accent)]/20 rounded-full px-3 py-1.5 mb-4">
            Nos catégories
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text)]">
            Tout pour votre mobile
          </h2>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Des centaines d'accessoires sélectionnés avec soin pour tous vos appareils.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = categoryIcons[category.name] || Package;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <Link
                  to="/products"
                  className="group block relative h-64 rounded-2xl overflow-hidden"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/90 via-[var(--bg)]/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-white/70 mb-3">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-[var(--accent)] font-medium">
                      <span>{category.count} produits</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;