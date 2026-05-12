export interface Review {
  id: string;
  author: string;
  rating: number;
  content: string;
  date: string;
  service: string;
}

export const recentReviews: Review[] = [
  {
    id: '1',
    author: 'Sophie M.',
    rating: 5,
    content: 'Prestation impeccable, je recommande vivement !',
    date: '2024-01-15',
    service: 'Pose de vernis semi-permanent',
  },
  {
    id: '2',
    author: 'Camille D.',
    rating: 5,
    content: 'Un cadre magnifique et des professionnelles à l\'écoute.',
    date: '2024-01-14',
    service: 'Soin visage hydratant',
  },
  {
    id: '3',
    author: 'Léa P.',
    rating: 5,
    content: 'Le meilleur maquillage que j\'ai jamais eu !',
    date: '2024-01-12',
    service: 'Maquillage soirée',
  },
  {
    id: '4',
    author: 'Marie L.',
    rating: 4,
    content: 'Très satisfaite des extensions de cils, résultat naturel.',
    date: '2024-01-10',
    service: 'Pose d\'extensions de cils',
  },
];

export default recentReviews;