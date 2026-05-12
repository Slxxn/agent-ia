import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { forwardRef } from 'react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'filled' | 'outline' | 'ghost' | 'primary' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'filled', size = 'md', children, className, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants: Record<string, string> = {
      filled: 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20',
      primary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20',
      outline: 'border border-slate-200 hover:border-violet-400 text-slate-800 bg-transparent hover:bg-violet-50',
      ghost: 'text-slate-500 hover:text-slate-900 bg-transparent hover:bg-slate-100',
      whatsapp: 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant ?? 'filled'], sizes[size ?? 'md'], className)}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;
