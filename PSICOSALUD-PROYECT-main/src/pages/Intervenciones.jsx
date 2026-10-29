import React, { useState, useEffect } from 'react';
import { intervencionesService } from '../features/intervenciones/api/intervenciones.service';
import { useAuth } from '../context/AuthContext';
import CalendarBoard from '../features/intervenciones/components/CalendarBoard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import CustomSelect from '../components/ui/CustomSelect';

export default function Intervenciones() {
  const toast = useToast();
  const { sessionUser } = useAuth();
  const isPsicologo = sessionUser?.rol === 'Psicólogo';
  const [intervenciones, setIntervenciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [estadoFilter, setEstadoFilter] = useState('Todos');

  const fetchIntervenciones = async () => {
    setIsLoading(true);
    let data = [];
    try {
      // Cargamos TODAS las intervenciones para que los psicólogos tengan visibilidad global
      data = await intervencionesService.getIntervenciones(null);
    } catch (err) {
      console.error("Error al cargar las intervenciones desde la DB", err, JSON.stringify(err));
    }

    setIntervenciones(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchIntervenciones();
  }, [isPsicologo, sessionUser?.id]);

  const handleUpdateEstado = async (id, nuevoEstado) => {
    try {
      await intervencionesService.updateEstado(id, nuevoEstado);
      setIntervenciones(prev => prev.map(inv => inv.id === id ? { ...inv, estado: nuevoEstado } : inv));
      toast.success('Estado actualizado correctamente.');
    } catch (err) {
      toast.error("Error al actualizar el estado de la intervención.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await intervencionesService.deleteIntervencion(id);
      setIntervenciones(prev => prev.filter(inv => inv.id !== id));
      toast.success('Intervención eliminada.');
    } catch (err) {
      toast.error("Error al eliminar la intervención.");
    }
  };

  const filteredIntervenciones = intervenciones.filter(inv => {
    if (estadoFilter !== 'Todos' && inv.estado !== estadoFilter) return false;
    return true;
  });

  if (isLoading) return <LoadingSpinner message="Cargando panel de intervenciones..." />;

  return (
    <div className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background min-h-screen px-12 py-9 flex flex-col h-screen overflow-hidden">

      {/* ── Encabezado ────────────────────────────────────────────── */}
      <header className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h2 className="text-[1.75rem] font-extrabold text-primary mb-1.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[2rem]">event_note</span>
            Calendario de Intervenciones
          </h2>
          <p className="text-sm text-on-surface-variant m-0">
            {isPsicologo
              ? 'Tus intervenciones asignadas listas para ejecutar.'
              : 'Vista general del progreso de intervenciones.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1.5 z-40 w-48">
            <span className="text-[0.6875rem] font-bold text-primary uppercase tracking-widest">Filtrar por Estado</span>
            <CustomSelect
              value={estadoFilter}
              onChange={(val) => setEstadoFilter(val)}
              options={[
                { value: "Todos", label: "Todos los estados" },
                { value: "Programada", label: "Programadas" },
                { value: "Completada", label: "Completadas" }
              ]}
              placeholder="Todos los estados"
            />
          </div>

        </div>
      </header>

      {/* ── Calendario ────────────────────────────────────────── */}
      <main className="flex-1 min-h-0 overflow-hidden pb-4">
        <CalendarBoard
          intervenciones={filteredIntervenciones}
          onUpdateEstado={handleUpdateEstado}
          onDelete={handleDelete}
          currentUser={sessionUser}
        />
      </main>

    </div>
  );
}
