import React, { useState } from 'react';

// Componente para la tarjeta discontinua de agregar cuestionario (Quiz)
export default function QuizAgregarCard({ onClick }) {
  // Estado local para alternar el resaltado al pasar el ratón (hover)
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-4 cursor-pointer min-h-85 transition-all duration-200 bg-transparent ${hovered ? 'bg-[rgba(83,98,87,0.05)] border-secondary text-secondary' : 'border-outline-variant text-on-surface-variant'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Círculo con el icono de suma */}
      <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${hovered ? 'border-secondary' : 'border-outline-variant'}`}>
        <span className="material-symbols-outlined text-[1.75rem]">
          add
        </span>
      </div>
      
      {/* Texto de acción */}
      <p className="text-sm font-semibold text-center m-0">Crear Nuevo Quiz</p>
    </div>
  );
}
