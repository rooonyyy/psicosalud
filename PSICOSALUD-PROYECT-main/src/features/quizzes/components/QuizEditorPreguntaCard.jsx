import React from 'react';
import CustomSelect from '../../../components/ui/CustomSelect';
import { TIPOS_PREGUNTA, OPCIONES_MULTIPLE_DEFAULT } from '../utils/quizzes.utils';

/**
 * Componente para renderizar una tarjeta de pregunta en el editor.
 * Soporta modo solo lectura (para preguntas del núcleo base o publicadas)
 * y modo edición (para preguntas personalizadas no publicadas).
 * Cero estilos en línea para respetar la arquitectura del proyecto.
 */
export default function QuizEditorPreguntaCard({
  pregunta,
  tipo = 'personalizado', // 'nucleo' o 'personalizado'
  bloqueada = false,
  onUpdate, // Callback con formato (campo, valor)
  onEliminar
}) {
  const opciones = pregunta.opciones || [];

  // Manejador para el cambio de tipo de pregunta
  const handleTipoChange = (e) => {
    const nuevoTipo = e.target.value;
    if (nuevoTipo === 'Opción múltiple' && opciones.length === 0) {
      // Si cambia a opción múltiple y no tiene opciones, inicializa con las opciones por defecto
      onUpdate('type', nuevoTipo);
      onUpdate('opciones', [...OPCIONES_MULTIPLE_DEFAULT]);
    } else {
      onUpdate('type', nuevoTipo);
    }
  };

  // Manejador para actualizar el texto de una opción específica
  const handleOpcionChange = (index, valor) => {
    const nuevasOpciones = [...opciones];
    nuevasOpciones[index] = valor;
    onUpdate('opciones', nuevasOpciones);
  };

  // Manejador para eliminar una opción específica
  const handleOpcionDelete = (index) => {
    const nuevasOpciones = opciones.filter((_, i) => i !== index);
    onUpdate('opciones', nuevasOpciones);
  };

  // Manejador para agregar una nueva opción
  const handleOpcionAdd = () => {
    const nuevasOpciones = [...opciones, `Opción ${opciones.length + 1}`];
    onUpdate('opciones', nuevasOpciones);
  };

  // Manejadores para los pesos (puntos) de cada opción
  const handlePesoChange = (index, valorStr) => {
    const nuevosPesos = [...(pregunta.pesos || [])];
    const valorNum = parseInt(valorStr, 10);
    nuevosPesos[index] = isNaN(valorNum) ? '' : valorNum;
    onUpdate('pesos', nuevosPesos);
  };

  const getPeso = (index, tipo) => {
    if (pregunta.pesos && pregunta.pesos[index] !== undefined && pregunta.pesos[index] !== '') {
      return pregunta.pesos[index];
    }
    // Valores por defecto
    if (tipo === 'Sí / No') return index === 0 ? 1 : 0; // Sí=1, No=0
    if (tipo === 'Likert 1–5') return index + 1; // 1, 2, 3, 4, 5
    return 0; // Múltiple
  };

  // Formatear el número de pregunta con dos dígitos
  const numeroPregunta = pregunta.id < 10 ? `0${pregunta.id}` : pregunta.id;

  if (bloqueada) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 mb-4 transition-shadow duration-200 relative border-l-[0.25rem] !border-l-primary focus-within:shadow-[0_0_0_2px_var(--primary)] focus-within:border-transparent">
        {/* Cabecera de la tarjeta */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-[0.625rem] font-extrabold uppercase tracking-[0.08em] text-on-surface-variant">Pregunta {numeroPregunta}</span>
          <span className="flex items-center gap-1.5 text-[0.625rem] font-extrabold uppercase tracking-[0.1em] px-3 py-1 rounded-full bg-primary text-white">
            <span className="material-symbols-outlined text-sm mr-1">
              lock
            </span>
            Bloqueada
          </span>
        </div>

        {/* Texto y tipo estáticos */}
        <div className="text-[0.9375rem] font-medium text-on-surface mb-4 leading-relaxed">
          {pregunta.text}
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant inline-block">
            {pregunta.type}
          </span>
        </div>

        {/* Preview visual según el tipo de pregunta en modo bloqueado */}
        {pregunta.type === 'Likert 1–5' && (
          <div className="flex gap-2 flex-wrap mt-2">
            {[1, 2, 3, 4, 5].map((val) => (
              <div key={val} className="w-9 h-9 rounded-full border border-outline-variant bg-transparent flex items-center justify-center text-xs font-bold text-on-surface-variant">
                {val}
              </div>
            ))}
          </div>
        )}

        {pregunta.type === 'Sí / No' && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2.5 text-[0.8125rem] text-on-surface-variant">
              <span className="material-symbols-outlined text-outline-variant">radio_button_unchecked</span>
              <span>Sí</span>
            </div>
            <div className="flex items-center gap-2.5 text-[0.8125rem] text-on-surface-variant">
              <span className="material-symbols-outlined text-outline-variant">radio_button_unchecked</span>
              <span>No</span>
            </div>
          </div>
        )}

        {pregunta.type === 'Opción múltiple' && (
          <div className="flex flex-col gap-2 mt-2">
            {opciones.map((opc, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-[0.8125rem] text-on-surface-variant">
                <span className="material-symbols-outlined text-outline-variant">radio_button_unchecked</span>
                <span>{opc}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Modo edición (no bloqueada)
  return (
    <div className="bg-white rounded-2xl border border-outline-variant p-6 mb-4 transition-shadow duration-200 relative border-l-[0.25rem] !border-l-[#d4a017] focus-within:shadow-[0_0_0_2px_var(--primary)] focus-within:border-transparent">
      {/* Cabecera de la tarjeta con número y acciones */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[0.625rem] font-extrabold uppercase tracking-[0.08em] text-on-surface-variant">Pregunta {numeroPregunta}</span>
        <div className="flex gap-1.5">
          <button
            type="button"
            className="px-2 py-1 rounded-md border border-outline-variant bg-transparent cursor-pointer text-[0.6875rem] font-semibold font-sans flex items-center gap-1 transition-colors duration-200 hover:bg-secondary-container hover:text-primary hover:border-transparent"
            onClick={onEliminar}
            title="Eliminar pregunta"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Eliminar
          </button>
        </div>
      </div>

      {/* Input de texto editable de la pregunta */}
      <input
        type="text"
        className="w-full text-[0.9375rem] font-medium border-none border-b border-outline-variant outline-none py-1.5 font-sans text-on-surface bg-transparent mb-4 focus:border-primary transition-colors"
        value={pregunta.text}
        onChange={(e) => onUpdate('text', e.target.value)}
        placeholder="Escribe la pregunta aquí..."
      />

      {/* Selector de tipo de pregunta */}
      <div className="flex justify-between items-center mb-4 z-40 relative">
        <div className="w-48">
          <CustomSelect
            value={pregunta.type}
            onChange={(val) => handleTipoChange({ target: { value: val } })}
            options={TIPOS_PREGUNTA.map(tipo => ({ value: tipo, label: tipo }))}
            placeholder="Tipo de pregunta"
          />
        </div>
      </div>

      {/* Previews interactivas de respuesta con configuración de pesos */}
      {pregunta.type === 'Likert 1–5' && (
        <div className="flex gap-2 flex-wrap mt-2">
          {[1, 2, 3, 4, 5].map((val, idx) => (
            <div key={val} className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-full border border-outline-variant bg-transparent flex items-center justify-center text-xs font-bold text-on-surface-variant">
                {val}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[0.6875rem] text-on-surface-variant">Pts:</span>
                <input
                  type="number"
                  className="w-10 px-1 py-0.5 text-xs border border-outline-variant rounded-md text-center"
                  value={pregunta.pesos && pregunta.pesos[idx] !== undefined ? pregunta.pesos[idx] : val}
                  onChange={(e) => handlePesoChange(idx, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {pregunta.type === 'Sí / No' && (
        <div className="flex flex-col gap-2 mt-2">
          {['Sí', 'No'].map((opc, idx) => (
            <div key={opc} className="flex items-center text-[0.8125rem] text-on-surface-variant justify-between pr-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline-variant">radio_button_unchecked</span>
                <span>{opc}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-on-surface-variant font-semibold">Puntos:</span>
                <input
                  type="number"
                  className="w-12 px-1.5 py-1 text-[0.8125rem] border border-outline rounded-md text-center"
                  value={pregunta.pesos && pregunta.pesos[idx] !== undefined ? pregunta.pesos[idx] : (idx === 0 ? 1 : 0)}
                  onChange={(e) => handlePesoChange(idx, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {pregunta.type === 'Opción múltiple' && (
        <div className="flex flex-col gap-2 mt-3">
          {opciones.map((opc, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-xl">
                radio_button_unchecked
              </span>
              <input
                type="text"
                className="flex-1 border-none border-b border-outline-variant py-1 text-[0.8125rem] outline-none font-sans bg-transparent focus:border-primary transition-colors"
                value={opc}
                onChange={(e) => handleOpcionChange(idx, e.target.value)}
                placeholder={`Opción ${idx + 1}`}
              />
              <div className="flex items-center gap-1.5 ml-auto mr-2">
                <span className="text-xs text-on-surface-variant font-semibold">Pts:</span>
                <input
                  type="number"
                  className="w-12 p-1 text-[0.8125rem] border border-outline rounded-md text-center"
                  value={pregunta.pesos && pregunta.pesos[idx] !== undefined ? pregunta.pesos[idx] : 0}
                  onChange={(e) => handlePesoChange(idx, e.target.value)}
                />
              </div>
              {opciones.length > 1 && (
                <button
                  type="button"
                  className="bg-transparent border-none cursor-pointer text-outline flex items-center transition-colors duration-200 hover:text-secondary p-1 rounded hover:bg-surface-container-low"
                  onClick={() => handleOpcionDelete(idx)}
                  title="Eliminar opción"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="bg-transparent border-none cursor-pointer text-xs font-semibold text-primary font-sans py-1 flex items-center gap-1 mt-1 w-fit hover:bg-surface-container-low px-2 rounded-md transition-colors"
            onClick={handleOpcionAdd}
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Agregar opción
          </button>
        </div>
      )}
    </div>
  );
}
