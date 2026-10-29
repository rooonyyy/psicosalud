import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { quizzesService } from '../api/quizzes.service';
import { areasService } from '../../areas/api/areas.service';
import { OPCIONES_MULTIPLE_DEFAULT, MAX_CUSTOM_QUESTIONS } from '../utils/quizzes.utils';
import { useConfirm } from '../../../context/ConfirmContext';

export function useQuizEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [customQuestions, setCustomQuestions] = useState([]);
  const [isPublished, setIsPublished] = useState(false);
  const [esPreestablecido, setEsPreestablecido] = useState(false);
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [duracionMinutos, setDuracionMinutos] = useState(10);
  const [codigoArea, setCodigoArea] = useState('');
  const [originalCodigoArea, setOriginalCodigoArea] = useState('');
  const [originalQuizData, setOriginalQuizData] = useState(null);
  const [tablaInterpretacion, setTablaInterpretacion] = useState([]);
  const confirm = useConfirm();

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areasData = await areasService.getAreas();
        setAvailableAreas(areasData.map(a => a.nombre));
      } catch (err) {
        console.error("Error al cargar áreas:", err);
      }
    };
    fetchAreas();

    const templateId = location.state?.templateId;
    const targetId = id || templateId;

    const fetchQuiz = async () => {
      if (targetId) {
        try {
          const quizEncontrado = await quizzesService.getQuizById(targetId);
          if (quizEncontrado) {
            setOriginalQuizData(quizEncontrado);
            setDuracionMinutos(quizEncontrado.duracionMinutos || 10);
            setAreasSeleccionadas(quizEncontrado.areasAsignadas || []);
            setTablaInterpretacion(quizEncontrado.tabla_interpretacion || []);
            
            if (id) {
              setCodigoArea(quizEncontrado.codigoArea || '');
              setOriginalCodigoArea(quizEncontrado.codigoArea || '');
              setEsPreestablecido(quizEncontrado.esPreestablecido || false);
              setTitulo(quizEncontrado.titulo);
              setDescripcion(quizEncontrado.desc);
              setCustomQuestions(quizEncontrado.preguntas_detalle || []);
              setIsPublished(quizEncontrado.estado === 'asignado');
            } else {
              setEsPreestablecido(false);
              setTitulo(quizEncontrado.titulo + ' (Copia)');
              setDescripcion(quizEncontrado.desc);
              setCustomQuestions(
                (quizEncontrado.preguntas_detalle || []).map((q, index) => ({
                  ...q,
                  id: 6 + index
                }))
              );
              setIsPublished(false);
            }
          }
        } catch (error) {
          console.error("Error cargando quiz:", error);
        }
      } else {
        setTitulo('');
        setDescripcion('');
        setCustomQuestions([]);
        setIsPublished(false);
        setEsPreestablecido(false);
        setDuracionMinutos(10);
        setAreasSeleccionadas([]);
        setTablaInterpretacion([]);
      }
    };
    fetchQuiz();
  }, [id, location.state]);

  useEffect(() => {
    let timeout1, timeout2;
    if (location.search.includes('action=assign') && titulo) {
      timeout1 = setTimeout(() => {
        const assignSection = document.getElementById('asignar-section');
        if (assignSection) {
          assignSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          assignSection.style.transition = 'box-shadow 0.3s ease';
          assignSection.style.boxShadow = '0 0 0 4px rgba(4, 71, 56, 0.2)';
          timeout2 = setTimeout(() => {
            assignSection.style.boxShadow = 'none';
          }, 2000);
        }
      }, 500);
    }
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [location.search, titulo]);

  const handleActualizarPregunta = (preguntaId, campo, valor) => {
    setCustomQuestions((prev) =>
      prev.map((q) => {
        if (q.id === preguntaId) {
          const updated = { ...q, [campo]: valor };
          if (campo === 'type' && valor === 'Opción múltiple' && (!updated.opciones || updated.opciones.length === 0)) {
            updated.opciones = [...OPCIONES_MULTIPLE_DEFAULT];
          }
          return updated;
        }
        return q;
      })
    );
  };

  const handleEliminarPregunta = (preguntaId) => {
    setCustomQuestions((prev) => prev.filter((q) => q.id !== preguntaId));
  };

  const handleAgregarPregunta = async () => {
    if (customQuestions.length >= MAX_CUSTOM_QUESTIONS) {
      await confirm(`Solo puedes agregar hasta ${MAX_CUSTOM_QUESTIONS} preguntas personalizadas.`, { title: 'Límite alcanzado', type: 'warning', icon: 'warning', hideCancel: true, confirmText: 'Aceptar' });
      return;
    }
    const nuevoId =
      customQuestions.length > 0
        ? Math.max(...customQuestions.map((q) => q.id)) + 1
        : 1;

    setCustomQuestions([
      ...customQuestions,
      {
        id: nuevoId,
        text: '',
        type: 'Likert 1–5',
        opciones: []
      }
    ]);
  };

  const handleAreaToggle = (area) => {
    setAreasSeleccionadas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handlePublish = async (isDuplicate = false) => {
    if (!titulo.trim()) {
      await confirm('Por favor ingresa un título para el quiz antes de guardar.', { title: 'Atención', type: 'warning', icon: 'warning', hideCancel: true, confirmText: 'Aceptar' });
      return;
    }
    if (!codigoArea.trim()) {
      await confirm('Por favor ingresa un Código de Acceso para el quiz antes de guardar.', { title: 'Atención', type: 'warning', icon: 'warning', hideCancel: true, confirmText: 'Aceptar' });
      return;
    }

    if (isDuplicate && codigoArea.toUpperCase() === originalCodigoArea.toUpperCase()) {
      await confirm('Por favor modifica el Código de Acceso para que sea único antes de duplicar el quiz.', { title: 'Código Duplicado', type: 'warning', icon: 'warning', hideCancel: true, confirmText: 'Aceptar' });
      return;
    }

    const actionText = isDuplicate ? 'duplicar' : 'guardar';
    const finalTitulo = isDuplicate && !titulo.includes('(Copia)') ? `${titulo} (Copia)` : titulo;

    if (await confirm(`¿Estás seguro de ${actionText} este quiz? Tendrá una duración de ${duracionMinutos} minutos.`, { title: isDuplicate ? 'Duplicar Quiz' : 'Guardar Quiz', icon: 'save', type: 'info' })) {
      try {
        const baseData = isDuplicate && originalQuizData ? originalQuizData : {};
        // Extraemos campos que no deben clonarse ciegamente
        const { id: _id, created_at, preguntas_detalle, questions, ...restBaseData } = baseData;

        const quizData = {
          ...restBaseData,
          titulo: finalTitulo,
          desc: descripcion,
          estado: 'desasignado',
          esPreestablecido: isDuplicate ? false : esPreestablecido,
          duracionMinutos,
          areasAsignadas: areasSeleccionadas,
          codigoArea: codigoArea.toUpperCase(),
          tabla_interpretacion: tablaInterpretacion,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        if (id && !isDuplicate) {
          await quizzesService.updateQuiz(id, quizData, customQuestions);
        } else {
          await quizzesService.createQuiz(quizData, customQuestions);
        }

        await confirm(`¡Quiz ${isDuplicate ? 'duplicado' : 'guardado'} con éxito!`, { title: '¡Éxito!', type: 'info', icon: 'check_circle', hideCancel: true, confirmText: 'Aceptar' });
        navigate('/quizzes');
      } catch (error) {
        console.error('Error al publicar:', error);
        await confirm(`Ocurrió un error al ${actionText} el quiz en la base de datos. Recuerda usar un Código de Acceso único.`, { title: 'Error', type: 'danger', icon: 'error', hideCancel: true, confirmText: 'Aceptar' });
      }
    }
  };

  const handleDuplicar = () => {
    handlePublish(true);
  };

  const totalPreguntas = customQuestions.length;

  return {
    titulo, setTitulo,
    descripcion, setDescripcion,
    customQuestions, setCustomQuestions,
    isPublished, setIsPublished,
    esPreestablecido, setEsPreestablecido,
    areasSeleccionadas, setAreasSeleccionadas,
    availableAreas,
    duracionMinutos, setDuracionMinutos,
    codigoArea, setCodigoArea,
    tablaInterpretacion, setTablaInterpretacion,
    handlePublish,
    handleDuplicar,
    handleAgregarPregunta,
    handleActualizarPregunta,
    handleEliminarPregunta,
    handleAreaToggle,
    totalPreguntas,
    navigate,
    id
  };
}
