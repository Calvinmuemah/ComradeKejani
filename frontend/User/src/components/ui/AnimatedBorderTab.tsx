/* 
 * AnimatedBorderTab.tsx
 * A component that adds an animated border tracer effect to selected tabs
 */

import React from 'react';

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
  return (
    <div
      className={`relative rounded-lg px-4 py-2 transition-all duration-200 ${className} ${
        isSelected 
          ? 'text-primary animated-border-tab' 
          : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
      }`}
      onClick={onClick}
      style={{ 
        transform: 'scale(1)',
        transformOrigin: 'center',
      }}
    >
      {children}
      
      {isSelected && (
        <div className="absolute inset-0 z-0 rounded-lg border border-primary/20 bg-primary/5">
          {/* This is styled via CSS in index.css with the .animated-border-tab class */}
        </div>
      )}
    </div>
  );
};
