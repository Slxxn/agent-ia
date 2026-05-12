import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { services } from '../../data/services';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 32, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export const Services: React.FC = () => {
  return (
    <section className="relative py-14 lg:py-20 overflow-hidden bg-[var(--bg)]">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--primary)]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[var(--accent)]/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <Badge variant="accent" size="sm" className="mb-6">
            <Sparkles className="w-3 h-3 mr-1" />
            Nos services
          </Badge>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight mb-6">
            Des solutions <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]">sur mesure</span>
          </h2>
          <p className="text-lg lg:text-xl text-[var(--muted)] max-w-2xl mx-auto">
            De la stratégie à l'exécution, nous vous accompagnons à chaque étape de votre transformation digitale.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              variants={item}
              className="group relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:border-[var(--accent)]/30 hover:bg-[var(--surface2)] hover:shadow-xl hover:shadow-[var(--primary)]/5"
            >
              {/* Image */}
              <div className="w-full h-40 rounded-xl overflow-hidden mb-6">
                <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-xl lg:text-2xl font-semibold leading-snug mb-3 text-[var(--text)]">
                {service.name}
              </h3>
              <p className="text-[var(--muted)] mb-6 leading-relaxed text-sm">
                {service.description}
              </p>

              {/* Price & CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <div>
                  <span className="text-2xl font-bold text-[var(--text)]">{service.price}€</span>
                  <span className="text-sm text-[var(--muted)] ml-1">· {service.duration} min</span>
                </div>
                <Button variant="ghost" size="sm" className="group">
                  Réserver
                  <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;