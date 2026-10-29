import React, { useState, useEffect } from 'react';
import { geminiService } from '../api/gemini.service';

export default function ModalPlanAccion({ isOpen, onClose, areaNombre, sugerenciaText, onOpenIntervencion, areaData }) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [error, setError] = useState(false);

  const generatePlan = (forceRefetch = false) => {
    if (!isOpen) return;
    setIsGenerating(true);
    setError(false);

    const estresVal = areaData?.estres ?? 0;
    const partVal = areaData?.participacion ?? 0;
    const qt = areaData?.quizType || 'General';
    const an = areaData?.areaNombre || areaNombre;
    
    const cacheKey = `psicoia_plan_${an}_${estresVal}_${partVal}_${qt}`;

    if (!forceRefetch) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setRecomendaciones(JSON.parse(cached));
          setIsGenerating(false);
          return;
        } catch(e) {}
      }
    }

    geminiService.generarPlanAccion({
      areaNombre: an,
      estres: estresVal,
      participacion: partVal,
      quizType: qt,
      nivelEstres: areaData?.nivelEstres || 'MEDIO',
    })
      .then((recs) => {
        localStorage.setItem(cacheKey, JSON.stringify(recs));
        setRecomendaciones(recs);
      })
      .catch((err) => {
        console.error('Error al generar plan:', err);
        setError(true);
      })
      .finally(() => {
        setIsGenerating(false);
      });
  };

  useEffect(() => {
    if (!isOpen) {
      setRecomendaciones([]);
      setError(false);
      return;
    }
    generatePlan(false);
  }, [isOpen]);

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Plan de Acción - ${areaNombre}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; padding: 40px; }
            h1 { color: #044738; font-size: 24px; margin-bottom: 5px; }
            h2 { color: #555; font-size: 14px; margin-top: 0; margin-bottom: 30px; font-weight: normal; }
            .context { background-color: #f0f7f5; padding: 15px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #d1e2dc; }
            .context h3 { margin-top: 0; font-size: 12px; color: #044738; text-transform: uppercase; }
            .context p { font-size: 14px; margin-bottom: 0; }
            .step { display: flex; margin-bottom: 25px; page-break-inside: avoid; }
            .step-number { background: #e0ece7; color: #044738; width: 30px; height: 30px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
            .step-content h4 { margin: 0 0 5px 0; font-size: 16px; color: #111; }
            .step-content p { margin: 0 0 10px 0; font-size: 14px; color: #555; }
            .step-content ul { margin: 0; padding-left: 20px; font-size: 14px; color: #555; }
            .disclaimer { margin-top: 40px; font-size: 11px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
          <h1>Plan de Acción</h1>
          <h2>Generado para el área de <strong>${areaNombre}</strong></h2>
          
          <div class="context">
            <h3>Contexto del Diagnóstico</h3>
            <p>${sugerenciaText || 'Análisis basado en las métricas recientes del área.'}</p>
          </div>

          <div class="recommendations">
            ${recomendaciones.map((rec, index) => `
              <div class="step">
                <div class="step-number">${index + 1}</div>
                <div class="step-content">
                  <h4>${rec.titulo}</h4>
                  <p>${rec.descripcion}</p>
                  ${rec.bullets && rec.bullets.length > 0 ? `
                    <ul>
                      ${rec.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
                    </ul>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="disclaimer">
            Aviso: Los resultados generados por IA pueden tener sesgos. Deben ser analizados por un profesional y tomarse como una herramienta de apoyo.
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Dar tiempo corto para asegurar que el navegador haya renderizado
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-[1000]">
      <div className="bg-white rounded-2xl p-8 w-[40rem] max-w-[90%] shadow-[0_8px_32px_rgba(4,71,56,0.15)] flex flex-col gap-6 font-sans max-h-[90vh] overflow-hidden">
        
        {/* Encabezado con icono y título */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="bg-primary/10 text-primary w-14 h-14 rounded-full flex items-center justify-center shrink-0 relative">
            <span className="material-symbols-outlined text-[2rem]">psychology_alt</span>
            {isGenerating && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-primary m-0">Plan de Acción — PsicoIA</h3>
          <p className="text-sm text-on-surface-variant m-0">
            Generado por IA para el área de <strong>{areaNombre}</strong>
          </p>
        </div>

        {/* Body scrollable */}
        <div className="overflow-y-auto pr-2 -mr-2">
          
          {/* Contexto del diagnóstico */}
          <div className="bg-primary/5 rounded-xl p-5 mb-6 border border-outline-variant/50">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 m-0">Contexto del Diagnóstico</h4>
            <p className="text-sm text-on-surface leading-relaxed m-0">
              {sugerenciaText || 'Análisis basado en las métricas recientes del área.'}
            </p>
          </div>

          {/* Recomendaciones */}
          <div className="space-y-6 min-h-[12rem]">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 py-6 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl animate-spin text-primary">autorenew</span>
                <p className="text-sm font-semibold text-center">
                  PsicoIA está analizando las métricas y redactando el plan de intervención...
                </p>
                <p className="text-xs text-on-surface-variant/60 text-center">Consultando modelo analítico · Esto puede tomar unos segundos</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="material-symbols-outlined text-4xl text-error">error_outline</span>
                <p className="text-sm font-semibold text-on-surface">No se pudo generar el plan de acción</p>
                <p className="text-xs text-on-surface-variant max-w-[22rem]">
                  Hubo un error al consultar PsicoIA. Verifica tu conexión a internet e intenta abrir el modal nuevamente.
                </p>
              </div>
            ) : recomendaciones.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">inbox</span>
                <p className="text-sm text-on-surface-variant">No se recibieron recomendaciones de PsicoIA.</p>
              </div>
            ) : (
              recomendaciones.map((rec, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-on-surface text-base mb-1 m-0">{rec.titulo}</h5>
                    <p className="text-sm text-on-surface-variant mb-2 m-0">
                      {rec.descripcion}
                    </p>
                    {rec.bullets && rec.bullets.length > 0 && (
                      <ul className="text-sm text-on-surface-variant list-disc pl-5 m-0 space-y-1">
                        {rec.bullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col items-center gap-4 mt-2 pt-4 border-t border-outline-variant/30">
          <div className="flex w-full justify-between items-center">
            <div className="flex gap-2">
              <button 
                onClick={() => generatePlan(true)}
                disabled={isGenerating}
                className="px-4 py-2.5 rounded-lg border border-outline-variant bg-transparent font-semibold text-sm text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Actualizar Plan de Acción"
              >
                <span className="material-symbols-outlined text-[1.125rem]">refresh</span>
                <span className="hidden sm:inline">Regenerar</span>
              </button>
              <button 
                onClick={handleExportPDF}
                disabled={isGenerating || recomendaciones.length === 0}
                className="px-4 py-2.5 rounded-lg border border-outline-variant bg-transparent font-semibold text-sm text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Exportar a PDF"
              >
                <span className="material-symbols-outlined text-[1.125rem]">picture_as_pdf</span>
                <span className="hidden sm:inline">Exportar PDF</span>
              </button>
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-2.5 rounded-lg border-none bg-primary font-semibold text-sm text-white hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
          <p className="text-[0.65rem] text-on-surface-variant/80 leading-[1.4] italic text-center max-w-[90%] m-0">
            <strong>Aviso:</strong> Los resultados generados por IA pueden tener sesgos. Deben ser analizados por un profesional y tomarse como una herramienta de apoyo, no como una solución clínica aplicable.
          </p>
        </div>

      </div>
    </div>
  );
}
