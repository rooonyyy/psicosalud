import React from 'react';
import { useNavigate } from 'react-router-dom';

// Componente para la sección de acciones rápidas del Dashboard
export default function AccionesRapidas({ acciones = [] }) {
    const navigate = useNavigate();

    const handleActionClick = (item) => {
        if (item.accion === 'navegar') navigate(item.ruta);
    };

    return (
        <div className="bg-white rounded-2xl border border-surface-container-high shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Header */}
            <div className="p-[1.5rem_1.5rem_1.25rem] border-b border-surface-container-high">
                <h3 className="text-base font-bold text-primary m-0">Acciones Rápidas</h3>
                <p className="text-xs text-on-surface-variant mt-0.5 m-0">Accesos directos al sistema</p>
            </div>

            {/* Botones */}
            <div className="p-4 flex flex-col gap-2">
                {acciones.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => handleActionClick(item)}
                        className="group flex items-center gap-3.5 p-[0.875rem_1rem] bg-transparent border border-surface-container-high rounded-xl cursor-pointer text-left w-full transition-all duration-200 text-on-surface hover:bg-primary-container hover:border-primary-container hover:text-white"
                    >
                        {/* Icono */}
                        <div className="w-[2.375rem] h-[2.375rem] rounded-xl bg-primary-fixed group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors duration-200">
                            <span className="material-symbols-outlined text-xl text-primary transition-colors duration-200 group-hover:text-white">
                                {item.icon}
                            </span>
                        </div>
                        {/* Label */}
                        <span className="text-sm font-semibold">{item.label}</span>

                        {/* Flecha */}
                        <span className="material-symbols-outlined text-lg ml-auto opacity-40">
                            chevron_right
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
