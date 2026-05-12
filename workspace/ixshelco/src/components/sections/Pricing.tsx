import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const plans = [
  {
    name: 'Essentiel',
    price: { monthly: '35€', yearly: '35€' },
    description: 'Parfait pour entretenir vos ongles',
    features: [
      'Manucure classique',
      'Limage & cuticules',
      'Vernis classique',
      'Durée : 45 min',
    ],
    cta: 'Réserver',
    popular: false,
  },
  {
    name: 'Semi-Permanent',
    price: { monthly: '45€', yearly: '45€' },
    description: 'Tenue jusqu\'à 3 semaines',
    features: [
      'Manucure semi-permanent',
      'Large choix de couleurs',
      'Finition parfaite',
      'Durée : 60 min',
    ],
    cta: 'Réserver',
    popular: true,
  },
  {
    name: 'Forfait Duo',
    price: { monthly: '85€', yearly: '85€' },
    description: 'Mains & pieds parfaits',
    features: [
      'Manucure semi-permanent',
      'Pédicure semi-permanent',
      'Combo idéal',
      'Durée : 120 min',
    ],
    cta: 'Réserver',
    popular: false,
  },
];

export const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="relative py-14 lg:py-20 overflow-hidden bg-[var(--bg)]">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-[var(--primary)]/8 via-[var(--accent)]/5 to-transparent rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="accent" size="sm" className="mb-6">
            <Sparkles className="w-3 h-3 mr-1" />
            Nos tarifs
          </Badge>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight mb-6">
            Des formules <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]">claires</span>
          </h2>
          <p className="text-lg lg:text-xl text-[var(--muted)] max-w-2xl mx-auto">
            Pas de frais cachés. Choisissez la prestation qui vous convient.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className={`relative bg-[var(--surface)] border rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? 'border-[var(--primary)] scale-105'
                  : 'border-[var(--border)] hover:border-[var(--accent)]/30 hover:shadow-xl'
              }`}
              style={plan.popular ? { boxShadow: '0 0 0 3px rgba(85,11,20,0.15)' } : {}}
            >
              <div className="mb-8">
                {plan.popular && (
                  <div className="flex justify-center mb-4">
                    <Badge variant="primary" size="sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Le plus populaire
                    </Badge>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-[var(--text)] mb-2">{plan.name}</h3>
                <p className="text-[var(--muted)] mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-[var(--text)]">
                    {plan.price.monthly}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[var(--muted)]">
                    <Check className="w-4 h-4 text-[var(--success)] shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'primary' : 'outline'}
                size="lg"
                className="w-full group"
              >
                {plan.cta}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
