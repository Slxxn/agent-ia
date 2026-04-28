import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ProductFilters from '../components/ProductFilters';
import ProductGrid from '../components/ProductGrid';
import WhatsAppButton from '../components/WhatsAppButton';
import { products } from '../data/products';

const Products: React.FC = () => {
  const [category, setCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchCategory = category === 'all' || product.category === category;
      const matchPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchCategory && matchPrice;
    });
  }, [category, priceRange]);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Catalogue TechUp
          </h1>
          <p className="mt-4 text-gray-400 text-lg max-w-2xl">
            Découvrez notre sélection de smartphones, accessoires et gadgets high-tech. 
            Filtrez par catégorie ou budget pour trouver l’article qu’il vous faut.
          </p>
        </motion.div>

        {/* Filtres + Grille */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filtres */}
          <aside className="w-full lg:w-64 shrink-0">
            <ProductFilters
              category={category}
              setCategory={setCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </aside>

          {/* Grille Produits */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="text-gray-500 text-xl">Aucun produit ne correspond à vos critères.</p>
                <button
                  onClick={() => { setCategory('all'); setPriceRange([0, 1000]); }}
                  className="mt-6 px-6 py-3 bg-purple-600 rounded-full font-semibold hover:bg-purple-700 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </motion.div>
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp flottant */}
      <WhatsAppButton />
    </main>
  );
};

export default Products;