import React, { useState, useMemo } from 'react';
import ModalDetalleIntervencion from './ModalDetalleIntervencion';

// Utils para fechas
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => {
  let day = new Date(year, month, 1).getDay();
  // Ajustar para que Lunes sea 0 y Domingo 6
  return day === 0 ? 6 : day - 1; 
};

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS_SEMANA = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

export default function CalendarBoard({ intervenciones, onUpdateEstado, onDelete, currentUser }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIntervencion, setSelectedIntervencion] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fecha actual local en formato YYYY-MM-DD para marcar "Hoy"
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Calcular celdas del calendario
  const calendarCells = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells = [];

    // Días del mes anterior (padding)
    for (let i = 0; i < firstDay; i++) {
      cells.push({ type: 'empty', key: `empty-${i}` });
    }

    // Días del mes actual
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      // Filtrar intervenciones que coinciden con este día
      const dayIntervenciones = intervenciones.filter(inv => {
        const invDate = inv.fecha_propuesta ? String(inv.fecha_propuesta).split('T')[0] : '';
        if (d === 11) console.log(`Day 11 compare: "${invDate}" === "${dateStr}" ->`, invDate === dateStr, '| raw:', inv.fecha_propuesta, typeof inv.fecha_propuesta);
        return invDate === dateStr;
      });
      
      cells.push({ 
        type: 'day', 
        day: d, 
        dateStr, 
        intervenciones: dayIntervenciones,
        key: `day-${d}` 
      });
    }
    
    // Rellenar hasta completar 42 celdas (6 semanas)
    const totalCells = cells.length;
    for (let i = 0; i < 42 - totalCells; i++) {
      cells.push({ type: 'empty', key: `empty-end-${i}` });
    }

    return cells;
  }, [year, month, intervenciones]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Color de estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Programada': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'Completada': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
  };

  const handleCardClick = (inv) => {
    setSelectedIntervencion(inv);
    setModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col h-full bg-surface-container-lowest/80 rounded-[1.25rem] border border-outline-variant/30 shadow-[0_8px_32px_rgba(4,71,56,0.04)] backdrop-blur-xl overflow-hidden">
        
        {/* Header del Calendario */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-white/60">
        <h3 className="text-xl font-black text-primary m-0 uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-[1.5rem]">calendar_month</span>
          {MESES[month]} {year}
        </h3>
        <div className="flex gap-2 items-center">
          <input 
            type="month" 
            value={`${year}-${String(month + 1).padStart(2, '0')}`}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m] = e.target.value.split('-');
                setCurrentDate(new Date(y, m - 1, 1));
              }
            }}
            className="h-[2.125rem] px-3 rounded-xl border border-outline-variant/40 text-sm font-bold text-on-surface-variant outline-none cursor-pointer bg-white shadow-sm hover:border-primary/50 transition-colors"
          />
          <div className="flex gap-1 bg-white border border-outline-variant/40 rounded-xl p-1 shadow-sm">
            <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 text-xs font-black text-on-surface-variant transition-colors tracking-widest">
              HOY
            </button>
            <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid del Calendario */}
      <div className="flex-1 flex flex-col min-h-0 bg-white/40">
        
        {/* Días de la semana */}
        <div className="grid grid-cols-7 border-b border-outline-variant/30 bg-surface-container-lowest/50">
          {DIAS_SEMANA.map(dia => (
            <div key={dia} className="py-2.5 text-center text-[0.625rem] font-black text-on-surface-variant/80 tracking-widest border-r border-outline-variant/10 last:border-r-0">
              {dia}
            </div>
          ))}
        </div>

        {/* Celdas */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6">
          {calendarCells.map((cell) => (
            <div 
              key={cell.key} 
              className={`border-b border-r border-outline-variant/20 p-1.5 sm:p-2.5 flex flex-col gap-1.5 transition-colors ${cell.type === 'empty' ? 'bg-black/[0.02]' : 'bg-transparent hover:bg-white/60'}`}
            >
              {cell.type === 'day' && (
                <>
                  <div className="flex justify-end">
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      cell.dateStr === todayStr 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-on-surface-variant/70'
                    }`}>
                      {cell.day}
                    </span>
                  </div>
                  
                  {/* Lista de intervenciones en este día */}
                  <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[80px] sm:max-h-[120px] scrollbar-thin scrollbar-thumb-outline-variant/30 scrollbar-track-transparent pr-1">
                    {cell.intervenciones.map(inv => (
                      <div 
                        key={inv.id}
                        onClick={() => handleCardClick(inv)}
                        className={`text-[0.625rem] sm:text-xs font-bold px-2 py-1 sm:py-1.5 rounded-lg cursor-pointer truncate border transition-all hover:scale-[1.02] shadow-sm flex items-center gap-1 ${getEstadoColor(inv.estado)}`}
                        title={inv.tipo_intervencion}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
                        <span className="truncate">{inv.tipo_intervencion}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Cierre del div principal del calendario */}
      </div>

      {/* Modal - Movido FUERA del div con backdrop-blur para evitar el problema de CSS Stacking Context */}
      <ModalDetalleIntervencion 
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedIntervencion(null); }}
        intervencion={selectedIntervencion}
        onUpdateEstado={onUpdateEstado}
        onDelete={onDelete}
        currentUser={currentUser}
      />
    </>
  );
}
