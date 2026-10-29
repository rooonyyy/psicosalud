import React from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import AreaKpiCards from '../features/areas/components/AreaKpiCards';
import AreaGraficoLineas from '../features/areas/components/AreaGraficoLineas';
import AreaGraficoDistribucion from '../features/areas/components/AreaGraficoDistribucion';
import AreaAlertas from '../features/areas/components/AreaAlertas';
import CustomSelect from '../components/ui/CustomSelect';
import { useAreasData } from '../features/areas/hooks/useAreasData';

export default function Areas() {
  const {
    isLoading,
    rawData,
    seleccionadaId,
    setSeleccionadaId,
    selectedQuizId,
    setSelectedQuizId,
    dateFilterType,
    setDateFilterType,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    filteredResponses,
    computedAreas,
    seleccionada,
    seleccionadaResponses,
    distribucionArea,
    quizType,
    fechaReporte
  } = useAreasData();
  if (isLoading) {
    return <LoadingSpinner message="Cargando áreas..." />;
  }

  return (
    <div className="bg-background min-h-screen px-12 py-9">

      {/* ———————————————————— Encabezado ———————————————————— */}
      <header className="flex justify-between items-center mb-8 gap-6">
        <div className="flex-1">
          <h2 className="text-[1.75rem] font-extrabold text-primary mb-1.5">
            Dashboard de Áreas
          </h2>
          <p className="text-sm text-on-surface-variant m-0">
            Análisis detallado de bienestar por departamento
          </p>
        </div>

        {/* ————————————————————— Barra de Filtros interactiva ————————————————————— */}
        <div className="flex items-end gap-4 bg-white px-6 py-4 rounded-2xl border border-surface-container-high shadow-[0_4px_20px_rgba(4,71,56,0.04)] transition-all duration-300 ease-in-out">
          {/* Selector de Área */}
          {computedAreas.length > 0 && (
            <div className="flex flex-col gap-1.5 z-50">
              <span className="text-[0.6875rem] font-bold text-primary uppercase tracking-widest">Área</span>
              <div className="relative flex items-center w-56">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-lg pointer-events-none z-10">domain</span>
                <CustomSelect
                  value={seleccionada?.nombre || ''}
                  onChange={(val) => {
                    const found = computedAreas.find(a => a.nombre === val);
                    if (found) setSeleccionadaId(found.id);
                  }}
                  options={computedAreas.map(a => ({ value: a.nombre, label: a.nombre }))}
                  placeholder="Seleccionar área"
                  innerClassName="!pl-11"
                />
              </div>
            </div>
          )}

          {/* Selector de Cuestionario */}
          <div className="flex flex-col gap-1.5 z-40 w-64">
            <span className="text-[0.6875rem] font-bold text-primary uppercase tracking-widest">Cuestionario</span>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-lg pointer-events-none z-10">quiz</span>
              <CustomSelect
                value={selectedQuizId}
                onChange={(val) => setSelectedQuizId(val)}
                options={rawData.quizzes.map(q => ({ value: q.id, label: q.titulo }))}
                placeholder="Seleccione cuestionario"
                innerClassName="!pl-11"
              />
            </div>
          </div>

          {/* Filtro por Rango Temporal */}
          <div className="flex flex-col gap-1.5 z-30 w-48">
            <span className="text-[0.6875rem] font-bold text-primary uppercase tracking-widest">Fecha</span>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-lg pointer-events-none z-10">calendar_today</span>
              <CustomSelect
                value={dateFilterType}
                onChange={(val) => setDateFilterType(val)}
                options={[
                  { value: "all", label: "Histórico" },
                  { value: "today", label: "Hoy" },
                  { value: "7days", label: "Últimos 7 días" },
                  { value: "30days", label: "Últimos 30 días" },
                  { value: "thisYear", label: "Este año" },
                  { value: "custom", label: "Rango personalizado" }
                ]}
                placeholder="Histórico"
                innerClassName="!pl-11"
              />
            </div>
          </div>

          {/* Inputs de fecha para rango personalizado */}
          {dateFilterType === 'custom' && (
            <div className="flex gap-3 items-end animate-[fadeInFilter_0.25s_ease-out_forwards]">
              <div className="flex flex-col gap-1.5">
                <span className="text-[0.6875rem] font-bold text-primary uppercase tracking-widest">Desde</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="h-[2.625rem] px-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm font-medium text-on-surface outline-none cursor-pointer font-sans transition-all duration-200 hover:border-outline focus:border-primary focus:shadow-[0_0_0_3px_rgba(4,71,56,0.12)]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[0.6875rem] font-bold text-primary uppercase tracking-widest">Hasta</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="h-[2.625rem] px-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm font-medium text-on-surface outline-none cursor-pointer font-sans transition-all duration-200 hover:border-outline focus:border-primary focus:shadow-[0_0_0_3px_rgba(4,71,56,0.12)]"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ——————————— Título dinámico del área seleccionada ——————————— */}
      {seleccionada && (
        <div className="flex items-center gap-3.5 mb-7 p-[1.125rem_1.5rem] bg-white rounded-xl border border-surface-container-high shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[1.625rem]">
              monitoring
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-on-surface m-0 leading-[1.3]">
              {seleccionada.nombre}
            </h3>
            <p className="text-[0.8125rem] text-on-surface-variant m-0 mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[0.9375rem]">groups</span>
              {seleccionada.total_trabajadores || 0} trabajadores registrados en esta área
            </p>
          </div>
        </div>
      )}

      {seleccionada ? (
        <>
          {/* ————————————————————————— KPIs ————————————————————————— */}
          <section className="mb-7">
            <AreaKpiCards area={seleccionada} />
          </section>

          <section className="grid grid-cols-[1fr_320px] gap-5 mb-7 min-w-0">
            <AreaGraficoLineas 
              area={seleccionada} 
              areaResponses={seleccionadaResponses} 
              dateFilterType={dateFilterType}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
            />
            <AreaGraficoDistribucion distributionData={distribucionArea} />
          </section>

          {/* ——————————————————————— Alertas ——————————————————————— */}
          <section>
            <AreaAlertas 
              area={seleccionada} 
              fechaReporte={fechaReporte}
              quizType={quizType}
            />
          </section>
        </>
      ) : (
        <div className="text-center p-10 bg-white rounded-2xl border border-surface-container-high">
          No hay áreas registradas en el sistema.
        </div>
      )}

    </div>
  );
}


