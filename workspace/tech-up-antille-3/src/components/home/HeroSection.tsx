import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-black"
      style={{
        background:
          'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 60%)',
      }}
    >
      {/* Background glow strips (neon inspiration) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm" />
        <div className="absolute top-3/4 right-0 w-[500px] h-[1px] bg-gradient-to-l from-transparent via-white/15 to-transparent blur-sm" />
        <div className="absolute top-1/2 right-10 w-[1px] h-[200px] bg-gradient-to-b from-transparent via-white/10 to-transparent blur-sm" />
        <div className="absolute bottom-20 left-1/3 w-[1px] h-[150px] bg-gradient-to-t from-transparent via-white/10 to-transparent blur-sm" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              Nouvelle collection été 2025
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tight text-white leading-none mb-6"
          >
            Équipe ton{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
              smartphone
            </span>{' '}
            avec style.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Le meilleur du mobile, en plein cœur de Fort-de-France. 
            Accessoires premium, qualité garantie, livraison rapide.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/boutique')}
              className="group relative px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg overflow-hidden transition-all duration-200 shadow-2xl shadow-white/20"
            >
              <span className="flex items-center gap-2">
                Découvrir la boutique
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/boutique')}
              className="group relative px-8 py-4 border border-white/20 text-white rounded-xl font-semibold text-lg overflow-hidden transition-all duration-200 hover:bg-white/5 backdrop-blur-sm"
            >
              <span className="flex items-center gap-2">
                Explorer les produits
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-col items-center gap-3"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-black bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white text-sm font-bold"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-white text-white" />
                ))}
              </div>
              <span>Noté 4.9/5 par <strong className="text-white">1 200+ clients</strong></span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
export { HeroSection };