import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Mock data for Instagram posts
const instagramPosts = [
  { id: 1, image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop", likes: 234, caption: "Nouveau casque sans fil 🎧" },
  { id: 2, image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop", likes: 189, caption: "Live en Martinique 🇲🇶" },
  { id: 3, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop", likes: 312, caption: "La tech qui te suit partout" },
  { id: 4, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", likes: 278, caption: "Accessoires haut de gamme" },
  { id: 5, image: "https://images.unsplash.com/photo-1617957772606-7680c6b184e2?w=400&h=400&fit=crop", likes: 145, caption: "Qualité & style avant tout" },
  { id: 6, image: "https://images.unsplash.com/photo-1546868871-af0de0ae72ea?w=400&h=400&fit=crop", likes: 201, caption: "Commande via WhatsApp 📱" },
];

export const SocialMedia: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0B0B] overflow-hidden"
    >
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-[#00BFFF]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8A2BE2]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Suis notre <span className="text-[#00BFFF]">lifestyle tech</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Rejoins la communauté Tech Up Antilles sur Instagram et découvre les
            dernières tendances.
          </p>
        </motion.div>

        {/* Instagram feed mockup */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4"
        >
          {instagramPosts.map((post) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              className="group relative rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg hover:shadow-[0_0_25px_rgba(0,191,255,0.3)] transition-shadow duration-300"
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <p className="text-white text-xs md:text-sm font-medium line-clamp-2">
                  {post.caption}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                    2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09
                    3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0
                    3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span className="text-white text-xs">{post.likes}</span>
                </div>
              </div>
              {/* Instagram icon corner */}
              <div className="absolute top-2 right-2 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07
                  3.252.148 4.771 1.691 4.919 4.919.058 1.265.069
                  1.645.069 4.849 0 3.205-.012 3.584-.069
                  4.849-.149 3.225-1.664 4.771-4.919
                  4.919-1.266.058-1.644.07-4.85.07-3.204
                  0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849
                  0-3.204.013-3.583.07-4.849.149-3.227
                  1.664-4.771 4.919-4.919 1.266-.057
                  1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014
                  7.053.072 2.695.272.273 2.69.073 7.052.014
                  8.333 0 8.741 0 12c0 3.259.014 3.668.072
                  4.948.2 4.358 2.618 6.78 6.98 6.98
                  1.281.058 1.689.072 4.948.072
                  3.259 0 3.668-.014 4.948-.072
                  4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948
                  0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014
                  15.259 0 12 0zm0 5.838a6.162 6.162 0 100
                  12.324 6.162 6.162 0 000-12.324zM12
                  16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44
                  1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="https://www.instagram.com/techupantilles/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#8A2BE2] to-[#00BFFF] text-white font-semibold rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(138,43,226,0.6)] transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07
              3.252.148 4.771 1.691 4.919 4.919.058 1.265.069
              1.645.069 4.849 0 3.205-.012 3.584-.069
              4.849-.149 3.225-1.664 4.771-4.919
              4.919-1.266.058-1.644.07-4.85.07-3.204
              0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849
              0-3.204.013-3.583.07-4.849.149-3.227
              1.664-4.771 4.919-4.919 1.266-.057
              1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014
              7.053.072 2.695.272.273 2.69.073 7.052.014
              8.333 0 8.741 0 12c0 3.259.014 3.668.072
              4.948.2 4.358 2.618 6.78 6.98 6.98
              1.281.058 1.689.072 4.948.072
              3.259 0 3.668-.014 4.948-.072
              4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948
              0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014
              15.259 0 12 0zm0 5.838a6.162 6.162 0 100
              12.324 6.162 6.162 0 000-12.324zM12
              16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44
              1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            Suis-nous sur Instagram
          </a>
          <p className="text-gray-500 text-sm mt-4">
            @techupantilles · #TechUpAntilles
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialMedia;