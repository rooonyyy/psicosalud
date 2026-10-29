import { useState, useEffect, useMemo } from 'react';
import { areasService } from '../api/areas.service';
import { insforge } from '../../../lib/insforge';

export function useAreasData() {
  const [rawData, setRawData] = useState({
    areas: [],
    responses: [],
    quizzes: []
  });
  const [seleccionadaId, setSeleccionadaId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de filtros
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [dateFilterType, setDateFilterType] = useState('all'); // all, 7days, 30days, thisYear, custom
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchAreasData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const [areas, responsesRes, quizzesRes] = await Promise.all([
        areasService.getRawAreas(),
        insforge.database.from('quiz_responses').select('*'),
        insforge.database.from('quizzes').select('*, questions(*)')
      ]);

      if (responsesRes.error) throw responsesRes.error;
      if (quizzesRes.error) throw quizzesRes.error;

      const quizzes = quizzesRes.data || [];

      setRawData({
        areas: areas || [],
        responses: responsesRes.data || [],
        quizzes: quizzes
      });

      // Selección inicial de Ãrea
      setSeleccionadaId(prev => {
        if (prev && (areas || []).some(a => a.id === prev)) {
          return prev;
        }
        return areas && areas.length > 0 ? areas[0].id : null;
      });

      // Selección inicial de Cuestionario (por defecto el primero)
      setSelectedQuizId(prev => {
        if (prev && (quizzes || []).some(q => q.id === prev)) {
          return prev;
        }
        return quizzes && quizzes.length > 0 ? quizzes[0].id : '';
      });
    } catch (err) {
      console.error('Error al cargar datos del dashboard de áreas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAreasData(true);

    const subscription = areasService.subscribeToUpdates(() => {
      fetchAreasData(false);
    });

    return () => {
      areasService.unsubscribe(subscription);
    };
  }, []);

  // 1. Filtrar las respuestas de los cuestionarios según los filtros de Quiz y Fecha
  const filteredResponses = useMemo(() => {
    return rawData.responses.filter(r => {
      // Filtro por Cuestionario
      if (selectedQuizId && r.quiz_id !== selectedQuizId) {
        return false;
      }

      // Filtro por Fecha
      if (dateFilterType === 'all') return true;

      const date = new Date(r.created_at || r.fecha);
      const now = new Date();

      if (dateFilterType === 'today') {
        return date.getFullYear() === now.getFullYear() &&
               date.getMonth() === now.getMonth() &&
               date.getDate() === now.getDate();
      }

      if (dateFilterType === '7days') {
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }

      if (dateFilterType === '30days') {
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }

      if (dateFilterType === 'thisYear') {
        return date.getFullYear() === now.getFullYear();
      }

      if (dateFilterType === 'custom') {
        if (customStartDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          if (date < start) return false;
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          if (date > end) return false;
        }
        return true;
      }

      return true;
    });
  }, [rawData.responses, selectedQuizId, dateFilterType, customStartDate, customEndDate]);

  // 2. Calcular las áreas agregando dinámicamente sus métricas filtradas
  const computedAreas = useMemo(() => {
    // Extraer rangos dinámicos del cuestionario seleccionado
    let rangosDefinidos = [];
    let maxScore = 100;
    if (selectedQuizId) {
      const selectedQuiz = rawData.quizzes.find(q => q.id === selectedQuizId);
      const tabla = selectedQuiz?.tabla_interpretacion || selectedQuiz?.rangos;
      if (tabla && tabla.length > 0) {
        rangosDefinidos = [...tabla].sort((a, b) => (a.min || 0) - (b.min || 0));
      }
      if (selectedQuiz) {
        let preguntasList = selectedQuiz.questions || selectedQuiz.preguntas_detalle || [];
        if (typeof preguntasList === 'string') {
            try { preguntasList = JSON.parse(preguntasList); } catch { preguntasList = []; }
        }
        if (Array.isArray(preguntasList) && preguntasList.length > 0) {
            maxScore = preguntasList.reduce((sum, preg) => {
                let maxPeso = 0;
                if (preg.pesos && Array.isArray(preg.pesos) && preg.pesos.length > 0) {
                    maxPeso = Math.max(...preg.pesos);
                } else if (preg.opciones && Array.isArray(preg.opciones) && preg.opciones.length > 0) {
                    maxPeso = Math.max(...preg.opciones.map(op => op.peso || 0));
                }
                return sum + maxPeso;
            }, 0);
        }
      }
    }

    return rawData.areas.map(area => {
      // Filtrar respuestas correspondientes a esta área específica
      const areaResponses = filteredResponses.filter(r => r.area?.toLowerCase() === area.nombre?.toLowerCase());
      const count = areaResponses.length;
      const total = area.total_trabajadores || 0;
      const participacionPct = total > 0 ? Math.round((count / total) * 100) : 0;

      let bienestar = 0;
      let estres = 0;
      let riesgo = 'Sin Datos';
      let hasData = false;
      
      if (count > 0) {
        hasData = true;
        const sumScore = areaResponses.reduce((sum, r) => sum + (r.puntaje_total || 0), 0);
        const avgRawScore = Math.round(sumScore / count);
        
        estres = Math.min(100, Math.max(0, Math.round((avgRawScore / Math.max(maxScore, 1)) * 100)));
        bienestar = 100 - estres;
        
        // Clasificar riesgo promedio del área usando los rangos dinámicos
        if (rangosDefinidos.length > 0) {
          const rangoEncontrado = rangosDefinidos.find(rg => avgRawScore >= rg.min && avgRawScore <= rg.max);
          if (rangoEncontrado) {
             riesgo = rangoEncontrado.nivel || rangoEncontrado.titulo;
          } else {
             // Fallback
             riesgo = estres < 30 ? 'Bajo' : (estres < 60 ? 'Medio' : 'Alto');
          }
        } else {
          riesgo = estres < 30 ? 'Bajo' : (estres < 60 ? 'Medio' : 'Alto');
        }
      }

      return {
        ...area,
        bienestar,
        estres,
        riesgo,
        hasData,
        participacion: participacionPct,
        participacionCount: count,
        tendencia: 0, // Retirado valor hardcodeado 5
        factoresRiesgo: area.factoresRiesgo || [
          { label: 'Carga de trabajo', nivel: estres > 60 ? 'Crítico' : 'Bajo' },
          { label: 'Falta de pausas', nivel: estres > 40 ? 'Medio' : 'Bajo' }
        ]
      };
    });
  }, [rawData.areas, filteredResponses, selectedQuizId, rawData.quizzes]);

  // Obtener el objeto del área actualmente seleccionada en el dropdown superior
  const seleccionada = useMemo(() => {
    return computedAreas.find(a => a.id === seleccionadaId) || computedAreas[0] || null;
  }, [computedAreas, seleccionadaId]);

  // Obtener respuestas exclusivas del área seleccionada (para el gráfico de líneas)
  const seleccionadaResponses = useMemo(() => {
    if (!seleccionada) return [];
    return filteredResponses.filter(r => r.area?.toLowerCase() === seleccionada.nombre?.toLowerCase());
  }, [seleccionada, filteredResponses]);

  // Calcular la distribución exacta de las personas evaluadas en el área
  const distribucionArea = useMemo(() => {
    let distribLabels = [];
    let distribData = [];
    let backgroundColors = [];
    
    let rangosDefinidos = [];
    if (selectedQuizId) {
      const selectedQuiz = rawData.quizzes.find(q => q.id === selectedQuizId);
      const tabla = selectedQuiz?.tabla_interpretacion || selectedQuiz?.rangos;
      if (tabla && tabla.length > 0) {
        rangosDefinidos = [...tabla].sort((a, b) => (a.min || 0) - (b.min || 0));
      }
    }

    const getColorBySeverity = (label) => {
      const l = (label || '').toLowerCase();
      let index = 5;
      if (l.includes('bajo') || l.includes('leve') || l.includes('optimo')) index = 0;
      else if (l.includes('moderado') || l.includes('medio')) index = 1;
      else if (l.includes('alto') && !l.includes('muy')) index = 3;
      else if (l.includes('muy alto') || l.includes('severo') || l.includes('crítico') || l.includes('critico')) index = 4;
      const paletteColors = ['rgba(34, 197, 94, 1)', 'rgba(234, 179, 8, 1)', 'rgba(249, 115, 22, 1)', 'rgba(239, 68, 68, 1)', 'rgba(168, 85, 247, 1)', 'rgba(100, 116, 139, 1)'];
      return paletteColors[index];
    };

    if (rangosDefinidos.length > 0) {
      const conteoPorRango = {};
      rangosDefinidos.forEach(r => conteoPorRango[r.nivel || r.titulo] = 0);

      seleccionadaResponses.forEach(r => {
        const score = r.puntaje_total || 0;
        const rangoEncontrado = rangosDefinidos.find(rg => score >= rg.min && score <= rg.max);
        if (rangoEncontrado) {
          const nombreNivel = rangoEncontrado.nivel || rangoEncontrado.titulo;
          conteoPorRango[nombreNivel]++;
        } else {
          const nivel = r.resultado_analisis?.nivel;
          if (nivel && conteoPorRango[nivel] !== undefined) {
            conteoPorRango[nivel]++;
          }
        }
      });

      distribLabels = rangosDefinidos.map(r => r.nivel || r.titulo);
      distribData = rangosDefinidos.map(r => conteoPorRango[r.nivel || r.titulo]);
      backgroundColors = rangosDefinidos.map(r => getColorBySeverity(r.nivel || r.titulo));

    } else {
      const conteoDinamico = {};
      seleccionadaResponses.forEach(r => {
        const nivel = r.resultado_analisis?.nivel || 'Sin Clasificar';
        conteoDinamico[nivel] = (conteoDinamico[nivel] || 0) + 1;
      });
      distribLabels = Object.keys(conteoDinamico);
      distribData = Object.values(conteoDinamico);
      backgroundColors = distribLabels.map(label => getColorBySeverity(label));
    }

    return {
      labels: distribLabels,
      datasets: [{
        data: distribData.length > 0 ? distribData : [],
        backgroundColor: backgroundColors,
        borderWidth: 1,
        borderColor: '#ffffff',
      }]
    };
  }, [seleccionadaResponses, selectedQuizId, rawData.quizzes]);

  const quizType = useMemo(() => {
    if (!selectedQuizId) return 'General';
    const selectedQuiz = rawData.quizzes.find(q => q.id === selectedQuizId);
    return selectedQuiz?.titulo || 'General';
  }, [selectedQuizId, rawData.quizzes]);

  const fechaReporte = useMemo(() => {
    if (seleccionadaResponses && seleccionadaResponses.length > 0) {
      const fechas = seleccionadaResponses.map(r => {
        const d = new Date(r.created_at || r.fecha);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      });
      const maxFecha = Math.max(...fechas);
      return maxFecha > 0 ? new Date(maxFecha).toISOString() : null;
    }
    // Si no hay datos pero se usó un filtro histórico
    if (dateFilterType === 'custom' && customEndDate) {
      return new Date(customEndDate).toISOString();
    }
    return null;
  }, [seleccionadaResponses, dateFilterType, customEndDate]);

  return {
    isLoading,
    rawData,
    seleccionadaId,
    setSeleccionadaId,
    selectedQuizId,
    setSelectedQuizId,
    dateFilterType,
    setDateFilterType,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    filteredResponses,
    computedAreas,
    seleccionada,
    seleccionadaResponses,
    distribucionArea,
    quizType,
    fechaReporte
  };
}

