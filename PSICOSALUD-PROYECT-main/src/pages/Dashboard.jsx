import React from "react";
import DashboardStats from '../features/dashboard/components/DashboardStats';
import DashboardCharts from '../features/dashboard/components/DashboardCharts';
import RecentActivity from '../features/dashboard/components/RecentActivity';
import AccionesRapidas from '../features/dashboard/components/AccionesRapidas';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomSelect from '../components/ui/CustomSelect';
import { accionesRapidas } from "../features/dashboard/utils/dashboard.utils";
import { useDashboardData } from "../features/dashboard/hooks/useDashboardData";

export default function Dashboard() {
  const {
    isLoading,
    rawData,
    selectedQuizId,
    setSelectedQuizId,
    dateFilterType,
    setDateFilterType,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    computedKpis,
    computedChartsData
  } = useDashboardData();
  if (isLoading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  return (
    <div className="bg-background min-h-screen px-12 py-9">

      {/* ———————————————————— Encabezado ———————————————————— */}
      <header className="flex justify-between items-center mb-8 gap-6">
        <div className="flex-1">
          <h2 className="text-[2rem] font-black text-primary tracking-tight mb-1.5">
            Dashboard General
          </h2>
          <p className="text-sm text-on-surface-variant m-0">
            Resumen de estado y métricas de bienestar organizacional.
          </p>
        </div>

        {/* ——————————— Barra de Filtros interactiva ——————————— */}
        <div className="flex items-end gap-4 bg-white px-6 py-4 rounded-2xl border border-surface-container-high shadow-[0_4px_20px_rgba(4,71,56,0.04)] transition-all duration-300 ease-in-out">
          {/* Filtro por Cuestionario */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.6875rem] font-bold text-primary uppercase tracking-widest">Cuestionario</span>
            <div className="relative flex items-center z-40 w-64">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-lg pointer-events-none z-10">quiz</span>
              <CustomSelect
                value={selectedQuizId}
                onChange={(val) => setSelectedQuizId(val)}
                options={rawData.quizzes.map(q => ({ value: q.id, label: q.titulo }))}
                placeholder="Seleccione un cuestionario"
                innerClassName="!pl-11"
              />
            </div>
          </div>

          {/* Filtro por Rango Temporal */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.6875rem] font-bold text-primary uppercase tracking-widest">Fecha</span>
            <div className="relative flex items-center z-40 w-48">
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
      <section className="mb-7">
        <DashboardStats kpiData={computedKpis} />
      </section>

      {/* ————————————————————————— Gráficos ————————————————————————— */}
      <section className="mb-7">
        <DashboardCharts
          stressEvolutionData={computedChartsData.stressEvolution}
          stressDistributionData={computedChartsData.stressDistribution}
        />
      </section>

      {/* ———————————————— Actividad + Acciones ———————————————— */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start mb-7">
        <RecentActivity recentActivity={rawData.recent} />
        <AccionesRapidas acciones={accionesRapidas} />
      </section>

    </div>
  );
}

