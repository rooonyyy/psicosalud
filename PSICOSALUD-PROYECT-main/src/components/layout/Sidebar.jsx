import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Función para obtener iniciales
const obtenerIniciales = (nombre) => {
    if (!nombre) return '??';
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Definición de las opciones de navegación del panel lateral (Sidebar)
const NAV = [
    { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/areas", label: "Áreas", icon: "domain" },
    { to: "/registros", label: "Reportes", icon: "description" },
    { to: "/usuarios", label: "Usuarios", icon: "group" },
    { to: "/intervenciones", label: "Intervenciones", icon: "event_note" },
    { to: "/quizzes", label: "Quizzes", icon: "quiz" },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const { sessionUser: authUser, logout } = useAuth();

    // Estado para controlar si el sidebar está reducido (collapsed)
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        // Limpiar sesión de memoria vía AuthContext
        logout();
        navigate("/login");
    };

    // Al cambiar el estado del sidebar, dispara un resize al finalizar la transición CSS (300ms)
    // para que Chart.js re-calcule el tamaño de los canvas correctamente.
    const handleToggle = () => {
        setIsCollapsed(prev => !prev);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 310);
    };

    return (
        <nav className={`sticky top-0 shrink-0 bg-white flex flex-col z-50 transition-all duration-300 ease-in-out h-screen ${isCollapsed ? 'w-17 px-2 py-5 items-center' : 'w-64 px-3 py-5'}`}>
            {/* Cabecera del Sidebar con el logo y el botón de alternancia */}
            <div className={`mb-6 ${isCollapsed ? 'px-0' : 'px-2'}`}>
                <div className={`flex items-center mb-1 ${isCollapsed ? 'flex-col gap-3 w-full' : 'gap-2'}`}>
                    <div className="w-8 h-8 rounded-full bg-[#536257] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white text-xl">
                            health_and_safety
                        </span>
                    </div>

                    {!isCollapsed && <h1 className="text-lg font-black text-primary uppercase whitespace-nowrap">PsicoSalud</h1>}

                    {/* Botón para contraer/expandir */}
                    <button
                        className={`bg-transparent border-none cursor-pointer text-on-surface-variant flex items-center justify-center p-1 rounded-full transition-colors hover:bg-black/5 ${isCollapsed ? 'ml-0' : 'ml-auto'}`}
                        onClick={handleToggle}
                        aria-label="Toggle Sidebar"
                    >
                        <span className="material-symbols-outlined">
                            {isCollapsed ? "menu" : "menu_open"}
                        </span>
                    </button>
                </div>

                {!isCollapsed && <p className="text-[0.625rem] ml-10 uppercase text-on-surface-variant whitespace-nowrap">Sistema de gestión laboral</p>}
            </div>

            {/* Listado dinámico de los enlaces de navegación */}
            <ul className={`flex-1 list-none flex flex-col gap-1 ${isCollapsed ? 'items-stretch w-full' : ''}`}>
                {NAV.map(({ to, label, icon }) => {
                    // Ocultar opción "Usuarios" si el usuario no es Administrador
                    if (to === "/usuarios" && authUser?.rol !== 'Administrador') {
                        return null;
                    }

                    return (
                        <li key={to} className="relative group">
                            <NavLink
                                to={to}
                                className={({ isActive }) =>
                                    `group relative flex items-center gap-2.5 rounded-md text-on-surface-variant transition-all duration-200 text-sm ${isCollapsed ? 'justify-center w-full py-2.5 px-0' : 'px-3 py-2.5'
                                    } ${isActive
                                        ? `text-[#536257] bg-[rgba(83,98,87,0.1)] font-bold ${!isCollapsed ? 'border-l-4 border-[#536257]' : ''}`
                                        : ''
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* Borde activo en colapsado */}
                                        {isActive && isCollapsed && (
                                            <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#536257] rounded-r-md"></div>
                                        )}

                                        <span className="material-symbols-outlined">
                                            {icon}
                                        </span>

                                        {!isCollapsed && <span className="link-text">{label}</span>}

                                        {/* Tooltip */}
                                        {isCollapsed && (
                                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-[#2d3748] text-white px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1 z-[100] shadow-md">
                                                {label}
                                            </div>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        </li>
                    );
                })}

                {/* Enlace de Configuración — Solo visible para Administradores */}
                {authUser && authUser.rol === 'Administrador' && (
                    <li className="relative group">
                        <NavLink
                            to="/configuracion"
                            className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-md text-on-surface-variant transition-all duration-200 text-sm ${isCollapsed ? 'justify-center w-full py-2.5 px-0' : 'px-3 py-2.5'
                                } ${isActive
                                    ? `text-[#536257] bg-[rgba(83,98,87,0.1)] font-bold ${!isCollapsed ? 'border-l-4 border-[#536257]' : ''}`
                                    : ''
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && isCollapsed && (
                                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#536257] rounded-r-md"></div>
                                    )}
                                    <span className="material-symbols-outlined">settings</span>
                                    {!isCollapsed && <span className="link-text">Configuración</span>}

                                    {/* Tooltip */}
                                    {isCollapsed && (
                                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-[#2d3748] text-white px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1 z-[100] shadow-md">
                                            Configuración
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    </li>
                )}
            </ul>

            {/* Pie del Sidebar con el perfil y botón de cerrar sesión */}
            <div className="border-t border-[rgba(112,121,117,0.2)] pt-6 mt-auto">
                <div className={`flex items-center gap-2.5 mb-4 ${isCollapsed ? 'justify-center mb-3' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-[rgba(83,98,87,0.1)] flex items-center justify-center text-[#536257] font-bold shrink-0">
                        {authUser ? (authUser.iniciales || obtenerIniciales(authUser.nombre)) : '??'}
                    </div>

                    {!isCollapsed && (
                        <div className="user-info">
                            <p className="font-bold text-primary text-[0.8125rem] whitespace-nowrap">{authUser ? authUser.nombre : 'Usuario'}</p>
                            <p className="text-[0.5625rem] uppercase text-on-surface-variant whitespace-nowrap">{authUser ? authUser.rol : 'Administrador'}</p>
                        </div>
                    )}
                </div>

                <div className="relative group">
                    <button
                        className={`w-full flex items-center gap-2.5 border-none bg-transparent text-[#ba1a1a] cursor-pointer text-[0.8125rem] rounded-lg transition-colors hover:bg-[rgba(186,26,26,0.05)] ${isCollapsed ? 'justify-center py-2 px-0' : 'py-2 px-3'}`}
                        onClick={handleLogout}
                    >
                        <span className="material-symbols-outlined">
                            logout
                        </span>

                        {!isCollapsed && <span className="link-text">Cerrar Sesión</span>}

                        {/* Tooltip */}
                        {isCollapsed && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-[#2d3748] text-white px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1 z-[100] shadow-md">
                                Cerrar Sesión
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
}