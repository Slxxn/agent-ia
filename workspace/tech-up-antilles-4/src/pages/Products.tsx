import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { products, categories as allCategories } from '../data/products';
import ProductGrid from '../components/catalogue/ProductGrid';
import FilterBar from '../components/catalogue/FilterBar';
import type { Category } from '../types';

const Products = () => {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = useMemo<Category[]>(() => allCategories, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (activeCategory) {
      const cat = allCategories.find(c => c.id === activeCategory);
      if (cat) filtered = filtered.filter(p => p.category === cat.name);
    }

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeCategory, searchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-24 pb-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900"
          >
            Notre Catalogue
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Découvrez notre sélection d'accessoires mobiles de qualité
          </motion.p>
        </div>

        <FilterBar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <motion.div
          key={activeCategory + searchTerm}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProductGrid products={filteredProducts} />
        </motion.div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">
              Aucun produit trouvé pour cette recherche.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Products;