import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: 'Kevin M.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin',
    rating: 5,
    text: 'Commande passée un lundi, reçue le mercredi en Guadeloupe 🇬🇵. Le AirPods Pro est incroyable, son neuf et réduction de bruit au top. Merci Tech Up Antilles !',
    location: 'Pointe-à-Pitre',
  },
  {
    id: 2,
    name: 'Amélie D.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amelie',
    rating: 5,
    text: 'Je cherchais une coque de téléphone stylée et résistante. Le choix est immense et la qualité est là. Livraison rapide en Martinique 🇲🇶. Je recommande !',
    location: 'Fort-de-France',
  },
  {
    id: 3,
    name: 'Jules R.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jules',
    rating: 4,
    text: 'J’ai acheté le chargeur sans fil 3-en-1. Design top, charge rapide. Seul petit bémol : le câble fourni est un peu court. Mais le SAV a été super réactif !',
    location: 'Basse-Terre',
  },
  {
    id: 4,
    name: 'Léa S.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lea',
    rating: 5,
    text: 'Enfin une boutique tech qui comprend les Antillais ! Prix compétitifs, produits authentiques, et le petit mot dans le colis fait toujours plaisir. Fidèle cliente !',
    location: 'Saint-Pierre',
  },
];

const ReviewsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
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

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const goToPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentReview = reviews[currentIndex];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'
        }`}
      />
    ));
  };

  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B] via-[#111] to-[#0B0B0B] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Ce que disent nos clients
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Des milliers d’Antillais nous font confiance. Voici quelques-uns de
            leurs retours.
          </p>
        </div>

        {/* Slider container */}
        <div className="relative max-w-lg mx-auto">
          {/* Navigation buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2 text-white hover:bg-white/20 transition-all duration-200 shadow-lg"
            aria-label="Avis précédent"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2 text-white hover:bg-white/20 transition-all duration-200 shadow-lg"
            aria-label="Avis suivant"
          >
            <ChevronRight size={20} />
          </button>

          {/* Review card */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8 min-h-[280px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentReview.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="flex flex-col items-center text-center gap-4"
              >
                {/* Avatar */}
                <img
                  src={currentReview.avatar}
                  alt={currentReview.name}
                  className="w-16 h-16 rounded-full border-2 border-blue-400/50 shadow-lg"
                />

                {/* Stars */}
                <div className="flex gap-1">{renderStars(currentReview.rating)}</div>

                {/* Review text */}
                <p className="text-gray-200 text-base leading-relaxed italic max-w-md">
                  “{currentReview.text}”
                </p>

                {/* Name & location */}
                <div>
                  <p className="text-white font-semibold">{currentReview.name}</p>
                  <p className="text-blue-300 text-sm">{currentReview.location}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots navigation */}
          <div className="flex justify-center gap-3 mt-6">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-blue-400 w-6'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Aller à l'avis ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSlider;
export { ReviewsSlider };