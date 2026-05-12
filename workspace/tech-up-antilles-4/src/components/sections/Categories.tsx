import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Smartphone, Battery, Headphones, Shield, Monitor, Watch } from 'lucide-react';
import { cn } from '../../lib/utils';

const categories = [
  {
    name: 'Coques & Protections',
    icon: Smartphone,
    description: 'Protégez votre téléphone avec style',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50',
    iconColor: 'text-violet-600',
    count: '24 produits'
  },
  {
    name: 'Chargeurs & Câbles',
    icon: Battery,
    description: 'Recharge rapide et fiable',
    color: 'from-sky-500 to-blue-600',
    bgColor: 'bg-sky-50',
    iconColor: 'text-sky-600',
    count: '18 produits'
  },
  {
    name: 'Audio',
    icon: Headphones,
    description: 'Écouteurs et casques Bluetooth',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    count: '12 produits'
  },
  {
    name: 'Protections écran',
    icon: Shield,
    description: 'Verre trempé et films protecteurs',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    count: '8 produits'
  },
  {
    name: 'Accessoires',
    icon: Monitor,
    description: 'Supports, powerbanks et plus',
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50',
    iconColor: 'text-rose-600',
    count: '15 produits'
  },
  {
    name: 'Montres connectées',
    icon: Watch,
    description: 'Bracelets et accessoires',
    color: 'from-indigo-500 to-violet-600',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    count: '6 produits'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const Categories = () => {
  return (
    <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-violet-50/40 to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-3 py-1.5 mb-4">
            Catégories
          </span>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-slate-900 mb-4">
            Nos catégories
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tout ce qu'il vous faut pour vos appareils mobiles
          </p>
        </motion.div>

        {/* Categories grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
        >
          {categories.map((category) => (
            <motion.div
              key={category.name}
              variants={itemVariants}
              className="group relative"
            >
              <Link
                to={`/products?category=${category.name.toLowerCase()}`}
                className="block"
              >
                <div className={cn(
                  "relative overflow-hidden rounded-2xl p-6 lg:p-8 border border-slate-200 transition-all duration-300",
                  "hover:shadow-lg hover:border-transparent",
                  category.bgColor
                )}>
                  {/* Gradient overlay on hover */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br",
                    category.color
                  )} />

                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <category.icon className={cn("w-7 h-7", category.iconColor)} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      {category.description}
                    </p>
                    <span className="inline-flex items-center text-xs font-medium text-slate-500">
                      {category.count}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;