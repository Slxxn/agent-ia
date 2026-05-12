import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

const Card = ({ children, className, hover = true, glass = false }: CardProps) => {
  return (
    <motion.div
      whileHover={hover ? { y: -6, boxShadow: '0 24px 48px rgba(0,0,0,0.3)' } : undefined}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative rounded-2xl p-6 lg:p-8 transition-all duration-300',
        glass
          ? 'bg-white/[0.03] backdrop-blur-xl border border-white/8'
          : 'bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]/30 hover:bg-[var(--surface2)] hover:shadow-xl hover:shadow-[var(--primary)]/5',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export { Card };
export default Card;