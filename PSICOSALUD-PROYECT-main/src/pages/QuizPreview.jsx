import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { quizzesService } from '../features/quizzes/api/quizzes.service';
import QuizPreviewPregunta from '../features/quizzes/components/QuizPreviewPregunta';
import LoadingSpinner from '../components/LoadingSpinner';
/**
 * Página de Vista Previa del Cuestionario.
 * Muestra el cuestionario con los datos en tiempo real pasados por el editor (state)
 * o con los datos estáticos guardados (id).
 * Replica el diseño visual y el flujo del portal de empleados (EmployeeQuiz.css).
 */
export default function QuizPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state;

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (stateData) {
      setTitulo(stateData.titulo);
      setDescripcion(stateData.descripcion);
      setPreguntas(stateData.preguntas || []);
      setLoading(false);
    } else if (id) {
      // Cargar del servicio
      quizzesService.getQuizById(id).then(quiz => {
        if (quiz) {
          setTitulo(quiz.titulo);
          setDescripcion(quiz.desc);
          const customQuestions = quiz.preguntas_detalle || [];
          setPreguntas(customQuestions);
        }
        setLoading(false);
      }).catch(err => {
        console.error("Error loading preview:", err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id, stateData]);

  // Estado local para guardar las respuestas del simulador (preguntaId: valor)
  const [respuestas, setRespuestas] = useState({});

  // Registrar la selección de la opción de respuesta
  const handleResponder = (preguntaId, valor) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: valor
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-sans items-center justify-center">
        <LoadingSpinner message="Cargando vista previa..." />
      </div>
    );
  }

  if (preguntas.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-sans">
        <div className="w-full max-w-[43.75rem] mx-auto px-6 py-10 flex flex-col flex-1 text-center py-10">
          <h2>Quiz no encontrado o sin preguntas cargadas</h2>
          <button className="px-5 py-2.5 rounded-xl border border-outline-variant bg-transparent text-sm font-semibold text-on-surface-variant cursor-pointer font-sans transition-colors duration-200 flex items-center gap-2 hover:bg-surface-container-low mx-auto mt-4" onClick={() => navigate('/quizzes')}>
            ← Volver a Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      {/* Cabecera de la vista previa con controles para regresar al listado */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-outline-variant">
        <span className="bg-[rgba(191,150,30,0.12)] text-[#7a5c00] text-[0.6875rem] font-extrabold uppercase px-3 py-1 rounded-full">VISTA PREVIA DE EVALUACIÓN</span>
        <button
          type="button"
          className="px-5 py-2.5 rounded-xl border border-outline-variant bg-transparent text-sm font-semibold text-primary cursor-pointer font-sans transition-colors duration-200 flex items-center gap-1.5 hover:bg-surface-container-low"
          onClick={() => navigate('/quizzes')}
        >
          ← Volver a Quizzes
        </button>
      </header>

      {/* Contenedor central alineado con el portal de empleados */}
      <div className="w-full max-w-[43.75rem] mx-auto px-6 py-10 flex flex-col flex-1">
        {/* Cabecera del cuestionario */}
        <div className="flex flex-col items-center gap-2 mb-8 mt-6">
          <div className="flex items-center justify-center bg-primary rounded-full w-10 h-10 mb-1">
            <span className="material-symbols-outlined text-white text-xl">psychology</span>
          </div>
          <h1 className="text-3xl font-bold text-primary m-0 text-center">{titulo}</h1>
          <p className="text-gray-500 m-0 text-center">{descripcion}</p>
        </div>

        {/* Listado de preguntas utilizando el componente interactivo con estilos de EmployeeQuiz */}
        <div>
          {preguntas.map((pregunta, index) => (
            <QuizPreviewPregunta
              key={pregunta.uniqueId || pregunta.id}
              pregunta={{ ...pregunta, id: pregunta.uniqueId || pregunta.id }}
              numero={index + 1}
              respuesta={respuestas[pregunta.uniqueId || pregunta.id]}
              onResponder={handleResponder}
            />
          ))}
        </div>

        {/* Barra de pie de página simulada */}
        <footer className="flex justify-between items-center bg-white rounded-2xl border border-[rgba(191,201,195,0.3)] py-5 px-7 mt-6 shadow-[0_4px_12px_rgba(4,71,56,0.03)]">
          <div className="text-[0.8125rem] text-on-surface-variant">
            Respuestas contestadas: <strong>{Object.keys(respuestas).length}</strong> de <strong>{preguntas.length}</strong>
          </div>
          
          <button
            type="button"
            className="px-6 py-3 w-auto opacity-60 cursor-not-allowed bg-primary text-white rounded-xl font-bold text-base transition-all"
            disabled
            title="Solo disponible en modo real"
          >
            Enviar Evaluación
          </button>
        </footer>
      </div>
    </div>
  );
}
