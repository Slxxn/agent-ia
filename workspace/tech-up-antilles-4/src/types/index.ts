export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  category: string;
  badge?: string;
  features?: string[];
  rating?: number;
  reviews?: number;
  reviewCount?: number;
  isNew?: boolean;
  discount?: number;
  inStock?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  avatar: string;
  content?: string;
  comment?: string;
  text?: string;
  rating: number;
  date?: string;
  location?: string;
  product?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  count: number;
  icon?: string;
}
