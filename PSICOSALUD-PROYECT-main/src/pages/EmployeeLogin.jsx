import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { insforge } from '../lib/insforge';
import { areasService } from '../features/areas/api/areas.service';
import { quizzesService } from '../features/quizzes/api/quizzes.service';
import CustomSelect from '../components/ui/CustomSelect';


// Componente para el inicio de sesión del empleado (Portal de Evaluación)
export default function EmployeeLogin() {
  const navigate = useNavigate();

  // Estados locales para el área del empleado, el código de acceso, mensajes de error y visibilidad del código
  const [area, setArea] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [mostrarCodigo, setMostrarCodigo] = useState(false); // Determina si se muestra el código en texto plano

  // Generar el array de áreas únicas asignadas desde quizzesData en el inicio del componente
  const [areasDisponibles, setAreasDisponibles] = useState([]);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const quizzes = await quizzesService.getQuizzes();
        const areas = [];
        quizzes.forEach((quiz) => {
          // El estado correcto cuando un cuestionario está activo es 'asignado' (no 'publicado')
          if (quiz.areasAsignadas && quiz.estado === 'asignado') {
            // Asegurar que sea un arreglo incluso si se guardó como string JSON por error
            let arr = quiz.areasAsignadas;
            if (typeof arr === 'string') {
              try { arr = JSON.parse(arr); } catch(e) { arr = [arr]; }
            }
            if (Array.isArray(arr)) {
              arr.forEach((areaAsig) => {
                if (!areas.includes(areaAsig)) {
                  areas.push(areaAsig);
                }
              });
            }
          }
        });
        setAreasDisponibles(areas);
      } catch (error) {
        console.error("Error fetching areas", error);
      }
    };
    fetchAreas();
  }, []);

  // Controlar la validación y el inicio de sesión del empleado
  const handleLogin = async (e) => {
    e.preventDefault();

    // Validar campos requeridos
    if (!area || !code) {
      setError('Complete todos los campos');
      return;
    }

    try {
      // Buscar en DB un quiz con el código ingresado y que incluya el área del empleado
      const quiz = await quizzesService.getQuizByCodeAndArea(code, area);

      // Si no encuentra el quiz, muestra mensaje de error correspondiente
      if (!quiz) {
        setError('Código incorrecto o no hay evaluación activa para tu área');
        return;
      }

      // Verificación de prevención de duplicados (Anónima)
      if (localStorage.getItem(`psico_quiz_completed_${quiz.id}`) === 'true') {
        setError('Ya has completado este cuestionario anteriormente. ¡Gracias por tu participación!');
        return;
      }

      // Limpiar errores y navegar a la sección de la evaluación pasando el quiz por el estado y el area seleccionada
      setError('');
      navigate('/evaluacion', { state: { quiz, area } });
    } catch (error) {
      console.error('Error in login', error);
      setError('Hubo un error de conexión');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-6 sm:p-4 bg-gradient-to-br from-[rgba(4,71,56,0.92)] to-[rgba(83,98,87,0.85)]">
      <div className="w-full max-w-[31.25rem] bg-white rounded-3xl p-10 sm:p-6 sm:rounded-2xl shadow-[0_25px_50px_-12px_rgba(4,71,56,0.25)]">

        {/* Logotipo y títulos informativos de la evaluación */}
        <div className="text-center mb-7 sm:mb-4">
          <div className="w-20 h-20 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 sm:mb-2">
            <span className="material-symbols-outlined text-white text-[2.5rem] sm:text-[1.625rem] [font-variation-settings:'FILL'_1]">
              psychology
            </span>
          </div>

          <h1 className="text-[1.75rem] sm:text-xl font-extrabold text-primary mb-1">PsicoSalud</h1>
          <p className="text-sm sm:text-xs sm:mt-1 text-on-surface-variant">Portal de Evaluación para Empleados</p>
        </div>

        {/* Formulario de inicio de sesión */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5 sm:gap-3.5">

          {/* Campo: Área de Trabajo (generado dinámicamente con áreas reales) */}
          <div className="flex flex-col z-40">
            <label className="block mb-2 sm:mb-1 text-xs sm:text-[0.6875rem] font-bold text-primary uppercase">Área de Trabajo</label>
            <CustomSelect
              value={area}
              onChange={(val) => setArea(val)}
              options={areasDisponibles.map(a => ({ value: a, label: a }))}
              placeholder="Seleccione un área"
            />
          </div>

          {/* Campo: Código de Área (Contraseña de ingreso con toggle de visibilidad) */}
          <div className="flex flex-col">
            <label className="block mb-2 sm:mb-1 text-xs sm:text-[0.6875rem] font-bold text-primary uppercase">Código de Área</label>
            <div className="relative flex items-center">
              <input
                type={mostrarCodigo ? 'text' : 'password'}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ingrese el código proporcionado"
                className="w-full pr-11 p-3.5 sm:px-3 sm:py-2.5 rounded-xl sm:rounded-xl border border-outline bg-slate-50 text-sm sm:text-[0.8125rem] outline-none focus:border-primary transition-colors"
                required
              />
              <button
                type="button"
                className="absolute right-3 bg-transparent border-none cursor-pointer text-on-surface-variant flex items-center p-0 transition-colors hover:text-primary"
                onClick={() => setMostrarCodigo(!mostrarCodigo)}
              >
                <span className="material-symbols-outlined">
                  {mostrarCodigo ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Renderizado condicional del mensaje de error */}
          {error && (
            <div className="text-[0.8125rem] text-error mb-4 flex items-center gap-1.5 bg-error-container p-2.5 rounded-lg">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          {/* Botón de envío para ingresar a responder */}
          <button
            type="submit"
            className="bg-primary text-white border-none rounded-xl sm:rounded-lg p-4 sm:p-3 font-bold cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            Ingresar a la Evaluación
            <span className="material-symbols-outlined">
              arrow_forward
            </span>
          </button>
        </form>

        {/* Nota informativa legal y confidencial del portal */}
        <div className="mt-6 sm:mt-4 p-3.5 sm:p-2.5 rounded-xl sm:rounded-lg bg-surface-container-low text-xs sm:text-[0.6875rem] text-center text-on-surface-variant">
          La evaluación es anónima y confidencial. Tus respuestas serán utilizadas únicamente para fines de bienestar organizacional.
        </div>

      </div>
    </div>
  );
}