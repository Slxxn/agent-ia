import React from 'react';
import { cn } from '../../lib/utils';

const badgeVariants = {
  default: 'bg-purple-600/20 text-purple-300 border-purple-500/30',
  promo: 'bg-red-600/20 text-red-300 border-red-500/30',
  'best-seller': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  new: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};

export interface BadgeProps {
  variant?: keyof typeof badgeVariants;
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className, children }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;