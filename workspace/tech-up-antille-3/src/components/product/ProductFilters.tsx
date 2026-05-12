import React from 'react';
import { motion } from 'framer-motion';
import { X, SlidersHorizontal } from 'lucide-react';
import { categories } from '../../data/products';

export interface ProductFiltersProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

export function ProductFilters({
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtres
      </button>

      {/* Filter panel */}
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : '0',
          opacity: isOpen ? 1 : 0,
        }}
        className="lg:hidden overflow-hidden"
      >
        <div className="py-4 space-y-6">
          <FilterContent
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            sortBy={sortBy}
            onSortChange={onSortChange}
            priceRange={priceRange}
            onPriceRangeChange={onPriceRangeChange}
          />
        </div>
      </motion.div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <FilterContent
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          sortBy={sortBy}
          onSortChange={onSortChange}
          priceRange={priceRange}
          onPriceRangeChange={onPriceRangeChange}
        />
      </div>
    </>
  );
}

function FilterContent({
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
}: ProductFiltersProps) {
  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3">Catégories</h4>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange(null)}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === null
                ? 'bg-violet-600/20 text-violet-400 border border-violet-500/20'
                : 'text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            Toutes les catégories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => onCategoryChange(cat.slug)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-violet-600/20 text-violet-400 border border-violet-500/20'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3">Trier par</h4>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
        >
          <option value="featured">En vedette</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="name-asc">Nom A-Z</option>
          <option value="name-desc">Nom Z-A</option>
          <option value="rating">Meilleures notes</option>
        </select>
      </div>

      {/* Price range */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3">
          Prix : {priceRange[0]}€ — {priceRange[1]}€
        </h4>
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={5000}
            step={50}
            value={priceRange[0]}
            onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
            className="w-full accent-violet-500"
          />
          <input
            type="range"
            min={0}
            max={5000}
            step={50}
            value={priceRange[1]}
            onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-violet-500"
          />
        </div>
      </div>
    </div>
  );
}

export default ProductFilters;