import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AreaGraficoDistribucion({ distributionData }) {
  if (!distributionData || distributionData.labels.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-surface-container-high shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-6 flex flex-col min-w-0 h-full items-center justify-center">
        <p className="text-center text-[0.8125rem] text-on-surface-variant">
          Sin datos suficientes
        </p>
      </div>
    );
  }

  let maxIndex = 0;
  let maxVal = 0;
  let totalPersonas = 0;
  const dataArray = distributionData.datasets[0].data;
  dataArray.forEach((val, idx) => {
    totalPersonas += val;
    if (val > maxVal) {
      maxVal = val;
      maxIndex = idx;
    }
  });

  const pct = totalPersonas > 0 ? Math.round((maxVal / totalPersonas) * 100) : 0;
  const mainLabel = distributionData.labels[maxIndex];
  const hasData = totalPersonas > 0;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: hasData,
        backgroundColor: '#1e293b',
        padding: 12,
        bodyFont: { size: 14, family: "'Inter', sans-serif" },
        cornerRadius: 8,
        callbacks: {
            label: function(context) {
                let label = context.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed !== null) {
                    label += context.parsed;
                }
                return label + ' personas';
            }
        }
      },
    },
  };
  const chartData = hasData ? distributionData : {
    labels: ['Sin datos'],
    datasets: [{
      data: [1],
      backgroundColor: ['#f1f5f9'],
      hoverBackgroundColor: ['#e2e8f0'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-container-high shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-6 flex flex-col min-w-0 h-full">
      <div className="mb-5 text-center">
        <h3 className="text-base font-bold text-primary mb-1">
          Distribución de Resultados
        </h3>
        <p className="text-xs text-on-surface-variant">
          Empleados en cada nivel del área
        </p>
      </div>

      <div className="relative h-45 shrink-0">
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
          <span className="text-[1.75rem] font-extrabold text-primary leading-none tracking-[-0.5px]">
            {hasData ? `${pct}%` : '0%'}
          </span>
          <span className="text-[0.6875rem] text-on-surface-variant mt-1 max-w-25 text-center leading-[1.2]">
            {hasData ? mainLabel : 'Sin registros'}
          </span>
        </div>
        <div className="relative w-full h-full z-10">
          <Doughnut data={chartData} options={options} />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-auto pt-5">
        {distributionData.labels.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5">
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: distributionData.datasets[0].backgroundColor[i] }}
            ></span>
            <span className="text-[0.6875rem] text-on-surface-variant font-medium">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
