import React from 'react';

// Componente para la barra de búsqueda y filtrado de usuarios
export default function UsersBusqueda({ search, onSearch, onLimpiar }) {
  return (
    <div className="flex gap-3 items-center mb-6 flex-wrap sm:flex-nowrap">
      {/* Campo de búsqueda con icono de lupa */}
      <div className="relative flex-[2_1_15rem] min-w-50 max-w-[21.875rem] w-full sm:w-auto">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant">search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar por nombre o rol..."
          className="w-full py-2.5 pr-3 pl-10 border border-outline-variant rounded-xl text-sm bg-white font-sans outline-none text-on-surface focus:border-primary transition-colors"
        />
      </div>

      {/* Botón para limpiar los filtros */}
      <button onClick={onLimpiar} className="px-4 py-2.5 bg-transparent border border-outline-variant rounded-lg text-sm font-semibold text-on-surface-variant font-sans cursor-pointer flex items-center justify-center gap-1.5 transition-colors duration-200 hover:bg-surface-container-low w-full sm:w-auto">
        <span className="material-symbols-outlined">filter_list_off</span>
        Limpiar
      </button>
    </div>
  );
}
