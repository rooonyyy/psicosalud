const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function (req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY no configurada en el servidor.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const body = await req.json();
    const { tipo, areaNombre, estres, participacion, quizType, nivelEstres } = body;

    // ── Prompt para SUGERENCIA RÁPIDA (tarjeta PsicoIA) ─────────────────────────
    let prompt = '';

    if (tipo === 'sugerencia') {
      prompt = `
Eres PsicoIA, un asistente experto en salud organizacional y psicología laboral.
Analiza los siguientes datos del área "${areaNombre}" y genera un diagnóstico breve y profesional (máximo 3 oraciones).

Datos del área:
- Cuestionario aplicado: ${quizType}
- Nivel de estrés / riesgo detectado: ${estres}%
- Nivel calculado: ${nivelEstres}
- Participación de empleados: ${participacion}%

Responde ÚNICAMENTE con el texto del diagnóstico, sin introducción ni listas. 
Usa términos clínicos apropiados. Sé directo y orientado a acción.
El texto debe poder leerse en la tarjeta de un dashboard, sin formato markdown.
      `.trim();

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200,
            },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Error al consultar Gemini');
      }

      const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      return new Response(JSON.stringify({ sugerencia: texto }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // ── Prompt para PLAN DE ACCIÓN COMPLETO (modal) ──────────────────────────────
    if (tipo === 'plan') {
      prompt = `
Eres PsicoIA, un asistente experto en salud organizacional y psicología laboral.
Genera un plan de acción concreto de 3 pasos para el área "${areaNombre}" basado en estos datos:

- Cuestionario aplicado: ${quizType}
- Nivel de estrés / riesgo detectado: ${estres}%
- Nivel calculado: ${nivelEstres}
- Participación de empleados: ${participacion}%

Responde EXCLUSIVAMENTE con un JSON válido con este formato exacto (sin markdown, sin texto extra):
[
  {
    "titulo": "Título de la acción (incluye timeframe, ej: Semana 1)",
    "descripcion": "Descripción breve de 1-2 oraciones de la intervención.",
    "bullets": ["Detalle 1", "Detalle 2"]
  },
  {
    "titulo": "...",
    "descripcion": "...",
    "bullets": ["...", "..."]
  },
  {
    "titulo": "...",
    "descripcion": "...",
    "bullets": ["...", "..."]
  }
]

Asegúrate de que los pasos sean progresivos, específicos para el nivel "${nivelEstres}" y aplicables en un contexto laboral latinoamericano.
      `.trim();

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 800,
            },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Error al consultar Gemini');
      }

      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '[]';
      
      // Limpiar posibles bloques markdown que Gemini a veces añade
      const cleanText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      let recomendaciones = [];
      try {
        recomendaciones = JSON.parse(cleanText);
      } catch {
        // Si falla el parse, devuelve el texto crudo para depuración
        return new Response(JSON.stringify({ error: 'No se pudo parsear la respuesta de Gemini', raw: rawText }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      return new Response(JSON.stringify({ recomendaciones }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: 'Tipo de solicitud no reconocido. Usa "sugerencia" o "plan".' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });

  } catch (error: any) {
    console.error('PsicoIA Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}
