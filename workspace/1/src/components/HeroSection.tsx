import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button, Card } from '@/components/ui';
import BadgePromo from '@/components/BadgePromo';
import { products } from '@/data/products';
import { formatPrice } from '@/lib/utils';

const HeroSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Sélection des produits phares (meilleurs ventes ou premiers)
  const featuredProducts = products.slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const whatsappNumber = '+590690000000'; // À remplacer par le vrai numéro
  const whatsappMessage = encodeURIComponent('Bonjour TechUp Antilles ! Je suis intéressé(e) par vos produits premium. Pouvez-vous m\'aider ?');

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Arrière-plan avec effet néon */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B] via-[#0B0B0B] to-[#1a032b] opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />

      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative z-10 w-full max-w-7xl mx-auto text-center"
      >
        {/* Titre principal */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight"
        >
          <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Tech Premium
          </span>{' '}
          <span className="text-white">aux Antilles</span>
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
        >
          Smartphones, accessoires et gadgets high-tech livrés rapidement en Guadeloupe et Martinique. 
          Service client réactif via WhatsApp.
        </motion.p>

        {/* CTA WhatsApp */}
        <motion.div variants={itemVariants} className="mt-8">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              className="group relative px-8 py-4 text-lg font-semibold bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-full shadow-lg hover:shadow-violet-500/30 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                Commander via WhatsApp
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </span>
            </Button>
          </a>
        </motion.div>

        {/* Produits phares */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuredProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              className="relative"
            >
              <Card className="group bg-[#1a1a2e]/60 backdrop-blur-sm border border-violet-500/20 hover:border-violet-500/50 shadow-xl hover:shadow-violet-500/10 transition-all duration-300 overflow-hidden">
                {product.badge && <BadgePromo type={product.badge} />}
                <div className="aspect-w-1 aspect-h-1">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-200 truncate">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-lg font-bold text-cyan-400">
                    {formatPrice(product.price)}
                  </p>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Bonjour, je suis intéressé par le produit : ${product.name} (${formatPrice(product.price)})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-colors"
                    >
                      Commander
                    </Button>
                  </a>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Dégradé en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0B] to-transparent" />
    </section>
  );
};

export { HeroSection };
export default HeroSection;