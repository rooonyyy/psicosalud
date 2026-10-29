import React from 'react';
import QuizEditorPreguntaCard from '../features/quizzes/components/QuizEditorPreguntaCard';
import { useQuizEditor } from '../features/quizzes/hooks/useQuizEditor';

export default function QuizEditor() {
  const {
    titulo, setTitulo,
    descripcion, setDescripcion,
    customQuestions,
    isPublished,
    esPreestablecido,
    areasSeleccionadas, setAreasSeleccionadas,
    availableAreas,
    duracionMinutos, setDuracionMinutos,
    codigoArea, setCodigoArea,
    tablaInterpretacion, setTablaInterpretacion,
    handlePublish,
    handleAgregarPregunta,
    handleActualizarPregunta,
    handleEliminarPregunta,
    handleAreaToggle,
    totalPreguntas,
    navigate,
    id,
    handleDuplicar
  } = useQuizEditor();

  return (
    <div className="py-8 px-8 md:px-16 max-w-[56.25rem] mx-auto">
      {/* Encabezado del editor */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-[1.75rem] font-bold text-primary m-0">Editor de Quiz</h2>
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl border border-outline-variant bg-transparent text-sm font-semibold text-on-surface-variant cursor-pointer font-sans transition-colors duration-200 flex items-center gap-2 hover:bg-surface-container-low"
            onClick={() => navigate('/quizzes')}
          >
            ← Volver
          </button>

          {!isPublished && (
            <div className="flex gap-2">
              {id && (
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl border border-secondary bg-transparent text-secondary text-sm font-semibold cursor-pointer font-sans transition-colors duration-200 flex items-center gap-2 hover:bg-surface-container-low active:scale-95"
                  onClick={handleDuplicar}
                >
                  Duplicar
                </button>
              )}
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl border-none bg-primary text-white text-sm font-semibold cursor-pointer font-sans transition-colors duration-200 flex items-center gap-2 hover:bg-primary-container active:scale-95"
                onClick={() => handlePublish(false)}
              >
                Guardar
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Banner informativo si el cuestionario es base/preestablecido */}
      {esPreestablecido && (
        <div className="flex items-center gap-3 bg-[rgba(4,71,56,0.06)] border border-[rgba(4,71,56,0.15)] rounded-lg py-3.5 px-5 text-[0.8125rem] text-primary font-medium mb-6">
          <span className="material-symbols-outlined text-xl">info</span>
          Este es el cuestionario base estandarizado de PsicoSalud. Sus preguntas no pueden modificarse para garantizar la comparabilidad de resultados.
        </div>
      )}

      {/* Tarjeta de metadatos (Título y Descripción) */}
      <div className="bg-white rounded-2xl border-l-[0.3125rem] border-primary py-7 px-8 mb-6 shadow-[0_4px_12px_rgba(4,71,56,0.03)]">
        <input
          type="text"
          className="w-full text-[1.375rem] font-bold text-primary border-none border-b-2 border-outline-variant outline-none pb-2 font-sans bg-transparent mb-4 focus:border-primary transition-colors"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título del cuestionario"
          disabled={isPublished || esPreestablecido}
        />
        <textarea
          className="w-full text-sm font-normal text-on-surface-variant border-none border-b-2 border-outline-variant outline-none pb-2 font-sans bg-transparent mb-4 focus:border-primary transition-colors resize-none overflow-hidden leading-relaxed"
          value={descripcion}
          onChange={(e) => {
            setDescripcion(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          ref={(el) => {
            if (el) {
              el.style.height = 'auto';
              el.style.height = el.scrollHeight + 'px';
            }
          }}
          placeholder="Descripción del cuestionario (objetivo, instrucciones...)"
          disabled={isPublished || esPreestablecido}
          rows={1}
        />

        {/* Fila de metadatos: Duración y Código de Acceso */}
        <div className="flex items-center gap-6 mt-4 flex-wrap">

          {/* Duración */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1 text-[0.8125rem] font-semibold text-primary">
              Duración estimada
            </label>
            <div className="flex items-center gap-2 bg-surface-container-lowest p-[0.5rem_0.875rem] rounded-lg border border-outline-variant">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">timer</span>
              <input
                type="number"
                min={5}
                max={120}
                step={5}
                className="w-15 border-none bg-transparent outline-none text-[0.9375rem] font-medium text-on-surface text-center"
                value={duracionMinutos}
                onChange={(e) => setDuracionMinutos(parseInt(e.target.value) || 10)}
                disabled={isPublished || esPreestablecido}
              />
              <span className="text-sm font-medium text-on-surface-variant">minutos</span>
            </div>
          </div>

          {/* Código de Acceso */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1 text-[0.8125rem] font-semibold text-primary">
              Código de Acceso
            </label>
            <div className="flex items-center gap-2 bg-surface-container-lowest p-[0.5rem_0.875rem] rounded-lg border border-outline-variant">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">key</span>
              <input
                type="text"
                className="w-35 border-none bg-transparent outline-none text-[0.9375rem] font-semibold text-on-surface uppercase"
                value={codigoArea}
                onChange={(e) => setCodigoArea(e.target.value.toUpperCase())}
                placeholder="Ej. VENTAS-24"
                disabled={isPublished || esPreestablecido}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Listado de preguntas del quiz (solo si no es preestablecido) */}
      {!esPreestablecido && (
        <>
          <div className="text-[0.6875rem] font-extrabold uppercase tracking-[0.1em] text-on-surface-variant mb-3 mt-2">
            {id ? 'Preguntas Personalizadas' : 'Mis Preguntas'}
          </div>
          <div>
            {customQuestions.map((pregunta) => (
              <QuizEditorPreguntaCard
                key={`custom-${pregunta.id}`}
                pregunta={pregunta}
                tipo="personalizado"
                bloqueada={isPublished || esPreestablecido}
                onUpdate={(campo, valor) => handleActualizarPregunta(pregunta.id, campo, valor)}
                onEliminar={() => handleEliminarPregunta(pregunta.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Botón para agregar una nueva pregunta personalizada */}
      {!esPreestablecido && !isPublished && (
        <button
          type="button"
          className="w-full p-4 rounded-xl border-2 border-dashed border-outline-variant bg-transparent cursor-pointer text-sm font-semibold text-on-surface-variant font-sans flex items-center justify-center gap-2 transition-all duration-200 mt-2 hover:bg-surface-container-low hover:border-secondary hover:text-primary"
          onClick={handleAgregarPregunta}
        >
          <span className="material-symbols-outlined">add</span>
          Agregar pregunta
        </button>
      )}

      {/* Sección de Asignación de Áreas */}
      {!esPreestablecido && (
        <div className="bg-[rgba(4,71,56,0.03)] border-[1.5px] border-[rgba(4,71,56,0.15)] rounded-xl py-6 px-7 mt-6" id="asignar-section">
          <div className="flex items-center gap-2.5 mb-1 justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[1.375rem]">
                location_on
              </span>
              <h3 className="text-[0.9375rem] font-bold text-primary m-0">
                Asignar a Áreas
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-1 rounded-xl border border-outline-variant bg-transparent text-[0.85rem] font-semibold text-on-surface-variant cursor-pointer font-sans transition-colors duration-200 hover:bg-surface-container-low"
                onClick={() => setAreasSeleccionadas(availableAreas)}
              >
                Seleccionar Todas
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded-xl border border-outline-variant bg-transparent text-[0.85rem] font-semibold text-on-surface-variant cursor-pointer font-sans transition-colors duration-200 hover:bg-surface-container-low"
                onClick={() => setAreasSeleccionadas([])}
              >
                Deseleccionar
              </button>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant mb-4 mt-1 pl-8">
            Selecciona las áreas que recibirán este cuestionario.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {availableAreas.length === 0 ? (
              <p className="text-sm text-[var(--on-surface-variant)]">Cargando áreas...</p>
            ) : (
              availableAreas.map((area) => {
                const isChecked = areasSeleccionadas.includes(area);
                return (
                  <label key={area} className="flex items-center gap-2 text-[0.8125rem] text-on-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleAreaToggle(area)}
                      disabled={isPublished}
                      className="accent-primary w-4 h-4 cursor-pointer"
                    />
                    <span>{area}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Cuadro de Interpretación de Resultados */}
      {!esPreestablecido && (
        <div className="bg-[rgba(4,71,56,0.03)] border-[1.5px] border-[rgba(4,71,56,0.15)] rounded-xl py-6 px-7 mt-6">
          <div className="flex items-center gap-2.5 mb-1 justify-between flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[1.375rem]">
                psychology
              </span>
              <h3 className="text-[0.9375rem] font-bold text-primary m-0">
                Cuadro de Interpretación de Resultados
              </h3>
            </div>
            <button
              type="button"
              className="px-3 py-1 rounded-xl border border-outline-variant bg-transparent text-[0.85rem] font-semibold text-on-surface-variant cursor-pointer font-sans transition-colors duration-200 flex items-center hover:bg-surface-container-low mt-2 sm:mt-0"
              onClick={() => setTablaInterpretacion([...tablaInterpretacion, { min: 0, max: 0, nivel: '', analisis: '', mostrarEmpleado: false }])}
              disabled={isPublished}
            >
              <span className="material-symbols-outlined text-base mr-1">add</span>
              Agregar Rango
            </button>
          </div>
          <p className="text-xs text-on-surface-variant mb-4 mt-1 sm:pl-8">
            Define los rangos de puntuación y su significado clínico. Si "Mostrar al empleado" está activo, el empleado verá este resultado al finalizar (recomendado solo para niveles altos).
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {tablaInterpretacion.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant bg-surface-container-lowest rounded-lg border border-dashed border-outline-variant">
                No hay rangos de interpretación definidos. Haz clic en "Agregar Rango".
              </div>
            ) : (
              tablaInterpretacion.map((rango, idx) => (
                <div key={idx} className="flex gap-3 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant items-start">
                  <div className="flex flex-col gap-1 w-20">
                    <label className="text-[0.6875rem] font-semibold text-on-surface-variant">Mín (pts)</label>
                    <input type="number" value={rango.min} onChange={(e) => { const nt = [...tablaInterpretacion]; nt[idx].min = parseInt(e.target.value)||0; setTablaInterpretacion(nt); }} disabled={isPublished} className="w-full p-1.5 rounded-md border border-outline" />
                  </div>
                  <div className="flex flex-col gap-1 w-20">
                    <label className="text-[0.6875rem] font-semibold text-on-surface-variant">Máx (pts)</label>
                    <input type="number" value={rango.max} onChange={(e) => { const nt = [...tablaInterpretacion]; nt[idx].max = parseInt(e.target.value)||0; setTablaInterpretacion(nt); }} disabled={isPublished} className="w-full p-1.5 rounded-md border border-outline" />
                  </div>
                  <div className="flex flex-col gap-1 w-[9.375rem]">
                    <label className="text-[0.6875rem] font-semibold text-on-surface-variant">Nivel</label>
                    <input type="text" value={rango.nivel} onChange={(e) => { const nt = [...tablaInterpretacion]; nt[idx].nivel = e.target.value; setTablaInterpretacion(nt); }} placeholder="Ej. Alto / Burnout" disabled={isPublished} className="w-full p-1.5 rounded-md border border-outline" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-[0.6875rem] font-semibold text-on-surface-variant">Análisis y Recomendación</label>
                    <input type="text" value={rango.analisis} onChange={(e) => { const nt = [...tablaInterpretacion]; nt[idx].analisis = e.target.value; setTablaInterpretacion(nt); }} placeholder="Recomendaciones..." disabled={isPublished} className="w-full p-1.5 rounded-md border border-outline" />
                  </div>
                  <div className="flex flex-col gap-1 items-center w-[5.625rem]">
                    <label className="text-[0.6875rem] font-semibold text-on-surface-variant text-center">Mostrar al empleado</label>
                    <input type="checkbox" className="accent-primary cursor-pointer w-[1.125rem] h-[1.125rem] mt-1.5" checked={rango.mostrarEmpleado} onChange={(e) => { const nt = [...tablaInterpretacion]; nt[idx].mostrarEmpleado = e.target.checked; setTablaInterpretacion(nt); }} disabled={isPublished} />
                  </div>
                  {!isPublished && (
                    <button type="button" onClick={() => { const nt = tablaInterpretacion.filter((_, i) => i !== idx); setTablaInterpretacion(nt); }} className="bg-none border-none text-primary cursor-pointer mt-[1.375rem] transition-opacity hover:opacity-70">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Barra de pie de página (Footer) con estadísticas y botón de publicar */}
      <footer className="flex justify-between items-center bg-white rounded-2xl border border-[rgba(191,201,195,0.3)] py-5 px-7 mt-6 shadow-[0_4px_12px_rgba(4,71,56,0.03)] flex-wrap sm:flex-nowrap gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">Total preguntas</span>
            <span className="text-[0.9375rem] font-bold text-primary">{totalPreguntas} preguntas</span>
          </div>

          <div className="w-[0.0625rem] h-8 bg-outline-variant hidden sm:block" />

          <div className="flex flex-col gap-1">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">Tiempo establecido</span>
            <span className="text-[0.9375rem] font-bold text-primary">{duracionMinutos} minutos</span>
          </div>
        </div>

        {!isPublished && (
          <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            {id && (
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl border border-secondary bg-transparent text-secondary text-sm font-semibold cursor-pointer font-sans transition-colors duration-200 flex items-center gap-2 hover:bg-surface-container-low active:scale-95 w-full sm:w-auto justify-center"
                onClick={handleDuplicar}
              >
                Duplicar
              </button>
            )}
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl border-none bg-primary text-white text-sm font-semibold cursor-pointer font-sans transition-colors duration-200 flex items-center gap-2 hover:bg-primary-container active:scale-95 w-full sm:w-auto justify-center"
              onClick={() => handlePublish(false)}
            >
              Guardar
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
