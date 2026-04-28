export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  featured?: boolean;
  rating: number;
  reviews: number;
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Bougie Artisanale Vanille & Cèdre",
    description: "Bougie coulée à la main avec de la cire de soja naturelle, parfumée à la vanille de Madagascar et au cèdre de l'Atlas. Brûle pendant plus de 60 heures.",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=400&fit=crop",
    category: "Bougies",
    featured: true,
    rating: 4.8,
    reviews: 124,
    inStock: true
  },
  {
    id: "2",
    name: "Savon à l'Argile Rose & Pétales de Rose",
    description: "Savon surgras artisanal enrichi en argile rose et huile essentielle de rose. Nettoie en douceur tout en respectant le film hydrolipidique de la peau.",
    price: 12.50,
    image: "https://images.unsplash.com/photo-1600857544200-b2e7e4e5b8f5?w=400&h=400&fit=crop",
    category: "Savons",
    featured: true,
    rating: 4.6,
    reviews: 89,
    inStock: true
  },
  {
    id: "3",
    name: "Baume à Lèvres au Miel & Propolis",
    description: "Baume nourrissant à base de miel bio, propolis et beurre de karité. Protection et réparation des lèvres sèches.",
    price: 8.90,
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=400&fit=crop",
    category: "Soins du visage",
    featured: false,
    rating: 4.7,
    reviews: 210,
    inStock: true
  },
  {
    id: "4",
    name: "Huile de Massage Relaxante Lavande & Camomille",
    description: "Huile de massage végétale aux extraits de lavande vraie et camomille romaine. Favorise la détente et apaise les tensions musculaires.",
    price: 22.00,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    category: "Huiles",
    featured: true,
    rating: 4.9,
    reviews: 56,
    inStock: true
  },
  {
    id: "5",
    name: "Gommage Corps au Café & Sucre de Coco",
    description: "Gommage exfoliant naturel à base de marc de café bio, sucre de coco et huile d'amande douce. Élimine les cellules mortes et revitalise la peau.",
    price: 18.50,
    image: "https://images.unsplash.com/photo-1601612628452-9e99ced43524?w=400&h=400&fit=crop",
    category: "Soins du corps",
    featured: false,
    rating: 4.5,
    reviews: 143,
    inStock: true
  },
  {
    id: "6",
    name: "Eau Florale de Rose de Damas",
    description: "Hydrolat pur obtenu par distillation à la vapeur des pétales de rose de Damas. Tonifie, apaise et illumine le teint.",
    price: 15.00,
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop",
    category: "Eaux florales",
    featured: false,
    rating: 4.4,
    reviews: 78,
    inStock: false
  },
  {
    id: "7",
    name: "Encens Artisanal Santal & Myrrhe",
    description: "Bâtonnets d'encens fabriqués à la main à partir de résines naturelles de santal et de myrrhe. Parfum envoûtant pour la méditation.",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1549480017-764a3f5b8b3a?w=400&h=400&fit=crop",
    category: "Encens",
    featured: true,
    rating: 4.7,
    reviews: 94,
    inStock: true
  },
  {
    id: "8",
    name: "Crème Hydratante à l'Aloe Vera & Acide Hyaluronique",
    description: "Crème légère et non grasse à l'aloe vera bio et acide hyaluronique. Hydrate en profondeur et repulpe la peau.",
    price: 26.00,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    category: "Soins du visage",
    featured: false,
    rating: 4.8,
    reviews: 187,
    inStock: true
  }
];

export default products;