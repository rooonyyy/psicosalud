import { useState, useEffect, useMemo } from 'react';
import { dashboardService } from '../api/dashboard.service';

export function useDashboardData() {
  const [rawData, setRawData] = useState({
    quizzes: [],
    areas: [],
    responses: [],
    recent: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Estados de filtros
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [dateFilterType, setDateFilterType] = useState('all'); // all, 7days, 30days, thisYear, custom
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const [raw, recent] = await Promise.all([
        dashboardService.getDashboardRawData(),
        dashboardService.getRecentActivity()
      ]);
      setRawData({
        quizzes: raw.quizzes || [],
        areas: raw.areas || [],
        responses: raw.responses || [],
        recent: recent || []
      });
      // Seleccionar el primer cuestionario por defecto si hay disponibles y aún no hay selección
      if (raw.quizzes?.length > 0) {
        setSelectedQuizId(prev => prev ? prev : raw.quizzes[0].id);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Carga inicial
    fetchDashboardData(true);

    // Suscribirse a actualizaciones en tiempo real
    const subscription = dashboardService.subscribeToUpdates(() => {
      fetchDashboardData(false);
    });

    return () => {
      dashboardService.unsubscribe(subscription);
    };
  }, []);

  // 1. Filtrar las respuestas de los cuestionarios según los filtros seleccionados
  const filteredResponses = useMemo(() => {
    return rawData.responses.filter(r => {
      // Filtro por Cuestionario (Obligatorio)
      if (r.quiz_id !== selectedQuizId) {
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

  // 2. Calcular KPIs dinámicamente en base a las respuestas filtradas
  const computedKpis = useMemo(() => {
    const evaluados = filteredResponses.length;

    // Calcular el total de trabajadores correspondientes a la selección
    let totalTrabajadores = 0;
    if (selectedQuizId) {
      const selectedQuiz = rawData.quizzes.find(q => q.id === selectedQuizId);
      if (selectedQuiz && selectedQuiz.areasAsignadas && selectedQuiz.areasAsignadas.length > 0) {
        // Sumar trabajadores de las áreas asignadas a este cuestionario
        const areasAsignadas = selectedQuiz.areasAsignadas;
        totalTrabajadores = rawData.areas
          .filter(a => areasAsignadas.some(assignedName => assignedName.toLowerCase().trim() === a.nombre.toLowerCase().trim()))
          .reduce((sum, a) => sum + (Number(a.total_trabajadores) || 0), 0);
      } else {
        // Fallback al total global si el cuestionario no tiene áreas asignadas
        totalTrabajadores = rawData.areas.reduce((sum, a) => sum + (Number(a.total_trabajadores) || 0), 0);
      }
    }

    const noEvaluados = Math.max(0, totalTrabajadores - evaluados);
    const participacion = totalTrabajadores > 0 ? Math.round((evaluados / totalTrabajadores) * 100) : 0;
    const falta = totalTrabajadores > 0 ? 100 - participacion : 0;

    return [
      { 
        icon: "fact_check", 
        label: "Participantes evaluados", 
        value: evaluados.toString(), 
        subtext: `${participacion}% de la empresa`,
        subtextIcon: "trending_up",
        borderClass: "bg-[#16a34a]", // green-600
        bgClass: "bg-[#dcfce7]", // green-100
        textClass: "text-[#16a34a]"
      },
      { 
        icon: "pending_actions", 
        label: "No evaluados", 
        value: noEvaluados.toString(), 
        subtext: `${falta}% por responder`, 
        subtextIcon: "trending_down",
        borderClass: "bg-[var(--error)]",
        bgClass: "bg-[var(--error-container)]",
        textClass: "text-[var(--error)]"
      },
      { 
        icon: "groups", 
        label: "Total trabajadores", 
        value: totalTrabajadores.toString(), 
        borderClass: "bg-[#2563eb]", // blue-600
        bgClass: "bg-[#dbeafe]", // blue-100
        textClass: "text-[#2563eb]"
      }
    ];
  }, [filteredResponses, selectedQuizId, rawData.quizzes, rawData.areas]);

  // 3. Calcular los datos de los gráficos de manera dinámica
  const computedChartsData = useMemo(() => {
    // --- DISTRIBUCIÓN DE ESTRÉS (Dona) ---
    let distribLabels;
    let distribData;
    let backgroundColors;
    let hoverColors;

    // Definición de paleta de colores para rangos (de menor a mayor gravedad)
    // Verde -> Amarillo -> Naranja -> Rojo -> Morado -> Gris
    const paletteBase = ['rgba(34, 197, 94, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(249, 115, 22, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(168, 85, 247, 0.8)', 'rgba(100, 116, 139, 0.8)'];
    const paletteHover = ['rgba(34, 197, 94, 1)', 'rgba(234, 179, 8, 1)', 'rgba(249, 115, 22, 1)', 'rgba(239, 68, 68, 1)', 'rgba(168, 85, 247, 1)', 'rgba(100, 116, 139, 1)'];

    // Helper para determinar color por severidad (nombre del nivel)
    const getColorBySeverity = (label, isHover = false) => {
      const l = label.toLowerCase();
      let index = 5; // Gris por defecto
      if (l.includes('bajo') || l.includes('leve') || l.includes('optimo')) index = 0;
      else if (l.includes('moderado') || l.includes('medio')) index = 1;
      else if (l.includes('alto') && !l.includes('muy')) index = 3;
      else if (l.includes('muy alto') || l.includes('severo')) index = 4;
      
      return isHover ? paletteHover[index] : paletteBase[index];
    };

    // Si hay un cuestionario específico seleccionado, usamos sus rangos predefinidos para estructurar la dona
    let rangosDefinidos = [];
    if (selectedQuizId) {
      const selectedQuiz = rawData.quizzes.find(q => q.id === selectedQuizId);
      const tabla = selectedQuiz?.tabla_interpretacion || selectedQuiz?.rangos; // Soporte para ambos nombres
      if (tabla && tabla.length > 0) {
        // Sort rangos by min value to ensure lowest severity (Bajo) gets the first color (Green)
        rangosDefinidos = [...tabla].sort((a, b) => (a.min || 0) - (b.min || 0));
      }
    }

    if (rangosDefinidos.length > 0) {
      // Inicializar contadores basados en los rangos del cuestionario
      const conteoPorRango = {};
      rangosDefinidos.forEach(r => conteoPorRango[r.nivel || r.titulo] = 0);

      filteredResponses.forEach(r => {
        const score = r.puntaje_total || 0;
        // Calculamos directamente el rango usando el puntaje crudo contra los rangos dinámicos del quiz
        const rangoEncontrado = rangosDefinidos.find(rg => score >= rg.min && score <= rg.max);
        
        if (rangoEncontrado) {
          const nombreNivel = rangoEncontrado.nivel || rangoEncontrado.titulo;
          conteoPorRango[nombreNivel]++;
        } else {
          // Fallback por si hay un nivel guardado y el puntaje está fuera de rango
          const nivel = r.resultado_analisis?.nivel;
          if (nivel && conteoPorRango[nivel] !== undefined) {
            conteoPorRango[nivel]++;
          }
        }
      });

      distribLabels = rangosDefinidos.map(r => r.nivel || r.titulo);
      distribData = rangosDefinidos.map(r => conteoPorRango[r.nivel || r.titulo]);
      // Asignar colores analizando el texto del rango, para que "Alto" siempre sea rojo y "Bajo" verde
      backgroundColors = rangosDefinidos.map(r => getColorBySeverity(r.nivel || r.titulo, false));
      hoverColors = rangosDefinidos.map(r => getColorBySeverity(r.nivel || r.titulo, true));

    } else {
      // Fallback si el cuestionario no tiene rangos definidos
      const conteoDinamico = {};
      filteredResponses.forEach(r => {
        const nivel = r.resultado_analisis?.nivel || 'Sin Clasificar';
        conteoDinamico[nivel] = (conteoDinamico[nivel] || 0) + 1;
      });

      distribLabels = Object.keys(conteoDinamico);
      distribData = Object.values(conteoDinamico);
      backgroundColors = distribLabels.map(label => getColorBySeverity(label, false));
      hoverColors = distribLabels.map(label => getColorBySeverity(label, true));
    }

    const stressDistribution = {
      labels: distribLabels,
      datasets: [
        {
          data: distribData.length > 0 ? distribData : [], // Sin datos de relleno
          backgroundColor: backgroundColors,
          hoverBackgroundColor: hoverColors,
          borderWidth: 1,
          borderColor: '#ffffff',
        }
      ]
    };

    // --- EVOLUCIÓN MENSUAL/DIARIA (Líneas) ---
    const last6Months = [];
    const now = new Date();
    let minDate, maxDate;
    let isDaily = dateFilterType === 'today' || dateFilterType === '7days' || dateFilterType === '30days';

    if (dateFilterType === 'thisYear') {
      minDate = new Date(now.getFullYear(), 0, 1);
      maxDate = new Date(now.getFullYear(), 11, 1);
    } else if (dateFilterType === 'today') {
      minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilterType === '7days') {
      minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilterType === '30days') {
      minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilterType === 'custom' && customStartDate && customEndDate) {
      minDate = new Date(customStartDate);
      maxDate = new Date(customEndDate);
      const diffDays = Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24));
      if (diffDays <= 31) isDaily = true;
    } else {
      if (filteredResponses.length > 0) {
        const dates = filteredResponses.map(r => new Date(r.created_at || r.fecha).getTime());
        minDate = new Date(Math.min(...dates));
        maxDate = new Date(Math.max(...dates));
      } else {
        minDate = new Date(); minDate.setMonth(now.getMonth() - 5);
        maxDate = new Date();
      }
    }

    if (isDaily) {
      let current = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
      const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
      if (end < current) end.setTime(current.getTime());

      let safety = 0;
      while (current <= end && safety < 60) {
        last6Months.push({
          name: current.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).trim(),
          day: current.getDate(),
          month: current.getMonth(),
          year: current.getFullYear(),
          wellbeing: 0, stress: 0, count: 0
        });
        current.setDate(current.getDate() + 1);
        safety++;
      }
      
      if (last6Months.length === 1) {
        const single = last6Months[0];
        const prev = new Date(single.year, single.month, single.day - 1);
        const next = new Date(single.year, single.month, single.day + 1);
        last6Months.unshift({
          name: prev.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).trim(),
          day: prev.getDate(), month: prev.getMonth(), year: prev.getFullYear(), wellbeing: 0, stress: 0, count: 0
        });
        last6Months.push({
          name: next.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).trim(),
          day: next.getDate(), month: next.getMonth(), year: next.getFullYear(), wellbeing: 0, stress: 0, count: 0
        });
      }
    } else {
      let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      if (end < current) end.setTime(current.getTime());

      let safety = 0;
      while (current <= end && safety < 60) {
        const yearFmt = current.getFullYear() !== now.getFullYear() ? '2-digit' : undefined;
        last6Months.push({
          name: current.toLocaleDateString('es-ES', { month: 'short', year: yearFmt }).trim(),
          month: current.getMonth(),
          year: current.getFullYear(),
          wellbeing: 0, stress: 0, count: 0
        });
        current.setMonth(current.getMonth() + 1);
        safety++;
      }

      if (last6Months.length === 1) {
        const single = last6Months[0];
        const prev = new Date(single.year, single.month - 1, 1);
        const next = new Date(single.year, single.month + 1, 1);
        last6Months.unshift({
          name: prev.toLocaleDateString('es-ES', { month: 'short', year: prev.getFullYear() !== now.getFullYear() ? '2-digit' : undefined }).trim(),
          month: prev.getMonth(), year: prev.getFullYear(), wellbeing: 0, stress: 0, count: 0
        });
        last6Months.push({
          name: next.toLocaleDateString('es-ES', { month: 'short', year: next.getFullYear() !== now.getFullYear() ? '2-digit' : undefined }).trim(),
          month: next.getMonth(), year: next.getFullYear(), wellbeing: 0, stress: 0, count: 0
        });
      }
    }

    filteredResponses.forEach(r => {
      const date = new Date(r.created_at || r.fecha);
      const d = date.getDate();
      const m = date.getMonth();
      const y = date.getFullYear();
      
      const bucket = isDaily 
        ? last6Months.find(b => b.day === d && b.month === m && b.year === y)
        : last6Months.find(b => b.month === m && b.year === y);
      if (bucket) {
        // Encontrar el puntaje máximo del quiz al que pertenece esta respuesta
        let maxScore = 100; // default si no se encuentra
        const parentQuiz = rawData.quizzes.find(q => q.id === r.quiz_id);
        
        if (parentQuiz) {
            // Calcular el max_score sumando el peso máximo de cada pregunta
            let preguntasList = parentQuiz.preguntas;
            if (typeof preguntasList === 'string') {
                try { preguntasList = JSON.parse(preguntasList); } catch { preguntasList = []; }
            }
            if (Array.isArray(preguntasList) && preguntasList.length > 0) {
                maxScore = preguntasList.reduce((sum, preg) => {
                    const pesosOpciones = preg.opciones?.map(op => op.peso || 0) || [0];
                    return sum + Math.max(...pesosOpciones);
                }, 0);
            }
        }
        
        // Evitar división por cero
        maxScore = Math.max(maxScore, 1);

        const scoreCrudo = r.puntaje_total || 0;
        
        // Normalizar el puntaje crudo a un porcentaje (0 a 100)
        const stressPercent = Math.min(100, Math.max(0, (scoreCrudo / maxScore) * 100));
        const wellbeingPercent = 100 - stressPercent;

        bucket.stress += stressPercent;
        bucket.wellbeing += wellbeingPercent;
        bucket.count++;
      }
    });

    const wellbeingData = [];
    const stressData = [];
    last6Months.forEach(b => {
      if (b.count > 0) {
        wellbeingData.push(Math.round(b.wellbeing / b.count));
        stressData.push(Math.round(b.stress / b.count));
      } else {
        // Usar 0 en lugar de null para que el gráfico de líneas siempre dibuje una línea
        wellbeingData.push(0);
        stressData.push(0);
      }
    });

    const stressEvolution = {
      labels: last6Months.map(b => b.name),
      datasets: [
        {
          label: 'Promedio Bienestar (%)',
          data: wellbeingData,
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          fill: true,
          tension: 0.4,
          spanGaps: true // Permite conectar la línea a través de meses sin datos
        },
        {
          label: 'Promedio Estrés (%)',
          data: stressData,
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          fill: true,
          tension: 0.4,
          spanGaps: true
        }
      ]
    };

    return { stressDistribution, stressEvolution };
  }, [filteredResponses, selectedQuizId, rawData.quizzes, dateFilterType, customStartDate, customEndDate]);

  return {
    isLoading,
    rawData,
    selectedQuizId,
    setSelectedQuizId,
    dateFilterType,
    setDateFilterType,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    computedKpis,
    computedChartsData
  };
}

