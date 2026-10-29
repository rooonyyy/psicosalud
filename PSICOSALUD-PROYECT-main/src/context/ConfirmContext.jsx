import React, { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext();

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm debe ser usado dentro de un ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: '¿Estás seguro?',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    type: 'danger', // danger, warning, info
    icon: 'delete',
    buttonIcon: 'delete'
  });
  const [resolver, setResolver] = useState(null);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      const type = options.type || 'danger';
      const title = options.title || (type === 'info' ? 'Información' : '¿Estás seguro?');
      const confirmText = options.confirmText || (type === 'danger' ? 'Eliminar' : 'Aceptar');
      const cancelText = options.cancelText || 'Cancelar';
      const icon = options.icon || (type === 'danger' ? 'delete' : type === 'info' ? 'info' : 'warning');
      const buttonIcon = options.buttonIcon || (type === 'danger' ? 'delete' : type === 'info' ? 'check_circle' : 'save');

      setConfig({
        title,
        message,
        confirmText,
        cancelText,
        type,
        icon,
        buttonIcon,
        hideCancel: options.hideCancel || false
      });
      setResolver(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) resolver(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) resolver(false);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      
      {isOpen && (
        <div className="fixed inset-0 w-screen h-screen bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-[9999] font-sans">
          <div 
            className="absolute inset-0 transition-opacity" 
            onClick={config.hideCancel ? handleConfirm : handleCancel}
          ></div>
          <div className="relative bg-white rounded-2xl p-8 w-[31.25rem] max-w-[90%] shadow-[0_8px_32px_rgba(4,71,56,0.15)] flex flex-col gap-5 animate-[modalIn_0.3s_ease-out]">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-[rgba(4,71,56,0.08)] text-primary w-14 h-14 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[2rem]">
                  {config.icon}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-primary m-0">{config.title}</h3>
              
              <p className="text-sm text-on-surface-variant leading-relaxed m-0">
                {config.message}
              </p>
            </div>

            <div className="flex justify-center gap-3 mt-3">
              {!config.hideCancel && (
                <button
                  className="px-5 py-2.5 bg-transparent border border-outline-variant rounded-lg font-bold text-sm text-on-surface-variant cursor-pointer font-sans transition-colors duration-200 hover:bg-surface-container-low"
                  onClick={handleCancel}
                >
                  {config.cancelText}
                </button>
              )}
              <button
                className="px-5 py-2.5 bg-primary text-white border-none rounded-lg font-bold text-sm cursor-pointer font-sans flex items-center gap-2 transition-opacity duration-200 hover:opacity-90"
                onClick={handleConfirm}
              >
                {config.buttonIcon && (
                  <span className="material-symbols-outlined text-lg">{config.buttonIcon}</span>
                )}
                {config.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
