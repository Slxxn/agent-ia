import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  glow = true,
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:from-cyan-400 hover:to-violet-500 active:scale-95',
    secondary:
      'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
    outline:
      'border border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-300',
    ghost:
      'text-gray-300 hover:text-white hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const glowClass = glow && variant === 'primary'
    ? 'shadow-[0_0_20px_rgba(0,191,255,0.3)] hover:shadow-[0_0_30px_rgba(138,43,226,0.4)]'
    : '';

  return (
    <button
      className={cn(base, variants[variant], sizes[size], glowClass, className)}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
export default Button;