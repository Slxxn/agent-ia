import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { products, categories as allCategories } from '../../data/products';
import ProductGrid from '../catalogue/ProductGrid';
import FilterBar from '../catalogue/FilterBar';
import type { Category } from '../../types';

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
    <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-violet-50/30 to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-3 py-1.5 mb-4">
            Notre sélection
          </span>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-slate-900 mb-4">
            Produits populaires
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Les accessoires les plus appréciés par nos clients
          </p>
        </motion.div>

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
    </section>
  );
};

export default Products;