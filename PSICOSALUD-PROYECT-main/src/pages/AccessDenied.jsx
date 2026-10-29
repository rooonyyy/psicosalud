import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Página 403 — Acceso Denegado
 * Se muestra cuando un usuario autenticado intenta acceder a una ruta
 * para la cual su rol no tiene permiso.
 * Incluye ilustración SVG de candado/barrera de seguridad con paleta PsicoSalud.
 */
export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center w-screen min-h-screen bg-background font-sans relative overflow-hidden py-8 px-6 sm:px-4 sm:py-6">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute rounded-full blur-[6.25rem] w-[31.25rem] h-[31.25rem] bg-primary-fixed opacity-25 -top-[9.375rem] -right-[6.25rem] animate-blob1" />
        <div className="absolute rounded-full blur-[6.25rem] w-[25rem] h-[25rem] bg-accent-green opacity-15 -bottom-[6.25rem] -left-[5rem] animate-blob2" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3 max-w-[35rem] w-full animate-content-fade-in">
        {/* Ilustración SVG — Personaje con candado y barrera */}
        <svg className="w-full max-w-[26.25rem] h-auto aspect-[500/420] sm:max-w-75" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 420">
          {/* Fondo circular suave */}
          <ellipse cx="250" cy="350" rx="180" ry="30" fill="var(--surface-container)" opacity="0.6" />
          <path d="M120,280s5,60,80,100c60,32,140,30,170,10s60-55,55-100-40-70-70-120S310,90,250,70,150,80,130,130,120,280,120,280Z" fill="var(--primary-fixed)" opacity="0.35" />

          {/* Candado grande */}
          <g transform="translate(170, 80)">
            {/* Arco del candado */}
            <path d="M40,110V75c0-22,18-40,40-40s40,18,40,40v35" fill="none" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" />
            {/* Cuerpo del candado */}
            <rect x="20" y="110" width="120" height="95" rx="14" fill="var(--primary)" />
            <rect x="20" y="110" width="120" height="95" rx="14" fill="var(--primary-container)" opacity="0.3" />
            {/* Ojo de cerradura */}
            <circle cx="80" cy="148" r="14" fill="var(--on-primary)" opacity="0.9" />
            <rect x="75" y="152" width="10" height="24" rx="4" fill="var(--on-primary)" opacity="0.9" />
            {/* Brillo */}
            <rect x="35" y="118" width="4" height="20" rx="2" fill="var(--on-primary)" opacity="0.15" />
          </g>

          {/* Escudo de seguridad */}
          <g transform="translate(310, 140)">
            <path d="M40,10 L70,22 L70,50 C70,72 55,88 40,95 C25,88 10,72 10,50 L10,22 Z" fill="var(--accent-green)" opacity="0.9" />
            <path d="M40,10 L70,22 L70,50 C70,72 55,88 40,95 C25,88 10,72 10,50 L10,22 Z" fill="none" stroke="var(--primary)" strokeWidth="3" />
            <polyline points="27,52 37,62 55,40" fill="none" stroke="var(--on-primary)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Barrera de seguridad izquierda */}
          <g transform="translate(60, 260)">
            <rect x="5" y="0" width="12" height="90" rx="3" fill="var(--primary)" />
            <rect x="5" y="0" width="12" height="12" rx="3" fill="var(--primary-container)" />
            <rect x="5" y="78" width="12" height="12" rx="3" fill="var(--primary-container)" />
          </g>

          {/* Barrera de seguridad derecha */}
          <g transform="translate(400, 260)">
            <rect x="5" y="0" width="12" height="90" rx="3" fill="var(--primary)" />
            <rect x="5" y="0" width="12" height="12" rx="3" fill="var(--primary-container)" />
            <rect x="5" y="78" width="12" height="12" rx="3" fill="var(--primary-container)" />
          </g>

          {/* Barras horizontales de barrera */}
          <g>
            <rect x="65" y="278" width="358" height="14" rx="4" fill="var(--primary)" />
            {/* Rayas diagonales de advertencia */}
            <rect x="85" y="278" width="28" height="14" fill="var(--accent-green)" opacity="0.5" transform="skewX(-20)" />
            <rect x="145" y="278" width="28" height="14" fill="var(--accent-green)" opacity="0.5" transform="skewX(-20)" />
            <rect x="205" y="278" width="28" height="14" fill="var(--accent-green)" opacity="0.5" transform="skewX(-20)" />
            <rect x="265" y="278" width="28" height="14" fill="var(--accent-green)" opacity="0.5" transform="skewX(-20)" />
            <rect x="325" y="278" width="28" height="14" fill="var(--accent-green)" opacity="0.5" transform="skewX(-20)" />
            <rect x="385" y="278" width="28" height="14" fill="var(--accent-green)" opacity="0.5" transform="skewX(-20)" />

            <rect x="65" y="310" width="358" height="10" rx="3" fill="var(--primary-container)" />
          </g>

          {/* Texto 403 grande detrás */}
          <text x="250" y="260" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="900" fontSize="120" fill="var(--primary)" opacity="0.07" letterSpacing="-4">403</text>

          {/* Estrellas/partículas decorativas */}
          <circle cx="130" cy="120" r="4" fill="var(--accent-green)" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="380" cy="100" r="3" fill="var(--primary-fixed)" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="420" cy="180" r="5" fill="var(--accent-green)" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="220" r="3" fill="var(--primary-fixed-dim)" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3.5s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* Texto informativo */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-[1.75rem] sm:text-[1.375rem] font-extrabold text-primary m-0 tracking-[-0.5px] leading-[1.2]">Acceso Denegado</h1>
          <p className="text-[0.9375rem] sm:text-sm text-on-surface-variant leading-[1.7] m-0 max-w-[26.25rem]">
            No tienes permisos suficientes para acceder a esta sección.
            Contacta al administrador del sistema si crees que esto es un error.
          </p>

          <div className="flex gap-3 mt-2 flex-wrap justify-center sm:flex-col sm:w-full">
            <button
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold font-sans cursor-pointer border-none transition-all duration-[0.25s] ease-[cubic-bezier(0.16,1,0.3,1)] sm:w-full bg-primary text-on-primary shadow-[0_2px_12px_rgba(4,71,56,0.2)] hover:bg-primary-container hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(4,71,56,0.25)] active:translate-y-0"
              onClick={() => navigate('/dashboard')}
            >
              <span className="material-symbols-outlined text-lg">dashboard</span>
              Ir al Dashboard
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold font-sans cursor-pointer transition-all duration-[0.25s] ease-[cubic-bezier(0.16,1,0.3,1)] sm:w-full bg-transparent text-primary border-[1.5px] border-outline-variant hover:bg-surface-container hover:border-primary hover:-translate-y-0.5 active:translate-y-0"
              onClick={() => navigate(-1)}
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Volver Atrás
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
