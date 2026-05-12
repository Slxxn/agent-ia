import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Check, ChevronLeft, Minus, Plus } from 'lucide-react';
import { getProductBySlug } from '../data/products';
import { formatPrice } from '../lib/utils';
import { useCart } from '../stores/cartStore';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || '');
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Produit non trouvé</h2>
          <Link to="/products" className="text-violet-400 hover:underline">Retour aux produits</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    setQuantity(1);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux produits
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl overflow-hidden bg-surface aspect-square"
          >
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
              }}
            />
            {product.originalPrice && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-red-500/90 text-white text-sm font-bold rounded-lg">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            <span className="text-sm uppercase tracking-widest text-violet-400 font-medium mb-2">{product.category}</span>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted">{product.rating} — {product.reviews} avis</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-black">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <p className="text-white/80 leading-relaxed mb-8">{product.description}</p>

            <div className="flex items-center gap-1 mb-6">
              <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-muted">{product.inStock ? 'En stock' : 'Épuisé'}</span>
            </div>

            {/* Quantité + add to cart */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-white/5 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-white/5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors shadow-lg shadow-violet-500/25"
              >
                <ShoppingCart className="w-5 h-5" />
                Ajouter au panier
              </motion.button>
            </div>

            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Check className="w-4 h-4 text-green-400" />
                Livraison express aux Antilles
              </div>
              <div className="flex items-center gap-2 text-sm text-muted mt-2">
                <Check className="w-4 h-4 text-green-400" />
                Garantie constructeur incluse
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;