export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const faqCategories: string[] = [
  'Réservations',
  'Prestations',
  'Produits',
  'Après-soin',
  'Institut',
];

export const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'Comment réserver une prestation ?',
    answer:
      'Vous pouvez réserver directement en ligne via notre site, par téléphone au 01 23 45 67 89, ou en vous rendant directement à l\'institut. La réservation en ligne est disponible 24h/24 et 7j/7.',
    category: 'Réservations',
  },
  {
    id: '2',
    question: 'Puis-je annuler ou modifier mon rendez-vous ?',
    answer:
      'Oui, vous pouvez annuler ou modifier votre rendez-vous jusqu\'à 24h avant sans frais. Passé ce délai, des frais d\'annulation de 50% du montant de la prestation pourront être appliqués.',
    category: 'Réservations',
  },
  {
    id: '3',
    question: 'Quels modes de paiement acceptez-vous ?',
    answer:
      'Nous acceptons les cartes bancaires (Visa, Mastercard), les espèces, les chèques et les tickets CESU (Chèques Emploi Service Universel).',
    category: 'Réservations',
  },
  {
    id: '4',
    question: 'Combien de temps dure une séance de pose de vernis semi-permanent ?',
    answer:
      'Une pose de vernis semi-permanent dure environ 45 minutes. Ce temps peut varier selon la complexité de la prestation (nail art, french manucure, etc.).',
    category: 'Prestations',
  },
  {
    id: '5',
    question: 'Proposez-vous des soins pour hommes ?',
    answer:
      'Absolument ! Tous nos soins sont accessibles aux hommes. Nous proposons également des prestations spécifiquement adaptées aux besoins de la peau masculine.',
    category: 'Prestations',
  },
  {
    id: '6',
    question: 'Quels produits utilisez-vous ?',
    answer:
      'Nous utilisons exclusivement des produits professionnels de grandes marques : L\'Oréal Professionnel, Kerastase, Sisley Paris, La Roche-Posay, Vichy et Biotherm. Tous nos produits sont sélectionnés pour leur qualité et leur respect de la peau.',
    category: 'Produits',
  },
  {
    id: '7',
    question: 'Vos produits sont-ils testés sur les animaux ?',
    answer:
      'Non, nous sommes engagés dans une démarche éthique et responsable. Tous les produits que nous utilisons sont cruelty-free et non testés sur les animaux.',
    category: 'Produits',
  },
  {
    id: '8',
    question: 'Comment entretenir mon vernis semi-permanent à la maison ?',
    answer:
      'Pour prolonger la tenue de votre vernis, évitez le contact prolongé avec l\'eau chaude, portez des gants pour les tâches ménagères et appliquez une huile cuticule quotidiennement. Évitez également de gratter ou de décoller le vernis.',
    category: 'Après-soin',
  },
  {
    id: '9',
    question: 'Combien de temps tiennent les extensions de cils ?',
    answer:
      'Les extensions de cils tiennent en moyenne 3 à 4 semaines. Nous recommandons une séance d\'entretien toutes les 3 semaines pour maintenir un résultat optimal.',
    category: 'Après-soin',
  },
  {
    id: '10',
    question: 'Où se situe votre institut ?',
    answer:
      'Notre institut est situé au 15 Rue de la Beauté, 75001 Paris. Nous sommes facilement accessibles en métro (lignes 1, 4 et 7) et disposons d\'un parking à proximité.',
    category: 'Institut',
  },
  {
    id: '11',
    question: 'Quels sont vos horaires d\'ouverture ?',
    answer:
      'Nous sommes ouverts du mardi au samedi de 9h à 19h, et le lundi sur rendez-vous uniquement. Le dimanche, nous sommes fermés.',
    category: 'Institut',
  },
];

export default faqItems;