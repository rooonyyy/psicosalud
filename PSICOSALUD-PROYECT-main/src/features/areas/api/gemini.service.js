import OpenAI from 'openai';

/**
 * Servicio que llama a OpenRouter (InsForge Model Gateway) utilizando el SDK oficial de OpenAI.
 * Se utiliza la clave VITE_OPENROUTER_API_KEY del archivo .env.local
 */
class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    this._ai = null;

    // Usaremos un modelo rápido y muy potente de OpenRouter
    this.model = 'nvidia/nemotron-3-super-120b-a12b:free';
  }

  /**
   * El cliente de OpenAI se crea solo cuando se usa la IA. Así, si no hay
   * VITE_OPENROUTER_API_KEY, el resto de la app funciona normal (antes se caía al cargar).
   */
  get ai() {
    if (!this._ai) {
      this._ai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true, // Requerido para llamar desde el frontend
        defaultHeaders: {
          'HTTP-Referer': window.location.origin,
          'X-Title': 'PsicoSalud',
        }
      });
    }
    return this._ai;
  }

  /**
   * Genera una sugerencia corta de diagnóstico para la tarjeta de PsicoIA.
   */
  async generarSugerencia({ areaNombre, estres, participacion, quizType, nivelEstres }) {
    if (!this.apiKey) throw new Error('API Key de OpenRouter no configurada');

    const systemInstruction = `Actúa como un psicólogo laboral experto. Tu objetivo es generar un diagnóstico clínico breve y directo (máximo 2-3 oraciones) sobre el estado de un área, y dar una recomendación prioritaria. Sé directo, orientado a la acción. No uses formato markdown, ni listas. No dejes ideas incompletas.`;

    const userPrompt = `Por favor analiza la siguiente área:
- Nombre del Área: ${areaNombre}
- Cuestionario aplicado: ${quizType}
- Nivel de riesgo/estrés detectado: ${estres}% (${nivelEstres})
- Nivel de participación de los empleados: ${participacion}%`;

    const fallbackModels = [
      'openai/gpt-oss-20b:free',
      'google/gemma-4-31b-it:free',
      'google/gemma-4-26b-a4b-it:free'
    ];

    let lastError = null;

    for (const model of fallbackModels) {
      try {
        const response = await this.ai.chat.completions.create({
          model: model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 400,
        });

        return response.choices[0]?.message?.content?.trim() || 'El análisis no pudo generarse.';
      } catch (error) {
        console.warn(`Error con el modelo ${model}:`, error?.error?.message || error.message);
        lastError = error;
        // Continuar con el siguiente modelo en la lista
      }
    }

    console.error('Error PsicoIA (sugerencia):', lastError);
    throw new Error('Error al conectar con los modelos. Verifica que tu API key tenga saldo o intenta nuevamente en unos minutos.');
  }

  /**
   * Genera un plan de acción completo con 3 pasos para el modal.
   */
  async generarPlanAccion({ areaNombre, estres, participacion, quizType, nivelEstres }) {
    if (!this.apiKey) throw new Error('API Key de OpenRouter no configurada');

    const systemInstruction = `Eres PsicoIA, un asistente experto en salud organizacional y psicología laboral. Tu tarea es generar planes de acción concretos de exactamente 3 pasos.
Responde EXCLUSIVAMENTE con un JSON válido con este formato exacto (sin markdown, sin texto extra, solo el JSON):
[
  {
    "titulo": "Título de la acción (incluye timeframe, ej: Semana 1)",
    "descripcion": "Descripción breve de 1-2 oraciones de la intervención.",
    "bullets": ["Detalle 1", "Detalle 2"]
  }
]`;

    const userPrompt = `Genera un plan de acción para el área "${areaNombre}" basado en estos datos:
- Cuestionario aplicado: ${quizType}
- Nivel de estrés / riesgo detectado: ${estres}%
- Nivel calculado: ${nivelEstres}
- Participación de empleados: ${participacion}%`;

    const fallbackModels = [
      'google/gemma-4-31b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'openai/gpt-oss-20b:free'
    ];

    let lastError = null;

    for (const model of fallbackModels) {
      try {
        const response = await this.ai.chat.completions.create({
          model: model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.8,
          max_tokens: 800,
        });

        const rawText = response.choices[0]?.message?.content?.trim() || '[]';
        const cleanText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        return JSON.parse(cleanText);
      } catch (error) {
        console.warn(`Error con el modelo ${model}:`, error?.error?.message || error.message);
        lastError = error;
      }
    }

    console.error('Error PsicoIA (plan):', lastError);
    throw new Error('Error al conectar con los modelos. Verifica que tu API key tenga saldo o intenta nuevamente en unos minutos.');
  }
}

export const geminiService = new GeminiService();
