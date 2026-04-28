import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps {
  className?: string;
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, children, hoverable = false }) => {
  return (
    <div
      className={cn(
        'bg-gray-900/80 border border-gray-800 rounded-xl shadow-lg backdrop-blur-sm',
        hoverable && 'transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-500/10 hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;