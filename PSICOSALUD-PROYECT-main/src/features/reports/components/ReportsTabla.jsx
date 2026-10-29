import React from 'react';

// Componente para la tabla de reportes
export default function ReportsTabla({ items = [], onEliminar, currentUser }) {
  
  // Función para obtener la inicial del nombre del responsable
  const obtenerIniciales = (nombre) => {
    if (!nombre) return '??';
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Función para formatear fecha con hora (usa created_at de la DB si está disponible)
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

  // Función para calcular la clase de color del avatar según la suma de caracteres del nombre
  const obtenerClaseAvatar = (nombreCompleto) => {
    if (!nombreCompleto) return 'reports-tabla__avatar--var1';
    const sumaCodigos = nombreCompleto
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variante = (sumaCodigos % 3) + 1; // Genera variante 1, 2 o 3
    if (variante === 1) return 'bg-[rgba(4,71,56,0.1)] text-primary';
    if (variante === 2) return 'bg-[rgba(83,98,87,0.12)] text-secondary';
    return 'bg-[rgba(37,69,47,0.1)] text-tertiary';
  };

  return (
    <div className="bg-white rounded-2xl border border-[rgba(191,201,195,0.3)] overflow-hidden shadow-[0_4px_24px_rgba(4,71,56,0.06)] overflow-x-auto">
      <table className="w-full border-collapse min-w-[37.5rem]">
        <thead>
          <tr>
            <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-[0.06em] bg-surface-container-low border-b border-outline-variant">Responsable</th>
            <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-[0.06em] bg-surface-container-low border-b border-outline-variant">Área</th>
            <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-[0.06em] bg-surface-container-low border-b border-outline-variant">Nombre del Informe</th>
            <th className="text-left px-5 py-3.5 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-[0.06em] bg-surface-container-low border-b border-outline-variant">Fecha</th>
            <th className="text-center px-5 py-3.5 text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-[0.06em] bg-surface-container-low border-b border-outline-variant">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-5 py-4 text-sm text-on-surface-variant align-middle text-center">
                No se encontraron informes que coincidan con los filtros.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="transition-colors duration-150 hover:bg-surface-container-low">
                {/* Columna de Responsable (Avatar + Nombre) */}
                <td className="px-5 py-4 border-t border-surface-container-high text-sm text-on-surface-variant align-middle">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${obtenerClaseAvatar(item.responsable)}`}>
                      {item.iniciales || obtenerIniciales(item.responsable)}
                    </div>
                    <span className="font-semibold text-on-surface">
                      {item.responsable}
                    </span>
                  </div>
                </td>

                {/* Columna de Área */}
                <td className="px-5 py-4 border-t border-surface-container-high text-sm text-on-surface-variant align-middle">{item.area}</td>

                {/* Columna de Nombre (Enlace visual) */}
                <td className="px-5 py-4 border-t border-surface-container-high text-sm text-on-surface-variant align-middle">
                  {item.archivo_url ? (
                    <a
                      href={item.archivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary cursor-pointer no-underline transition-all hover:underline"
                    >
                      {item.nombre}
                    </a>
                  ) : (
                    <span className="font-semibold text-on-surface">
                      {item.nombre}
                    </span>
                  )}
                </td>

                {/* Columna de Fecha */}
                <td className="px-5 py-4 border-t border-surface-container-high text-sm text-on-surface-variant align-middle">
                  {formatearFechaHora(item.created_at)}
                </td>

                {/* Columna de Acciones */}
                <td className="px-5 py-4 border-t border-surface-container-high text-sm text-on-surface-variant align-middle">
                  <div className="flex justify-center gap-2">
                    {/* Botón de descargar */}
                    {item.archivo_url ? (
                      <a
                        href={item.archivo_url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 border border-outline-variant rounded-md cursor-pointer flex items-center justify-center transition-colors duration-200 bg-surface-container-low text-secondary hover:bg-secondary-container hover:text-primary"
                        title="Descargar informe"
                      >
                        <span className="material-symbols-outlined text-lg">download</span>
                      </a>
                    ) : (
                      <button
                        disabled
                        className="p-1.5 border border-outline-variant rounded-md bg-transparent cursor-not-allowed text-on-surface-variant flex items-center justify-center opacity-50"
                        title="Sin archivo para descargar"
                      >
                        <span className="material-symbols-outlined text-lg">download</span>
                      </button>
                    )}



                    {/* Botón de eliminación (usa paleta verde del sistema en css) */}
                    {(() => {
                      const isAdmin = currentUser?.rol === 'Administrador';
                      const canDelete = isAdmin || (currentUser?.nombre === item.responsable);
                      
                      return (
                        <button
                          onClick={() => canDelete && onEliminar(item)}
                          disabled={!canDelete}
                          className={`p-1.5 border border-outline-variant rounded-md flex items-center justify-center transition-colors duration-200 ${canDelete ? 'cursor-pointer bg-surface-container-low text-secondary hover:bg-secondary-container hover:text-primary' : 'bg-transparent cursor-not-allowed text-on-surface-variant opacity-50'}`}
                          title={canDelete ? "Eliminar informe" : "No tienes permisos para eliminar este informe"}
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      );
                    })()}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
