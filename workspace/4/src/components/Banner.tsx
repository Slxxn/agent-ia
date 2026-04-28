import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Banner: React.FC = () => {
  const [visible, setVisible] = useState(true);

  // Auto-hide after 10 seconds (optional)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="relative z-30 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 px-4 py-2 text-center text-sm font-medium text-white shadow-lg backdrop-blur-sm"
        >
          <span className="text-lg">🇬🇵🇲🇶</span>
          <span>Disponible en Guadeloupe &amp; Martinique</span>
          <button
            onClick={() => setVisible(false)}
            className="ml-4 rounded-full bg-white/20 p-1 transition hover:bg-white/30 focus:outline-none"
            aria-label="Fermer la bannière"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Banner;