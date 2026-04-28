import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import Button from './ui/Button';

const HeroSection: React.FC = () => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const handleScrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToOrder = () => {
    const el = document.getElementById('order-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0B0B0B]"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B0B] via-[#1a1a2e] to-[#0B0B0B]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-400 rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-2000" />
        </div>
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-tight mb-6"
          variants={childVariants}
        >
          Upgrade ton quotidien
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            avec la tech ultime
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10"
          variants={childVariants}
        >
          La tech qui te suit partout. Qualité. Style. Performance.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={childVariants}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleScrollToProducts}
            className="px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
          >
            Voir les produits
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleScrollToOrder}
            className="px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-blue-400 text-blue-400 hover:bg-blue-400/10 hover:shadow-blue-400/30 transition-all duration-300"
          >
            Commander maintenant
          </Button>
        </motion.div>

        {/* Scroll down indicator */}
        <motion.div
          className="mt-16 animate-bounce"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, repeat: Infinity, duration: 1.5 }}
        >
          <svg
            className="w-8 h-8 text-blue-400 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0B] to-transparent" />
    </section>
  );
};

export default HeroSection;