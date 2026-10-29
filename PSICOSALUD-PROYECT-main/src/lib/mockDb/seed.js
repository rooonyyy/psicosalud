// Datos de ejemplo para la base de datos simulada de PsicoSalud.
// Se generan una sola vez (primer arranque) y luego viven en localStorage.
//
// Credenciales de prueba:
//   Administrador -> admin@psicosalud.com    / admin123
//   Psicóloga     -> psicologo@psicosalud.com / psico123
//   Código de acceso del portal de empleados -> ESTRES2026

// Hash SHA-256 de las contraseñas de prueba (mismo algoritmo que usa el mock al crear usuarios)
const HASH_ADMIN = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'; // admin123
const HASH_PSICO = 'e501c0bb4713ba0fc8eee2f1b2be1b2f949bdcf0e106fdd100409a3f6d659ae5'; // psico123

// Generador pseudoaleatorio con semilla: los datos de ejemplo son siempre parecidos
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

const TABLA_INTERPRETACION = [
  { min: 5, max: 11, nivel: 'Bajo', descripcion: 'Nivel de estrés bajo. Mantén tus hábitos saludables.', mostrarEmpleado: true },
  { min: 12, max: 18, nivel: 'Medio', descripcion: 'Nivel de estrés moderado. Considera pausas activas y apoyo de tu equipo.', mostrarEmpleado: true },
  { min: 19, max: 25, nivel: 'Alto', descripcion: 'Nivel de estrés alto. Te recomendamos conversar con el equipo de psicología.', mostrarEmpleado: true }
];

const PREGUNTAS_ESTRES = [
  '¿Con qué frecuencia sientes que el trabajo te supera?',
  '¿Puedes desconectarte del trabajo fuera del horario laboral?',
  '¿Sientes que tienes suficiente apoyo de tu equipo?',
  '¿Con qué frecuencia sientes cansancio físico al terminar la jornada?',
  '¿Sientes que tu trabajo tiene un impacto positivo en la empresa?'
];

