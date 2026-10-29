import React from 'react';

import LoginHero from '../features/auth/components/LoginHero';
import LoginForm from '../features/auth/components/LoginForm';
/**
 * Componente de la página de Inicio de Sesión (Login)
 * Actúa como orquestador principal de la vista de login para staff (Admins y Psicólogos).
 * Contiene un botón para redireccionar a los trabajadores al portal de evaluación.
*/

export default function Login() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Capa de fondo degradado */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#044738eb] to-[#536257d9]" />

      {/* Contenido principal de la página de inicio de sesión */}
      <main className="relative z-10 w-full max-w-[62.5rem] flex flex-col items-center">

        {/* Encabezado con el logotipo y el título del sistema */}
        <div className="mb-8 text-white text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="material-symbols-outlined text-5xl text-white [font-variation-settings:'FILL'_1]">
              psychology
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight">PsicoSalud</h1>
          </div>
          <p className="text-[0.8125rem] font-medium uppercase tracking-[0.1em] opacity-90">
            Sistema de gestión del bienestar laboral
          </p>
        </div>

        {/* Tarjeta contenedora de inicio de sesión (diseño en dos columnas) */}
        <div className="w-full bg-white rounded-3xl overflow-hidden flex shadow-[0_25px_50px_-12px_rgba(4,71,56,0.25)]">

          {/* Panel Lateral Izquierdo: Información y características */}
          <LoginHero />

          {/* Panel Derecho: Formulario e ingresos por rol */}
          <div className="flex-1 py-12 px-12">
            {/* Mensaje de bienvenida */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-primary tracking-tight text-center">
                Portal del Equipo
              </h2>
              <p className="text-on-surface-variant mt-2 text-sm text-center">
                Ingresa con tu cuenta de administrador o psicólogo.
              </p>
            </div>

            {/* Componente de formulario de credenciales */}
            <LoginForm />

          </div>
        </div>
      </main>
    </div>
  );
}