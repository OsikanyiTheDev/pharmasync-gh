'use client';

import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = 'success', description?: string) => {
    const id = `TOAST-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newToast: ToastMessage = { id, type, message, description };
    setToasts(prev => [...prev.slice(-4), newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start space-x-3 p-3.5 rounded-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              t.type === 'success'
                ? 'bg-white border-[#10B981]/20 text-slate-900'
                : t.type === 'error'
                ? 'bg-white border-[#EF4444]/20 text-slate-900'
                : 'bg-white border-[#4E60FF]/20 text-slate-900'
            }`}
          >
            {t.type === 'success' && <div className="bg-[#10B981] text-white p-1 rounded-full flex-shrink-0"><CheckCircle2 className="w-4 h-4" /></div>}
            {t.type === 'error' && <div className="bg-[#EF4444] text-white p-1 rounded-full flex-shrink-0"><AlertCircle className="w-4 h-4" /></div>}
            {t.type === 'info' && <div className="bg-[#4E60FF] text-white p-1 rounded-full flex-shrink-0"><Info className="w-4 h-4" /></div>}

            <div className="flex-1">
              <p className="text-xs font-bold text-slate-900">{t.message}</p>
              {t.description && <p className="text-[11px] text-slate-500 mt-0.5">{t.description}</p>}
            </div>

            <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-slate-700 p-0.5 rounded-lg hover:bg-slate-50">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
