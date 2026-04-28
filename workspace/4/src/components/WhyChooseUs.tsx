import { motion } from 'framer-motion';

const benefits = [
  {
    icon: '🚀',
    title: 'Livraison rapide aux Antilles',
    description:
      'Commandez et recevez sous 24 à 72h en Guadeloupe, Martinique et toute la Caraïbe.',
  },
  {
    icon: '🔒',
    title: 'Produits fiables et testés',
    description:
      'Chaque produit passe nos contrôles qualité rigoureux avant expédition.',
  },
  {
    icon: '💬',
    title: 'Support client réactif',
    description:
      'Une question ? Notre équipe répond sous 1h via WhatsApp, chat ou e-mail.',
  },
  {
    icon: '💸',
    title: 'Prix compétitifs',
    description:
      'Tech Up Antilles vous garantit les meilleurs prix sans compromis sur la qualité.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const WhyChooseUs: React.FC = () => {
  return (
    <section id="pourquoi-nous" className="relative py-20 px-4 md:px-8 lg:px-16 overflow-hidden">
      {/* Fond subtil avec gradient néon */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B] via-[#0F0F1E] to-[#0B0B0B] pointer-events-none" />

      {/* Effets lumineux d'arrière-plan */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#00BFFF] opacity-5 blur-3xl rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#8A2BE2] opacity-5 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Pourquoi choisir{' '}
            <span className="bg-gradient-to-r from-[#00BFFF] to-[#8A2BE2] bg-clip-text text-transparent">
              Tech Up Antilles
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            La tech premium qui pense à vous, où que vous soyez aux Antilles.
          </p>
        </motion.div>

        {/* Grille des avantages */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              className="group relative p-6 rounded-2xl border border-white/10 
                         bg-white/5 backdrop-blur-sm shadow-lg 
                         hover:shadow-[0_0_25px_rgba(0,191,255,0.15)] 
                         transition-all duration-300
                         before:absolute before:inset-0 before:rounded-2xl 
                         before:bg-gradient-to-br before:from-[#00BFFF]/5 before:to-[#8A2BE2]/5 
                         before:opacity-0 before:transition-opacity before:duration-300
                         hover:before:opacity-100"
            >
              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                {/* Icône animée */}
                <motion.span
                  className="text-5xl leading-none"
                  whileHover={{ rotate: [0, 10, -10, 0], scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {benefit.icon}
                </motion.span>

                {/* Texte */}
                <h3 className="text-xl font-bold text-white group-hover:text-[#00BFFF] transition-colors duration-200">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                  {benefit.description}
                </p>
              </div>

              {/* Bordure lumineuse au hover */}
              <div className="absolute inset-0 rounded-2xl border border-transparent 
                            group-hover:border-[#00BFFF]/30 transition-all duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export { WhyChooseUs };
export default WhyChooseUs;