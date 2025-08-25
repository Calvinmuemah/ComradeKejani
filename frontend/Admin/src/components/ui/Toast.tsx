import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface ToastRecord { id: number; type: ToastType; message: string; createdAt: number; }
interface ToastContextValue { notify: (message: string, type?: ToastType, durationMs?: number) => void; }

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ToastItem: React.FC<{ toast: ToastRecord; onClose: (id:number)=>void; duration: number; }> = ({ toast, onClose, duration }) => {
  const [exiting, setExiting] = useState(false);
  useEffect(()=>{
    const timer = setTimeout(()=>{ setExiting(true); setTimeout(()=>onClose(toast.id),300); }, duration);
    return ()=> clearTimeout(timer);
  },[toast.id,duration,onClose]);
  const icon = toast.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-400" />
    : toast.type === 'error' ? <AlertCircle className="h-5 w-5 text-rose-400" />
    : <Info className="h-5 w-5 text-blue-400" />;
  const color = toast.type === 'success' ? 'bg-emerald-900/80 border-emerald-700'
    : toast.type === 'error' ? 'bg-rose-900/80 border-rose-700'
    : 'bg-blue-900/80 border-blue-700';
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-xl border text-white text-sm transform transition-all duration-300 ease-in-out ${color} ${exiting? 'translate-x-full opacity-0':'translate-x-0 opacity-100'}`}> 
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">{toast.message}</div>
      <button onClick={()=>{ setExiting(true); setTimeout(()=>onClose(toast.id),300); }} className="flex-shrink-0 text-white/70 hover:text-white">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const notify = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(list => [...list, { id, type, message, createdAt: Date.now() }]);
    // Auto removal handled by ToastItem timer
  }, []);
  const remove = useCallback((id:number)=> setToasts(list=>list.filter(t=>t.id!==id)),[]);
  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-[9999] w-80 max-w-[90vw]">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={remove} duration={4000} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(){
  const ctx = useContext(ToastContext);
  if(!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

export default ToastProvider;
