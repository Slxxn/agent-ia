import { motion } from 'framer-motion';
import { FiInstagram, FiExternalLink } from 'react-icons/fi';

const posts = [
  { id: 1, image: '📱', label: 'Smartphone en action' },
  { id: 2, image: '🎧', label: 'AirPods Max' },
  { id: 3, image: '⌚', label: 'Montre connectée' },
  { id: 4, image: '💻', label: 'Setup gaming' },
  { id: 5, image: '🔋', label: 'Chargeur rapide' },
  { id: 6, image: '📸', label: 'Photo lifestyle' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export const SocialSection: React.FC = () => {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0B0B0B] overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#00BFFF] to-[#8A2BE2] opacity-10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Suis-nous sur{' '}
            <span className="bg-gradient-to-r from-[#00BFFF] to-[#8A2BE2] bg-clip-text text-transparent">
              Instagram
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Découvre les coulisses, les nouveaux produits et le lifestyle Tech Up Antilles.
          </p>
        </motion.div>

        {/* Instagram Posts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {posts.map((post) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center aspect-square cursor-pointer overflow-hidden"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00BFFF]/20 to-[#8A2BE2]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <span className="text-5xl mb-3 relative z-10">{post.image}</span>
              <p className="text-gray-400 text-sm text-center relative z-10">{post.label}</p>
              {/* Instagram icon */}
              <FiInstagram className="absolute top-3 right-3 text-white/30 text-lg" />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="https://www.instagram.com/techupantilles/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00BFFF] to-[#8A2BE2] text-white font-semibold rounded-full hover:shadow-lg hover:shadow-[#00BFFF]/30 transition-all duration-300 group"
          >
            <FiInstagram className="text-xl" />
            <span>Suis-nous sur Instagram</span>
            <FiExternalLink className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialSection;