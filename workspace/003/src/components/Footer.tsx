import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Icônes SVG inline (légères)
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M15 8a5 5 0 0 0-3.5-1.5A5 5 0 0 0 6.5 12a5 5 0 0 0 5 5 5 5 0 0 0 5-5V8h0" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const Footer: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer className="relative bg-[#0B0B0B] text-white border-t border-white/10">
      {/* Bannière régions */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 py-2 text-center text-sm font-medium tracking-wider">
        <span className="inline-block animate-pulse">Disponible en Guadeloupe 🇬🇵 & Martinique 🇲🇶</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" ref={ref}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo + Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00BFFF] to-[#8A2BE2] bg-clip-text text-transparent">
              Tech Up Antilles
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              La tech qui te suit partout. Qualité, style, performance. Livraison rapide aux Antilles.
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">Navigation</h3>
            <ul className="space-y-2">
              <li><a href="#hero" className="text-gray-400 hover:text-[#00BFFF] transition-colors text-sm">Accueil</a></li>
              <li><a href="#products" className="text-gray-400 hover:text-[#00BFFF] transition-colors text-sm">Produits</a></li>
              <li><a href="#why" className="text-gray-400 hover:text-[#00BFFF] transition-colors text-sm">Pourquoi nous</a></li>
              <li><a href="#social" className="text-gray-400 hover:text-[#00BFFF] transition-colors text-sm">Instagram</a></li>
              <li><a href="#reviews" className="text-gray-400 hover:text-[#00BFFF] transition-colors text-sm">Avis</a></li>
            </ul>
          </motion.div>

          {/* Contact WhatsApp */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <a
              href="https://wa.link/590123456" // lien WhatsApp simulé
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30"
            >
              <WhatsAppIcon />
              Commander sur WhatsApp
            </a>
            <p className="text-gray-400 text-xs mt-2">
              Réponse sous 30 minutes.
            </p>
          </motion.div>

          {/* Réseaux sociaux */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">Suis-nous</h3>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/techupantilles"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-[#00BFFF]/20 border border-white/10 hover:border-[#00BFFF] transition-all duration-200 group"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://facebook.com/techupantilles"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-[#00BFFF]/20 border border-white/10 hover:border-[#00BFFF] transition-all duration-200 group"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://tiktok.com/@techupantilles"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-[#00BFFF]/20 border border-white/10 hover:border-[#00BFFF] transition-all duration-200 group"
                aria-label="TikTok"
              >
                <TikTokIcon />
              </a>
            </div>
            <p className="text-gray-400 text-xs">
              @techupantilles
            </p>
          </motion.div>
        </div>

        {/* Séparation */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Tech Up Antilles. Tous droits réservés.</p>
          <div className="flex gap-4">
            <a href="/mentions-legales" className="hover:text-[#00BFFF] transition-colors">Mentions légales</a>
            <a href="/politique-confidentialite" className="hover:text-[#00BFFF] transition-colors">Politique de confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;