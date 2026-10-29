import React from 'react';
import CustomSelect from '../../../components/ui/CustomSelect';

// Componente para la barra de filtros de reportes
export default function ReportsFiltros({
  search,
  onSearch,
  selectedFecha,
  onFecha,
  selectedResponsable,
  onResponsable,
  selectedArea,
  onArea,
  onLimpiar,
  responsablesOptions = [],
  areasOptions = []
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center mb-6">
      {/* Entrada de búsqueda con icono de lupa */}
      <div className="relative flex-[2_1_15rem] min-w-50 max-w-[21.875rem]">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant">search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar informes..."
          className="w-full py-2.5 pr-3 pl-10 border border-outline-variant rounded-xl text-sm bg-white font-sans outline-none text-on-surface focus:border-primary transition-colors"
        />
      </div>

      {/* Calendario de Fecha */}
      <input
        type="date"
        value={selectedFecha}
        onChange={(e) => onFecha(e.target.value)}
        className="py-2.5 px-4 bg-white border border-outline-variant rounded-2xl text-sm text-on-surface-variant font-sans cursor-pointer outline-none min-w-40 flex-[1_1_10rem] focus:border-primary transition-colors"
        title="Filtrar por fecha"
      />

      {/* Select de Responsable */}
      <div className="flex-[1_1_10rem] min-w-40 z-40">
        <CustomSelect
          value={selectedResponsable}
          onChange={(val) => onResponsable(val)}
          options={[
            { value: "", label: "Responsable: Todos" },
            ...responsablesOptions.map(resp => ({ value: resp, label: resp }))
          ]}
          placeholder="Responsable: Todos"
          className="rounded-2xl"
        />
      </div>

      {/* Select de Área */}
      <div className="flex-[1_1_10rem] min-w-40 z-30">
        <CustomSelect
          value={selectedArea}
          onChange={(val) => onArea(val)}
          options={[
            { value: "", label: "Área: Todas" },
            ...areasOptions.map(area => ({ value: area, label: area }))
          ]}
          placeholder="Área: Todas"
          className="rounded-2xl"
        />
      </div>

      {/* Botón de Limpiar filtros */}
      <button onClick={onLimpiar} className="py-2.5 px-4 bg-transparent border border-outline-variant rounded-lg text-sm font-semibold text-on-surface-variant font-sans cursor-pointer flex items-center gap-1.5 transition-colors duration-200 hover:bg-surface-container-low">
        <span className="material-symbols-outlined">filter_list_off</span>
        Limpiar
      </button>
    </div>
  );
}
