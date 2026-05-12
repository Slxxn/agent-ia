import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6 lg:p-8',
  lg: 'p-8 lg:p-10',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  glow = false,
  padding = 'md',
  onClick,
}) => {
  const Component = hover ? motion.div : 'div';
  const motionProps = hover
    ? {
        whileHover: { y: -4, boxShadow: '0 20px 40px rgba(85, 11, 20, 0.1)' },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component
      className={cn(
        'bg-white rounded-2xl border border-[#550b14]/10',
        'transition-all duration-300',
        glow && 'shadow-[0_0_30px_-5px_rgba(85,11,20,0.15)]',
        hover && 'cursor-pointer hover:border-[#550b14]/20 hover:shadow-xl',
        paddings[padding],
        className
      )}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

export const CardBody: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('space-y-3', className)}>{children}</div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('mt-6 pt-4 border-t border-[#550b14]/10', className)}>
    {children}
  </div>
);

export default Card;