import React, { useState } from 'react';
import { useToast } from '../../../context/ToastContext';

export default function ModalNuevaArea({ visible, onCerrar, onGuardar }) {
  const toast = useToast();
  const [nombre, setNombre] = useState('');
  const [trabajadores, setTrabajadores] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!visible) return null;

  const limpiarFormulario = () => {
    setNombre('');
    setTrabajadores('');
    setIsSubmitting(false);
  };

  const handleCerrar = () => {
    limpiarFormulario();
    onCerrar();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error('Ingresa el nombre del área.');
      return;
    }
    const workersCount = parseInt(trabajadores, 10);
    if (isNaN(workersCount) || workersCount < 0) {
      toast.error('Ingresa una cantidad válida de trabajadores (0 o más).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onGuardar({ nombre: nombre.trim(), trabajadores: workersCount });
      limpiarFormulario();
    } catch (err) {
      console.error('Error al agregar área:', err);
      toast.error('Hubo un error al agregar el área.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-[1000]">
      <div className="bg-white rounded-2xl p-8 w-[31.25rem] max-w-[90%] shadow-[0_8px_32px_rgba(4,71,56,0.15)] flex flex-col gap-5 font-sans">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="bg-[rgba(4,71,56,0.08)] text-primary w-14 h-14 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[2rem]">domain_add</span>
          </div>
          <h3 className="text-xl font-bold text-primary m-0">Agregar Nueva Área</h3>
          <p className="text-on-surface-variant text-sm mt-1 mb-0 leading-relaxed">
            Ingresa los detalles de la nueva área organizativa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-on-surface">Nombre del Área</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Operaciones"
              required
              className="w-full py-2.5 px-3.5 border border-outline-variant rounded-lg text-sm bg-white outline-none font-sans text-on-surface"
            />
          </div>
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-on-surface">Cantidad de Trabajadores</label>
            <input
              type="number"
              min="0"
              value={trabajadores}
              onChange={(e) => setTrabajadores(e.target.value)}
              placeholder="Ej. 15"
              required
              className="w-full py-2.5 px-3.5 border border-outline-variant rounded-lg text-sm bg-white outline-none font-sans text-on-surface"
            />
          </div>

          <div className="flex justify-center gap-3 mt-3">
            <button
              type="button"
              onClick={handleCerrar}
              className="px-5 py-2.5 bg-transparent border border-outline-variant rounded-lg font-bold text-sm text-on-surface-variant cursor-pointer font-sans transition-colors duration-200 hover:bg-surface-container-low"
              disabled={isSubmitting}
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-white border-none rounded-lg font-bold text-sm cursor-pointer font-sans flex items-center gap-2 transition-opacity duration-200 hover:opacity-90"
              disabled={isSubmitting}
            >
              <span className={`material-symbols-outlined text-lg ${isSubmitting ? 'animate-spin' : ''}`}>
                {isSubmitting ? 'sync' : 'save'}
              </span>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
