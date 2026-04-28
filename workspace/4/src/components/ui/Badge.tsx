import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'violet' | 'green' | 'red';
  size?: 'sm' | 'md';
  glow?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'cyan',
  size = 'sm',
  glow = true,
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap';

  const variants = {
    cyan: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30',
    violet: 'bg-violet-500/20 text-violet-300 border border-violet-400/30',
    green: 'bg-green-500/20 text-green-300 border border-green-400/30',
    red: 'bg-red-500/20 text-red-300 border border-red-400/30',
  };

  const sizes = {
    sm: 'px-3 py-0.5 text-xs',
    md: 'px-4 py-1 text-sm',
  };

  const glowClass = glow
    ? variant === 'cyan'
      ? 'shadow-[0_0_8px_rgba(0,191,255,0.4)]'
      : variant === 'violet'
      ? 'shadow-[0_0_8px_rgba(138,43,226,0.4)]'
      : variant === 'green'
      ? 'shadow-[0_0_8px_rgba(34,197,94,0.4)]'
      : 'shadow-[0_0_8px_rgba(239,68,68,0.4)]'
    : '';

  return (
    <span
      className={cn(base, variants[variant], sizes[size], glowClass, className)}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge };
export default Badge;