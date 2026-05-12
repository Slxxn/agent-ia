import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          'border-2 border-[#550b14]/10 border-t-[#550b14] rounded-full animate-spin',
          sizes[size],
          className
        )}
      />
      {label && (
        <p className="text-sm text-[#7e6961]">{label}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;