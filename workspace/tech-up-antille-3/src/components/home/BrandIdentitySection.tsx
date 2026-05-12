import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Zap, Sparkles, Shield, Users, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
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

const values = [
  {
    icon: Zap,
    title: 'Innovation constante',
    description: 'On déniche les dernières tendances pour que ton smartphone soit toujours à la pointe.',
  },
  {
    icon: Sparkles,
    title: 'Qualité premium',
    description: 'Chaque accessoire est testé et approuvé par notre équipe. Pas de compromis.',
  },
  {
    icon: Shield,
    title: 'Confiance locale',
    description: 'Boutique physique à Fort-de-France. Tu peux toucher, essayer, repartir avec.',
  },
  {
    icon: Users,
    title: 'Communauté tech',
    description: 'Rejoins des milliers de passionnés qui font vivre la culture mobile aux Antilles.',
  },
];

const BrandIdentitySection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section id="brand-identity" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background effect - neon glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-3xl" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side: Text content */}
          <motion.div
            ref={sectionRef}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={containerVariants}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Notre histoire</span>
            </motion.div>

            {/* Main heading */}
            <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Tech Up Antilles,{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400">
                l'accessoire mobile nouvelle génération
              </span>
            </motion.h2>

            {/* Story paragraph */}
            <motion.p variants={fadeInUp} className="text-lg text-white/70 leading-relaxed">
              Nés à Fort-de-France, on a grandi avec une conviction : ton smartphone mérite mieux que des accessoires bas de gamme. 
              Inspirés par la culture street-tech et l'énergie des Caraïbes, on a créé Tech Up Antilles pour offrir aux Antillais 
              des produits premium, stylés et fiables — sans devoir commander à l'autre bout du monde.
            </motion.p>

            <motion.p variants={fadeInUp} className="text-lg text-white/60 leading-relaxed">
              Aujourd'hui, notre boutique physique au cœur de Fort-de-France vibre au rythme des nouvelles sorties, 
              des conseils personnalisés et d'une communauté qui partage la même passion pour la tech et le style.
            </motion.p>

            {/* Location + CTA */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <span>Fort-de-France, Martinique</span>
              </div>
              <Link
                to="/a-propos"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg shadow-violet-500/25"
              >
                <Smartphone className="w-5 h-5" />
                <span>Découvrir la boutique</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right side: Visual representation / Values cards */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5"
              >
                {/* Icon with glow */}
                <div className="relative mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-6 h-6 text-cyan-400" />
                  {/* Glow ring */}
                  <div className="absolute inset-0 rounded-xl bg-cyan-400/5 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Divider */}
        <div className="mt-20 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </section>
  );
};

export default BrandIdentitySection;
export { BrandIdentitySection };