import { insforge } from '../../../lib/insforge';

export const quizzesService = {
  async getQuizzes() {
    const { data, error } = await insforge.database
      .from('quizzes')
      .select('*, questions(*)')
      .neq('estado', 'eliminado')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Mapear para inyectar el número de preguntas basado en la relación
    return data.map(q => ({
      ...q,
      preguntas: q.questions ? q.questions.length : 0
    }));
  },

  // Obtener un quiz por su ID incluyendo sus preguntas
  async getQuizById(id) {
    const { data: quiz, error: quizError } = await insforge.database
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (quizError) throw quizError;

    const { data: questions, error: questionsError } = await insforge.database
      .from('questions')
      .select('*')
      .eq('quiz_id', id)
      .order('order_index', { ascending: true });
    
    if (questionsError) throw questionsError;

    return { ...quiz, preguntas_detalle: questions };
  },

  // Buscar un quiz por código de área (para el login de empleados)
  async getQuizByCodeAndArea(code, area) {
    const { data, error } = await insforge.database
      .from('quizzes')
      .select('*')
      .eq('codigoArea', code);
    
    if (error) throw error;
    
    // Filtrar localmente por área ya que areasAsignadas es un array de texto
    const matchedQuiz = data.find(q => 
      q.areasAsignadas && q.areasAsignadas.some(a => a.toLowerCase() === area.toLowerCase())
    );

    if (!matchedQuiz) return null;

    // Obtener preguntas
    const { data: questions, error: questionsError } = await insforge.database
      .from('questions')
      .select('*')
      .eq('quiz_id', matchedQuiz.id)
      .order('order_index', { ascending: true });
      
    if (questionsError) throw questionsError;

    return { ...matchedQuiz, preguntas_detalle: questions };
  },

  // Helper para asegurar que los pesos siempre se guarden completos (sin nulos)
  _procesarPesos(q) {
    let defaultPesos = [];
    if (q.type === 'Likert 1–5') defaultPesos = [1, 2, 3, 4, 5];
    else if (q.type === 'Sí / No') defaultPesos = [1, 0];
    else defaultPesos = (q.opciones || []).map(() => 0);

    return defaultPesos.map((def, i) => {
      if (q.pesos && q.pesos[i] !== undefined && q.pesos[i] !== null && q.pesos[i] !== '') {
        return parseInt(q.pesos[i], 10) || 0;
      }
      return def;
    });
  },

  // Crear un nuevo quiz con sus preguntas
  async createQuiz(quizData, questionsData) {
    // 1. Insertar el quiz
    const { data: quiz, error: quizError } = await insforge.database
      .from('quizzes')
      .insert([quizData])
      .select()
      .single();
      
    if (quizError) throw quizError;

    // 2. Insertar las preguntas relacionadas
    if (questionsData && questionsData.length > 0) {
      const questionsToInsert = questionsData.map((q, index) => ({
        quiz_id: quiz.id,
        text: q.text,
        type: q.type,
        opciones: q.opciones || [],
        pesos: this._procesarPesos(q),
        order_index: index
      }));

      const { error: questionsError } = await insforge.database
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;
    }

    return quiz;
  },

  // Actualizar un quiz existente
  async updateQuiz(id, quizData, questionsData) {
    const { data: quiz, error: quizError } = await insforge.database
      .from('quizzes')
      .update(quizData)
      .eq('id', id)
      .select()
      .single();
      
    if (quizError) throw quizError;

    // Actualizar preguntas (borrar y recrear por simplicidad)
    if (questionsData) {
      await insforge.database.from('questions').delete().eq('quiz_id', id);

      if (questionsData.length > 0) {
        const questionsToInsert = questionsData.map((q, index) => ({
          quiz_id: id,
          text: q.text,
          type: q.type,
          opciones: q.opciones || [],
          pesos: this._procesarPesos(q),
          order_index: index
        }));
        const { error: questionsError } = await insforge.database
          .from('questions')
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }
    }
    return quiz;
  },

  // Eliminar un quiz de manera lógica (soft delete) para mantener las métricas en reportes históricos
  async deleteQuiz(id) {
    const { error } = await insforge.database
      .from('quizzes')
      .update({ estado: 'eliminado' })
      .eq('id', id);
      
    if (error) throw error;
    return true;
  },

  // Enviar respuestas de un empleado
  async submitQuizResponse(quizId, area, respuestas, puntajeTotal, resultadoAnalisis) {
    const { data, error } = await insforge.database
      .from('quiz_responses')
      .insert([{
        quiz_id: quizId,
        area: area,
        respuestas: respuestas,
        puntaje_total: puntajeTotal,
        resultado_analisis: resultadoAnalisis
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  // Obtener el conteo total de respuestas de un quiz o de todos
  async getQuizResponsesCount(quizId) {
    let query = insforge.database.from('quiz_responses').select('*', { count: 'exact', head: true });
    
    if (quizId) {
      query = query.eq('quiz_id', quizId);
    }

    const { count, error } = await query;
      
    if (error) {
      console.error(error);
      return 0;
    }
    return count || 0;
  }
};
