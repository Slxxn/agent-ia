import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Testimonial {
  id: number;
  name: string;
  avatar: string; // URL vers une image (peut être un placeholder)
  rating: number; // 1-5
  text: string;
  date?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Karim M.',
    avatar: 'https://i.pravatar.cc/100?img=11',
    rating: 5,
    text: 'Commande passée un lundi soir, reçue mercredi matin ! iPhone 13 reconditionné impeccable, je recommande TechUp Antilles pour leur sérieux et leur rapidité.',
    date: 'Mars 2025',
  },
  {
    id: 2,
    name: 'Sophie L.',
    avatar: 'https://i.pravatar.cc/100?img=5',
    rating: 5,
    text: 'Très bon rapport qualité-prix. Le casque JBL est au top, et le service client WhatsApp répond en 5 minutes. Une boutique locale que je soutiens !',
    date: 'Février 2025',
  },
  {
    id: 3,
    name: 'Alexandre P.',
    avatar: 'https://i.pravatar.cc/100?img=3',
    rating: 4,
    text: 'Livraison rapide et produit conforme. Seul petit bémol, la coque était légèrement rayée, mais le SAV a réagi immédiatement avec un échange. Très pro.',
    date: 'Janvier 2025',
  },
  {
    id: 4,
    name: 'Marie D.',
    avatar: 'https://i.pravatar.cc/100?img=9',
    rating: 5,
    text: 'La powerbank me sauve la vie ! Design moderne, livraison en point relais express. Et en plus ils sont en Martinique, parfait.',
    date: 'Décembre 2024',
  },
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex gap-0.5" aria-label={`Note : ${rating} sur 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
          viewBox="0 0 24 24"
          fill={star <= rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      ))}
    </div>
  );
};

const TestimonialCard: React.FC<{ testimonial: Testimonial; index: number }> = ({
  testimonial,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
      className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-purple-500/40 transition-colors"
    >
      <div className="flex items-start gap-4">
        <img
          src={testimonial.avatar}
          alt={`Photo de ${testimonial.name}`}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/20"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-white truncate">{testimonial.name}</h4>
            {testimonial.date && (
              <span className="text-gray-500 text-xs whitespace-nowrap">{testimonial.date}</span>
            )}
          </div>
          <StarRating rating={testimonial.rating} />
        </div>
      </div>
      <p className="mt-4 text-gray-300 text-sm leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
    </motion.div>
  );
};

export const TestimonialSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="relative py-16 md:py-24 overflow-hidden">
      {/* Fond décoratif */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Ce que nos clients disent
          </h2>
          <p className="mt-3 text-gray-400 max-w-2xl mx-auto">
            Des centaines de clients satisfaits en Guadeloupe et Martinique. Rejoignez-les !
          </p>
        </motion.div>

        {/* Grille des témoignages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>

        {/* CTA vers plus d'avis */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-10"
        >
          <a
            href="https://www.instagram.com/techupantilles/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-cyan-500 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Voir tous les avis sur Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialSection;