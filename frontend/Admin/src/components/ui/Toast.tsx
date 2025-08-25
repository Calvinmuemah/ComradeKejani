import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
  id: string;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000, id }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        onClose();
      }, 300); // Animation duration

      return () => clearTimeout(exitTimer);
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-rose-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
      default:
        return null;
    }
  };

  const getStyles = () => {
    const baseStyles = "flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-xl border transform transition-all duration-300 ease-in-out";
    const appearanceStyles = isExiting 
      ? "translate-x-full opacity-0" 
      : "translate-x-0 opacity-100";
    
    const typeStyles = {
      success: "bg-emerald-900/80 border-emerald-700 text-white",
      error: "bg-rose-900/80 border-rose-700 text-white",
      info: "bg-blue-900/80 border-blue-700 text-white"
    };
    
    return `${baseStyles} ${typeStyles[type]} ${appearanceStyles}`;
  };

  return (
    <div className={getStyles()} role="alert" id={id}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button 
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="flex-shrink-0 text-white/70 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
