import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';

const plans = [
  {
    name: 'Découverte',
    price: { monthly: 0, yearly: 0 },
    description: 'Parfait pour commencer',
    features: [
      { text: 'Accès au catalogue', included: true },
      { text: 'Commande WhatsApp', included: true },
      { text: 'Support standard', included: true },
      { text: 'Livraison standard', included: true },
      { text: 'Programme fidélité', included: false },
      { text: 'Livraison express', included: false },
      { text: 'Avant-premières', included: false },
    ],
    cta: 'Commencer gratuitement',
    popular: false
  },
  {
    name: 'Premium',
    price: { monthly: 9.99, yearly: 99.99 },
    description: 'Pour les clients réguliers',
    features: [
      { text: 'Accès au catalogue', included: true },
      { text: 'Commande WhatsApp prioritaire', included: true },
      { text: 'Support prioritaire', included: true },
      { text: 'Livraison offerte', included: true },
      { text: 'Programme fidélité', included: true },
      { text: 'Livraison express', included: true },
      { text: 'Avant-premières', included: false },
    ],
    cta: 'Devenir Premium',
    popular: true
  },
  {
    name: 'VIP',
    price: { monthly: 19.99, yearly: 199.99 },
    description: 'L\'expérience ultime',
    features: [
      { text: 'Accès au catalogue', included: true },
      { text: 'Commande WhatsApp prioritaire', included: true },
      { text: 'Support VIP 24/7', included: true },
      { text: 'Livraison offerte', included: true },
      { text: 'Programme fidélité ×2', included: true },
      { text: 'Livraison express offerte', included: true },
      { text: 'Avant-premières exclusives', included: true },
    ],
    cta: 'Devenir VIP',
    popular: false
  }
];

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="relative py-16 lg:py-24 bg-violet-100 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-violet-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-sky-100/30 rounded-full blur-[100px]" />
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
            Programmes
          </span>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-slate-900 mb-4">
            Choisissez votre formule
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Des avantages exclusifs pour nos clients fidèles
          </p>

          {/* Toggle mensuel/annuel */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={cn("text-sm font-medium transition-colors", !isAnnual ? "text-slate-900" : "text-slate-500")}>
              Mensuel
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors duration-200",
                isAnnual ? "bg-violet-600" : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                  isAnnual && "translate-x-7"
                )}
              />
            </button>
            <span className={cn("text-sm font-medium transition-colors", isAnnual ? "text-slate-900" : "text-slate-500")}>
              Annuel
              <span className="ml-1 text-xs text-emerald-600 font-semibold">-17%</span>
            </span>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: '-100px' }}
              className={cn(
                "relative bg-white rounded-2xl p-8 border shadow-sm transition-all duration-300 hover:shadow-lg",
                plan.popular
                  ? "border-violet-600 ring-2 ring-violet-600/20 scale-105"
                  : "border-slate-200"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-violet-600 rounded-full px-3 py-1">
                    Plus populaire
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isAnnual ? 'annual' : 'monthly'}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="text-4xl font-bold text-slate-900"
                    >
                      {isAnnual
                        ? plan.price.yearly === 0
                          ? 'Gratuit'
                          : `${plan.price.yearly.toFixed(2)} €`
                        : plan.price.monthly === 0
                        ? 'Gratuit'
                        : `${plan.price.monthly.toFixed(2)} €`}
                    </motion.span>
                  </AnimatePresence>
                  {plan.price.monthly > 0 && (
                    <span className="text-sm text-slate-500">/{isAnnual ? 'an' : 'mois'}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-violet-600 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'filled' : 'outline'}
                size="md"
                className="w-full"
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;