import { insforge } from '../../../lib/insforge';

export const areasService = {
  async getRawAreas() {
    const { data, error } = await insforge.database
      .from('areas')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getAreas() {
    const { data: areasData, error } = await insforge.database
      .from('areas')
      .select('*')
      .order('id', { ascending: true });
      
    if (error) throw error;
    
    // Obtener respuestas para calcular participación real por área
    const { data: responses, error: respError } = await insforge.database
      .from('quiz_responses')
      .select('area');
      
    if (respError) throw respError;
    
    const areaCounts = {};
    responses.forEach(r => {
      areaCounts[r.area] = (areaCounts[r.area] || 0) + 1;
    });
    
    // Mapeamos los datos calculando en base a la participación real y total_trabajadores
    return areasData.map(area => {
      const count = areaCounts[area.nombre] || 0;
      const total = area.total_trabajadores || 0;
      const participacionPct = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        ...area,
        bienestar: Math.min(100, 50 + count * 2),
        estres: Math.max(0, 50 - count * 2),
        participacion: participacionPct,
        participacionCount: count,
        tendencia: count > 0 ? 5 : 0,
        riesgo: count < 2 ? 'Bajo' : (count < 5 ? 'Medio' : 'Alto'),
        factoresRiesgo: area.factoresRiesgo || ['Carga de trabajo', 'Falta de pausas']
      };
    });
  },

  async getAreaHistorial(areaNombre) {
    // Obtenemos participación real de esta área
    const { count } = await insforge.database
      .from('quiz_responses')
      .select('*', { count: 'exact', head: true })
      .eq('area', areaNombre);
      
    const p = count || 0;
    
    return { 
      bienestar: [40, 45, 50, 48, 55, 50 + p * 2], 
      estres: [60, 55, 50, 52, 45, 50 - p * 2] 
    };
  },

  // Actualizar el total de trabajadores de un área
  async updateAreaTrabajadores(id, totalTrabajadores) {
    const { data, error } = await insforge.database
      .from('areas')
      .update({ total_trabajadores: totalTrabajadores })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Crear una nueva área
  async createArea(nombre, total_trabajadores) {
    const { data, error } = await insforge.database
      .from('areas')
      .insert([{ nombre, total_trabajadores }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar un área
  async deleteArea(id) {
    const { error } = await insforge.database
      .from('areas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Obtener la suma global de trabajadores de todas las áreas
  async getTotalTrabajadores() {
    const { data, error } = await insforge.database
      .from('areas')
      .select('total_trabajadores');

    if (error) throw error;
    return (data || []).reduce((sum, a) => sum + (Number(a.total_trabajadores) || 0), 0);
  },

  subscribeToUpdates(callback) {
    try {
      if (insforge.database.channel) {
        const channel = insforge.database.channel('areas-updates')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_responses' }, payload => {
            callback();
          })
          .subscribe();
        return channel;
      } else {
        return setInterval(callback, 5000);
      }
    } catch (e) {
      console.warn("Realtime no soportado, usando polling", e);
      return setInterval(callback, 5000);
    }
  },
  
  unsubscribe(subscription) {
    if (subscription && typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe();
    } else if (subscription) {
      clearInterval(subscription);
    }
  }
};

