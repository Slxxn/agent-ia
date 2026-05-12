import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { cn, formatPrice, truncate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { addItem, cartItems } = useCart();
  const inCart = cartItems.some(item => item.id === product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addItem(product, 1);
    }
  };

  // Génération d'étoiles visuelles pour le rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    return (
      <span className="inline-flex items-center gap-0.5 text-yellow-500">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-current" />
        ))}
        {hasHalf && (
          <span className="relative w-4 h-4">
            <Star className="w-4 h-4 text-yellow-500/30 absolute inset-0" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className="w-4 h-4 fill-current" />
            </span>
          </span>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-yellow-500/30" />
        ))}
      </span>
    );
  };

  return (
    <Link to={`/product/${product.id}`} className="block group">
      <Card className={cn(
        'relative overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-sm',
        'transition-all duration-300 hover:shadow-lg hover:border-violet-200 hover:shadow-violet-100/50',
        className
      )}>
        {/* Image container avec overlay hover */}
        <div className="relative aspect-square overflow-hidden bg-slate-50">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay au hover avec bouton rapide */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent flex items-end justify-center pb-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Button
                variant="filled"
                size="sm"
                onClick={handleQuickAdd}
                className={cn(
                  'rounded-full px-6 shadow-lg',
                  inCart ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-violet-600 hover:bg-violet-700'
                )}
                disabled={inCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {inCart ? 'Dans le panier' : 'Ajouter'}
              </Button>
            </motion.div>
          </motion.div>

          {/* Badge de catégorie */}
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-xs font-medium text-slate-700 border border-slate-200"
          >
            {product.category}
          </Badge>

          {/* Badge prix si soldé (exemple) - ici on peut ajouter une condition si solde */}
          {product.oldPrice && (
            <Badge
              variant="destructive"
              className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-medium border-none"
            >
              -{Math.round((1 - product.price / product.oldPrice) * 100)}%
            </Badge>
          )}
        </div>

        {/* Informations produit */}
        <div className="p-4 space-y-2">
          <h3 className="font-display font-semibold text-lg text-slate-900 leading-snug group-hover:text-violet-700 transition-colors">
            {truncate(product.name, 40)}
          </h3>

          {product.rating && (
            <div className="flex items-center gap-1.5">
              {renderStars(product.rating)}
              <span className="text-xs text-slate-400">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Bouton mobile (visible sans hover) */}
          <div className="lg:hidden pt-1">
            <Button
              variant={inCart ? 'outline' : 'filled'}
              size="sm"
              onClick={handleQuickAdd}
              className="w-full rounded-full"
            >
              {inCart ? 'Dans le panier' : 'Ajouter au panier'}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;