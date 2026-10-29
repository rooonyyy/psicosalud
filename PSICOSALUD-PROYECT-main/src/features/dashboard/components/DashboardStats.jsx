import React from "react";

// Componente para renderizar las tarjetas de estadísticas principales (KPIs)
export default function DashboardStats({ kpiData = [] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {kpiData.map((item, index) => (
                <div
                    key={index}
                    className="relative bg-white rounded-2xl border border-surface-container-high p-[1.75rem_1.75rem_1.75rem_1.5rem] flex items-center gap-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:-translate-y-[0.125rem] cursor-default"
                >
                    {/* Barra de acento lateral */}
                    <div 
                        className={`absolute left-0 top-0 bottom-0 w-[0.3125rem] rounded-l-2xl ${item.borderClass}`} 
                    />

                    {/* Icono con fondo tonal */}
                    <div 
                        className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${item.bgClass}`} 
                    >
                        <span className={`material-symbols-outlined text-[1.75rem] [font-variation-settings:'FILL'_1] ${item.textClass}`}>
                            {item.icon}
                        </span>
                    </div>

                    {/* Texto */}
                    <div>
                        <p className="text-[0.6875rem] font-bold text-on-surface-variant mb-1.5 uppercase tracking-[0.5px]">
                            {item.label}
                        </p>
                        <div className="text-[2.375rem] font-extrabold text-primary leading-none mb-2">
                            {item.value}
                        </div>
                        {item.subtext && (
                            <div className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-on-surface-variant bg-surface-container-lowest border border-surface-container-high px-2.5 py-1 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                <span className={`material-symbols-outlined text-sm ${item.textClass}`}>
                                    {item.subtextIcon || "info"}
                                </span>
                                {item.subtext}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
