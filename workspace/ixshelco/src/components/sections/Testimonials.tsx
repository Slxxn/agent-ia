import { motion } from 'framer-motion';
import testimonialsData, { testimonialsStats } from '../../data/testimonials';
import { Star, Quote } from 'lucide-react';
import { useRef } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const Testimonials = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative py-24 lg:py-32 overflow-hidden bg-[var(--bg)]"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[var(--primary)]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-[var(--accent)] bg-[var(--accent)]/8 border border-[var(--accent)]/20 rounded-full px-3 py-1.5 mb-6">
            <Star className="w-3 h-3" />
            Témoignages
          </span>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight text-[var(--text)] mb-4">
            Ce que disent nos{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]">
              clients
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-[var(--muted)] max-w-2xl mx-auto">
            La satisfaction de nos clients est notre plus belle récompense. Découvrez leurs expériences.
          </p>
        </motion.div>

        {/* Stats row */}
        {testimonialsStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 lg:mb-20"
          >
            <div className="text-center p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
              <div className="text-3xl lg:text-4xl font-bold text-[var(--accent)] mb-1">
                {testimonialsStats.totalReviews}+
              </div>
              <div className="text-sm text-[var(--muted)]">Avis clients</div>
            </div>
            <div className="text-center p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
              <div className="text-3xl lg:text-4xl font-bold text-[var(--accent)] mb-1">
                {testimonialsStats.averageRating}
              </div>
              <div className="text-sm text-[var(--muted)]">Note moyenne</div>
            </div>
            <div className="text-center p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
              <div className="text-3xl lg:text-4xl font-bold text-[var(--accent)] mb-1">
                {testimonialsStats.satisfactionRate}%
              </div>
              <div className="text-sm text-[var(--muted)]">Satisfaction</div>
            </div>
            <div className="text-center p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
              <div className="text-3xl lg:text-4xl font-bold text-[var(--accent)] mb-1">
                {testimonialsStats.returnRate}%
              </div>
              <div className="text-sm text-[var(--muted)]">Fidélité</div>
            </div>
          </motion.div>
        )}

        {/* Testimonials masonry grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="columns-1 md:columns-2 lg:columns-3 gap-4 lg:gap-6 space-y-4 lg:space-y-6"
        >
          {testimonialsData.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={item}
              className="break-inside-avoid bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:border-[var(--accent)]/30 hover:bg-[var(--surface2)] hover:shadow-xl hover:shadow-[var(--primary)]/5"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-[var(--accent)]/20 mb-4" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? 'text-[var(--accent)] fill-[var(--accent)]'
                        : 'text-[var(--border)]'
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-[var(--text)]/80 text-base leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.author
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="font-semibold text-[var(--text)] text-sm">
                    {testimonial.author}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;