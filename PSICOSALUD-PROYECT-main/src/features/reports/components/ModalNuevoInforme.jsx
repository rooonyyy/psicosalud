import React, { useState, useRef, useEffect } from 'react';
import { intervencionesService } from '../../intervenciones/api/intervenciones.service';
import { useToast } from '../../../context/ToastContext';
import CustomSelect from '../../../components/ui/CustomSelect';

// Componente de modal para crear un nuevo informe
export default function ModalNuevoInforme({ visible, onCerrar, onGuardar, usuarioActual, areasDb = [] }) {
  const toast = useToast();
  // Estados locales para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [area, setArea] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Estados para barras de progreso
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);

  // Estados para intervenciones
  const [intervencionesPendientes, setIntervencionesPendientes] = useState([]);
  const [selectedIntervencionId, setSelectedIntervencionId] = useState('');

  const fileInputRef = useRef(null);

  // Efecto para inicializar el área seleccionada y cargar intervenciones pendientes
  useEffect(() => {
    if (visible && !area) {
      setArea('');
    }

    const fetchIntervenciones = async () => {
      if (visible && usuarioActual?.id) {
        try {
          // Obtener las intervenciones del usuario logueado o todas si es admin
          const isAdmin = usuarioActual.rol === 'Administrador';
          const allIntervenciones = await intervencionesService.getIntervenciones(isAdmin ? null : usuarioActual.id);
          // Filtrar solo las que están 'Programada'
          const pendientes = allIntervenciones.filter(inv => inv.estado === 'Programada');
          setIntervencionesPendientes(pendientes);
        } catch (err) {
          console.error("Error al cargar intervenciones pendientes:", err);
        }
      }
    };
    fetchIntervenciones();
  }, [visible, areasDb, area, usuarioActual]);

  // Si el modal no es visible, no se renderiza nada
  if (!visible) return null;

  // Limpiar los campos del formulario
  const limpiarFormulario = () => {
    setNombre('');
    setArea('');
    setArchivo(null);
    setDragActive(false);
    setIsSubmitting(false);
    setUploadProgress(0);
    setIsLocalLoading(false);
    setLocalProgress(0);
    setSelectedIntervencionId('');
  };

  // Manejar el cierre del modal
  const handleCerrar = () => {
    limpiarFormulario();
    onCerrar();
  };

  // Guardar el informe y enviar los datos
  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error('Por favor ingrese el nombre del informe.');
      return;
    }
    const nombreUser = usuarioActual?.nombre || '';
    const apellidoUser = usuarioActual?.apellido1 || '';
    const responsable = usuarioActual ? `${nombreUser} ${apellidoUser}`.trim() : 'Usuario Desconocido';

    setIsSubmitting(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return 90;
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 300);

    try {
      await onGuardar({ nombre, responsable, area, archivo, intervencion_id: selectedIntervencionId });
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        limpiarFormulario();
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Eventos de Drag & Drop para el archivo PDF
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.zip', '.rar'];

  const validateAndSetFile = (file) => {
    if (!file) return;

    // Validar peso max 15MB
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('El archivo supera el peso máximo permitido de 15MB.');
      return;
    }

    // Validar extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      toast.error(`El formato del archivo no está permitido. Formatos soportados: ${allowedTypes.join(', ')}`);
      return;
    }

    setIsLocalLoading(true);
    setLocalProgress(0);
    const interval = setInterval(() => {
      setLocalProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setArchivo(file);
          setTimeout(() => setIsLocalLoading(false), 200);
          return 100;
        }
        return prev + 15;
      });
    }, 50);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const abrirSelectorArchivo = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-[1000]">
      <div className="bg-white rounded-2xl p-8 w-[31.25rem] max-w-[90%] shadow-[0_8px_32px_rgba(4,71,56,0.15)] flex flex-col gap-5 font-sans">
        {/* Encabezado con icono y título */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="bg-[rgba(4,71,56,0.08)] text-primary w-14 h-14 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[2rem]">description</span>
          </div>
          <h3 className="text-xl font-bold text-primary m-0">Nuevo Informe</h3>
        </div>

        {/* Formulario de creación */}
        <form onSubmit={handleGuardar} className="flex flex-col gap-4">
          {/* Campo: Intervención Vinculada */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">Intervención a Completar</label>
            <CustomSelect
              value={selectedIntervencionId}
              onChange={(val) => {
                setSelectedIntervencionId(val);
                if (val) {
                  const inv = intervencionesPendientes.find(i => i.id === val);
                  if (inv) {
                    setNombre(`Informe - ${inv.tipo_intervencion}`);
                    if (inv.areas?.nombre) {
                      setArea(inv.areas.nombre);
                    }
                  }
                }
              }}
              options={[
                ...intervencionesPendientes.map(inv => ({
                  value: inv.id,
                  label: `${inv.tipo_intervencion} - ${inv.fecha_propuesta}`
                }))
              ]}
              placeholder="Sin vincular a intervención"
            />
          </div>

          {/* Campo: Nombre del informe */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">Nombre del informe</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Evaluación de Clima Laboral Q4"
              className="w-full py-2.5 px-3.5 border border-outline-variant rounded-lg text-sm bg-white outline-none font-sans text-on-surface"
            />
          </div>

          {/* Grid de 2 columnas para selectores */}
          <div className="grid grid-cols-2 gap-4">
            {/* Campo: Responsable (Solo Lectura) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">Responsable</label>
              <input
                type="text"
                disabled
                value={usuarioActual ? `${usuarioActual.nombre} ${usuarioActual.apellido1}` : 'Cargando...'}
                className="w-full py-2.5 px-3.5 border border-outline-variant rounded-lg text-sm bg-gray-100 cursor-not-allowed outline-none font-sans text-on-surface-variant"
              />
            </div>

            {/* Campo: Área */}
            <div className="flex flex-col gap-1.5 z-40">
              <label className="text-xs font-semibold text-on-surface">Área</label>
              <CustomSelect
                value={area}
                onChange={(val) => setArea(val)}
                disabled={!!selectedIntervencionId}
                options={areasDb.map(opt => ({ value: opt, label: opt }))}
                placeholder="Seleccione el área"
              />
            </div>
          </div>

          {/* Campo: Zona drag-and-drop de archivo PDF */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">Documento Adjunto (Max 15MB)</label>
            <p className="text-[0.6875rem] text-on-surface-variant mb-2">
              Formatos: .pdf, .doc(x), .xls(x), .ppt(x), .jpg, .png, .zip, .rar
            </p>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={abrirSelectorArchivo}
              className={`border-2 border-dashed border-outline-variant bg-[#f9f9f8] rounded-xl py-5 px-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center gap-2 ${dragActive ? '!border-primary !bg-[rgba(4,71,56,0.04)]' : ''}`}
            >
              <span className="material-symbols-outlined text-[2rem] text-primary">
                upload_file
              </span>

              {isLocalLoading ? (
                <div className="w-full mt-2">
                  <div className="h-1.5 bg-gray-200 rounded overflow-hidden">
                    <div className="h-full bg-[var(--primary)] transition-all duration-100 ease-linear" style={{ width: `${localProgress}%` }}></div>
                  </div>
                  <p className="text-xs text-[var(--primary)] mt-1">Cargando archivo... {localProgress}%</p>
                </div>
              ) : archivo ? (
                <div className="flex flex-col gap-0.5">
                  <p className="text-[0.8125rem] font-semibold text-primary break-all m-0">{archivo.name}</p>
                  <p className="text-[0.6875rem] text-on-surface-variant m-0">
                    {(archivo.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-[0.8125rem] text-on-surface font-medium m-0">Arrastra y suelta tu archivo aquí</p>
                  <p className="text-xs text-on-surface-variant m-0 mb-2.5">o haz clic para buscar en tus carpetas</p>
                </div>
              )}

              {/* Input de tipo file oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip,.rar"
                onChange={handleFileChange}
                onClick={(e) => e.stopPropagation()}
                className="hidden"
                disabled={isSubmitting || isLocalLoading}
              />

              <button
                type="button"
                className="py-1.5 px-3 bg-white border border-outline-variant rounded-md text-xs font-semibold text-on-surface-variant cursor-pointer"
                disabled={isSubmitting || isLocalLoading}
              >
                {archivo ? 'Cambiar archivo' : 'Seleccionar archivo'}
              </button>
            </div>
          </div>

          {/* Botones de acción del pie */}
          <div className="flex flex-col gap-3 mt-2">
            {isSubmitting && (
              <div className="w-full">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-xs text-center text-on-surface-variant mt-1 font-medium">
                  Guardando y subiendo archivo... {uploadProgress}%
                </p>
              </div>
            )}
            {/* Acciones */}
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
          </div>
        </form>
      </div>
    </div>
  );
}
