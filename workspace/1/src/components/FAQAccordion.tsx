import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items?: FAQItem[];
  className?: string;
}

const defaultItems: FAQItem[] = [
  {
    question: 'Quels sont les délais de livraison ?',
    answer:
      'Nous livrons sous 24 à 48h en Guadeloupe et Martinique. La livraison est offerte dès 100€ d’achat. Vous recevrez un numéro de suivi par SMS ou WhatsApp.',
  },
  {
    question: 'Comment puis-je payer ma commande ?',
    answer:
      'Pour le moment, nous acceptons les virements bancaires, PayPal et le paiement en espèces à la livraison (uniquement en Guadeloupe). Le paiement par carte sera bientôt disponible.',
  },
  {
    question: 'Quels produits sont garantis ?',
    answer:
      'Tous nos produits sont garantis 1 an (hors accessoires). Les smartphones reconditionnés bénéficient d’une garantie supplémentaire de 6 mois offerte par TechUp Antilles.',
  },
  {
    question: 'Puis-je retourner un produit ?',
    answer:
      'Oui, vous disposez de 14 jours pour retourner un produit non utilisé et dans son emballage d’origine. Les frais de retour sont à votre charge sauf en cas de défaut.',
  },
  {
    question: 'Comment contacter le service client ?',
    answer:
      'Le plus rapide est via WhatsApp au +590 690 00 00 00. Vous pouvez aussi nous envoyer un email à contact@techupantilles.com. Nous répondons sous 2h en semaine.',
  },
  {
    question: 'Proposez-vous des solutions de financement ?',
    answer:
      'Pas encore, mais nous étudions la mise en place de paiement en plusieurs fois. Restez connecté sur nos réseaux pour être informé des nouveautés.',
  },
];

const FAQAccordion: React.FC<FAQAccordionProps> = ({ items = defaultItems, className = '' }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setActiveIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => {
        const isOpen = activeIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <div
            key={index}
            className="border border-purple-500/20 rounded-xl overflow-hidden bg-black/60 backdrop-blur-sm"
          >
            <button
              id={buttonId}
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between px-5 py-4 text-left text-white font-medium transition-colors duration-200 hover:bg-purple-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <span className="pr-4">{item.question}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex-shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 text-gray-300 text-sm leading-relaxed">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export { FAQAccordion };
export default FAQAccordion;