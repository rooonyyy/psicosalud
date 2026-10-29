import React, { useState } from 'react';
export default function ModalDetalleIntervencion({ isOpen, onClose, intervencion, onUpdateEstado, onDelete, currentUser }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !intervencion) return null;

  const isAdmin = currentUser?.rol === 'Administrador';
  const isOwner = currentUser?.id === intervencion.especialista_id;
  const canModify = isAdmin || isOwner;

  const handleUpdate = async (nuevoEstado) => {
    if (!canModify) return;
    setIsUpdating(true);
    await onUpdateEstado(intervencion.id, nuevoEstado);
    setIsUpdating(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!canModify) return;
    setIsDeleting(true);
    await onDelete(intervencion.id);
    setIsDeleting(false);
    onClose();
  };

  const estados = ['Programada', 'Completada'];

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-[1000]">
      <div className="bg-white rounded-2xl p-8 w-[31.25rem] max-w-[90%] shadow-[0_8px_32px_rgba(4,71,56,0.15)] flex flex-col gap-5 font-sans">
        
        {/* Encabezado del modal */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="bg-[rgba(4,71,56,0.08)] text-primary w-14 h-14 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[2rem]">assignment</span>
          </div>
          <h3 className="text-xl font-bold text-primary m-0">Detalle de Intervención</h3>
          <p className="text-on-surface-variant text-sm mt-1 mb-0 leading-relaxed">Revisa la información de esta intervención.</p>
        </div>

        {/* Detalles */}
        <div className="flex flex-col gap-4 mt-2">
          {/* Título Principal */}
          <div className="flex flex-col gap-1.5 text-center mb-2">
            <span className="text-sm font-bold text-on-surface uppercase tracking-wider">{intervencion.tipo_intervencion}</span>
            <div className="flex justify-center mt-1">
              <span className="inline-flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant/40 px-3 py-1 rounded-lg text-xs font-bold text-on-surface">
                <span className="material-symbols-outlined text-[14px] text-primary">flag</span>
                {intervencion.estado}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30">
              <span className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Área</span>
              <span className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">domain</span>
                {intervencion.areas?.nombre || 'General'}
              </span>
            </div>
            
            <div className="flex flex-col gap-1.5 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30">
              <span className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Fecha</span>
              <span className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">event</span>
                {intervencion.fecha_propuesta}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30">
            <span className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Especialista a Cargo</span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                {intervencion.users?.nombre ? intervencion.users.nombre[0].toUpperCase() : '?'}
              </div>
              <span className="text-sm font-semibold text-on-surface">
                {intervencion.users?.nombre ? `${intervencion.users.nombre} ${intervencion.users.apellido1 ?? ''}`.trim() : 'Sin asignar'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Notas y Descripción</span>
            <div className="text-sm text-on-surface/80 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30 min-h-[5rem] whitespace-pre-wrap leading-relaxed">
              {intervencion.notas ? intervencion.notas : <span className="italic opacity-50">Sin notas adicionales proporcionadas...</span>}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-center gap-3 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-transparent border border-outline-variant rounded-lg font-bold text-sm text-on-surface-variant cursor-pointer font-sans transition-colors duration-200 hover:bg-surface-container-low"
            disabled={isUpdating || isDeleting}
          >
            Cerrar
          </button>
          
          {canModify && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isUpdating}
              className="px-5 py-2.5 bg-primary text-white border-none rounded-lg font-bold text-sm cursor-pointer font-sans flex items-center gap-2 transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
