export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  featured: boolean;
  inStock: boolean;
}

export const categories = [
  { name: 'Ordinateurs', slug: 'ordinateurs', icon: 'Monitor' },
  { name: 'Smartphones', slug: 'smartphones', icon: 'Smartphone' },
  { name: 'Audio', slug: 'audio', icon: 'Headphones' },
  { name: 'Gaming', slug: 'gaming', icon: 'Gamepad2' },
  { name: 'Accessoires', slug: 'accessoires', icon: 'Cable' },
  { name: 'Réseaux', slug: 'reseaux', icon: 'Wifi' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'MacBook Pro 16" M3 Max',
    slug: 'macbook-pro-16-m3-max',
    description: 'Puce M3 Max avec CPU 16 cœurs et GPU 40 cœurs. Jusqu’à 128 Go de mémoire unifiée. Autonomie jusqu’à 22 heures. Écran Liquid Retina XDR 16,2 pouces.',
    price: 4299,
    originalPrice: 4599,
    category: 'ordinateurs',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    rating: 4.8,
    reviews: 234,
    featured: true,
    inStock: true,
  },
  {
    id: '2',
    name: 'iPhone 15 Pro Max 256Go',
    slug: 'iphone-15-pro-max-256go',
    description: 'Titane, puce A17 Pro, zoom optique 5x, Action Button, USB-C. Autonomie exceptionnelle.',
    price: 1599,
    originalPrice: 1699,
    category: 'smartphones',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2565?w=800&q=80',
    rating: 4.7,
    reviews: 851,
    featured: true,
    inStock: true,
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    description: 'Casque audio sans fil à réduction de bruit active. Son haute résolution, 30h d’autonomie, confort ultime.',
    price: 399,
    originalPrice: 449,
    category: 'audio',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
    rating: 4.6,
    reviews: 1243,
    featured: true,
    inStock: true,
  },
  {
    id: '4',
    name: 'PS5 Slim Édition Digitale',
    slug: 'ps5-slim-edition-digitale',
    description: 'Console PlayStation 5 Slim, 1 To SSD, manette DualSense, prise en charge 4K/120fps.',
    price: 499,
    category: 'gaming',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80',
    rating: 4.9,
    reviews: 2047,
    featured: true,
    inStock: true,
  },
  {
    id: '5',
    name: 'Apple AirPods Pro 2 USB-C',
    slug: 'airpods-pro-2-usb-c',
    description: 'Réduction active du bruit, audio spatial personnalisé, autonomie 6h + boîtier MagSafe USB-C.',
    price: 249,
    originalPrice: 279,
    category: 'audio',
    image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&q=80',
    rating: 4.5,
    reviews: 2890,
    featured: false,
    inStock: true,
  },
  {
    id: '6',
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    description: 'Écran Dynamic AMOLED 2X 6,8", Snapdragon 8 Gen 3, S Pen intégré, 200 MP, Galaxy AI.',
    price: 1399,
    originalPrice: 1499,
    category: 'smartphones',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
    rating: 4.6,
    reviews: 456,
    featured: true,
    inStock: true,
  },
  {
    id: '7',
    name: 'Logitech MX Master 3S',
    slug: 'logitech-mx-master-3s',
    description: 'Souris sans fil ergonomique, capteur 8000 DPI, molette MagSpeed, charge USB-C, 70 jours d’autonomie.',
    price: 109,
    category: 'accessoires',
    image: 'https://images.unsplash.com/photo-1625723044792-44de5e17b3d4?w=800&q=80',
    rating: 4.4,
    reviews: 1024,
    featured: false,
    inStock: true,
  },
  {
    id: '8',
    name: 'Dell XPS 15 9530',
    slug: 'dell-xps-15-9530',
    description: 'Intel Core i9-13900H, 32Go RAM, 1To SSD, NVIDIA GeForce RTX 4070, écran OLED 3.5K.',
    price: 2999,
    originalPrice: 3299,
    category: 'ordinateurs',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
    rating: 4.5,
    reviews: 312,
    featured: false,
    inStock: true,
  },
  {
    id: '9',
    name: 'Razer BlackWidow V4 Pro',
    slug: 'razer-blackwidow-v4-pro',
    description: 'Clavier mécanique gaming, switches verts Razer, rétroéclairage Chroma RGB, repose-poignet en mousse à mémoire de forme.',
    price: 249,
    category: 'gaming',
    image: 'https://images.unsplash.com/photo-1541140532154-b024d1c0a78a?w=800&q=80',
    rating: 4.3,
    reviews: 876,
    featured: false,
    inStock: true,
  },
  {
    id: '10',
    name: 'Apple Watch Ultra 2',
    slug: 'apple-watch-ultra-2',
    description: 'Boîtier titane 49mm, écran plus lumineux, autonomie 36h, GPS double fréquence, plongée jusqu’à 40m.',
    price: 899,
    category: 'accessoires',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    rating: 4.7,
    reviews: 567,
    featured: false,
    inStock: true,
  },
  {
    id: '11',
    name: 'ASUS ROG Ally',
    slug: 'asus-rog-ally',
    description: 'Console portable gaming Windows 11, AMD Ryzen Z1 Extreme, 16Go RAM, 512Go SSD, écran 120Hz.',
    price: 799,
    originalPrice: 899,
    category: 'gaming',
    image: 'https://images.unsplash.com/photo-1605901309584-7d6e7f1e1f1d?w=800&q=80',
    rating: 4.4,
    reviews: 432,
    featured: false,
    inStock: true,
  },
  {
    id: '12',
    name: 'Google Pixel 8 Pro',
    slug: 'google-pixel-8-pro',
    description: 'Tensor G3, écran Super Actua 6,7", caméra 50MP + téléobjectif 48MP, 7 ans de mises à jour, AI Google.',
    price: 999,
    originalPrice: 1099,
    category: 'smartphones',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    rating: 4.5,
    reviews: 678,
    featured: false,
    inStock: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(product => product.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(product => product.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(product => product.featured);
}