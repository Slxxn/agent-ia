import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ProductFiltersProps {
  categories: string[];
  onCategoryChange: (category: string | null) => void;
  onPriceChange: (min: number | null, max: number | null) => void;
  className?: string;
}

const priceRanges = [
  { label: "Moins de 50€", min: null, max: 50 },
  { label: "50€ – 100€", min: 50, max: 100 },
  { label: "100€ – 500€", min: 100, max: 500 },
  { label: "Plus de 500€", min: 500, max: null },
];

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  onCategoryChange,
  onPriceChange,
  className = "",
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePriceRange, setActivePriceRange] = useState<number | null>(null);

  const handleCategory = useCallback(
    (cat: string | null) => {
      setActiveCategory(cat);
      onCategoryChange(cat);
    },
    [onCategoryChange]
  );

  const handlePrice = useCallback(
    (index: number) => {
      setActivePriceRange(index);
      const range = priceRanges[index];
      onPriceChange(range.min, range.max);
    },
    [onPriceChange]
  );

  const clearFilters = useCallback(() => {
    setActiveCategory(null);
    setActivePriceRange(null);
    onCategoryChange(null);
    onPriceChange(null, null);
  }, [onCategoryChange, onPriceChange]);

  return (
    <motion.div
      className={`space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Catégories */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
          Catégories
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategory(null)}
            className="text-xs"
          >
            Tous
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategory(cat)}
              className="text-xs capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Tranches de prix */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
          Prix
        </h3>
        <div className="space-y-2">
          {priceRanges.map((range, index) => (
            <label
              key={index}
              className={`flex items-center gap-3 cursor-pointer group ${
                activePriceRange === index ? "text-cyan-400" : "text-gray-400"
              }`}
            >
              <input
                type="radio"
                name="priceRange"
                checked={activePriceRange === index}
                onChange={() => handlePrice(index)}
                className="accent-cyan-500"
              />
              <span className="text-sm">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Effacer les filtres */}
      {(activeCategory !== null || activePriceRange !== null) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Effacer les filtres
        </Button>
      )}
    </motion.div>
  );
};

export { ProductFilters };
export default ProductFilters;