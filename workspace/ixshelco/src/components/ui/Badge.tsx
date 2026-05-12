import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'subtle' | 'accent' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const variants = {
    default: 'bg-[var(--surface2)] text-[var(--text)] border-[var(--border)]',
    outline: 'border border-[var(--border)] text-[var(--muted)] bg-transparent',
    subtle: 'bg-[var(--surface2)] text-[var(--muted)] border-[var(--border)]',
    accent: 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20',
    primary: 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold tracking-wide rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export default Badge;
