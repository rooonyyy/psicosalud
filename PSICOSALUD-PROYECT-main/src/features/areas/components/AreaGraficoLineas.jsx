import React, { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AreaGraficoLineas({ area, areaResponses = [], dateFilterType = 'all', customStartDate, customEndDate }) {
  const areaNombre = area ? area.nombre : 'Área no disponible';

  // Calcular el historial de forma reactiva basado en los filtros y datos
  const hist = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    let minDate, maxDate;
    let isDaily = dateFilterType === 'today' || dateFilterType === '7days' || dateFilterType === '30days';

    if (dateFilterType === 'thisYear') {
      minDate = new Date(now.getFullYear(), 0, 1);
      maxDate = new Date(now.getFullYear(), 11, 1);
    } else if (dateFilterType === 'today') {
      minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilterType === '7days') {
      minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilterType === '30days') {
      minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilterType === 'custom' && customStartDate && customEndDate) {
      minDate = new Date(customStartDate);
      maxDate = new Date(customEndDate);
      const diffDays = Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24));
      if (diffDays <= 31) isDaily = true;
    } else {
      // 'all' o fallback: basado en los datos
      if (areaResponses.length > 0) {
        const dates = areaResponses.map(r => new Date(r.created_at || r.fecha).getTime());
        minDate = new Date(Math.min(...dates));
        maxDate = new Date(Math.max(...dates));
      } else {
        minDate = new Date(); minDate.setMonth(now.getMonth() - 5);
        maxDate = new Date();
      }
    }

    if (isDaily) {
      let current = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
      const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
      if (end < current) end.setTime(current.getTime());

      let safety = 0;
      while (current <= end && safety < 60) {
        last6Months.push({
          name: current.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).trim(),
          day: current.getDate(),
          month: current.getMonth(),
          year: current.getFullYear(),
          wellbeing: 0, stress: 0, count: 0
        });
        current.setDate(current.getDate() + 1);
        safety++;
      }
      
      if (last6Months.length === 1) {
        const single = last6Months[0];
        const prev = new Date(single.year, single.month, single.day - 1);
        const next = new Date(single.year, single.month, single.day + 1);
        last6Months.unshift({
          name: prev.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).trim(),
          day: prev.getDate(), month: prev.getMonth(), year: prev.getFullYear(), wellbeing: 0, stress: 0, count: 0
        });
        last6Months.push({
          name: next.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).trim(),
          day: next.getDate(), month: next.getMonth(), year: next.getFullYear(), wellbeing: 0, stress: 0, count: 0
        });
      }
    } else {
      let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      if (end < current) end.setTime(current.getTime());

      let safety = 0;
      while (current <= end && safety < 60) {
        const yearFmt = current.getFullYear() !== now.getFullYear() ? '2-digit' : undefined;
        last6Months.push({
          name: current.toLocaleDateString('es-ES', { month: 'short', year: yearFmt }).trim(),
          month: current.getMonth(),
          year: current.getFullYear(),
          wellbeing: 0, stress: 0, count: 0
        });
        current.setMonth(current.getMonth() + 1);
        safety++;
      }

      if (last6Months.length === 1) {
        const single = last6Months[0];
        const prev = new Date(single.year, single.month - 1, 1);
        const next = new Date(single.year, single.month + 1, 1);
        last6Months.unshift({
          name: prev.toLocaleDateString('es-ES', { month: 'short', year: prev.getFullYear() !== now.getFullYear() ? '2-digit' : undefined }).trim(),
          month: prev.getMonth(), year: prev.getFullYear(), wellbeing: 0, stress: 0, count: 0
        });
        last6Months.push({
          name: next.toLocaleDateString('es-ES', { month: 'short', year: next.getFullYear() !== now.getFullYear() ? '2-digit' : undefined }).trim(),
          month: next.getMonth(), year: next.getFullYear(), wellbeing: 0, stress: 0, count: 0
        });
      }
    }

    areaResponses.forEach(r => {
      const date = new Date(r.created_at || r.fecha);
      const d = date.getDate();
      const m = date.getMonth();
      const y = date.getFullYear();
      
      const bucket = isDaily 
        ? last6Months.find(b => b.day === d && b.month === m && b.year === y)
        : last6Months.find(b => b.month === m && b.year === y);
      if (bucket) {
        const score = r.puntaje_total || 0;
        const stress = Math.min(100, Math.max(0, score));
        const wellbeing = 100 - stress;
        bucket.stress += stress;
        bucket.wellbeing += wellbeing;
        bucket.count++;
      }
    });

    const wellbeingData = [];
    const stressData = [];
    last6Months.forEach(b => {
      if (b.count > 0) {
        wellbeingData.push(Math.round(b.wellbeing / b.count));
        stressData.push(Math.round(b.stress / b.count));
      } else {
        // Usar 0 en lugar de valores base para mostrar que no hay actividad en esos meses
        wellbeingData.push(0);
        stressData.push(0);
      }
    });

    return { bienestar: wellbeingData, estres: stressData, labels: last6Months.map(b => b.name) };
  }, [areaResponses]);

  const data = {
    labels: hist.labels,
    datasets: [
      {
        label: 'Bienestar',
        data: hist.bienestar,
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Estrés',
        data: hist.estres,
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 10,
        titleFont: { size: 12, weight: '600', family: 'Inter' },
        bodyFont: { size: 13, family: 'Inter' },
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true, max: 100,
        grid: { color: '#f1f5f9' },
        ticks: { color: '#94a3b8', font: { size: 11 }, callback: v => `${v}%` },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-container-high shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-6 flex flex-col min-w-0">
      <div className="mb-5 flex justify-between items-end">
        <div>
          <h3 className="text-base font-bold text-primary mb-1">
            Evolución del Estrés vs Bienestar
          </h3>
          <p className="text-xs text-on-surface-variant">
            Tendencia en el periodo seleccionado — {areaNombre}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
            <span className="text-xs text-on-surface-variant font-medium">Bienestar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
            <span className="text-xs text-on-surface-variant font-medium">Estrés</span>
          </div>
        </div>
      </div>
      <div className="h-60 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
