import React from 'react';

/**
 * Componente LoginHero
 * Renderiza la sección lateral izquierda de la tarjeta de inicio de sesión.
 * Muestra el eslogan del sistema, una barra divisoria decorativa y un listado
 * dinámico de las características de PsicoSalud.
*/

  // Lista de características clave que se muestran en el panel
const features = [
  'Acceso seguro y privado',
  'Soporte psicológico continuo',
  'Gestión de talento humano',
];

export default function LoginHero() {

  return (
    <div className="w-[42%] bg-primary p-10 flex flex-col justify-center text-white">
      {/* Mensaje de bienvenida destacado */}
      <h2 className="text-[1.375rem] font-bold mb-4">
        Tu bienestar es nuestra prioridad
      </h2>

      {/* Barra divisora de acento en color verde */}
      <div className="w-12 h-1 bg-accent-green rounded-sm mb-6" />

      {/* Párrafo descriptivo del propósito del sistema */}
      <p className="text-white/85 leading-relaxed mb-8 text-sm">
        Potenciando el equilibrio entre el rendimiento profesional y la salud mental para equipos de alto impacto.
      </p>

      {/* Renderizado dinámico de la lista de características */}
      {features.map((feature) => (
        <div key={feature} className="flex items-center gap-3 mb-4">
          {/* Icono de check de Material Symbols */}
          <span className="material-symbols-outlined text-accent-green text-[1.375rem] [font-variation-settings:'FILL'_1]">
            check_circle
          </span>
          <span className="text-sm font-medium">{feature}</span>
        </div>
      ))}
    </div>
  );
}