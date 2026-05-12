import { motion } from 'framer-motion';
import {
  Smartphone,
  Cable,
  Headphones,
  Shield,
  Gem,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  slug: string;
}

const categories: Category[] = [
  {
    id: 'cases',
    name: 'Coques',
    description: 'Protection ultra-mince, design tendance, matériaux premium.',
    icon: <Smartphone className="w-8 h-8" />,
    slug: 'coques',
  },
  {
    id: 'chargers',
    name: 'Chargeurs',
    description: 'Charge rapide GaN, sans-fil, batteries externes.',
    icon: <Cable className="w-8 h-8" />,
    slug: 'chargeurs',
  },
  {
    id: 'audio',
    name: 'Audio',
    description: 'Écouteurs sans-fil, casques, enceintes Bluetooth.',
    icon: <Headphones className="w-8 h-8" />,
    slug: 'audio',
  },
  {
    id: 'protection',
    name: 'Protection écran',
    description: 'Verre trempé, film hydrogel, anti-espion.',
    icon: <Shield className="w-8 h-8" />,
    slug: 'protection-ecran',
  },
  {
    id: 'premium',
    name: 'Accessoires premium',
    description: 'Supports, grips, montres, gadgets connectés.',
    icon: <Gem className="w-8 h-8" />,
    slug: 'accessoires-premium',
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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const CategoriesOverview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 lg:py-32 bg-black/95">
      {/* Background subtle neon lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Catégories
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Tout pour ton{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              mobile
            </span>
          </h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto text-lg">
            Des accessoires sélectionnés pour leur qualité, leur design et leur compatibilité.
          </p>
        </motion.div>

        {/* Categories grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6"
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => navigate(`/boutique?categorie=${category.slug}`)}
              className="group cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 flex flex-col items-center text-center hover:bg-white/10 transition-all duration-300 shadow-lg"
            >
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors duration-300 text-white">
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {category.name}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed mb-4">
                {category.description}
              </p>
              <span className="text-white/70 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                Voir la collection{' '}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesOverview;
export { CategoriesOverview };