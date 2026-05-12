import { useState, useCallback, memo, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Check, Zap, Star, ArrowRight } from 'lucide-react';
import { useCart, CartItem } from '../../stores/cartStore';
import { getFeaturedProducts, Product } from '../../data/products';
import { cn, formatPrice } from '../../lib/utils';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

interface QuickAddButtonProps {
  product: Product;
  onAdd: (product: Product) => void;
  isAdded: boolean;
}

const QuickAddButton = memo(function QuickAddButton({ product, onAdd, isAdded }: QuickAddButtonProps) {
  return (
    <motion.button
      onClick={() => onAdd(product)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300',
        isAdded
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
      )}
    >
      {isAdded ? (
        <>
          <Check className="w-4 h-4" />
          <span>Ajouté</span>
        </>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4" />
          <span>Ajouter</span>
        </>
      )}
    </motion.button>
  );
});

function ProductCardFeatured({ product, index }: { product: Product; index: number }) {
  const { addItem, items } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const isInCart = items.some((item: CartItem) => item.id === product.id);
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleAdd = useCallback(
    (prod: Product) => {
      addItem(prod, 1);
      setAddedId(prod.id);
      setIsAdded(true);
      setTimeout(() => {
        setAddedId(null);
        setIsAdded(false);
      }, 2000);
    },
    [addItem]
  );

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg shadow-black/20 hover:shadow-violet-500/10 transition-all duration-500"
    >
      {/* Product image container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-violet-900/20 to-black/40">
        <motion.img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Neon glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Price badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-white font-bold text-sm shadow-lg">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Quick add button - appears on hover */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <QuickAddButton
            product={product}
            onAdd={handleAdd}
            isAdded={addedId === product.id}
          />
        </div>
      </div>

      {/* Product info */}
      <div className="p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">
            {product.category}
          </span>
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-xs font-medium text-white/70">{product.rating}</span>
          </div>
        </div>
        <h3 className="text-lg font-bold text-white leading-tight">{product.name}</h3>
        <p className="text-sm text-white/60 line-clamp-2">{product.description}</p>
        {product.inStock ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En stock
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-red-400 font-medium mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Rupture
          </span>
        )}
      </div>
    </motion.div>
  );
}

function FeaturedProductsSection() {
  const featuredProducts = getFeaturedProducts();
  const [visibleCount, setVisibleCount] = useState(4);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, featuredProducts.length));
  };

  return (
    <section id="featured-products" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            <span>Meilleures ventes</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Les accessoires qui cartonnent
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Les produits préférés de notre communauté. Des accessoires sélectionnés pour leur qualité, leur design et leur performance.
          </p>
        </motion.div>

        {/* Featured products grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {featuredProducts.slice(0, visibleCount).map((product, index) => (
            <ProductCardFeatured key={product.id} product={product} index={index} />
          ))}
        </motion.div>

        {/* Show more / View all */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-12 text-center"
        >
          {visibleCount < featuredProducts.length ? (
            <motion.button
              onClick={handleShowMore}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white font-semibold transition-colors duration-200"
            >
              Voir plus de produits
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          ) : (
            <Link
              to="/produits"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg shadow-violet-500/25"
            >
              Explorer toute la boutique
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturedProductsSection;
export { FeaturedProductsSection };