import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string; // optional styling overrides for the outer content panel
  tone?: 'default' | 'danger' | 'info'; // quick semantic accent
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className = '',
  tone = 'default'
}) => {
  if (!isOpen) return null;

  // Determine max-width class based on size prop
  const getMaxWidthClass = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      default:
        return 'max-w-lg';
    }
  };

  const accentClasses = (() => {
    switch (tone) {
      case 'danger': return 'text-rose-300 border-rose-700/40 shadow-rose-900/20';
      case 'info': return 'text-sky-300 border-sky-700/40 shadow-sky-900/20';
      default: return 'text-indigo-200 border-indigo-700/40 shadow-indigo-900/20';
    }
  })();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80 backdrop-blur-sm opacity-0 animate-[fadeIn_160ms_ease-out_forwards]"
          onClick={onClose}
        />
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        {/* Panel */}
        <div
          className={`inline-block w-full transform overflow-hidden rounded-2xl bg-[#0f1424] text-left align-bottom shadow-2xl ring-1 ring-white/5 transition-all sm:my-8 sm:align-middle ${getMaxWidthClass(size)} ${className} opacity-0 scale-95 animate-[modalIn_190ms_cubic-bezier(.16,.84,.44,1)_forwards]`}
        >
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex items-start justify-between mb-5">
              <h3 className={`text-lg font-semibold tracking-tight leading-6 ${accentClasses}`}>
                {title}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="text-gray-200 text-sm leading-relaxed">
              {children}
            </div>
          </div>
        </div>
      </div>
      {/* Keyframes */}
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes modalIn { from { opacity:0; transform:scale(.95) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }
      `}</style>
    </div>
  );
};

export { Modal };