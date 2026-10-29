import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function ModalQuizAsignado({ visible, quiz, onCerrar }) {
  if (!visible || !quiz) return null;

  // The URL to point the QR code to.
  const quizUrl = `${window.location.origin}/login-empleado`;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-[1000]">
      <div className="bg-white rounded-2xl p-8 w-[31.25rem] max-w-[25rem] text-center shadow-[0_8px_32px_rgba(4,71,56,0.15)] flex flex-col gap-5 font-sans">
        <div className="mx-auto bg-[rgba(46,125,95,0.1)] text-primary w-14 h-14 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-[2rem] text-secondary">
            check_circle
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-primary mt-4 mb-0">¡Cuestionario Asignado!</h3>
        <p className="text-on-surface-variant text-sm mt-1 m-0 leading-relaxed">
          El cuestionario ha sido asignado correctamente y ya puede recibir respuestas.
        </p>

        <div className="bg-surface-container-low p-6 rounded-xl mt-4 border border-outline-variant flex flex-col items-center gap-4">
          <div>
            <span className="text-xs font-bold text-on-surface-variant uppercase">
              Código de Acceso
            </span>
            <div className="text-2xl font-extrabold text-primary tracking-[0.05em]">
              {quiz.codigoArea}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-outline-variant">
            <QRCodeCanvas value={quizUrl} size={150} level={"M"} />
          </div>

          <p className="text-[0.8125rem] text-on-surface-variant m-0">
            Los trabajadores pueden escanear el código QR para ingresar directamente al portal de evaluación e ingresar el código de acceso.
          </p>
        </div>

        <div className="flex justify-center mt-6 w-full">
          <button 
            onClick={onCerrar} 
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white border-none rounded-xl font-bold text-sm cursor-pointer font-sans transition-all hover:opacity-90 hover:shadow-md"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
