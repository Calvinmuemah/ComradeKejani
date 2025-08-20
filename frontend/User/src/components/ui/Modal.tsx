import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 dark:bg-background/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-6xl p-0 flex items-center justify-center">
        <div className="rounded-xl p-8 shadow-2xl animate-modalPop border border-primary/20 bg-background dark:bg-background/90 w-full h-full flex flex-row items-stretch gap-8"
          style={{
            boxShadow: '0 0 32px 8px rgba(99,102,241,0.25), 0 0 0 4px rgba(99,102,241,0.10)',
            background: 'inherit',
            backdropFilter: 'blur(8px)',
            minHeight: '600px',
            minWidth: '900px',
            maxHeight: '90vh',
            maxWidth: '95vw',
          }}
        >
          <button
            className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors text-xl font-bold"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

// Animations (add to your global CSS or tailwind config)
// .animate-fadeIn { animation: fadeIn 0.2s ease; }
// .animate-modalPop { animation: modalPop 0.3s cubic-bezier(.22,1,.36,1); }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
// @keyframes modalPop { 0% { transform: scale(0.95) translateY(30px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
