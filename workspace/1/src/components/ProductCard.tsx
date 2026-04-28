import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';
import { useCart } from '../stores/cartStore';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  badge: string | null;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  const whatsappMessage = `Bonjour TechUp Antilles, je souhaite commander le produit suivant : ${product.name} (${product.price.toFixed(2)}€). Merci de me contacter.`;

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(
      `https://wa.me/590690000000?text=${encodeURIComponent(whatsappMessage)}`,
      '_blank'
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block">
        <Card className="relative overflow-hidden bg-[#1a1a2e] border border-gray-800 rounded-2xl transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.3)]">
          {/* Image container */}
          <div className="relative aspect-square overflow-hidden bg-[#0f0f1a]">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Badge */}
            {product.badge && (
              <div className="absolute top-3 left-3 z-10">
                <Badge variant={product.badge === 'promo' ? 'default' : 'secondary'}>
                  {product.badge === 'promo' ? '🔥 Promo' : '⭐ Best Seller'}
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2">
              {product.name}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-cyan-400">
                {product.price.toFixed(2)}€
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddToCart}
                  className="border-gray-600 text-gray-300 hover:border-violet-500 hover:text-violet-400 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleWhatsAppOrder}
                  className="bg-green-600 hover:bg-green-500 text-white transition-colors"
                >
                  💬 Commander
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
export { ProductCard };