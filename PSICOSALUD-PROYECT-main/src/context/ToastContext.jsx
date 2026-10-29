import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border
              backdrop-blur-xl font-sans min-w-[280px] max-w-[400px]
              ${t.type === 'success' 
                ? 'bg-[#E6F4EA]/90 border-[#34A853]/20 text-[#137333]' 
                : t.type === 'error'
                ? 'bg-[#FCE8E6]/90 border-[#EA4335]/20 text-[#C5221F]'
                : 'bg-white/90 border-outline-variant/30 text-on-surface'}
            `}
          >
            {t.type === 'success' && (
              <span className="material-symbols-outlined text-[1.25rem]">check_circle</span>
            )}
            {t.type === 'error' && (
              <span className="material-symbols-outlined text-[1.25rem]">error</span>
            )}
            {t.type === 'info' && (
              <span className="material-symbols-outlined text-[1.25rem]">info</span>
            )}
            <p className="text-sm font-semibold m-0 leading-tight flex-1">{t.message}</p>
            <button 
              onClick={() => removeToast(t.id)}
              className="text-current/60 hover:text-current transition-colors p-1 -mr-2 rounded-full hover:bg-black/5"
            >
              <span className="material-symbols-outlined text-[1rem]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context.toast;
};
