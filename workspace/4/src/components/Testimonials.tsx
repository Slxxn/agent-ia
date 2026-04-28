import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

// Données des témoignages
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Lucas M.",
    role: "Étudiant en informatique",
    avatar: "https://i.pravatar.cc/80?u=lucas",
    content: "J'ai commandé un iPhone 15 Pro Max, livré en 48h en Guadeloupe ! Le service client est top, je recommande Tech Up Antilles sans hésiter.",
    rating: 5,
  },
  {
    id: 2,
    name: "Marie S.",
    role: "Chef d'entreprise",
    avatar: "https://i.pravatar.cc/80?u=marie",
    content: "Produits 100% authentiques, prix imbattables. J'équipe toute ma société chez Tech Up Antilles. Mention spéciale pour les AirPods Pro.",
    rating: 5,
  },
  {
    id: 3,
    name: "Kevin D.",
    role: "Influenceur lifestyle",
    avatar: "https://i.pravatar.cc/80?u=kevin",
    content: "Le style et la qualité sont au rendez-vous. Mes abonnés adorent voir mes accessoires Tech Up Antilles dans mes stories. Merci !",
    rating: 5,
  },
  {
    id: 4,
    name: "Sophie L.",
    role: "Infirmière",
    avatar: "https://i.pravatar.cc/80?u=sophie",
    content: "Livraison rapide, emballage soigné, produit conforme. J'ai offert une montre connectée à mon frère, il est ravi.",
    rating: 4,
  },
  {
    id: 5,
    name: "Antoine R.",
    role: "Freelance développeur",
    avatar: "https://i.pravatar.cc/80?u=antoine",
    content: "Le support WhatsApp est ultra réactif. J'ai eu un souci avec ma commande, tout a été résolu en 10 minutes. Service 5 étoiles !",
    rating: 5,
  },
];

// Composant d'évaluation (étoiles)
const Stars: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg
        key={i}
        className={`w-4 h-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
      </svg>
    );
  }
  return <div className="flex gap-1 mt-2">{stars}</div>;
};

// Composant principal
export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1: left, 1: right

  // Changer de témoignage
  const changeTestimonial = useCallback((newIndex: number) => {
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentIndex(newIndex);
  }, [currentIndex]);

  const next = useCallback(() => {
    changeTestimonial((currentIndex + 1) % testimonials.length);
  }, [currentIndex, changeTestimonial]);

  const prev = useCallback(() => {
    changeTestimonial((currentIndex - 1 + testimonials.length) % testimonials.length);
  }, [currentIndex, changeTestimonial]);

  // Auto-slide toutes les 6 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      next();
    }, 6000);
    return () => clearInterval(interval);
  }, [next]);

  // Variantes d'animation Framer Motion
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const current = testimonials[currentIndex];

  if (!current) return null;

  return (
    <section className="relative py-16 md:py-24 bg-[#0B0B0B] overflow-hidden">
      {/* Éléments décoratifs néon */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00BFFF] opacity-[0.08] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#8A2BE2] opacity-[0.06] rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Ce que disent nos{' '}
            <span className="bg-gradient-to-r from-[#00BFFF] to-[#8A2BE2] bg-clip-text text-transparent">
              clients
            </span>
          </h2>
          <p className="mt-3 text-gray-400 text-lg max-w-2xl mx-auto">
            Des milliers de clients satisfaits aux Antilles et dans le monde.
          </p>
        </div>

        {/* Slider */}
        <div className="relative flex items-center justify-center">
          {/* Bouton précédent */}
          <button
            onClick={prev}
            className="absolute left-0 z-10 p-2 text-gray-400 hover:text-white transition-colors duration-300 focus:outline-none"
            aria-label="Témoignage précédent"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Carte témoignage */}
          <div className="relative w-full max-w-2xl mx-8 overflow-hidden">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-8 md:px-10 md:py-10 shadow-2xl"
              >
                {/* Cotation */}
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-6 h-6 text-[#00BFFF]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <span className="text-white/60 text-sm">Témoignage client</span>
                </div>

                {/* Texte */}
                <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-6">
                  "{current.content}"
                </p>

                {/* Étoiles */}
                <Stars rating={current.rating} />

                {/* Profile */}
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
                  <img
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#00BFFF]/50"
                    src={current.avatar}
                    alt={current.name}
                  />
                  <div>
                    <h3 className="text-white font-semibold text-lg">{current.name}</h3>
                    <p className="text-gray-400 text-sm">{current.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bouton suivant */}
          <button
            onClick={next}
            className="absolute right-0 z-10 p-2 text-gray-400 hover:text-white transition-colors duration-300 focus:outline-none"
            aria-label="Témoignage suivant"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots de navigation */}
        <div className="flex justify-center gap-3 mt-8">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => changeTestimonial(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'bg-[#00BFFF] w-6'
                  : 'bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Aller au témoignage ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;