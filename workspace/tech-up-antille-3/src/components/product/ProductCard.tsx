import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import type { Product } from '../../data/products';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../stores/cartStore';

export interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="glass-card group overflow-hidden">
      {/* Image container */}
      <Link
        to={`/products/${product.slug}`}
        className="block relative h-48 lg:h-56 overflow-hidden bg-surface"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] to-transparent z-10" />
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
          }}
        />
        {product.originalPrice && (
          <span className="absolute top-3 left-3 z-20 px-2 py-1 bg-red-500/90 text-white text-xs font-bold rounded-lg">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 lg:p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest text-violet-400 font-medium">
            {product.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-amber-400 ml-auto">
            <Star className="w-3 h-3 fill-amber-400" />
            {product.rating}
          </span>
        </div>

        <Link to={`/products/${product.slug}`}>
          <h3 className="text-lg font-semibold mb-1 line-clamp-1 group-hover:text-violet-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted mb-4 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              addItem(product, 1);
            }}
            disabled={!product.inStock}
            className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Ajouter au panier"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;