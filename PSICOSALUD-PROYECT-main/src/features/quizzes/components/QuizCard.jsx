import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';

/**
 * Componente para renderizar la tarjeta individual de un cuestionario (quiz).
 * Cero estilos en línea para respetar la arquitectura del proyecto.
 */
export default function QuizCard({ quiz, onEdit, onAssign, onUnassign, onDelete, onPreview }) {
  const navigate = useNavigate();
  const toast = useToast();

  // Manejador para la acción principal
  const handleMainActionClick = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(quiz.id);
  };

  // Manejador para el botón de vista previa
  const handlePreviewClick = (e) => {
    e.stopPropagation();
    if (onPreview) onPreview(quiz.id);
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-[rgba(191,201,195,0.4)] p-6 lg:p-8 flex flex-col shadow-[0_4px_8px_rgba(0,0,0,0.04)] transition-all duration-200 cursor-pointer min-h-85 relative hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(4,71,56,0.1)] group">
      {/* Cabecera de la tarjeta con estado y botón para eliminar */}
      <div className="flex justify-between items-center mb-6">
        {quiz.estado === 'asignado' ? (
          <span className="flex items-center gap-1.5 text-[0.625rem] font-extrabold uppercase tracking-[0.1em] px-3 py-1 rounded-full bg-[rgba(83,98,87,0.1)] text-secondary border border-[rgba(83,98,87,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Asignado
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[0.625rem] font-extrabold uppercase tracking-[0.1em] px-3 py-1 rounded-full bg-[rgba(191,201,195,0.25)] text-on-surface-variant border border-[rgba(191,201,195,0.4)]">
            <span className="material-symbols-outlined text-sm">
              edit_document
            </span>
            Desasignado
          </span>
        )}
        
        {/* Botón para eliminar cuestionario */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete(quiz.id);
          }}
          className="bg-transparent border-none rounded-lg p-1.5 cursor-pointer text-on-surface-variant flex items-center justify-center transition-all duration-200 hover:bg-[rgba(4,71,56,0.1)] hover:text-primary"
          title="Eliminar quiz"
          aria-label="Eliminar quiz"
        >
          <span className="material-symbols-outlined text-xl">delete</span>
        </button>
      </div>

      {/* Título y descripción del cuestionario */}
      <h3 className="text-lg font-extrabold text-primary tracking-[-0.01em] mb-3 leading-snug m-0">{quiz.titulo}</h3>
      <p className="text-[0.8125rem] text-on-surface-variant leading-relaxed flex-1 mb-6 m-0">{quiz.desc}</p>

      {/* Estadísticas: número de preguntas y áreas asignadas */}
      <div className="flex gap-4 mb-5 border-t border-outline-variant pt-5">
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-base text-primary">
            quiz
          </span>
          <span>
            <strong className="text-on-surface font-bold">
              {quiz.preguntas}
            </strong>{' '}
            preguntas
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-base text-primary">
            domain
          </span>
          <span>
            {quiz.areas !== undefined
              ? (typeof quiz.areas === 'number'
                  ? `${quiz.areas} ${quiz.areas === 1 ? 'área' : 'áreas'}`
                  : quiz.areas)
              : (quiz.areasAsignadas && quiz.areasAsignadas.length > 0
                  ? `${quiz.areasAsignadas.length} áreas`
                  : 'Sin áreas')}
          </span>
        </div>
      </div>

      {/* Acciones principales: En uso / Usar Plantilla, Vista Previa */}
      <div className="flex gap-2 flex-wrap">
        {quiz.estado === 'asignado' ? (
          <>
            <button 
              className="flex-1 p-2.5 bg-surface-container-low text-primary border border-outline-variant flex items-center justify-center gap-1 opacity-70 cursor-not-allowed rounded-2xl text-[0.8125rem] font-bold font-sans"
              disabled={true}
              title="Cuestionario asignado"
            >
              <span className="material-symbols-outlined text-lg">lock</span>
              En uso
            </button>
            <button 
              className="flex-1 p-2.5 bg-transparent text-primary border border-outline-variant flex items-center justify-center rounded-xl text-[0.8125rem] font-bold cursor-pointer font-sans transition-colors hover:bg-[rgba(4,71,56,0.05)] hover:border-primary"
              title="Detener y desasignar cuestionario"
              onClick={(e) => { e.stopPropagation(); if (onUnassign) onUnassign(quiz.id); }}
            >
              Desasignar
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(quiz.id); }} 
              className="flex-1 p-2.5 bg-transparent text-primary border-2 border-primary rounded-lg text-[0.8125rem] font-bold cursor-pointer font-sans transition-colors hover:bg-surface-container"
            >
              Editar
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); if (onAssign) onAssign(quiz.id); }} 
              className="flex-1 p-2.5 bg-primary text-on-primary border-none rounded-lg text-[0.8125rem] font-bold cursor-pointer font-sans transition-colors hover:bg-primary-container"
            >
              Asignar
            </button>
          </>
        )}

        <button 
          onClick={(e) => {
            e.stopPropagation();
            const baseUrl = window.location.origin;
            const link = `${baseUrl}/login-empleado`;
            
            if (navigator.clipboard && window.isSecureContext) {
              navigator.clipboard.writeText(link).then(() => {
                toast.success('Enlace del portal de empleados copiado al portapapeles');
              });
            } else {
              // Fallback para IPs locales HTTP
              const textArea = document.createElement("textarea");
              textArea.value = link;
              textArea.style.position = "fixed";
              textArea.style.left = "-9999px";
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              try {
                document.execCommand('copy');
                toast.success('Enlace copiado al portapapeles (modo de compatibilidad)');
              } catch (err) {
                console.error('No se pudo copiar el texto: ', err);
              }
              document.body.removeChild(textArea);
            }
          }}
          className="p-2.5 px-3 bg-transparent border border-outline-variant rounded-xl cursor-pointer text-on-surface-variant flex items-center justify-center transition-all hover:bg-surface-container-low hover:border-outline"
          title="Compartir link"
          aria-label="Compartir link del portal de evaluación"
        >
          <span className="material-symbols-outlined text-xl">share</span>
        </button>
        <button 
          onClick={handlePreviewClick} 
          className="p-2.5 px-3 bg-transparent border border-outline-variant rounded-xl cursor-pointer text-on-surface-variant flex items-center justify-center transition-all hover:bg-surface-container-low hover:border-outline"
          title="Vista Previa"
          aria-label="Vista previa del quiz"
        >
          <span className="material-symbols-outlined text-xl">visibility</span>
        </button>
      </div>
    </div>
  );
}
