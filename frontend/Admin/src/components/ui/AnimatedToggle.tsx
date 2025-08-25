import React from 'react';

interface AnimatedToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

// Accessible animated toggle (checkbox under the hood)
export const AnimatedToggle: React.FC<AnimatedToggleProps> = ({
  checked,
  onChange,
  label,
  disabled,
  className = '',
  size = 'md'
}) => {
  const dims = size === 'sm' ? { w: 36, h: 18, dot: 14 } : { w: 44, h: 22, dot: 18 };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex items-center transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 rounded-full select-none ${checked ? 'bg-gradient-to-r from-indigo-500 to-blue-600 shadow-[0_0_0_1px_rgba(99,102,241,0.4),0_0_8px_-1px_rgba(59,130,246,0.6)]' : 'bg-oxford-800 shadow-inner'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      style={{ width: dims.w, height: dims.h }}
    >
      <span
        className={`absolute left-0 top-0 h-full flex items-center`}
        style={{ width: dims.w }}
      >
        <span
          className={`transition-all duration-300 ease-out rounded-full bg-white/90 backdrop-blur-sm border border-white/30 shadow ${checked ? 'translate-x-[calc(100%-' + (dims.dot) + 'px)] scale-100' : 'translate-x-0 scale-95'} ${checked ? 'bg-white' : ''}`}
          style={{ width: dims.dot, height: dims.dot, marginLeft: 2 }}
        />
      </span>
      {/* Ripple / glow effect */}
      <span className={`absolute inset-0 rounded-full pointer-events-none overflow-hidden`}> 
        <span className={`absolute inset-0 rounded-full opacity-0 ${checked ? 'animate-pulse-slow bg-blue-500/20' : ''}`} />
      </span>
      {label && (
        <span className="ml-2 text-xs font-medium text-gray-300 select-none pr-1">
          {label}
        </span>
      )}
    </button>
  );
};

export default AnimatedToggle;

// Tailwind utility keyframes (inline). Could be moved to global css.
// Using a style tag injection would duplicate; consumer should already have animate-pulse-slow in css.
