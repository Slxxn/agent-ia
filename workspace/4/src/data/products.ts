export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: 'smartphones' | 'accessories' | 'gadgets';
  image: string;
  description: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  discount?: number;
}

const products: Product[] = [
  {
    id: 'p1',
    name: 'iPhone 15 Pro Max 256 Go',
    price: 1599,
    originalPrice: 1799,
    category: 'smartphones',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop',
    description: 'Le flagship Apple avec puce A17 Pro, écran 6.7" Super Retina XDR et appareil photo 48 MP. Disponible en Guadeloupe.',
    isNew: true,
    discount: 11,
  },
  {
    id: 'p2',
    name: 'Samsung Galaxy S24 Ultra',
    price: 1449,
    originalPrice: 1599,
    category: 'smartphones',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop',
    description: 'Le meilleur smartphone Android avec S Pen, écran Dynamic AMOLED 2X et batterie 5000 mAh.',
    isBestSeller: true,
    discount: 9,
  },
  {
    id: 'p3',
    name: 'AirPods Pro 2 (USB-C)',
    price: 279,
    originalPrice: 329,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&h=600&fit=crop',
    description: 'Réduction de bruit active, audio spatial personnalisé et boîtier MagSafe. Livraison rapide aux Antilles.',
    isNew: true,
    discount: 15,
  },
  {
    id: 'p4',
    name: 'Chargeur Anker 65W GaN',
    price: 39,
    originalPrice: 49,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop',
    description: 'Chargeur compact 65W avec 2 ports USB-C. Compatible iPhone, Samsung, MacBook. Idéal pour voyager.',
    discount: 20,
  },
  {
    id: 'p5',
    name: 'Drone DJI Mini 4 Pro',
    price: 999,
    originalPrice: 1099,
    category: 'gadgets',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=600&fit=crop',
    description: 'Drone ultra-léger avec caméra 4K, détection d’obstacles et mode retour automatique. Parfait pour filmer les Antilles.',
    isNew: true,
    discount: 9,
  },
  {
    id: 'p6',
    name: 'Montre connectée Apple Watch Series 9',
    price: 499,
    originalPrice: 549,
    category: 'gadgets',
    image: 'https://images.unsplash.com/photo-1546868871-af0de0ae72fa?w=600&h=600&fit=crop',
    description: 'Analyse de santé avancée, capteur d’oxygène dans le sang et GPS intégré. Idéale pour le sport.',
    isBestSeller: true,
    discount: 9,
  },
  {
    id: 'p7',
    name: 'Coque MagSafe transparente iPhone 15 Pro',
    price: 29,
    originalPrice: 39,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1604263439201-171fb8c0fddc?w=600&h=600&fit=crop',
    description: 'Coque fine avec aimants intégrés, protection anti-chute et finition anti-jaunissement.',
    discount: 25,
  },
  {
    id: 'p8',
    name: 'Enceinte JBL Flip 6',
    price: 119,
    originalPrice: 149,
    category: 'gadgets',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
    description: 'Enceinte Bluetooth étanche IP67, son puissant et basses profondes. Parfaite pour la plage.',
    isBestSeller: true,
    discount: 20,
  },
  {
    id: 'p9',
    name: 'Google Pixel 8 Pro',
    price: 1099,
    originalPrice: 1199,
    category: 'smartphones',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop',
    description: 'Appareil photo professionnel avec intelligence artificielle, écran 120 Hz et 7 ans de mises à jour.',
    discount: 8,
  },
  {
    id: 'p10',
    name: 'Casque Sony WH-1000XM5',
    price: 349,
    originalPrice: 399,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop',
    description: 'Casque sans fil avec réduction de bruit active leader du marché. Autonomie 30h. Confort absolu.',
    isNew: true,
    discount: 12,
  },
  {
    id: 'p11',
    name: 'Lampe connectée Philips Hue Go',
    price: 79,
    originalPrice: 99,
    category: 'gadgets',
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&h=600&fit=crop',
    description: 'Lampe portable avec 16 millions de couleurs, contrôle vocal et application. Créez l’ambiance chez vous.',
    discount: 20,
  },
  {
    id: 'p12',
    name: 'Apple iPad Air M2 11"',
    price: 799,
    originalPrice: 899,
    category: 'gadgets',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop',
    description: 'Puissance M2, écran Liquid Retina, compatible Apple Pencil Pro. Idéal pour le télétravail et les études.',
    isNew: true,
    discount: 11,
  },
];

export const categories = [
  { id: 'smartphones', label: 'Smartphones', icon: '📱' },
  { id: 'accessories', label: 'Accessoires', icon: '🎧' },
  { id: 'gadgets', label: 'Gadgets tech', icon: '⚡' },
] as const;

export default products;