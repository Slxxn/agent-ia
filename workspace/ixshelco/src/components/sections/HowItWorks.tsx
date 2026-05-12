import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const steps = [
  {
    number: '01',
    title: 'Consultation',
    description: 'Nous analysons vos besoins, vos objectifs et votre marché pour définir une stratégie sur mesure.',
    color: 'from-[var(--primary)] to-[var(--accent)]',
  },
  {
    number: '02',
    title: 'Création',
    description: 'Nos experts conçoivent et développent votre solution avec les dernières technologies et tendances.',
    color: 'from-[var(--accent)] to-[var(--accent2)]',
  },
  {
    number: '03',
    title: 'Lancement',
    description: 'Nous déployons votre projet et assurons un suivi continu pour garantir votre succès.',
    color: 'from-[var(--accent2)] to-[var(--primary)]',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-[var(--surface)]">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-br from-[var(--primary)]/5 via-[var(--accent)]/3 to-transparent rounded-full blur-[150px]" />
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
            Comment ça marche
          </Badge>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight mb-6">
            Un processus en <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]">3 étapes</span>
          </h2>
          <p className="text-lg lg:text-xl text-[var(--muted)] max-w-2xl mx-auto">
            Une méthodologie éprouvée pour transformer votre vision en réalité.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent hidden lg:block" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative text-center"
              >
                {/* Number */}
                <div className="relative mb-8 inline-block">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} p-0.5`}>
                    <div className="w-full h-full rounded-2xl bg-[var(--surface)] flex items-center justify-center">
                      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)]">
                        {step.number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold mb-4 text-[var(--text)]">{step.title}</h3>
                <p className="text-[var(--muted)] leading-relaxed max-w-sm mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button variant="primary" size="lg" className="group">
            Commencer votre projet
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;