import React from 'react';

// Componente para mostrar las tarjetas de métricas clave (KPIs) en la gestión de quizzes
export default function QuizKpis({ kpis = [] }) {
  const getAccentClasses = (accent) => {
    switch (accent) {
      case 'var(--primary)':
        return {
          border: 'bg-primary',
          bg: 'bg-[rgba(4,71,56,0.12)]',
          text: 'text-primary'
        };
      case 'var(--secondary)':
        return {
          border: 'bg-secondary',
          bg: 'bg-[rgba(46,125,95,0.12)]',
          text: 'text-secondary'
        };
      case '#2563eb':
        return {
          border: 'bg-[#2563eb]',
          bg: 'bg-[rgba(37,99,235,0.12)]',
          text: 'text-[#2563eb]'
        };
      default:
        return {
          border: 'bg-primary',
          bg: 'bg-[rgba(4,71,56,0.12)]',
          text: 'text-primary'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 mb-8">
      {kpis.map((kpi, index) => {
        const classes = getAccentClasses(kpi.accent);
        
        return (
          <div
            key={index}
            className="bg-white rounded-2xl border border-surface-container-high py-7 pr-7 pl-6 flex items-center gap-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden relative transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 cursor-default group"
          >
            {/* Barra de acento lateral */}
            <div 
              className={`absolute left-0 top-0 bottom-0 w-[0.3125rem] rounded-l-2xl ${classes.border}`}
            />

            {/* Icono con fondo tonal */}
            <div 
              className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${classes.bg}`}
            >
              <span className={`material-symbols-outlined text-[1.75rem] [font-variation-settings:'FILL'_1] ${classes.text}`}>
                {kpi.icon}
              </span>
            </div>

            {/* Texto */}
            <div>
              <p className="text-[0.6875rem] font-bold text-on-surface-variant mb-1.5 uppercase tracking-[0.5px]">
                {kpi.label}
              </p>
              <h2 className="text-[2.375rem] font-extrabold text-primary leading-none mb-0 mt-0">
                {kpi.value}
              </h2>
            </div>
          </div>
        );
      })}
    </div>
  );
}
