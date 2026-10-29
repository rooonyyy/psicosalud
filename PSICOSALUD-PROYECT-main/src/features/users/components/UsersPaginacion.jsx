import React from 'react';

// Componente para la paginación del listado de usuarios
export default function UsersPaginacion({
  paginaActual,
  totalPaginas,
  inicio,
  fin,
  total,
  onCambiar
}) {
  // Generar el listado de números de página
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between mt-5 text-on-surface-variant text-[0.8125rem] flex-col sm:flex-row gap-4 sm:gap-0">
      {/* Información de rango actual */}
      <span>
        Mostrando {inicio} a {fin} de {total} entradas
      </span>

      {/* Botones de navegación de página */}
      <div className="flex items-center gap-1.5">
        {/* Botón de página anterior */}
        <button
          onClick={() => onCambiar(Math.max(paginaActual - 1, 1))}
          disabled={paginaActual === 1}
          className="w-8 h-8 rounded-md border border-outline-variant bg-transparent cursor-pointer flex items-center justify-center text-on-surface-variant font-semibold text-[0.8125rem] transition-colors duration-200 hover:not(:disabled):bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
          title="Página anterior"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>

        {/* Botones de números de página */}
        {paginas.map((pag) => (
          <button
            key={pag}
            onClick={() => onCambiar(pag)}
            className={`w-8 h-8 rounded-md border bg-transparent cursor-pointer flex items-center justify-center font-semibold text-[0.8125rem] transition-colors duration-200 hover:not(:disabled):bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40 ${
              pag === paginaActual ? '!bg-primary !text-white !border-none' : 'border-outline-variant text-on-surface-variant'
            }`}
          >
            {pag}
          </button>
        ))}

        {/* Botón de página siguiente */}
        <button
          onClick={() => onCambiar(Math.min(paginaActual + 1, totalPaginas))}
          disabled={paginaActual === totalPaginas}
          className="w-8 h-8 rounded-md border border-outline-variant bg-transparent cursor-pointer flex items-center justify-center text-on-surface-variant font-semibold text-[0.8125rem] transition-colors duration-200 hover:not(:disabled):bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
          title="Página siguiente"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
