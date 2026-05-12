import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { testimonials } from '../../data/testimonials';
import { cn } from '../../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const TestimonialsSection = () => {
  return (
    <section className="relative py-16 lg:py-24 overflow-hidden bg-violet-100">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-100/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-3 py-1.5 mb-4">
            Témoignages
          </span>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-slate-900 mb-4">
            Ce que disent nos clients
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            La satisfaction de nos clients est notre plus belle récompense
          </p>
        </motion.div>

        {/* Masonry grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              className={cn(
                "break-inside-avoid bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300",
                index === 0 && "lg:mt-0",
                index === 1 && "lg:mt-12",
                index === 2 && "lg:mt-6"
              )}
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-violet-200 mb-4" />

              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < testimonial.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300"
                    )}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-slate-600 leading-relaxed mb-6 italic">
                "{testimonial.comment ?? testimonial.text ?? testimonial.content ?? ''}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.location ?? testimonial.role ?? ''}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;