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
          ? `text-primary font-medium border border-primary/40 ${isLightMode ? 'bg-primary/5 shadow-sm' : 'bg-primary/10'} animate-[headerGlowPulse_3.6s_ease-in-out_infinite]` 
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
      
  {/* Remove inner border overlay since active style now includes border + animation */}
    </div>
  );
};
