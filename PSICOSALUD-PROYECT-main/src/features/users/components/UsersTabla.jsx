import React from 'react';
import { obtenerNombreCompleto } from '../utils/users.utils';

// Componente para la tabla de visualización de usuarios
export default function UsersTabla({ items = [], onEditar, onEliminar }) {
  
  // Función para obtener las iniciales a partir del nombre completo si no están predefinidas
  const obtenerIniciales = (nombre) => {
    if (!nombre) return '??';
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Función para calcular la variante de color del avatar según la suma de códigos del nombre completo
  const obtenerClaseAvatar = (nombreCompleto) => {
    if (!nombreCompleto) return 'users-tabla__avatar--var1';
    const sumaCodigos = nombreCompleto
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variante = (sumaCodigos % 3) + 1; // Genera variantes del 1 al 3
    if (variante === 1) return 'bg-[rgba(4,71,56,0.1)] text-primary';
    if (variante === 2) return 'bg-[rgba(83,98,87,0.12)] text-secondary';
    return 'bg-[rgba(37,69,47,0.1)] text-tertiary';
  };

  return (
    <div className="bg-white rounded-2xl border border-[rgba(191,201,195,0.3)] overflow-hidden shadow-[0_4px_24px_rgba(4,71,56,0.06)] overflow-x-auto">
      <table className="w-full border-collapse min-w-[37.5rem]">
        <thead>
          <tr>
            <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-[0.06em] bg-surface-container-low border-b border-outline-variant">Usuario</th>
            <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-[0.06em] bg-surface-container-low border-b border-outline-variant">Rol</th>
            <th className="text-center px-5 py-3.5 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-[0.06em] bg-surface-container-low border-b border-outline-variant">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="3" className="px-5 py-4 text-sm text-on-surface-variant align-middle text-center">
                No se encontraron usuarios que coincidan con los filtros.
              </td>
            </tr>
          ) : (
            items.map((user) => {
              const nombreCompleto = obtenerNombreCompleto(user);
              const avatarClase = obtenerClaseAvatar(nombreCompleto);
              
              return (
                <tr key={user.id} className="transition-colors duration-150 hover:bg-surface-container-low">
                  {/* Columna Usuario (Avatar + Nombre completo + Email) */}
                  <td className="px-5 py-4 border-t border-surface-container-high text-sm text-on-surface-variant align-middle">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[0.8125rem] shrink-0 ${avatarClase}`}>
                        {user.iniciales || obtenerIniciales(nombreCompleto)}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface m-0">{nombreCompleto}</p>
                        <p className="text-xs text-on-surface-variant m-0 mt-0.5">{user.email || 'correo@psicosalud.com'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Columna Rol */}
                  <td className="px-5 py-4 border-t border-surface-container-high text-sm text-on-surface-variant align-middle">
                    <span className="text-[0.6875rem] font-bold px-3 py-1 rounded-full bg-[rgba(83,98,87,0.12)] text-secondary inline-block">
                      {user.rol}
                    </span>
                  </td>

                  {/* Columna Acciones */}
                  <td className="px-5 py-4 border-t border-surface-container-high text-sm text-on-surface-variant align-middle">
                    <div className="flex justify-center gap-2">
                      {/* Botón de edición */}
                      <button
                        onClick={() => onEditar(user)}
                        className="px-3 py-1.5 border border-outline-variant rounded-md cursor-pointer font-sans text-xs flex items-center justify-center transition-all duration-200 bg-surface-container-low text-secondary hover:bg-secondary-container hover:text-primary"
                        title="Editar usuario"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>

                      {/* Botón de eliminación */}
                      <button
                        onClick={() => onEliminar(user)}
                        className="px-3 py-1.5 border border-outline-variant rounded-md cursor-pointer font-sans text-xs flex items-center justify-center transition-all duration-200 bg-surface-container-low text-secondary hover:bg-secondary-container hover:text-primary"
                        title="Eliminar usuario"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
