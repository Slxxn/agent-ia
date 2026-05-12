import { cn } from '../../lib/utils';

interface BadgeProps {
  variant?: 'default' | 'new' | 'discount' | 'sale' | 'secondary' | 'destructive' | 'primary';
  children: React.ReactNode;
  className?: string;
}

const Badge = ({ variant = 'default', children, className }: BadgeProps) => {
  const variants: Record<string, string> = {
    default: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
    new: 'bg-green-500/10 text-green-600 border-green-500/20',
    discount: 'bg-red-500/10 text-red-600 border-red-500/20',
    sale: 'bg-violet-600/10 text-violet-700 border-violet-600/20',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200',
    destructive: 'bg-red-500 text-white border-red-500',
    primary: 'bg-violet-600 text-white border-violet-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em] uppercase border rounded-full px-3 py-1',
        variants[variant] ?? variants['default'],
        className
      )}
    >
      {children}
    </span>
  );
};

export { Badge };
export default Badge;
