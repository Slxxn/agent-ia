import { motion } from 'framer-motion';
import { HelpCircle, MessageCircle, ShoppingBag, CreditCard, Truck, RotateCcw, Shield, Smartphone } from 'lucide-react';
import FAQAccordion from '../components/FAQAccordion';
import WhatsAppButton from '../components/WhatsAppButton';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const faqCategories = [
  {
    icon: ShoppingBag,
    title: 'Commandes',
    questions: [
      {
        question: 'Comment passer une commande ?',
        answer:
          'Rendez-vous sur notre catalogue, choisissez votre produit et cliquez sur "Commander via WhatsApp". Vous serez redirigé vers WhatsApp avec un message pré-rempli. Il vous suffit de confirmer votre commande et votre adresse de livraison.',
      },
      {
        question: 'Puis-je commander depuis la Martinique ?',
        answer:
          'Oui ! Nous livrons partout en Guadeloupe et en Martinique. La livraison est souvent effectuée en 24h selon votre zone.',
      },
      {
        question: 'Y a-t-il une quantité minimum de commande ?',
        answer:
          'Non, vous pouvez commander un seul produit. Aucun minimum requis.',
      },
    ],
  },
  {
    icon: CreditCard,
    title: 'Paiement',
    questions: [
      {
        question: 'Quels moyens de paiement acceptez-vous ?',
        answer:
          'Nous acceptons les virements bancaires, PayPal, et le paiement en espèces à la livraison (sous conditions). Pour le moment, nous n\'avons pas de paiement par carte en ligne, mais cela arrive bientôt !',
      },
      {
        question: 'Le paiement est-il sécurisé ?',
        answer:
          'Oui, via PayPal ou virement bancaire. Nous ne stockons aucune donnée bancaire.',
      },
      {
        question: 'Puis-je payer en plusieurs fois ?',
        answer:
          'Pas encore. Mais nous travaillons sur une solution avec Alma pour le paiement fractionné. Restez à l\'écoute !',
      },
    ],
  },
  {
    icon: Truck,
    title: 'Livraison',
    questions: [
      {
        question: 'Quels sont les délais de livraison ?',
        answer:
          'Livraison en 24h en Guadeloupe (sauf zones éloignées). En Martinique, comptez 24 à 48h selon la localisation. Nous utilisons des transporteurs locaux fiables.',
      },
      {
        question: 'Combien coûte la livraison ?',
        answer:
          'Livraison offerte à partir de 50€ d\'achat. En dessous, forfait de 5€ quel que soit le produit.',
      },
      {
        question: 'Puis-je suivre ma commande ?',
        answer:
          'Oui, nous vous envoyons un numéro de suivi par WhatsApp dès que votre colis est pris en charge.',
      },
    ],
  },
  {
    icon: RotateCcw,
    title: 'Retours et garantie',
    questions: [
      {
        question: 'Puis-je retourner un produit ?',
        answer:
          'Oui, sous 14 jours après réception. Le produit doit être dans son emballage d\'origine, non utilisé. Contactez-nous via WhatsApp pour initier le retour.',
      },
      {
        question: 'Quelle est la garantie sur les produits ?',
        answer:
          'Tous nos produits bénéficient d\'une garantie constructeur (1 an minimum). Pour les reconditionnés, nous offrons 6 mois de garantie supplémentaire.',
      },
      {
        question: 'Que faire si mon produit est défectueux ?',
        answer:
          'Contactez-nous immédiatement via WhatsApp. Nous échangeons ou remboursons sous 48h après diagnostic.',
      },
    ],
  },
  {
    icon: Shield,
    title: 'Service client',
    questions: [
      {
        question: 'Comment vous contacter ?',
        answer:
          'Le plus simple est via le bouton WhatsApp flottant sur notre site. Vous pouvez aussi nous envoyer un message privé sur Instagram @techupantilles.',
      },
      {
        question: 'Quels sont vos horaires ?',
        answer:
          'Nous répondons du lundi au samedi, de 9h à 19h (heure locale). En dehors de ces horaires, laissez-nous un message, nous vous répondrons dès le lendemain matin.',
      },
      {
        question: 'Proposez-vous une assistance technique ?',
        answer:
          'Oui, nous vous accompagnons dans la configuration de votre produit. N\'hésitez pas à nous demander conseil !',
      },
    ],
  },
  {
    icon: Smartphone,
    title: 'Produits',
    questions: [
      {
        question: 'Vendez-vous des produits neufs ou reconditionnés ?',
        answer:
          'Les deux ! Nous avons des produits neufs sous blister et des reconditionnés de haute qualité (grade A ou B) avec garantie.',
      },
      {
        question: 'Comment vérifier si un produit est en stock ?',
        answer:
          'La disponibilité est indiquée sur chaque fiche produit. En cas de rupture, nous vous proposons une alerte WhatsApp.',
      },
      {
        question: 'Puis-je commander un produit qui n\'est pas dans le catalogue ?',
        answer:
          'Oui ! Contactez-nous sur WhatsApp, nous pouvons commander pour vous sous 48h.',
      },
    ],
  },
];

export const FAQ: React.FC = () => {
  const handleWhatsApp = () => {
    const txt = encodeURIComponent('Bonjour, j\'ai une question concernant votre FAQ.');
    window.open(`https://wa.me/590690000000?text=${txt}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center"
          >
            <motion.span
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1 text-sm font-medium text-violet-400 backdrop-blur-sm"
              variants={fadeInUp}
              custom={0}
            >
              <HelpCircle className="h-4 w-4" />
              Foire aux questions
            </motion.span>
            <motion.h1
              className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
              variants={fadeInUp}
              custom={1}
            >
              Vous avez une <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">question</span> ?
            </motion.h1>
            <motion.p
              className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 sm:text-xl"
              variants={fadeInUp}
              custom={2}
            >
              Retrouvez les réponses aux questions les plus fréquentes. 
              Si vous ne trouvez pas votre bonheur, contactez-nous directement sur WhatsApp.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          {faqCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              custom={index}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-violet-500/10 p-2">
                  <category.icon className="h-5 w-5 text-violet-400" />
                </div>
                <h2 className="text-2xl font-bold">{category.title}</h2>
              </div>
              <FAQAccordion
                items={category.questions.map((q, i) => ({
                  id: `${category.title}-${i}`,
                  question: q.question,
                  answer: q.answer,
                }))}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/10 to-cyan-900/10 pointer-events-none" />
        <div className="relative mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Encore un doute ?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-gray-400">
              Notre équipe est là pour vous répondre en moins d'une heure sur WhatsApp.
            </p>
            <button
              onClick={handleWhatsApp}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:shadow-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <MessageCircle className="h-5 w-5" />
              Posez votre question
            </button>
          </motion.div>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  );
};

export default FAQ;