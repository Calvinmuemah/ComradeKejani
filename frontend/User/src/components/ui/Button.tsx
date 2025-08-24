import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from './buttonVariants';
import { cn } from '../../utils/cn';
import { useTheme } from '../../contexts/useTheme';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    
    let lightClasses = '';
    if (isLight) {
      if (variant === 'outline') {
        lightClasses = 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800';
      } else if (variant === 'ghost') {
        lightClasses = 'hover:bg-gray-50 text-gray-700 hover:text-gray-900';
      }
    }
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }), lightClasses)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };