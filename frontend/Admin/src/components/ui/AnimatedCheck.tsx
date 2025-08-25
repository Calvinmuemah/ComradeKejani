import React, { useEffect } from 'react';

interface AnimatedCheckProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

// Subtle animated checkbox: outlined square that fills with gradient & animates a check stroke
export const AnimatedCheck: React.FC<AnimatedCheckProps> = ({
  checked,
  onChange,
  label = 'Available',
  disabled,
  className = ''
}) => {
  // Inject keyframes only once (idempotent)
  useEffect(() => {
    const id = 'animated-check-keyframes';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `@keyframes dash { to { stroke-dashoffset: 0; } }`;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`group inline-flex items-center gap-2 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <span className={`relative flex items-center justify-center w-5 h-5 rounded-md border transition-all duration-300 overflow-hidden
        ${checked ? 'border-blue-500 bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_2px_4px_-1px_rgba(37,99,235,0.5)]' : 'border-gray-600 bg-oxford-900'}
        `}
      >
        {/* Background subtle pulse ring */}
        <span className={`absolute inset-0 rounded-md bg-blue-500/20 opacity-0 scale-50 transition-all duration-300
          ${checked ? 'opacity-100 scale-100' : ''}`}
        />
        {/* Check mark path */}
        <svg
          viewBox="0 0 24 24"
          className={`w-3.5 h-3.5 stroke-[3] text-white transition-opacity duration-200 ${checked ? 'opacity-100' : 'opacity-0'}`}
          style={checked ? { strokeDasharray: 22, strokeDashoffset: 22, animation: 'dash .35s ease forwards' } : {}}
        >
          <path
            d="M5 13.2 9.2 17.4 19 7.6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-xs font-medium text-gray-300 tracking-wide">
        {label}
      </span>
    </button>
  );
};

export default AnimatedCheck;
