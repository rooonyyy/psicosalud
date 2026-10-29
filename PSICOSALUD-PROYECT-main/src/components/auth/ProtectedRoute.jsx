import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute — Componente que protege rutas administrativas.
 * 
 * Verifica:
 * 1. Que exista una sesión activa en memoria (AuthContext)
 * 2. Que el rol del usuario esté dentro de los roles permitidos (si se especifican)
 * 
 * Props:
 * - children: El componente/página a renderizar si el acceso es válido
 * - allowedRoles: Array opcional de roles permitidos (ej: ['Administrador'])
 *   Si no se especifica, cualquier usuario autenticado puede acceder.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, sessionUser, isLoading } = useAuth();

  // Esperar a que InsForge Auth resuelva la sesión inicial
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="w-10 h-10 rounded-full border-[0.25rem] border-primary-fixed border-t-primary animate-spin" />
      </div>
    );
  }

  // Sin sesión activa → redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles específicos requeridos, verificar que el usuario tenga uno válido
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = sessionUser?.rol;
    if (!allowedRoles.includes(userRole)) {
      // Rol no autorizado → redirigir a página de acceso denegado
      return <Navigate to="/acceso-denegado" replace />;
    }
  }

  // Sesión válida y rol permitido → renderizar la página
  return children;
}
