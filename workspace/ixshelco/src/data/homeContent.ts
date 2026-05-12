import { Service } from '../lib/theme';

export interface HeroContent {
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  stats: Array<{
    value: string;
    label: string;
  }>;
}

export interface LogoItem {
  name: string;
  src: string;
  width: number;
  height: number;
}

export interface ProblemSolution {
  problem: {
    badge: string;
    title: string;
    description: string;
    painPoints: string[];
  };
  solution: {
    badge: string;
    title: string;
    description: string;
    benefits: string[];
  };
}

export const heroContent: HeroContent = {
  badge: 'Studio de Nail Art à domicile',
  title: 'Des ongles qui racontent votre histoire',
  subtitle: 'Dans mon studio intimiste à la maison, je crée des œuvres d\'art miniatures pour vos mains. Manucure, nail art et soins personnalisés dans un cadre chaleureux et professionnel.',
  primaryCta: 'Réserver une séance',
  secondaryCta: 'Découvrir mon univers',
  stats: [
    { value: '150+', label: 'Clientes satisfaites' },
    { value: '4.9', label: 'Note moyenne' },
    { value: '50+', label: 'Designs uniques' },
  ],
};

export const problemSolution: ProblemSolution = {
  problem: {
    badge: 'Le constat',
    title: 'Des ongles abîmés par les salons impersonnels ?',
    description: 'Vous en avez assez des salons où l\'on vous traite à la chaîne, des produits agressifs qui abîment vos ongles, et des designs qui ne ressemblent jamais à ce que vous aviez imaginé ?',
    painPoints: [
      'Produits chimiques qui fragilisent l\'ongle',
      'Rendez-vous expéditifs sans écoute réelle',
      'Designs standardisés, jamais personnalisés',
      'Ambiance stressante et impersonnelle',
    ],
  },
  solution: {
    badge: 'Mon approche',
    title: 'Un studio cocooning pour des ongles en pleine santé',
    description: 'Dans mon salon privé, chaque cliente est unique. Je prends le temps de comprendre vos envies, de respecter la santé de vos ongles, et de créer des designs qui vous ressemblent vraiment.',
    benefits: [
      'Produits premium et respectueux de l\'ongle',
      'Séances d\'1h30 minimum pour un travail soigné',
      'Création sur-mesure selon votre inspiration',
      'Ambiance détente avec musique et boisson chaude',
    ],
  },
};

export const logoItems: LogoItem[] = [
  { name: 'CND', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/CND_Logo.svg/200px-CND_Logo.svg.png', width: 100, height: 40 },
  { name: 'OPI', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/OPI_Logo.svg/200px-OPI_Logo.svg.png', width: 80, height: 40 },
  { name: 'Essie', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Essie_logo.svg/200px-Essie_logo.svg.png', width: 100, height: 40 },
  { name: 'Gelish', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Gelish_logo.svg/200px-Gelish_logo.svg.png', width: 120, height: 40 },
  { name: 'IBD', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/IBD_Logo.svg/200px-IBD_Logo.svg.png', width: 80, height: 40 },
  { name: 'Bio Sculpture', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Bio_Sculpture_Gel_logo.svg/200px-Bio_Sculpture_Gel_logo.svg.png', width: 140, height: 40 },
];