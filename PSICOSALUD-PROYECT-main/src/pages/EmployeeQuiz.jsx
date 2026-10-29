import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { quizzesService } from "../features/quizzes/api/quizzes.service";
import { useToast } from '../context/ToastContext';

// Componente principal para el cuestionario que responde el empleado
export default function EmployeeQuiz() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const quizRecibido = location.state?.quiz;
  const areaRecibida = location.state?.area || 'General';

  // Estados locales para la pregunta activa (paso), las respuestas acumuladas, la opción seleccionada actualmente, la visibilidad del modal de éxito y el cronómetro
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFinishedModal, setShowFinishedModal] = useState(false);
  const [resultadoCalculado, setResultadoCalculado] = useState(null); // Nuevo estado para el análisis
  const [tiempoAgotado, setTiempoAgotado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(
    (quizRecibido?.duracionMinutos || 10) * 60
  );

  // Efecto para controlar el cronómetro regresivo de la evaluación
  useEffect(() => {
    // Si no hay quiz, no iniciamos el cronómetro
    if (!quizRecibido) return;

    const intervalo = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          setTiempoAgotado(true); // Se acaba el tiempo — modal diferenciado
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Limpieza del intervalo al desmontar el componente o cambiar el quiz
    return () => clearInterval(intervalo);
  }, [quizRecibido]);

  // Si no hay quizRecibido, se muestra mensaje de error centrado con botón de retorno
  if (!quizRecibido) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:py-8 md:px-20">
        <div className="text-center mb-10">
          <div className="w-12 h-12 mx-auto mb-3 mt-8 rounded-full bg-primary flex justify-center items-center">
            <span className="material-symbols-outlined text-white text-[1.75rem] [font-variation-settings:'FILL'_1]">warning</span>
          </div>
          <h1 className="text-[1.375rem] md:text-[2rem] font-bold text-primary mb-1.5">Error</h1>
          <p className="text-gray-500">No se encontró ninguna evaluación activa. Por favor regresa e intenta de nuevo.</p>
        </div>
        <div className="max-w-[62.5rem] mx-auto">
          <button
            onClick={() => navigate("/login-empleado")}
            className="mt-8 w-full p-3.5 md:p-[1.125rem] border-none rounded-xl bg-primary text-white text-[0.9375rem] md:text-base font-bold cursor-pointer hover:bg-primary/90 transition-colors"
          >
            Volver al Portal
          </button>
        </div>
      </div>
    );
  }

  // Las preguntas reales del quiz recibido
  const questions = quizRecibido.preguntas_detalle || [];

  // Obtener la pregunta correspondiente al paso actual del flujo
  const currentQuestion = questions[currentStep];

  // Determinar las opciones de respuesta según el tipo de pregunta
  let currentOptions = [];
  if (currentQuestion) {
    if (currentQuestion.type === 'Likert 1–5') {
      currentOptions = ['1', '2', '3', '4', '5'];
    } else if (currentQuestion.type === 'Sí / No') {
      currentOptions = ['Sí', 'No'];
    } else if (currentQuestion.type === 'Opción múltiple') {
      currentOptions = currentQuestion.opciones || [];
    }
  }

  // Calcular el porcentaje de progreso de la evaluación para la barra visual
  const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;

  // Calcular el tiempo restante estimado para información general
  const tiempoRestante = questions.length > 0
    ? Math.round(((questions.length - currentStep) * quizRecibido.duracionMinutos) / questions.length)
    : 0;

  // Función para formatear los segundos restantes en formato MM:SS
  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const secs = segundos % 60;
    const minutosStr = minutos < 10 ? `0${minutos}` : minutos;
    const secsStr = secs < 10 ? `0${secs}` : secs;
    return `${minutosStr}:${secsStr}`;
  };

  // Registrar la selección de la opción por parte del usuario
  const handleOptionSelect = (idx) => {
    setSelectedOption(idx);

    // Almacenar la respuesta asociándola con el ID de la pregunta
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: idx,
    }));
  };

  // Función para calcular puntaje total y buscar el nivel de interpretación
  const calcularPuntajeYAnalisis = () => {
    let total = 0;
    questions.forEach((q) => {
      const idxSeleccionado = answers[q.id];
      if (idxSeleccionado !== undefined) {
        if (q.pesos && q.pesos[idxSeleccionado] !== undefined && q.pesos[idxSeleccionado] !== '') {
          total += parseInt(q.pesos[idxSeleccionado], 10) || 0;
        } else {
          // Valores por defecto
          if (q.type === 'Likert 1–5') total += (idxSeleccionado + 1);
          else if (q.type === 'Sí / No') total += (idxSeleccionado === 0 ? 1 : 0);
        }
      }
    });

    let analisis = null;
    if (quizRecibido.tabla_interpretacion && quizRecibido.tabla_interpretacion.length > 0) {
      analisis = quizRecibido.tabla_interpretacion.find(r => total >= r.min && total <= r.max) || null;
    }
    return { total, analisis };
  };

  // Pasar a la siguiente pregunta o finalizar la encuesta
  const handleNext = async () => {
    // Evitar avanzar si no se ha respondido la pregunta activa
    if (selectedOption === null) return;

    if (currentStep < questions.length - 1) {
      // Avanzar un paso y restablecer la opción con el valor previamente guardado si existe, o null
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setSelectedOption(answers[questions[nextStep].id] ?? null);
    } else {
      // Calcular resultados
      const { total, analisis } = calcularPuntajeYAnalisis();
      if (analisis && analisis.mostrarEmpleado) {
        setResultadoCalculado(analisis);
      }

      // Enviar las respuestas a InsForge y mostrar el modal de agradecimiento
      try {
        setIsSubmitting(true);
        await quizzesService.submitQuizResponse(quizRecibido.id, areaRecibida, answers, total, analisis);
        
        // Marcar el cuestionario como completado en este navegador para prevenir duplicados
        localStorage.setItem(`psico_quiz_completed_${quizRecibido.id}`, 'true');
        
        setShowFinishedModal(true);
      } catch (error) {
        console.error('Error enviando respuestas', error);
        toast.error('Hubo un error guardando tus respuestas. Por favor intenta nuevamente.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:py-8 md:px-20">
      {/* Encabezado del portal de evaluación */}
      <div className="flex flex-col items-center gap-2 mb-10 mt-6 text-center">
        <div className="w-12 h-12 mx-auto mb-1 mt-2 rounded-full bg-primary flex justify-center items-center">
          <span className="material-symbols-outlined text-white text-[1.75rem] [font-variation-settings:'FILL'_1]">
            psychology
          </span>
        </div>

        <h1 className="text-[1.375rem] md:text-[2rem] font-bold text-primary mb-1.5 m-0">PsicoSalud</h1>
        <p className="text-gray-500 m-0 text-base">{quizRecibido.titulo}</p>
        {quizRecibido.desc && (
          <p className="text-gray-600 m-0 text-sm max-w-xl text-center px-4 mt-2 whitespace-pre-line">
            {quizRecibido.desc}
          </p>
        )}
      </div>

      {/* Contenido interactivo de la evaluación */}
      <div className="max-w-[62.5rem] mx-auto">
        
        {/* Fila superior con contador de preguntas y cronómetro regresivo */}
        <div className="flex justify-between items-center mb-2 font-semibold">
          <span>
            Pregunta {currentStep + 1} de {questions.length}
          </span>
          <div className={`flex items-center gap-1.5 text-sm font-bold font-sans ${segundosRestantes <= 60 ? 'text-red-600' : 'text-primary'}`}>
            <span className="material-symbols-outlined text-lg">timer</span>
            <span>{formatearTiempo(segundosRestantes)}</span>
          </div>
        </div>

        {/* Barra de progreso de la encuesta */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-10">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Tiempo restante estimado debajo de la barra de progreso */}
        <div className="text-right -mt-7 mb-7">
          <span className="text-xs text-on-surface-variant">
            ~{tiempoRestante} min restantes
          </span>
        </div>

        {/* Título/Texto de la pregunta activa */}
        <h2 className="text-lg md:text-[1.75rem] mb-5 md:mb-8 text-gray-900 font-bold">
          {currentQuestion?.text}
        </h2>

        {/* Listado de tarjetas de selección de respuesta */}
        <div className="flex flex-col gap-4">
          {currentOptions.map((option, idx) => (
            <div
              key={idx}
              className={`p-3.5 md:p-5 border-2 rounded-xl cursor-pointer text-sm md:text-base transition-all duration-200 ${
                selectedOption === idx 
                  ? "bg-primary text-white border-primary" 
                  : "border-gray-300 hover:border-primary"
              }`}
              onClick={() => handleOptionSelect(idx)}
            >
              {option}
            </div>
          ))}
        </div>

        {/* Botón para pasar a la siguiente pregunta o finalizar */}
        <button
          className="mt-8 w-full p-3.5 md:p-[1.125rem] border-none rounded-xl bg-primary text-white text-[0.9375rem] md:text-base font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          onClick={handleNext}
          disabled={selectedOption === null || isSubmitting}
        >
          {isSubmitting
             ? "Enviando..."
             : currentStep === questions.length - 1
             ? "Finalizar"
             : "Siguiente"}
        </button>

      </div>

      {/* Modal de Agradecimiento por completar la evaluación */}
      {showFinishedModal && (
        <div className="fixed inset-0 w-screen h-screen bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-[1000] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-7 md:p-10 max-w-[30rem] w-full shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <div className="w-18 h-18 bg-primary/10 text-primary rounded-full flex justify-center items-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[2.5rem] [font-variation-settings:'FILL'_1]">
                check_circle
              </span>
            </div>
            <h3 className="text-[1.375rem] font-extrabold text-primary mb-3">¡Evaluación Completada!</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-7">
              Gracias por completar la evaluación. Tus respuestas han sido registradas de forma segura y confidencial.
            </p>

            {resultadoCalculado && (
              <div className="mt-4 mb-5 p-4 bg-surface-container-lowest border border-outline-variant rounded-2xl text-left">
                <h4 className="text-[0.9375rem] text-error m-0 mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg">warning</span>
                  Nivel detectado: {resultadoCalculado.nivel}
                </h4>
                <p className="text-[0.8125rem] text-on-surface m-0 leading-relaxed">
                  {resultadoCalculado.analisis}
                </p>
              </div>
            )}

            <button
              className="w-full p-3.5 bg-primary text-white border-none rounded-xl text-[0.9375rem] font-bold cursor-pointer flex items-center justify-center gap-2 transition-colors hover:bg-primary/90"
              onClick={() => navigate("/login-empleado")}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Tiempo Agotado — las respuestas se descartan */}
      {tiempoAgotado && (
        <div className="fixed inset-0 w-screen h-screen bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-[1000] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-7 md:p-10 max-w-[30rem] w-full shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <div className="w-18 h-18 bg-error-container text-error rounded-full flex justify-center items-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[2.5rem] [font-variation-settings:'FILL'_1]">
                timer_off
              </span>
            </div>
            <h3 className="text-[1.375rem] font-extrabold text-error mb-3">Tiempo Agotado</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-7">
              El tiempo asignado para esta evaluación ha finalizado. Tus respuestas no fueron registradas. Puedes solicitar un nuevo acceso para completar la evaluación.
            </p>
            <button
              className="w-full p-3.5 bg-error text-white border-none rounded-xl text-[0.9375rem] font-bold cursor-pointer flex items-center justify-center gap-2 transition-colors hover:bg-red-700"
              onClick={() => navigate("/login-empleado")}
            >
              Volver al Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}