import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { products } from '../data/products';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCartStore } from '../stores/cartStore';

/**
 * FeaturedProducts component
 * Displays a grid of products with hover effects and add-to-cart functionality.
 * Uses Framer Motion for staggered entrance animation.
 */
export const FeaturedProducts: React.FC = () => {
  const [visibleProducts, setVisibleProducts] = useState<typeof products>([]);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    // Load products on mount
    setVisibleProducts(products);
  }, []);

  const handleAddToCart = (product: typeof products[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-black/40">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Produits en vedette
        </h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {visibleProducts.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <Card className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900/80 to-gray-950/90 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400/50">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {product.isNew && (
                    <Badge className="absolute top-3 right-3 bg-blue-500/80 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                      Nouveau
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="text-xs border-blue-400/30 text-blue-300"
                    >
                      {product.category}
                    </Badge>
                    <span className="text-lg font-bold text-white">
                      {product.price.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white leading-snug line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {product.description}
                  </p>
                </CardContent>

                <CardFooter className="p-5 pt-0">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                  >
                    Ajouter au panier
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;