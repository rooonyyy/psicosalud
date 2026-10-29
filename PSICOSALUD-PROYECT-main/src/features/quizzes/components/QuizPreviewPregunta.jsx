import React from 'react';

/**
 * Componente para renderizar una pregunta individual en el modo de vista previa interactiva.
 * Cambia los estilos visuales cuando el usuario selecciona una respuesta para dar feedback inmediato.
 */
export default function QuizPreviewPregunta({
  pregunta,
  numero, // Número secuencial opcional para mostrar
  respuesta, // El valor seleccionado actualmente para esta pregunta (número o string)
  onResponder // Callback con firma (preguntaId, valor)
}) {
  const displayNum = numero !== undefined ? (numero < 10 ? `0${numero}` : numero) : (pregunta.id < 10 ? `0${pregunta.id}` : pregunta.id);

  // Determinar las opciones a mostrar según el tipo de pregunta
  let options = [];
  if (pregunta.type === 'Likert 1–5') {
    options = ["1", "2", "3", "4", "5"];
  } else if (pregunta.type === 'Sí / No') {
    options = ["Sí", "No"];
  } else if (pregunta.type === 'Opción múltiple') {
    options = pregunta.opciones || [];
  }

  return (
    <div className="bg-white rounded-2xl border border-outline-variant p-6 mb-4">
      {/* Indicador del número secuencial de la pregunta */}
      <div className="text-[0.625rem] font-extrabold uppercase tracking-[0.08em] text-on-surface-variant mb-2">Pregunta {displayNum}</div>

      {/* Título/Texto de la pregunta usando el estilo de EmployeeQuiz */}
      <h2 className="text-lg font-semibold text-on-surface mb-5 leading-snug">
        {pregunta.text}
      </h2>

      {/* Listado de tarjetas de selección de respuestas, idénticas a EmployeeQuiz */}
      <div className="flex flex-col gap-3">
        {options.map((option, idx) => {
          const isSelected = respuesta === option;
          return (
            <div
              key={idx}
              className={`w-full text-left bg-surface-container-lowest border-2 p-5 rounded-xl text-base font-medium cursor-pointer transition-all duration-200 ${isSelected ? 'border-primary bg-[rgba(4,71,56,0.06)] shadow-[0_4px_12px_rgba(4,71,56,0.08)] text-primary' : 'border-outline-variant text-on-surface hover:border-primary hover:bg-[rgba(4,71,56,0.02)]'}`}
              onClick={() => onResponder(pregunta.id, option)}
            >
              {option}
            </div>
          );
        })}
      </div>
    </div>
  );
}
