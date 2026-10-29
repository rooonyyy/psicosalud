import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { quizzesService } from '../features/quizzes/api/quizzes.service';
import { areasService } from '../features/areas/api/areas.service';
import QuizKpis from '../features/quizzes/components/QuizKpis';
import QuizCard from '../features/quizzes/components/QuizCard';
import QuizAgregarCard from '../features/quizzes/components/QuizAgregarCard';
import ModalQuizAsignado from '../features/quizzes/components/ModalQuizAsignado';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

// Componente principal/orquestador de la página de gestión de Quizzes
export default function QuizList() {
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  // Estado para la lista de cuestionarios (para permitir simular la eliminación)
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [respuestasTotales, setRespuestasTotales] = useState(null);
  const [totalTrabajadores, setTotalTrabajadores] = useState(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizzesService.getQuizzes();
      const activeQuiz = data.find(q => q.estado === 'asignado');
      
      let count = null;
      let trabajadoresTotales = null;
      
      if (activeQuiz) {
        count = await quizzesService.getQuizResponsesCount(activeQuiz.id);
        const areasData = await areasService.getAreas();
        
        trabajadoresTotales = areasData
          .filter(a => activeQuiz.areasAsignadas && activeQuiz.areasAsignadas.some(assigned => assigned.toLowerCase() === a.nombre.toLowerCase()))
          .reduce((sum, a) => sum + (Number(a.total_trabajadores) || 0), 0);
      }
      
      setQuizzes(data);
      setRespuestasTotales(count);
      setTotalTrabajadores(trabajadoresTotales);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Modal de éxito post-asignación
  const [quizAsignadoSuccess, setQuizAsignadoSuccess] = useState({ visible: false, quiz: null });

  const handleAssignDirect = async (quiz) => {
    if (!quiz.areasAsignadas || quiz.areasAsignadas.length === 0) {
      await confirm('Debes seleccionar al menos un área antes de asignar el cuestionario. Por favor, edítalo primero.', {
        title: 'Áreas no definidas',
        type: 'warning',
        icon: 'warning',
        hideCancel: true,
        confirmText: 'Aceptar'
      });
      navigate('/quizzes/editor/' + quiz.id + '#asignar');
      return;
    }
    
    if (await confirm('¿Estás seguro de asignar este cuestionario a las áreas seleccionadas? Comenzará a recolectar respuestas de inmediato.', {
      title: 'Asignar Cuestionario',
      icon: 'send',
      type: 'info',
      confirmText: 'Sí, Asignar'
    })) {
      try {
        await quizzesService.updateQuiz(quiz.id, { estado: 'asignado' });
        fetchQuizzes();
        setQuizAsignadoSuccess({ visible: true, quiz });
      } catch (err) {
        console.error(err);
        toast.error('Error al asignar el cuestionario.');
      }
    }
  };

  const handleUnassignDirect = async (quiz) => {
    if (await confirm('¿Estás seguro de desasignar este cuestionario? Se detendrá la recolección de respuestas para todas las áreas.', {
      title: 'Desasignar Cuestionario',
      icon: 'cancel',
      type: 'warning',
      confirmText: 'Sí, Desasignar'
    })) {
      try {
        await quizzesService.updateQuiz(quiz.id, { estado: 'desasignado' });
        fetchQuizzes();
      } catch (err) {
        console.error(err);
        toast.error('Error al desasignar el cuestionario.');
      }
    }
  };

  React.useEffect(() => {
    fetchQuizzes();
  }, []);

  const tasaParticipacion = (totalTrabajadores !== null && totalTrabajadores > 0)
    ? Math.round((respuestasTotales / totalTrabajadores) * 100) 
    : null;

  const dynamicKpis = [
    {
      icon: 'assignment',
      label: 'Total Quizzes',
      value: quizzes.length.toString(),
      accent: 'var(--primary)'
    },
    {
      icon: 'task_alt',
      label: 'Completados',
      value: respuestasTotales !== null ? respuestasTotales.toString() : '-',
      accent: 'var(--secondary)'
    },
    {
      icon: 'percent',
      label: 'Tasa Participación',
      value: tasaParticipacion !== null ? `${tasaParticipacion}%` : '-',
      accent: '#2563eb'
    }
  ];

  // Redirigir al editor de quiz para crear un nuevo registro
  const handleNuevoQuiz = () => {
    navigate('/quizzes/editor');
  };

  // Abrir el modal de confirmación al hacer clic en el botón de opciones
  const handleOpenOptions = async (id) => {
    const quiz = quizzes.find((q) => q.id === id);
    if (quiz) {
      if (quiz.estado === 'asignado') {
        await confirm('Este cuestionario está actualmente en circulación. Debes desasignarlo primero antes de poder eliminarlo.', {
          title: 'Cuestionario Asignado',
          type: 'warning',
          icon: 'assignment_turned_in',
          hideCancel: true,
          confirmText: 'Aceptar'
        });
        return;
      }
      if (await confirm(`¿Estás seguro de que deseas eliminar el cuestionario "${quiz.titulo}"? Esta acción no se puede deshacer.`)) {
        try {
          await quizzesService.deleteQuiz(quiz.id);
          setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
          toast.success('Cuestionario eliminado correctamente.');
        } catch (error) {
          console.error('Error deleting quiz:', error);
          toast.error('Hubo un error al eliminar el quiz.');
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-8 max-w-[100rem] mx-auto p-4 sm:p-6 lg:px-16 lg:py-8">
      {/* Encabezado de la página */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight m-0">Gestor de Quizes</h2>
          <p className="text-on-surface-variant mt-1 text-sm m-0">
            Administra y crea cuestionarios de bienestar laboral.
          </p>
        </div>
        <button
          onClick={handleNuevoQuiz}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm font-sans transition-colors active:scale-95 hover:bg-primary-container justify-center sm:justify-start w-full sm:w-auto border-none cursor-pointer"
        >
          <span className="material-symbols-outlined">add</span>
          Nuevo Quiz
        </button>
      </div>

      {/* Panel superior con los KPIs y métricas clave */}
      <QuizKpis kpis={dynamicKpis} />

      {/* Grid con las tarjetas de cuestionarios y el botón dashed para agregar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {loading ? (
          <LoadingSpinner message="Sincronizando cuestionarios..." />
        ) : quizzes && quizzes.length === 0 ? (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-15 px-5 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">quiz</span>
            <h3 className="text-lg font-semibold text-on-surface mb-2">Sin cuestionarios</h3>
            <p className="text-on-surface-variant max-w-[25rem] mx-auto mb-5">
              Aún no hay cuestionarios registrados en el sistema.
            </p>
            <button onClick={handleNuevoQuiz} className="flex items-center gap-2 mx-auto px-5 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm font-sans transition-colors active:scale-95 hover:bg-primary-container justify-center border-none cursor-pointer">
              <span className="material-symbols-outlined">add</span>
              Crear Primer Quiz
            </button>
          </div>
        ) : (
          <>
            {(quizzes || []).map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onEdit={(id) => navigate('/quizzes/editor/' + id)}
                onPreview={(id) => navigate('/quizzes/preview/' + id)}
                onAssign={() => handleAssignDirect(quiz)}
                onUnassign={() => handleUnassignDirect(quiz)}
                onDelete={(id) => handleOpenOptions(id)}
              />
            ))}
            {/* Tarjeta discontinua para crear un nuevo cuestionario */}
            <QuizAgregarCard onClick={handleNuevoQuiz} />
          </>
        )}
      </div>

      {/* Modal de éxito de asignación con QR */}
      <ModalQuizAsignado
        visible={quizAsignadoSuccess.visible}
        quiz={quizAsignadoSuccess.quiz}
        onCerrar={() => setQuizAsignadoSuccess({ visible: false, quiz: null })}
      />
    </div>
  );
}
