import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { Category } from '@/types';

interface FilterBarProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Rechercher un produit…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        {/* Bouton "Tous" */}
        <motion.button
          onClick={() => onCategoryChange('')}
          className={cn(
            'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            'border border-slate-200 hover:border-violet-300 hover:bg-violet-50',
            activeCategory === ''
              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
              : 'bg-white text-slate-600'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Tous
        </motion.button>

        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              'border border-slate-200 hover:border-violet-300 hover:bg-violet-50',
              activeCategory === cat.id
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                : 'bg-white text-slate-600'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {cat.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;