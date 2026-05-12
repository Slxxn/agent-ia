export interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    author: 'Sophie Martin',
    role: 'Cliente régulière',
    content: 'Un véritable coup de cœur ! Le nail art est d\'une précision incroyable et l\'ambiance du studio est tellement apaisante. Je ne vais plus que chez IXSHEL&CO.',
    rating: 5
  },
  {
    id: '2',
    author: 'Camille Dubois',
    role: 'Mariée 2024',
    content: 'Pour mon mariage, j\'avais besoin d\'une manucure parfaite. Résultat au-delà de mes espérances ! Des ongles sublimes qui ont tenu parfaitement tout le week-end.',
    rating: 5
  },
  {
    id: '3',
    author: 'Léa Moreau',
    role: 'Cliente depuis 1 an',
    content: 'Le studio à domicile est une vraie bulle de bien-être. On se sent chouchoutée de A à Z. Les produits utilisés sont de grande qualité et ça se voit !',
    rating: 5
  },
  {
    id: '4',
    author: 'Emma Petit',
    role: 'Nouvelle cliente',
    content: 'Première expérience et je suis conquise ! L\'accueil est chaleureux, les conseils sont précieux et le résultat est magnifique. Je reviendrai sans hésiter.',
    rating: 5
  },
  {
    id: '5',
    author: 'Julie Bernard',
    role: 'Cliente fidèle',
    content: 'Je recommande les yeux fermés. Chaque séance est un moment de détente et de partage. Les finitions sont toujours impeccables, que ce soit pour une manucure simple ou du nail art.',
    rating: 5
  },
  {
    id: '6',
    author: 'Marie Laurent',
    role: 'Cliente depuis 6 mois',
    content: 'Enfin une professionnelle qui comprend ce que je veux ! Les créations sont uniques et personnalisées. Mon vernis tient plus de 3 semaines sans s\'écailler.',
    rating: 5
  }
];

export const testimonialsStats = {
  totalClients: 150,
  averageRating: 4.9,
  totalServices: 300,
  recommendationRate: 98
};

export default testimonials;