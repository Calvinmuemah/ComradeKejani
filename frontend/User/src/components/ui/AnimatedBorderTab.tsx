/* 
 * AnimatedBorderTab.tsx
 * A component that provides clean tab styling with hover effects
 */

import React from 'react';
import { useTheme } from '../../contexts/useTheme';

interface AnimatedBorderTabProps {
  children: React.ReactNode;
  isSelected: boolean;
  className?: string;
  onClick?: () => void;
}

export const AnimatedBorderTab: React.FC<AnimatedBorderTabProps> = ({
  children,
  isSelected,
  className = '',
  onClick,
}) => {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';

  return (
    <div
      className={`relative rounded-lg px-4 py-2 transition-all duration-300 ${className} ${
        isSelected 
          ? `text-primary font-medium ${isLightMode ? 'bg-primary/5 shadow-sm' : 'bg-primary/10'}` 
          : `text-muted-foreground hover:text-foreground ${
              isLightMode 
                ? 'hover:bg-gray-50 hover:shadow-sm' 
                : 'hover:bg-surface-hover'
            } hover:scale-105`
      }`}
      onClick={onClick}
      style={{ 
        transformOrigin: 'center',
      }}
    >
      {children}
      
      {isSelected && (
        <div className={`absolute inset-0 z-0 rounded-lg border ${
          isLightMode 
            ? 'border-primary/30' 
            : 'border-primary/30'
        }`}>
        </div>
      )}
    </div>
  );
};
