import React from 'react';
import { Badge } from '@/components/ui';

interface BadgePromoProps {
  type: 'promo' | 'best-seller';
  label?: string;
  className?: string;
}

const BadgePromo: React.FC<BadgePromoProps> = ({ type, label, className = '' }) => {
  const defaultLabels: Record<string, string> = {
    promo: 'Promo',
    'best-seller': 'Best Seller',
  };

  const badgeLabel = label || defaultLabels[type];

  const colorClasses: Record<string, string> = {
    promo: 'bg-violet-600/90 text-white border-violet-400',
    'best-seller': 'bg-cyan-600/90 text-white border-cyan-400',
  };

  return (
    <Badge
      className={`absolute top-2 left-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider shadow-lg backdrop-blur-sm border ${colorClasses[type]} ${className}`}
    >
      {badgeLabel}
    </Badge>
  );
};

export { BadgePromo };
export default BadgePromo;