import React from 'react';

// KPI card config
const kpiConfig = [
  {
    key: 'bienestar',
    label: 'Índice de Bienestar',
    icon: 'favorite',
    format: v => `${v}%`,
  },
  {
    key: 'estres',
    label: 'Estrés Promedio',
    icon: 'psychology',
    format: v => `${v}%`,
  },
  {
    key: 'participacion',
    label: 'Participación',
    icon: 'groups',
    format: v => `${v}%`,
  },
];

// Componente para renderizar la fila de tarjetas de indicadores clave de rendimiento (KPIs)
export default function AreaKpiCards({ area }) {
  const data = area || { bienestar: 0, estres: 0, participacion: 0, tendencia: 0 };

  const getDynamicStyles = (key, value, tendencia) => {
    // Si no hay datos (ej. área recién creada sin quizzes)
    if (!area && value === 0) {
      return { 
        borderClass: 'bg-outline-variant', bgClass: 'bg-surface-container', textClass: 'text-on-surface-variant',
        pill: { icon: 'horizontal_rule', iconClass: 'text-on-surface-variant', text: 'Sin datos' }
      };
    }

    if (key === 'bienestar') {
      let pill = { icon: 'horizontal_rule', iconClass: 'text-[var(--on-surface-variant)]', text: 'Sin cambios recientes' };
      if (tendencia !== undefined && tendencia !== 0) {
        const esPositiva = tendencia > 0;
        pill = {
          icon: esPositiva ? 'trending_up' : 'trending_down',
          iconClass: esPositiva ? 'text-[#16a34a]' : 'text-[var(--error)]',
          text: `${esPositiva ? '+' : ''}${tendencia}% vs mes anterior`
        };
      }
      if (value >= 70) return { borderClass: 'bg-[var(--primary)]', bgClass: 'bg-[var(--primary-fixed)]', textClass: 'text-[var(--primary)]', pill };
      if (value >= 40) return { borderClass: 'bg-[#f59e0b]', bgClass: 'bg-[#fef3c7]', textClass: 'text-[#b45309]', pill };
      return { borderClass: 'bg-[var(--error)]', bgClass: 'bg-[var(--error-container)]', textClass: 'text-[var(--error)]', pill };
    }
    
    if (key === 'estres') {
      if (value >= 60) return { 
        borderClass: 'bg-[var(--error)]', bgClass: 'bg-[var(--error-container)]', textClass: 'text-[var(--error)]',
        pill: { icon: 'warning', iconClass: 'text-[var(--error)]', text: 'Atención prioritaria' }
      };
      if (value >= 30) return { 
        borderClass: 'bg-[#f59e0b]', bgClass: 'bg-[#fef3c7]', textClass: 'text-[#b45309]',
        pill: { icon: 'info', iconClass: 'text-[#b45309]', text: 'Precaución moderada' }
      };
      return { 
        borderClass: 'bg-[var(--primary)]', bgClass: 'bg-[var(--primary-fixed)]', textClass: 'text-[var(--primary)]',
        pill: { icon: 'check_circle', iconClass: 'text-[#16a34a]', text: 'Niveles saludables' }
      };
    }
    
    if (key === 'participacion') {
      if (value >= 70) return { 
        borderClass: 'bg-[#2563eb]', bgClass: 'bg-[#dbeafe]', textClass: 'text-[#2563eb]',
        pill: { icon: 'trending_up', iconClass: 'text-[#16a34a]', text: 'Alta fiabilidad' }
      };
      if (value >= 40) return { 
        borderClass: 'bg-[#f59e0b]', bgClass: 'bg-[#fef3c7]', textClass: 'text-[#b45309]',
        pill: { icon: 'info', iconClass: 'text-[#b45309]', text: 'Fiabilidad moderada' }
      };
      return { 
        borderClass: 'bg-[var(--error)]', bgClass: 'bg-[var(--error-container)]', textClass: 'text-[var(--error)]',
        pill: { icon: 'warning', iconClass: 'text-[var(--error)]', text: 'Baja fiabilidad' }
      };
    }
    
    return { 
      borderClass: 'bg-[var(--primary)]', bgClass: 'bg-[var(--primary-fixed)]', textClass: 'text-[var(--primary)]',
      pill: { icon: 'info', iconClass: 'text-[var(--on-surface-variant)]', text: '' }
    };
  };

  return (
    <div className="grid grid-cols-3 gap-5">
      {kpiConfig.map(({ key, label, icon, format }) => {
        const value = data[key];
        const { borderClass, bgClass, textClass, pill } = getDynamicStyles(key, value, data.tendencia);
        
        return (
          <div
            key={key}
          className="bg-white rounded-2xl border border-surface-container-high p-[1.75rem_1.75rem_1.75rem_1.5rem] flex items-center gap-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] relative overflow-hidden transition-all duration-200 cursor-default hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:-translate-y-[0.125rem]"
        >
          {/* Barra de acento lateral */}
          <div 
            className={`absolute left-0 top-0 bottom-0 w-[0.3125rem] rounded-l-2xl ${borderClass}`}
          />

          {/* Icono */}
          <div 
            className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}
          >
            <span className={`material-symbols-outlined text-[1.75rem] [font-variation-settings:'FILL'_1] ${textClass}`}>
              {icon}
            </span>
          </div>

          {/* Contenido */}
          <div>
            <p className="text-[0.6875rem] font-bold text-on-surface-variant mb-1.5 uppercase tracking-[0.5px]">
              {label}
            </p>
            <div className="text-[2.375rem] font-extrabold text-primary leading-none mb-2">
              {format(value)}
            </div>
            
            {/* Pill de estado unificado y estético */}
            {pill && pill.text && (
              <div className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-on-surface-variant bg-surface-container-lowest border border-surface-container-high px-2.5 py-1 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <span className={`material-symbols-outlined text-sm ${pill.iconClass}`}>
                  {pill.icon}
                </span>
                {pill.text}
              </div>
            )}
          </div>
        </div>
        );
      })}
    </div>
  );
}
