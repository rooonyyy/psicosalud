import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsService } from '../features/reports/api/reports.service';
import { areasService } from '../features/areas/api/areas.service';
import ReportsFiltros from '../features/reports/components/ReportsFiltros';
import ReportsTabla from '../features/reports/components/ReportsTabla';
import ReportsPaginacion from '../features/reports/components/ReportsPaginacion';
import ModalNuevoInforme from '../features/reports/components/ModalNuevoInforme';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
// Página principal del módulo de reportes (orquestador)
export default function Reports() {
  const toast = useToast();
  const confirm = useConfirm();
  // Estados para los datos de los reportes y filtros
  const [reportes, setReportes] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [responsablesOptions, setResponsablesOptions] = useState([]);
  const [areasDb, setAreasDb] = useState([]);
  const { sessionUser: usuarioActual } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [dataReports, dataUsers, dataAreas] = await Promise.all([
          reportsService.getReports(),
          reportsService.getResponsables(),
          areasService.getAreas()
        ]);
        setReportes(dataReports);
        setAreasDb(dataAreas.map(a => a.nombre).sort());
        
        // Mapear los usuarios a opciones de filtro
        const opcionesUnicas = [...new Set(dataUsers.map(u => `${u.nombre || ''} ${u.apellido1 || ''}`.trim()))].sort();
        setResponsablesOptions(opcionesUnicas);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  const [selectedFecha, setSelectedFecha] = useState('');
  const [selectedResponsable, setSelectedResponsable] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  // Estados para la visibilidad de los modales y el item seleccionado para  // Modal properties
  const [showModalNuevo, setShowModalNuevo] = useState(false);

  // Opciones de filtros calculadas dinámicamente según la lista actual

  const areasOptions = useMemo(() => {
    return [...new Set(reportes.map((r) => r.area))].sort();
  }, [reportes]);

  // Lógica de filtrado en tiempo real
  const reportesFiltrados = useMemo(() => {
    return reportes.filter((r) => {
      const cumpleBusqueda = r.nombre.toLowerCase().includes(search.toLowerCase());
      
      let cumpleFecha = true;
      if (selectedFecha) {
        const d = new Date(r.created_at);
        if (!isNaN(d)) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const rDateFormatted = `${y}-${m}-${day}`;
          cumpleFecha = rDateFormatted === selectedFecha;
        } else {
          cumpleFecha = false;
        }
      }

      const cumpleResponsable = selectedResponsable === '' || r.responsable === selectedResponsable;
      const cumpleArea = selectedArea === '' || r.area === selectedArea;
      return cumpleBusqueda && cumpleFecha && cumpleResponsable && cumpleArea;
    });
  }, [reportes, search, selectedFecha, selectedResponsable, selectedArea]);

  // Lógica de paginación (10 reportes por página)
  const itemsPorPagina = 10;
  const totalEntradas = reportesFiltrados.length;
  const totalPaginas = Math.ceil(totalEntradas / itemsPorPagina) || 1;

  // Ajuste de página activa por si cambian los filtros y hay menos páginas
  const paginaActiva = Math.min(paginaActual, totalPaginas);

  const inicioIndice = (paginaActiva - 1) * itemsPorPagina;
  const finIndice = Math.min(inicioIndice + itemsPorPagina, totalEntradas);

  const itemsPaginados = useMemo(() => {
    return reportesFiltrados.slice(inicioIndice, finIndice);
  }, [reportesFiltrados, inicioIndice, finIndice]);



  // Obtener iniciales del responsable
  const obtenerIniciales = (nombre) => {
    if (!nombre) return '??';
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Guardar un nuevo informe creado desde el modal
  const handleGuardar = async (nuevo) => {
    const nuevoReporte = {
      responsable: nuevo.responsable,
      iniciales: obtenerIniciales(nuevo.responsable),
      area: nuevo.area,
      nombre: nuevo.nombre,
      intervencion_id: nuevo.intervencion_id
    };

    try {
      const createdReport = await reportsService.createReport(nuevoReporte, nuevo.archivo);
      setReportes([createdReport, ...reportes]);
      setShowModalNuevo(false);
      setPaginaActual(1); // Regresa a la primera página para ver el informe insertado
      toast.success('Informe creado correctamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al crear el informe.');
    }
  };



  // Confirmar y procesar la eliminación de un reporte
  const handleConfirmarEliminar = async (informeId, archivoNombre) => {
    try {
      await reportsService.deleteReport(informeId, archivoNombre);
      setReportes(reportes.filter((r) => r.id !== informeId));
      toast.success('Informe eliminado correctamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar el informe de la base de datos.');
    }
  };

  return (
    <div className="py-8 px-16 max-w-[100rem] mx-auto">
      {/* Encabezado */}
      <div className="flex justify-between items-start mb-8 flex-col sm:flex-row gap-4 sm:gap-0">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-[-0.02em] m-0">Registro de Informes</h2>
          <p className="text-on-surface-variant mt-1 text-sm mb-0">Historial de evaluaciones y análisis de bienestar.</p>
        </div>
        <button
          onClick={() => setShowModalNuevo(true)}
          className="px-5 py-2.5 bg-primary text-white border-none rounded-lg font-bold text-sm cursor-pointer font-sans flex items-center gap-2 transition-opacity duration-200 hover:opacity-90"
        >
          + Registrar Informe
        </button>
      </div>

      {/* Componente de barra de filtros */}
      <ReportsFiltros
        search={search}
        onSearch={(val) => { setSearch(val); setPaginaActual(1); }}
        selectedFecha={selectedFecha}
        onFecha={(val) => { setSelectedFecha(val); setPaginaActual(1); }}
        selectedResponsable={selectedResponsable}
        onResponsable={(val) => { setSelectedResponsable(val); setPaginaActual(1); }}
        selectedArea={selectedArea}
        onArea={(val) => { setSelectedArea(val); setPaginaActual(1); }}
        onLimpiar={() => {
          setSearch('');
          setSelectedFecha('');
          setSelectedResponsable('');
          setSelectedArea('');
          setPaginaActual(1);
        }}
        responsablesOptions={responsablesOptions}
        areasOptions={areasOptions}
      />

      {/* Componente de tabla */}
      {isLoading ? (
        <LoadingSpinner message="Cargando informes..." />
      ) : reportes.length === 0 ? (
        <div className="text-center p-[3.75rem_1.25rem] bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
          <span className="material-symbols-outlined text-5xl text-outline mb-4">description</span>
          <h3 className="text-lg font-semibold text-on-surface mb-2">Sin reportes</h3>
          <p className="text-on-surface-variant max-w-[25rem] mx-auto mb-5">
            Aún no hay informes de bienestar registrados en el sistema.
          </p>
          <button onClick={() => setShowModalNuevo(true)} className="px-5 py-2.5 bg-primary text-white border-none rounded-lg font-bold text-sm cursor-pointer font-sans flex items-center justify-center gap-2 transition-opacity duration-200 hover:opacity-90 mx-auto mt-4">
            + Registrar Primer Informe
          </button>
        </div>
      ) : (
        <ReportsTabla
          items={itemsPaginados}
          onEliminar={async (item) => {
            if (await confirm(`¿Estás seguro de que deseas eliminar el informe de "${item.nombre}"?`)) {
              handleConfirmarEliminar(item.id, item.archivo_nombre);
            }
          }}
          currentUser={usuarioActual}
        />
      )}

      {/* Componente de paginación */}
      {totalEntradas > 0 && (
        <ReportsPaginacion
          paginaActual={paginaActiva}
          totalPaginas={totalPaginas}
          inicio={totalEntradas === 0 ? 0 : inicioIndice + 1}
          fin={finIndice}
          total={totalEntradas}
          onCambiar={setPaginaActual}
        />
      )}

      {/* Modal para registrar un nuevo informe */}
      <ModalNuevoInforme
        visible={showModalNuevo}
        onCerrar={() => setShowModalNuevo(false)}
        onGuardar={handleGuardar}
        usuarioActual={usuarioActual}
        areasDb={areasDb}
      />

    </div>
  );
}
