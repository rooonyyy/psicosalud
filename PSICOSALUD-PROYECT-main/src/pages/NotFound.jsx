import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Página 404 — No Encontrado
 * Se muestra cuando el usuario navega a una ruta que no existe.
 * Incluye ilustración SVG detallada con personaje y elementos de búsqueda,
 * siguiendo la paleta de colores PsicoSalud.
 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center w-screen min-h-screen bg-background font-sans relative overflow-hidden py-8 px-6 sm:px-4 sm:py-6">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute rounded-full blur-[6.25rem] w-[31.25rem] h-[31.25rem] bg-primary-fixed opacity-25 -top-[9.375rem] -right-[6.25rem] animate-blob1" />
        <div className="absolute rounded-full blur-[6.25rem] w-[25rem] h-[25rem] bg-accent-green opacity-15 -bottom-[6.25rem] -left-[5rem] animate-blob2" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3 max-w-[35rem] w-full animate-content-fade-in">
        {/* Ilustración SVG — Personaje perdido con mapa y lupa */}
        <svg className="w-full max-w-[26.25rem] h-auto aspect-[500/420] sm:max-w-75" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 420">
          {/* Sombra del suelo */}
          <ellipse cx="250" cy="370" rx="190" ry="25" fill="var(--surface-container)" opacity="0.7" />

          {/* Forma orgánica de fondo */}
          <path d="M80,250s8,70,85,110c55,28,145,28,180,10s60-52,55-100-38-68-68-118S295,70,240,55,130,68,110,120,80,250,80,250Z" fill="var(--primary-fixed)" opacity="0.3" />

          {/* Texto 404 grande detrás */}
          <text x="250" y="270" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="900" fontSize="140" fill="var(--primary)" opacity="0.06" letterSpacing="-6">404</text>

          {/* ===== Personaje ===== */}
          <g transform="translate(170, 95)">
            {/* Cabello */}
            <path d="M60,38s8-18,25-20,25,2,28,8,5,18,4,22-3,5-3,5S106,30,90,24,62,25,56,35Z" fill="var(--primary)" />
            <path d="M56,35s-5,4-5,12,2,10,2,10l5-3s-4-8-2-14Z" fill="var(--primary)" />
            <path d="M114,53s4-6,4-12-2-9-4-10l-4,5s3,6,2,12Z" fill="var(--primary)" />

            {/* Cabeza */}
            <ellipse cx="82" cy="52" rx="28" ry="26" fill="#dcc8b0" />

            {/* Orejas */}
            <ellipse cx="54" cy="55" rx="5" ry="7" fill="#dcc8b0" />
            <ellipse cx="110" cy="55" rx="5" ry="7" fill="#dcc8b0" />

            {/* Ojos — expresión confusa/buscando */}
            <circle cx="72" cy="50" r="3.5" fill="var(--primary)" />
            <circle cx="93" cy="50" r="3.5" fill="var(--primary)" />
            <circle cx="73" cy="49" r="1.2" fill="var(--on-primary)" />
            <circle cx="94" cy="49" r="1.2" fill="var(--on-primary)" />
            {/* Cejas levantadas (confusión) */}
            <path d="M66,42 Q72,38 78,41" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            <path d="M87,41 Q93,38 99,42" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />

            {/* Boca — expresión de duda */}
            <path d="M76,63 Q82,60 89,63" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

            {/* Signo de interrogación sobre la cabeza */}
            <g transform="translate(75, -8)">
              <text x="0" y="0" fontFamily="var(--font-sans)" fontWeight="800" fontSize="20" fill="var(--primary)" opacity="0.6">
                <animate attributeName="y" values="0;-5;0" dur="2.5s" repeatCount="indefinite" />
                ?
              </text>
            </g>

            {/* Cuello */}
            <rect x="75" y="74" width="14" height="12" rx="4" fill="#dcc8b0" />

            {/* Cuerpo / Camisa */}
            <path d="M50,86 Q52,82 75,82 L89,82 Q112,82 114,86 L120,140 Q120,148 112,148 L52,148 Q44,148 44,140 Z" fill="var(--primary)" />
            {/* Detalle de cuello de camisa */}
            <path d="M75,82 L82,95 L89,82" fill="none" stroke="var(--primary-container)" strokeWidth="2" />

            {/* Brazo izquierdo — sosteniendo mapa */}
            <path d="M50,90 Q35,95 28,115 Q24,128 30,135" fill="none" stroke="#dcc8b0" strokeWidth="10" strokeLinecap="round" />
            {/* Mano izquierda */}
            <circle cx="30" cy="136" r="7" fill="#dcc8b0" />

            {/* Brazo derecho — rascándose la cabeza */}
            <path d="M114,90 Q128,88 130,70 Q131,58 120,48" fill="none" stroke="#dcc8b0" strokeWidth="10" strokeLinecap="round" />
            {/* Mano derecha */}
            <circle cx="118" cy="46" r="7" fill="#dcc8b0" />

            {/* Piernas */}
            <rect x="60" y="148" width="14" height="60" rx="5" fill="var(--primary-container)" />
            <rect x="90" y="148" width="14" height="60" rx="5" fill="var(--primary-container)" />

            {/* Zapatos */}
            <ellipse cx="67" cy="212" rx="12" ry="6" fill="var(--primary)" />
            <ellipse cx="97" cy="212" rx="12" ry="6" fill="var(--primary)" />
          </g>

          {/* ===== Mapa desplegado en la mano izquierda ===== */}
          <g transform="translate(135, 210)">
            <rect x="0" y="0" width="58" height="45" rx="4" fill="var(--surface-container-lowest)" stroke="var(--outline-variant)" strokeWidth="1.5" />
            {/* Líneas del mapa */}
            <path d="M8,12 L20,8 L32,18 L45,10 L52,16" fill="none" stroke="var(--accent-green)" strokeWidth="1.5" opacity="0.6" />
            <path d="M5,25 L18,20 L28,28 L42,22 L52,30" fill="none" stroke="var(--primary-fixed-dim)" strokeWidth="1.2" opacity="0.5" />
            {/* Punto de ubicación con signo de interrogación */}
            <circle cx="32" cy="18" r="5" fill="var(--error)" opacity="0.3" />
            <circle cx="32" cy="18" r="2.5" fill="var(--error)" opacity="0.7" />
            {/* X de "perdido" */}
            <g transform="translate(25, 30)" opacity="0.5">
              <line x1="0" y1="0" x2="8" y2="8" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="0" x2="0" y2="8" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>

          {/* ===== Señal de dirección rota ===== */}
          <g transform="translate(330, 140)">
            {/* Poste */}
            <rect x="18" y="0" width="8" height="200" rx="3" fill="var(--primary)" />
            <rect x="18" y="195" width="8" height="5" rx="2" fill="var(--primary-container)" />
            {/* Letrero superior — roto/caído */}
            <g transform="rotate(-12, 22, 30)">
              <path d="M22,20 L85,20 L95,35 L85,50 L22,50 Z" fill="var(--accent-green)" stroke="var(--primary)" strokeWidth="2" />
              <rect x="32" y="31" width="40" height="4" rx="2" fill="var(--on-primary)" opacity="0.6" />
              <rect x="32" y="38" width="25" height="4" rx="2" fill="var(--on-primary)" opacity="0.4" />
            </g>
            {/* Letrero inferior — apuntando al otro lado */}
            <g transform="translate(0, 40)">
              <path d="M22,20 L-41,20 L-51,35 L-41,50 L22,50 Z" fill="var(--primary-container)" stroke="var(--primary)" strokeWidth="2" />
              <rect x="-30" y="31" width="35" height="4" rx="2" fill="var(--on-primary)" opacity="0.5" />
              <rect x="-25" y="38" width="20" height="4" rx="2" fill="var(--on-primary)" opacity="0.3" />
            </g>
          </g>

          {/* ===== Lupa en el suelo ===== */}
          <g transform="translate(90, 320)">
            <rect x="28" y="22" width="35" height="8" rx="4" fill="var(--primary-container)" transform="rotate(40, 28, 22)" />
            <circle cx="22" cy="18" r="16" fill="none" stroke="var(--primary)" strokeWidth="5" />
            <circle cx="22" cy="18" r="9" fill="var(--primary-fixed)" opacity="0.4" />
            <path d="M16,12 Q19,8 26,10" fill="none" stroke="var(--on-primary)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          </g>

          {/* ===== Partículas decorativas ===== */}
          <circle cx="100" cy="120" r="4" fill="var(--accent-green)" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.15;0.5" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="420" cy="100" r="3" fill="var(--primary-fixed)" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="440" cy="220" r="5" fill="var(--accent-green)" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="70" cy="200" r="3" fill="var(--primary-fixed-dim)" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.15;0.6" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="460" cy="310" r="4" fill="var(--accent-green)" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.08;0.3" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Signos de interrogación flotantes */}
          <text x="130" y="90" fontFamily="var(--font-sans)" fontWeight="700" fontSize="16" fill="var(--accent-green)" opacity="0.35">
            <animate attributeName="y" values="90;80;90" dur="4s" repeatCount="indefinite" />
            ?
          </text>
          <text x="400" y="150" fontFamily="var(--font-sans)" fontWeight="700" fontSize="13" fill="var(--primary-fixed-dim)" opacity="0.3">
            <animate attributeName="y" values="150;140;150" dur="3s" repeatCount="indefinite" />
            ?
          </text>
          <text x="450" y="260" fontFamily="var(--font-sans)" fontWeight="700" fontSize="11" fill="var(--primary)" opacity="0.12">
            <animate attributeName="y" values="260;252;260" dur="3.5s" repeatCount="indefinite" />
            ?
          </text>
        </svg>

        {/* Texto informativo */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-[1.75rem] sm:text-[1.375rem] font-extrabold text-primary m-0 tracking-[-0.5px] leading-[1.2]">Página No Encontrada</h1>
          <p className="text-[0.9375rem] sm:text-sm text-on-surface-variant leading-[1.7] m-0 max-w-[26.25rem]">
            La página que buscas no existe o ha sido movida.
            Verifica la URL e intenta de nuevo.
          </p>

          <div className="flex gap-3 mt-2 flex-wrap justify-center sm:flex-col sm:w-full">
            <button
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold font-sans cursor-pointer border-none transition-all duration-[0.25s] ease-[cubic-bezier(0.16,1,0.3,1)] sm:w-full bg-primary text-on-primary shadow-[0_2px_12px_rgba(4,71,56,0.2)] hover:bg-primary-container hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(4,71,56,0.25)] active:translate-y-0"
              onClick={() => navigate('/login')}
            >
              <span className="material-symbols-outlined text-lg">home</span>
              Ir al Inicio
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold font-sans cursor-pointer transition-all duration-[0.25s] ease-[cubic-bezier(0.16,1,0.3,1)] sm:w-full bg-transparent text-primary border-[1.5px] border-outline-variant hover:bg-surface-container hover:border-primary hover:-translate-y-0.5 active:translate-y-0"
              onClick={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate('/dashboard');
                }
              }}
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
