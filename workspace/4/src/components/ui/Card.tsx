import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  variant?: 'default' | 'neon';
}

const Card: React.FC<CardProps> = ({
  className,
  glow = true,
  variant = 'default',
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative rounded-2xl p-6 transition-all duration-300',
        // Glassmorphism de base
        'bg-black/40 backdrop-blur-xl border border-white/10',
        // Variation néon
        variant === 'neon' && 'border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]',
        // Glow hover
        glow && 'hover:shadow-[0_0_30px_rgba(0,191,255,0.3)] hover:border-cyan-400/50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card };
export default Card;