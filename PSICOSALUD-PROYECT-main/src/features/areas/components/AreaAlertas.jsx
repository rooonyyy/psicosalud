import React, { useState, useCallback, useEffect } from 'react';
import ModalIntervencion from './ModalIntervencion';
import ModalPlanAccion from './ModalPlanAccion';
import { geminiService } from '../api/gemini.service';

// Componente para renderizar la sección inferior de alertas críticas y sugerencias de PsicoIA
export default function AreaAlertas({ area, fechaReporte, quizType }) {
  const [modalIntervencionOpen, setModalIntervencionOpen] = useState(false);
  const [modalPlanOpen, setModalPlanOpen] = useState(false);

  // Estado de la consulta a PsicoIA (Gemini)
  const [iaTexto, setIaTexto] = useState('');
  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState(false);
  const [iaConsultado, setIaConsultado] = useState(false);

  const areaNombre = area ? area.nombre : 'Área no seleccionada';
  const sinDatos = !area || (area.bienestar === 0 && area.estres === 0);
  const estresValue = area ? area.estres : 0;
  const participacion = area ? area.participacion : 0;

  // Restaurar de caché o limpiar al cambiar de área o recargar
  useEffect(() => {
    if (sinDatos) {
      setIaTexto('');
      setIaConsultado(false);
      return;
    }
    const cacheKey = `psicoia_sugerencia_${areaNombre}_${estresValue}_${participacion}_${quizType}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setIaTexto(cached);
      setIaConsultado(true);
    } else {
      setIaTexto('');
      setIaConsultado(false);
    }
    setIaError(false);
  }, [areaNombre, estresValue, participacion, quizType, sinDatos]);

  // Función para consultar PsicoIA
  const handleConsultarIA = useCallback(async (forceRefetch = false) => {
    if (iaLoading || sinDatos) return;
    setIaLoading(true);
    setIaError(false);
    
    const cacheKey = `psicoia_sugerencia_${areaNombre}_${estresValue}_${participacion}_${quizType}`;

    try {
      if (!forceRefetch) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setIaTexto(cached);
          setIaConsultado(true);
          setIaLoading(false);
          return;
        }
      }

      const texto = await geminiService.generarSugerencia({
        areaNombre,
        estres: estresValue,
        participacion,
        quizType: quizType || 'General',
        nivelEstres: estresValue >= 60 ? 'ALTO' : estresValue >= 30 ? 'MEDIO' : 'BAJO',
      });
      
      localStorage.setItem(cacheKey, texto);
      setIaTexto(texto);
      setIaConsultado(true);
    } catch (err) {
      console.error(err);
      setIaError(err.message || 'Error desconocido');
    } finally {
      setIaLoading(false);
    }
  }, [areaNombre, estresValue, participacion, quizType, sinDatos, iaLoading]);

  // Lógica de Temporalidad (Reporte Histórico vs Actual)
  let esHistorico = false;
  if (fechaReporte) {
    const fecha = new Date(fechaReporte);
    const hoy = new Date();
    const diasDiferencia = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    if (diasDiferencia > 30) {
      esHistorico = true;
    }
  }

  // Vocabulario Dinámico por Quiz
  const tipoEncuesta = quizType || 'General';
  const termRiesgo = tipoEncuesta === 'Clima Laboral' ? 'Insatisfacción' : (tipoEncuesta === 'NOM-035' ? 'Riesgo Psicosocial' : 'Burnout');
  const termDiagnostico = tipoEncuesta === 'Clima Laboral' ? 'insatisfacción laboral' : (tipoEncuesta === 'NOM-035' ? 'factores de riesgo' : 'nivel de estrés');

  // Lógica Dinámica Real para la Alerta (basada en estres y participacion)
  let nivelEstres = 'BAJO';
  let cardStyles = {
    cardBg: 'bg-primary/5',
    borderColor: 'border-primary/30',
    sidebarBg: 'bg-primary',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    iconName: 'check_circle',
    buttonBg: 'bg-primary',
    buttonHover: 'hover:bg-primary/90',
    buttonIcon: 'calendar_add_on',
    buttonText: 'Programar Actividad'
  };
  let textoAlerta = '';

  if (sinDatos) {
    textoAlerta = 'No hay suficientes respuestas para generar un diagnóstico.';
    cardStyles = {
      cardBg: 'bg-surface-container-lowest',
      borderColor: 'border-outline-variant/50',
      sidebarBg: 'bg-outline-variant',
      iconBg: 'bg-surface-container-high',
      iconColor: 'text-on-surface-variant',
      iconName: 'hourglass_empty',
      buttonBg: 'bg-primary',
      buttonHover: 'hover:bg-primary/90',
      buttonIcon: 'calendar_add_on',
      buttonText: 'Programar Actividad'
    };
  } else if (estresValue >= 60) {
    nivelEstres = 'ALTO';
    cardStyles = {
      cardBg: 'bg-[#fef2f2]',
      borderColor: 'border-[#fecaca]',
      sidebarBg: 'bg-error',
      iconBg: 'bg-error-container',
      iconColor: 'text-error',
      iconName: 'warning',
      buttonBg: 'bg-error',
      buttonHover: 'hover:opacity-[0.85]',
      buttonIcon: 'calendar_add_on',
      buttonText: 'Programar Intervención Urgente'
    };
    if (participacion < 50) {
      textoAlerta = `Alta presencia de ${termDiagnostico} cruzando el umbral crítico (${estresValue}%). Además, la baja participación (${participacion}%) sugiere desmotivación. Requiere intervención inmediata.`;
    } else {
      textoAlerta = `Alta participación (${participacion}%) con métricas críticas (${estresValue}%). Los datos son concluyentes para iniciar acciones preventivas urgentes contra el ${termRiesgo}.`;
    }
  } else if (estresValue >= 30) {
    nivelEstres = 'MEDIO';
    cardStyles = {
      cardBg: 'bg-[#fffbeb]',
      borderColor: 'border-[#fde68a]',
      sidebarBg: 'bg-[#d97706]',
      iconBg: 'bg-[#fef3c7]',
      iconColor: 'text-[#d97706]',
      iconName: 'error',
      buttonBg: 'bg-[#d97706]',
      buttonHover: 'hover:opacity-[0.85]',
      buttonIcon: 'calendar_add_on',
      buttonText: 'Programar Intervención'
    };
    if (participacion < 50) {
      textoAlerta = `Métricas de ${termDiagnostico} moderadas. La participación es muy baja (${participacion}%), se sugiere fomentar encuestas focalizadas para mayor precisión.`;
    } else {
      textoAlerta = `Riesgo moderado de ${termRiesgo}. Revisar los indicadores en grupos específicos para evitar que la situación escale a niveles críticos.`;
    }
  } else {
    textoAlerta = `Niveles óptimos. El bienestar se mantiene estable con una participación del ${participacion}%. Continuar monitoreo periódico.`;
  }

  // Override de estilos si es un reporte Histórico
  if (esHistorico) {
    cardStyles = {
      cardBg: 'bg-surface-container-lowest',
      borderColor: 'border-outline-variant/50',
      sidebarBg: 'bg-outline-variant',
      iconBg: 'bg-surface-container',
      iconColor: 'text-on-surface-variant',
      iconName: 'history',
      buttonBg: 'bg-surface-container-high text-on-surface-variant',
      buttonHover: 'hover:bg-outline-variant/30',
      buttonIcon: 'visibility',
      buttonText: 'Ver Histórico de Intervenciones'
    };
    textoAlerta = `Reporte histórico archivado. Nivel de ${termDiagnostico} registrado: ${estresValue}%. ` +
                  (estresValue >= 60 ? `Se requirieron acciones críticas contra el ${termRiesgo}.` : 'No se detectaron crisis mayores en su momento.');
  }

  // Motor Lógico de PsicoIA basado en variables reales
  let sugerenciaIA = <></>;
  if (sinDatos) {
     sugerenciaIA = <>Aún no hay suficientes respuestas en esta área para que el motor analítico recomiende una estrategia personalizada.</>;
  } else if (estresValue >= 60) {
     sugerenciaIA = (
       <>
         El análisis de las métricas indica un <strong>riesgo alto de {termRiesgo}</strong>. 
         Con una participación del {participacion}%, se recomienda urgentemente implementar{' '}
         <strong>talleres grupales de contención</strong> y{' '}
         <strong>sesiones de feedback 1-a-1</strong> directas con los líderes para investigar el detonante.
       </>
     );
  } else if (estresValue >= 30) {
     sugerenciaIA = (
       <>
         Los datos sugieren fricciones incipientes asociadas a {termDiagnostico}. Se recomienda iniciar{' '}
         <strong>encuestas de clima breves y focalizadas</strong> y{' '}
         evaluar la situación actual a mediano plazo.
       </>
     );
  } else {
     sugerenciaIA = (
       <>
         Las métricas son altamente favorables. Se sugiere continuar promoviendo el programa de{' '}
         <strong>reconocimiento laboral</strong> y{' '}
         <strong>beneficios flexibles</strong> para mantener este estándar.
       </>
     );
  }

  if (esHistorico) {
     sugerenciaIA = <>Análisis predictivo de PsicoIA no disponible para reportes históricos archivados.</>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-5">
        {/* ── Tarjeta de Diagnóstico (Dinámica e Histórica) ─────────────────────────── */}
        <div className={`${cardStyles.cardBg} rounded-2xl border-[1.5px] ${cardStyles.borderColor} shadow-sm p-7 relative overflow-hidden transition-colors duration-300`}>
          {/* Tira lateral */}
          <div className={`absolute left-0 top-0 bottom-0 w-[0.3125rem] ${cardStyles.sidebarBg} rounded-l-4 transition-colors duration-300`} />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl ${cardStyles.iconBg} flex items-center justify-center transition-colors duration-300`}>
                <span className={`material-symbols-outlined ${cardStyles.iconColor} text-xl`}>
                  {cardStyles.iconName}
                </span>
              </div>
              <div>
                <span className={`inline-block text-[0.625rem] font-bold ${cardStyles.iconColor} bg-surface-container px-2.5 py-0.5 rounded-5 uppercase tracking-[0.5px] transition-colors duration-300`}>
                  {sinDatos ? 'N/A' : `Nivel ${nivelEstres}`}
                </span>
              </div>
            </div>
            {esHistorico && (
              <span className="text-[0.6875rem] font-bold text-on-surface-variant bg-white border border-outline-variant px-2 py-1 rounded-md uppercase">
                HISTÓRICO ARCHIVADO
              </span>
            )}
          </div>

          <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.6px] mb-2.5">
            RESULTADOS DEL QUIZ
          </h4>
          <p className="text-sm text-on-surface leading-[1.6] mb-5 min-h-[4rem]">
            El <strong>{sinDatos ? '0' : estresValue}%</strong> del área de <strong>{areaNombre}</strong> presenta un resultado <strong className={cardStyles.iconColor}>{sinDatos ? 'N/A' : nivelEstres}</strong>.
            {` ${textoAlerta}`}
          </p>
          <button
            onClick={() => {
              if (!esHistorico) {
                setModalIntervencionOpen(true);
              }
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 ${cardStyles.buttonBg} text-white border-none rounded-xl text-[0.8125rem] font-semibold transition-all duration-200 ${esHistorico ? 'cursor-not-allowed opacity-70' : 'cursor-pointer ' + cardStyles.buttonHover}`}
            disabled={esHistorico}
          >
            <span className="material-symbols-outlined text-base">{cardStyles.buttonIcon}</span>
            {cardStyles.buttonText}
          </button>
        </div>

        {/* ── Tarjeta de PsicoIA ────────────────────────────────── */}
        <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl border border-primary-container shadow-[0_4px_16px_rgba(4,71,56,0.15)] p-7 text-white relative overflow-hidden flex flex-col">
          {/* Elementos decorativos de fondo */}
          <div className="absolute -right-[1.25rem] -bottom-[1.25rem] w-30 h-30 rounded-full bg-[rgba(255,255,255,0.06)]" />
          <div className="absolute right-[1.875rem] -top-[1.875rem] w-20 h-20 rounded-full bg-[rgba(255,255,255,0.04)]" />

          {/* Cabecera */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[rgba(255,255,255,0.15)] flex items-center justify-center relative shrink-0">
              <span className="material-symbols-outlined text-white text-xl">psychology_alt</span>
              {iaLoading && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#86efac] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#86efac]"></span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${iaLoading ? 'bg-yellow-300 animate-pulse' : 'bg-[#86efac] animate-pulse'}`} />
              <span className="text-xs font-bold text-[rgba(255,255,255,0.9)] tracking-[0.3px]">
                Sugerencia de PsicoIA
              </span>
            </div>
          </div>

          {/* Contenido dinámico */}
          <div className="flex-1 min-h-[4.5rem] mb-5">
            {iaLoading ? (
              <div className="flex items-center gap-2.5 text-[rgba(255,255,255,0.7)]">
                <span className="material-symbols-outlined text-lg animate-spin">autorenew</span>
                <p className="text-sm italic">PsicoIA está analizando los datos del área...</p>
              </div>
            ) : iaError ? (
              <div className="flex items-start gap-2 text-[rgba(255,255,255,0.8)]">
                <span className="material-symbols-outlined text-base text-yellow-300 shrink-0 mt-0.5">warning</span>
                <p className="text-sm">
                  <strong>Error al conectar:</strong> {typeof iaError === 'string' ? iaError : 'Verifica tu conexión e intenta nuevamente. (Puede requerir reiniciar el servidor)'}
                </p>
              </div>
            ) : iaConsultado ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-[rgba(255,255,255,0.92)] leading-[1.7]">{iaTexto}</p>
                <p className="text-[0.65rem] text-[rgba(255,255,255,0.7)] leading-[1.4] italic bg-[rgba(0,0,0,0.15)] p-2.5 rounded-lg border border-[rgba(255,255,255,0.1)]">
                  <strong>Aviso:</strong> Los resultados generados por IA pueden tener sesgos. Deben ser analizados por un profesional y tomarse como una herramienta de apoyo, no como una solución aplicable directamente.
                </p>
              </div>
            ) : (
              <p className="text-sm text-[rgba(255,255,255,0.6)] leading-[1.7] italic">
                {sinDatos
                  ? 'No hay suficientes respuestas en esta área para generar un análisis con IA.'
                  : esHistorico
                  ? 'Análisis predictivo de PsicoIA no disponible para reportes históricos archivados.'
                  : 'Haz clic en "Consultar PsicoIA" para obtener un análisis personalizado generado con inteligencia artificial.'}
              </p>
            )}
          </div>

          {/* Botones de acción */}
          {!esHistorico && (
            <div className="flex flex-wrap gap-2.5">
              {/* Botón principal: Consultar IA */}
              {!sinDatos && (
                <button
                  onClick={() => handleConsultarIA(iaConsultado)}
                  disabled={iaLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[rgba(255,255,255,0.22)] text-white border border-[rgba(255,255,255,0.3)] rounded-xl text-[0.8125rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.32)] disabled:opacity-60 disabled:cursor-wait"
                >
                  <span className="material-symbols-outlined text-base">
                    {iaLoading ? 'autorenew' : iaConsultado ? 'refresh' : 'smart_toy'}
                  </span>
                  {iaLoading ? 'Analizando...' : iaConsultado ? 'Actualizar Análisis' : 'Consultar PsicoIA'}
                </button>
              )}

              {/* Botón secundario: Ver plan completo (solo si ya hay respuesta de IA) */}
              {iaConsultado && (
                <button
                  onClick={() => setModalPlanOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white border-none rounded-xl text-[0.8125rem] font-semibold cursor-pointer transition-colors duration-200 hover:bg-white/20"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Ver plan de acción
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <ModalIntervencion 
        isOpen={modalIntervencionOpen} 
        onClose={() => setModalIntervencionOpen(false)} 
        areaNombre={areaNombre} 
        areaId={area?.id} 
        quizType={quizType}
        fechaReporte={fechaReporte}
      />
      <ModalPlanAccion
        isOpen={modalPlanOpen}
        onClose={() => setModalPlanOpen(false)}
        areaNombre={areaNombre}
        sugerenciaText={iaTexto}
        onOpenIntervencion={() => setModalIntervencionOpen(true)}
        areaData={{
          areaNombre,
          estres: estresValue,
          participacion,
          quizType: quizType || 'General',
          nivelEstres: estresValue >= 60 ? 'ALTO' : estresValue >= 30 ? 'MEDIO' : 'BAJO',
        }}
      />
    </>
  );
}
