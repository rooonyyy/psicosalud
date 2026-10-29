-- Agregamos la columna 'pesos' a la tabla 'questions'
ALTER TABLE public.questions ADD COLUMN pesos JSONB;

-- Agregamos la columna 'tabla_interpretacion' a la tabla 'quizzes'
ALTER TABLE public.quizzes ADD COLUMN tabla_interpretacion JSONB;

-- Agregamos las columnas de puntaje y análisis a la tabla 'quiz_responses'
ALTER TABLE public.quiz_responses ADD COLUMN puntaje_total integer;
ALTER TABLE public.quiz_responses ADD COLUMN resultado_analisis JSONB;
