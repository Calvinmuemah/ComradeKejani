import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'border-transparent bg-blue-600 text-white': variant === 'default',
          'border-transparent bg-gray-100 text-gray-900': variant === 'secondary',
          'border-transparent bg-red-600 text-white': variant === 'destructive',
          'text-gray-950': variant === 'outline',
          'border-transparent bg-emerald-100 text-emerald-800': variant === 'success',
          'border-transparent bg-yellow-100 text-yellow-800': variant === 'warning',
        },
        className
      )}
      {...props}
    />
  );
};

export { Badge };