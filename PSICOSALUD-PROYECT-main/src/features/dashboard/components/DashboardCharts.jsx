import React from "react";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

// Componente para renderizar la sección de gráficos del Dashboard usando Chart.js
export default function DashboardCharts({ stressEvolutionData, stressDistributionData }) {
    if (!stressEvolutionData || !stressDistributionData) return null;

    // Calcular valores dinámicos para el centro de la dona
    const distribData = stressDistributionData.datasets[0].data;
    const distribLabels = stressDistributionData.labels;
    const totalDistrib = distribData.reduce((a, b) => a + b, 0);
    
    let centerPercent = 0;
    let centerLabel = 'Sin registros';
    let chartData = stressDistributionData;

    if (totalDistrib > 0) {
        const maxVal = Math.max(...distribData);
        const maxIndex = distribData.indexOf(maxVal);
        centerPercent = Math.round((maxVal / totalDistrib) * 100);
        centerLabel = `${distribLabels[maxIndex]}`;
    } else {
        chartData = {
            labels: ['Sin datos'],
            datasets: [{
                data: [1],
                backgroundColor: ['#f1f5f9'],
                hoverBackgroundColor: ['#e2e8f0'],
                borderWidth: 0,
            }]
        };
    }

    const lineOptions = {
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
                titleFont: { size: 12, weight: '600' },
                bodyFont: { size: 13 },
            }
        },
        scales: {
            y: {
                beginAtZero: true, max: 100,
                grid: { color: '#f1f5f9', drawBorder: false },
                ticks: { color: '#94a3b8', font: { size: 11 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { size: 11 } }
            }
        }
    };

    const doughnutOptions = {
        responsive: true, maintainAspectRatio: false, cutout: '78%',
        plugins: {
            legend: {
                display: false
            },
            tooltip: { 
                enabled: totalDistrib > 0,
                backgroundColor: '#1e293b', padding: 10, cornerRadius: 8 
            }
        }
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 min-w-0">

            <div className="bg-white rounded-2xl border border-surface-container-high shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-6 min-w-0 overflow-hidden">
                <div className="mb-5 flex justify-between items-end">
                    <div>
                        <h3 className="text-base font-bold text-primary mb-1 m-0">
                            Evolución de Niveles de Estrés
                        </h3>
                        <p className="text-xs text-on-surface-variant m-0">
                            Promedio general ponderado de estrés vs bienestar
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
                            <span className="text-xs text-on-surface-variant font-medium">Bienestar</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                            <span className="text-xs text-on-surface-variant font-medium">Estrés</span>
                        </div>
                    </div>
                </div>
                <div className="relative w-full h-60">
                    <Line options={lineOptions} data={stressEvolutionData} />
                </div>
            </div>

            {/* Gráfico de Dona */}
            <div className="bg-white rounded-2xl border border-surface-container-high shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-6 min-w-0 overflow-hidden flex flex-col">
                <div className="mb-5 text-center">
                    <h3 className="text-base font-bold text-primary mb-1 m-0">
                        Distribución de Resultados
                    </h3>
                    <p className="text-xs text-on-surface-variant m-0">
                        Agrupación según los rangos del cuestionario
                    </p>
                </div>
                <div className="relative w-full h-55">
                    {/* Centro de la dona (Detrás del canvas) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                        <span className="text-3xl font-extrabold text-primary leading-none">{centerPercent}%</span>
                        <span className="text-xs text-on-surface-variant mt-1 text-center max-w-[6.875rem] inline-block leading-snug">
                            {centerLabel}
                        </span>
                    </div>
                    {/* Canvas (encima) */}
                    <div className="relative w-full h-full z-10">
                        <Doughnut options={doughnutOptions} data={chartData} />
                    </div>
                </div>

                {/* Leyenda HTML Personalizada (Evita que el canvas cambie de tamaño al haber muchos items) */}
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-6">
                    {distribLabels.map((label, i) => (
                        <div key={label} className="flex items-center gap-2">
                            <span 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: stressDistributionData.datasets[0].backgroundColor[i] }}
                            ></span>
                            <span className="text-xs text-on-surface-variant font-medium">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
