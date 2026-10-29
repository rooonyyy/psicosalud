import React, { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = "Selecciona una opción",
  disabled = false,
  className = "",
  innerClassName = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Botón selector */}
      <div 
        className={`w-full py-2.5 px-3.5 border border-outline-variant rounded-lg text-sm bg-white font-sans text-on-surface flex justify-between items-center transition-colors ${disabled ? 'bg-gray-100 cursor-not-allowed text-on-surface-variant' : 'cursor-pointer hover:border-primary'} ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''} ${innerClassName}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`material-symbols-outlined text-[1.125rem] text-on-surface-variant transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </div>

      {/* Lista desplegable */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-outline-variant rounded-lg shadow-lg max-h-72 overflow-y-auto overflow-x-hidden font-sans">
          {options.length === 0 ? (
            <div className="px-4 py-2.5 text-sm text-on-surface-variant italic">
              No hay opciones disponibles
            </div>
          ) : (
            options.map((opt) => (
              <div
                key={opt.value}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  value === opt.value 
                    ? 'bg-primary/10 text-primary font-bold' 
                    : 'text-on-surface hover:bg-surface-container-low'
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
