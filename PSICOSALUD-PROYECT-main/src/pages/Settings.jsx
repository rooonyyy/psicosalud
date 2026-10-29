import React, { useState, useEffect } from 'react';
import { areasService } from '../features/areas/api/areas.service';
import ModalNuevaArea from '../features/areas/components/ModalNuevaArea';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
/**
 * Página de Configuración del Sistema
 * Permite a los administradores gestionar la cantidad de trabajadores por área.
 * El total global se calcula automáticamente como la suma de todas las áreas.
 */
export default function Settings() {
  const toast = useToast();
  const confirm = useConfirm();
  const [areas, setAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Estado para modal Nueva Área
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const fetchAreas = async () => {
    try {
      setIsLoading(true);
      const data = await areasService.getAreas();
      setAreas(data);
    } catch (err) {
      console.error('Error al cargar áreas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  // Total global calculado desde las áreas
  const totalGlobal = areas.reduce((sum, a) => sum + (Number(a.total_trabajadores) || 0), 0);

  // Iniciar edición de un área
  const handleEdit = (area) => {
    setEditingId(area.id);
    setEditValue(area.total_trabajadores?.toString() || '0');
  };

  // Cancelar edición
  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  // Guardar el nuevo valor
  const handleSave = async (areaId) => {
    const newValue = parseInt(editValue, 10);
    if (isNaN(newValue) || newValue < 0) {
      toast.error('Ingresa un número válido mayor o igual a 0.');
      return;
    }

    try {
      setSaving(true);
      await areasService.updateAreaTrabajadores(areaId, newValue);
      setAreas(areas.map(a => a.id === areaId ? { ...a, total_trabajadores: newValue } : a));
      setEditingId(null);
      setEditValue('');
      toast.success('Área actualizada correctamente.');
    } catch (err) {
      console.error('Error al actualizar:', err);
      toast.error('Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  // Manejar tecla Enter para guardar
  const handleKeyDown = (e, areaId) => {
    if (e.key === 'Enter') handleSave(areaId);
    if (e.key === 'Escape') handleCancel();
  };

  // Manejar agregar nueva área
  const handleGuardarNuevaArea = async ({ nombre, trabajadores }) => {
    await areasService.createArea(nombre, trabajadores);
    toast.success('Área agregada correctamente.');
    setIsAddModalOpen(false);
    fetchAreas(); // Recargar áreas
  };

  const handleGuardarEliminarArea = async (areaId) => {
    try {
      await areasService.deleteArea(areaId);
      toast.success('Área eliminada correctamente.');
      fetchAreas();
    } catch (err) {
      console.error('Error al eliminar área:', err);
      toast.error('Error al eliminar el área. Asegúrate de que no tenga registros asociados.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando configuración..." />;
  }

  return (
    <div className="bg-background min-h-screen py-9 px-10">
      {/* Encabezado */}
      <header className="mb-8">
        <div>
          <h2 className="text-[1.75rem] font-extrabold text-primary mb-1.5 m-0">Configuración</h2>
          <p className="text-sm text-on-surface-variant m-0">Administra los parámetros generales del sistema.</p>
        </div>
      </header>

      {/* Card: Trabajadores por Área */}
      <div className="bg-white rounded-2xl border border-surface-container-high shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex items-start justify-between flex-wrap gap-4 pt-7 px-7 pb-5 border-b border-surface-container-high">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[1.625rem]">groups</span>
            </div>
            <div>
              <h3 className="text-[1.0625rem] font-bold text-on-surface mb-1">Trabajadores por Área</h3>
              <p className="text-[0.8125rem] text-on-surface-variant leading-relaxed m-0">Define la cantidad de trabajadores en cada área organizativa.</p>
            </div>
          </div>
          <button 
            type="button" 
            className="py-2 px-4 bg-primary text-white border-none rounded-lg font-medium text-sm cursor-pointer font-sans flex items-center gap-2 transition-opacity hover:opacity-90" 
            onClick={() => setIsAddModalOpen(true)}
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Nueva Área
          </button>
        </div>

        {/* Total Global */}
        <div className="flex items-center gap-4 my-5 mx-7 py-4.5 px-6 bg-primary-fixed rounded-xl border border-[rgba(4,71,56,0.15)]">
          <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-2xl">corporate_fare</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-[0.5px] mb-0.5">Total Global de Trabajadores</span>
            <span className="block text-[2rem] font-extrabold text-primary leading-none">{totalGlobal}</span>
          </div>
        </div>

        {/* Tabla de Áreas */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="py-3 px-6 text-left text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-[0.6px]">Área</th>
                <th className="py-3 px-6 text-left text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-[0.6px]">Trabajadores</th>
                <th className="py-3 px-6 text-center text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-[0.6px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => (
                <tr key={area.id} className="transition-colors duration-150 hover:bg-surface-container-low">
                  <td className="py-4 px-6 border-t border-surface-container-high text-sm text-on-surface align-middle">
                    <div className="flex items-center gap-2.5 font-semibold">
                      <span className="material-symbols-outlined text-xl text-primary">domain</span>
                      {area.nombre}
                    </div>
                  </td>
                  <td className="py-4 px-6 border-t border-surface-container-high text-sm text-on-surface align-middle">
                    {editingId === area.id ? (
                      <input
                        type="number"
                        min="0"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, area.id)}
                        className="w-[5.625rem] py-2 px-3 text-sm font-semibold border-2 border-primary rounded-lg outline-none bg-surface-container-low text-primary transition-all focus:ring-[0.1875rem] focus:ring-[rgba(4,71,56,0.12)]"
                        autoFocus
                      />
                    ) : (
                      <span className="inline-flex items-center justify-center min-w-11 py-1 px-3.5 bg-surface-container rounded-full font-bold text-sm text-primary">
                        {area.total_trabajadores || 0}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 border-t border-surface-container-high text-sm text-on-surface align-middle">
                    {editingId === area.id ? (
                      <div className="flex gap-1.5">
                        <button
                          className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl border-none text-[0.8125rem] font-semibold cursor-pointer transition-all hover:scale-[0.97] bg-primary text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-wait"
                          onClick={() => handleSave(area.id)}
                          disabled={saving}
                        >
                          <span className="material-symbols-outlined text-lg">save</span>
                          {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border-none text-[0.8125rem] font-semibold cursor-pointer transition-all hover:scale-[0.97] bg-surface-container text-secondary hover:bg-secondary-container hover:text-primary"
                          onClick={handleCancel}
                          disabled={saving}
                          title="Descartar cambios"
                        >
                          <span className="material-symbols-outlined text-lg">undo</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <button
                          className="px-3 py-1.5 border border-outline-variant rounded-md cursor-pointer font-sans text-xs flex items-center justify-center transition-all duration-200 bg-surface-container-low text-secondary hover:bg-secondary-container hover:text-primary"
                          onClick={() => handleEdit(area)}
                          title="Editar área"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          className="px-3 py-1.5 border border-outline-variant rounded-md cursor-pointer font-sans text-xs flex items-center justify-center transition-all duration-200 bg-surface-container-low text-secondary hover:bg-secondary-container hover:text-primary"
                          onClick={async () => {
                            if (await confirm('¿Estás seguro de que deseas eliminar esta área? Esta acción no se puede deshacer.')) {
                              handleGuardarEliminarArea(area.id);
                            }
                          }}
                          title="Eliminar área"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal Nueva Área extraído */}
      <ModalNuevaArea
        visible={isAddModalOpen}
        onCerrar={() => setIsAddModalOpen(false)}
        onGuardar={handleGuardarNuevaArea}
      />
    </div>
  );
}
