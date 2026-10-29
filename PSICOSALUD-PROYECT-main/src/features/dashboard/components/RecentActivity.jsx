import React from "react";
import { Link } from "react-router-dom";

// Componente para renderizar la tabla de Actividad Reciente en el Dashboard general
export default function DashboardActivity({ recentActivity = [] }) {

    const obtenerIniciales = (nombre) => {
        if (!nombre) return '??';
        return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const obtenerClaseAvatar = (nombreCompleto) => {
        if (!nombreCompleto) return 'bg-[rgba(4,71,56,0.1)] text-primary';
        const sumaCodigos = nombreCompleto
            .split('')
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const variante = (sumaCodigos % 3) + 1; // Genera variantes del 1 al 3
        if (variante === 1) return 'bg-[rgba(4,71,56,0.1)] text-primary';
        if (variante === 2) return 'bg-[rgba(83,98,87,0.12)] text-secondary';
        return 'bg-[rgba(37,69,47,0.1)] text-tertiary';
    };

    const formatearFechaHora = (fechaString) => {
        if (!fechaString) return '';
        const d = new Date(fechaString);
        if (isNaN(d)) return fechaString;
        
        const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = meses[d.getMonth()];
        const day = d.getDate();
        const year = d.getFullYear();
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        
        return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
    };

    return (
        <div className="bg-white rounded-2xl border border-surface-container-high shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Header */}
            <div className="p-[1.5rem_1.75rem_1.25rem] border-b border-surface-container-high flex justify-between items-center">
                <div>
                    <h3 className="text-base font-bold text-primary m-0">Actividad Reciente</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5 m-0">Últimos informes registrados</p>
                </div>
                <Link 
                    to="/registros"
                    className="text-primary text-[0.8125rem] font-semibold no-underline p-[0.375rem_0.75rem] rounded-lg bg-surface-container-low transition-colors duration-200 hover:bg-surface-container"
                >
                    Ver todos
                </Link>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low">
                            {['Responsable', 'Área', 'Nombre del Informe', 'Fecha'].map(h => (
                                <th key={h} className="p-[0.75rem_1.25rem] text-left text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-[0.6px]">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {recentActivity.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-[1.875rem_1.25rem] text-center text-on-surface-variant text-[0.8125rem]">
                                    No hay reportes recientes en la base de datos.
                                </td>
                            </tr>
                        ) : (
                            recentActivity.map((item, index) => {
                                const avatarClase = obtenerClaseAvatar(item.responsable);
                                return (
                                    <tr
                                        key={index}
                                        className="border-t border-surface-container-high transition-colors duration-150 hover:bg-surface-container-low"
                                    >
                                        {/* Responsable */}
                                        <td className="p-[1rem_1.25rem]">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarClase}`}>
                                                    {item.iniciales || obtenerIniciales(item.responsable)}
                                                </div>
                                                <span className="text-sm font-semibold text-on-surface">
                                                    {item.responsable}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Área */}
                                        <td className="p-[1rem_1.25rem] text-sm text-on-surface-variant">
                                            {item.area}
                                        </td>
                                        {/* Informe */}
                                        <td className="p-[1rem_1.25rem] text-sm font-medium text-on-surface">
                                            {item.nombre}
                                        </td>
                                        {/* Fecha */}
                                        <td className="p-[1rem_1.25rem] text-sm text-on-surface-variant">
                                            {item.created_at ? formatearFechaHora(item.created_at) : item.fecha}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
