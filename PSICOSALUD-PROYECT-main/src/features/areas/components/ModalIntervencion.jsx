import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { usersService } from '../../users/api/users.service';
import { insforge } from '../../../lib/insforge';
import { useToast } from '../../../context/ToastContext';
import CustomSelect from '../../../components/ui/CustomSelect';

export default function ModalIntervencion({ isOpen, onClose, areaNombre, areaId, quizType, fechaReporte }) {
  const toast = useToast();
  const { sessionUser: usuarioActual } = useAuth();
  const isAdmin = usuarioActual?.rol === 'Administrador';

  const [formData, setFormData] = useState({
    tipo: '',
    fecha: '',
    especialistaId: '', // To store selected psychologist if Admin
    notas: ''
  });

  const [psicologos, setPsicologos] = useState([]);
  const [loadingPsicologos, setLoadingPsicologos] = useState(false);

  useEffect(() => {
    if (isOpen && isAdmin) {
      const fetchPsicologos = async () => {
        setLoadingPsicologos(true);
        try {
          const allUsers = await usersService.getUsers();
          const psicos = allUsers.filter(u => u.rol === 'Psicólogo');
          setPsicologos(psicos);
        } catch (error) {
          console.error("Error fetching psicólogos:", error);
        } finally {
          setLoadingPsicologos(false);
        }
      };
      fetchPsicologos();
    }
  }, [isOpen, isAdmin]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Determine the specialist ID
    let especialistaFinalId = null;
    if (isAdmin) {
      especialistaFinalId = formData.especialistaId;
    } else {
      especialistaFinalId = usuarioActual ? usuarioActual.id : null;
    }

    try {
      // 1. Validar que no exista ya una intervención para esta misma alerta (área + quiz + fecha)
      let query = insforge.database
        .from('intervenciones')
        .select('id, estado')
        .eq('area_id', areaId);

      if (quizType) query = query.eq('quiz_type', quizType);
      if (fechaReporte) query = query.eq('fecha_alerta', fechaReporte);

      const { data: existentes, error: checkError } = await query;

      if (checkError) throw checkError;

      if (existentes && existentes.length > 0) {
        const est = existentes[0].estado;
        if (est === 'Programada' || est === 'En Progreso') {
          toast.error(`Ya existe una intervención ${est} para esta área y cuestionario. Complétela o cancálela antes de registrar otra.`);
        } else {
          toast.error("Ya existe una intervención registrada y resuelta para esta alerta específica. No se pueden duplicar intervenciones para la misma alerta.");
        }
        setIsSubmitting(false);
        return;
      }

      // 2. Insertar la nueva intervención
      const { data, error } = await insforge.database
        .from('intervenciones')
        .insert([{
          area_id: areaId,
          especialista_id: especialistaFinalId,
          tipo_intervencion: formData.tipo,
          fecha_propuesta: formData.fecha,
          notas: formData.notas,
          estado: 'Programada',
          quiz_type: quizType || null,
          fecha_alerta: fechaReporte || null
        }]);

      if (error) {
        console.error("Error al guardar intervención:", error);
        toast.error("Error al guardar la intervención en la base de datos.");
      } else {
        toast.success("Intervención guardada exitosamente.");
        onClose();
      }
    } catch (err) {
      console.error("Excepción al guardar intervención:", err);
      toast.error("Excepción al guardar la intervención.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-[1000]">
      <div className="bg-white rounded-2xl p-8 w-[31.25rem] max-w-[90%] shadow-[0_8px_32px_rgba(4,71,56,0.15)] flex flex-col gap-5 font-sans">

        {/* Encabezado con icono y título */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="bg-[rgba(4,71,56,0.08)] text-primary w-14 h-14 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[2rem]">calendar_add_on</span>
          </div>
          <h3 className="text-xl font-bold text-primary m-0">Programar Intervención</h3>
          <p className="text-on-surface-variant text-sm mt-1 mb-0 leading-relaxed">Completa los datos para registrar la intervención.</p>
        </div>

        {/* Formulario */}
        <form id="form-intervencion" onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">Tipo de Intervención</label>
            <input
              type="text"
              required
              placeholder="Ej. Taller de Manejo de Estrés"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full py-2.5 px-3.5 border border-outline-variant rounded-lg text-sm bg-white outline-none font-sans text-on-surface"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">Área</label>
              <input
                type="text"
                disabled
                value={areaNombre}
                className="w-full py-2.5 px-3.5 border border-outline-variant rounded-lg text-sm bg-surface-container-lowest cursor-not-allowed outline-none font-sans text-on-surface-variant"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">Fecha Propuesta</label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full py-2.5 px-3.5 border border-outline-variant rounded-lg text-sm bg-white outline-none font-sans text-on-surface"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">
              {isAdmin ? 'Asignar a Especialista' : 'Especialista (Logeado)'}
            </label>

            {isAdmin ? (
              <div className="z-40">
                <CustomSelect
                  value={formData.especialistaId}
                  onChange={(val) => setFormData({ ...formData, especialistaId: val })}
                  disabled={loadingPsicologos}
                  options={[
                    { value: "", label: loadingPsicologos ? 'Cargando...' : 'Seleccione un Psicólogo' },
                    ...psicologos.map(psico => ({
                      value: psico.id,
                      label: `${psico.nombre} ${psico.apellido1}`
                    }))
                  ]}
                  placeholder={loadingPsicologos ? 'Cargando...' : 'Seleccione un Psicólogo...'}
                />
              </div>
            ) : (
              <input
                type="text"
                disabled
                value={usuarioActual ? `${usuarioActual.nombre} ${usuarioActual.apellido1}` : 'Cargando...'}
                className="w-full py-2.5 px-3.5 border border-outline-variant rounded-lg text-sm bg-surface-container-lowest cursor-not-allowed outline-none font-sans text-on-surface-variant"
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">Notas adicionales</label>
            <textarea
              rows="3"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Ej: El grupo reportó problemas específicos..."
              className="w-full py-2.5 px-3.5 border border-outline-variant rounded-lg text-sm bg-white outline-none font-sans text-on-surface resize-none"
            ></textarea>
          </div>

          {/* Botones */}
          <div className="flex justify-center gap-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-transparent border border-outline-variant rounded-lg font-bold text-sm text-on-surface-variant cursor-pointer font-sans transition-colors duration-200 hover:bg-surface-container-low"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-primary text-white border-none rounded-lg font-bold text-sm cursor-pointer font-sans flex items-center gap-2 transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