export function buildSeed(now = new Date()) {
  const rand = mulberry32(2026);
  const isoDaysAgo = (d, hour = 10) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - d);
    dt.setHours(hour, Math.floor(rand() * 59), 0, 0);
    return dt.toISOString();
  };
  const dateOnly = (offsetDays) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + offsetDays);
    return dt.toISOString().slice(0, 10);
  };

  // ── Usuarios ────────────────────────────────────────────────────────────────
  const users = [
    { id: newId(), email: 'admin@psicosalud.com', password: HASH_ADMIN, nombre: 'Carlos', apellido1: 'Mendoza', apellido2: 'Rojas', rol: 'Administrador', iniciales: 'CM', created_at: isoDaysAgo(200) },
    { id: newId(), email: 'psicologo@psicosalud.com', password: HASH_PSICO, nombre: 'Lucía', apellido1: 'Torres', apellido2: 'Vega', rol: 'Psicólogo', iniciales: 'LT', created_at: isoDaysAgo(180) },
    { id: newId(), email: 'mateo.salazar@psicosalud.com', password: HASH_PSICO, nombre: 'Mateo', apellido1: 'Salazar', apellido2: 'Quispe', rol: 'Psicólogo', iniciales: 'MS', created_at: isoDaysAgo(150) }
  ];

  // ── Áreas ───────────────────────────────────────────────────────────────────
  const areas = [
    { id: 1, nombre: 'Recursos Humanos', total_trabajadores: 12, created_at: isoDaysAgo(200) },
    { id: 2, nombre: 'Operaciones', total_trabajadores: 40, created_at: isoDaysAgo(200) },
    { id: 3, nombre: 'Ventas', total_trabajadores: 25, created_at: isoDaysAgo(200) },
    { id: 4, nombre: 'Tecnología', total_trabajadores: 15, created_at: isoDaysAgo(200) },
    { id: 5, nombre: 'Atención al Cliente', total_trabajadores: 30, created_at: isoDaysAgo(200) }
  ];

  // ── Cuestionarios y preguntas ───────────────────────────────────────────────
  const quizEstres = {
    id: newId(),
    titulo: 'Evaluación de Estrés Laboral',
    desc: 'Mide el nivel de estrés percibido por los colaboradores durante la jornada.',
    estado: 'asignado',
    esPreestablecido: true,
    duracionMinutos: 10,
    areasAsignadas: ['Recursos Humanos', 'Operaciones', 'Ventas', 'Tecnología'],
    codigoArea: 'ESTRES2026',
    tabla_interpretacion: TABLA_INTERPRETACION,
    date: 'Oct 05, 2026',
    created_at: isoDaysAgo(20)
  };

  const quizClima = {
    id: newId(),
    titulo: 'Clima y Bienestar Organizacional',
    desc: 'Evalúa la percepción del ambiente laboral y el bienestar general del equipo.',
    estado: 'desasignado',
    esPreestablecido: false,
    duracionMinutos: 8,
    areasAsignadas: ['Atención al Cliente'],
    codigoArea: 'CLIMA2026',
    tabla_interpretacion: TABLA_INTERPRETACION,
    date: 'Aug 02, 2026',
    created_at: isoDaysAgo(80)
  };

  const quizzes = [quizEstres, quizClima];

  const questions = [];
  PREGUNTAS_ESTRES.forEach((text, i) => {
    questions.push({ id: newId(), quiz_id: quizEstres.id, text, type: 'Likert 1–5', opciones: [], pesos: [1, 2, 3, 4, 5], order_index: i, created_at: quizEstres.created_at });
  });
  PREGUNTAS_ESTRES.forEach((text, i) => {
    questions.push({ id: newId(), quiz_id: quizClima.id, text, type: 'Likert 1–5', opciones: [], pesos: [1, 2, 3, 4, 5], order_index: i, created_at: quizClima.created_at });
  });

  // ── Respuestas de empleados (distribuidas en los últimos ~5 meses) ──────────
  // sesgo: valor medio de la respuesta Likert (0-4) por área, para tener datos variados
  const sesgoPorArea = { 'Recursos Humanos': 1.2, 'Operaciones': 3.0, 'Ventas': 2.2, 'Tecnología': 2.5 };
  const cantidadPorArea = { 'Recursos Humanos': 9, 'Operaciones': 22, 'Ventas': 14, 'Tecnología': 10 };
  const qEstres = questions.filter(q => q.quiz_id === quizEstres.id);
  const quizResponses = [];

  Object.entries(cantidadPorArea).forEach(([area, n]) => {
    for (let k = 0; k < n; k++) {
      const answers = {};
      let total = 0;
      qEstres.forEach(q => {
        const idx = Math.max(0, Math.min(4, Math.round(sesgoPorArea[area] + (rand() - 0.5) * 3)));
        answers[q.id] = idx;
        total += q.pesos[idx];
      });
      const analisis = TABLA_INTERPRETACION.find(r => total >= r.min && total <= r.max) || null;
      quizResponses.push({
        id: newId(),
        quiz_id: quizEstres.id,
        area,
        respuestas: answers,
        puntaje_total: total,
        resultado_analisis: analisis,
        created_at: isoDaysAgo(Math.floor(rand() * 150), 8 + Math.floor(rand() * 9))
      });
    }
  });
  quizResponses.sort((a, b) => a.created_at.localeCompare(b.created_at));

  // ── Intervenciones ──────────────────────────────────────────────────────────
  const intervenciones = [
    {
      id: newId(), area_id: 2, especialista_id: users[1].id,
      tipo_intervencion: 'Taller de Manejo de Estrés',
      fecha_propuesta: dateOnly(5), notas: 'Taller grupal de 2 horas con técnicas de respiración y pausas activas.',
      estado: 'Programada', quiz_type: quizEstres.titulo, fecha_alerta: dateOnly(-10), created_at: isoDaysAgo(8)
    },
    {
      id: newId(), area_id: 3, especialista_id: users[2].id,
      tipo_intervencion: 'Sesiones de Coaching Individual',
      fecha_propuesta: dateOnly(-2), notas: 'Seguimiento individual a los líderes del equipo de ventas.',
      estado: 'En Progreso', quiz_type: quizEstres.titulo, fecha_alerta: dateOnly(-20), created_at: isoDaysAgo(18)
    },
    {
      id: newId(), area_id: 4, especialista_id: users[1].id,
      tipo_intervencion: 'Dinámica de Integración de Equipo',
      fecha_propuesta: dateOnly(-30), notas: 'Actividad de cohesión para el equipo de Tecnología.',
      estado: 'Completada', quiz_type: quizEstres.titulo, fecha_alerta: dateOnly(-45), created_at: isoDaysAgo(40)
    }
  ];

  // ── Informes ────────────────────────────────────────────────────────────────
  const reports = [
    {
      id: newId(), nombre: 'Informe - Dinámica de Integración de Equipo', responsable: 'Lucía Torres',
      area: 'Tecnología', intervencion_id: intervenciones[2].id, archivo_url: null, archivo_nombre: null, created_at: isoDaysAgo(28)
    },
    {
      id: newId(), nombre: 'Informe trimestral de clima laboral', responsable: 'Carlos Mendoza',
      area: 'Recursos Humanos', intervencion_id: null, archivo_url: null, archivo_nombre: null, created_at: isoDaysAgo(14)
    },
    {
      id: newId(), nombre: 'Diagnóstico de carga laboral en Operaciones', responsable: 'Mateo Salazar',
      area: 'Operaciones', intervencion_id: null, archivo_url: null, archivo_nombre: null, created_at: isoDaysAgo(5)
    }
  ];

  return {
    users,
    areas,
    quizzes,
    questions,
    quiz_responses: quizResponses,
    intervenciones,
    reports
  };
}
