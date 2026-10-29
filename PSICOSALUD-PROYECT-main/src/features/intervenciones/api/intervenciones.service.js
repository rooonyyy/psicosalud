import { insforge } from '../../../lib/insforge';

class IntervencionesService {
  /**
   * Obtiene las intervenciones. 
   * Si se pasa un especialistaId, filtra por ese psicólogo.
   * Si es administrador, no se pasa id y trae todas.
   */
  async getIntervenciones(especialistaId = null) {
    let query = insforge.database
      .from('intervenciones')
      .select('*, areas(nombre), users(nombre, apellido1)')
      .order('created_at', { ascending: false });

    if (especialistaId) {
      query = query.eq('especialista_id', especialistaId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching intervenciones:', error);
      throw error;
    }
    return data ?? [];
  }

  /**
   * Actualiza el estado de una intervención.
   * @param {string} id ID de la intervención
   * @param {string} nuevoEstado 'Programada', 'En Progreso', 'Completada', 'Cancelada'
   */
  async updateEstado(id, nuevoEstado) {
    const { data, error } = await insforge.database
      .from('intervenciones')
      .update({ estado: nuevoEstado })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating estado:', error);
      throw error;
    }
    return data;
  }

  /**
   * Elimina una intervención
   */
  async deleteIntervencion(id) {
    const { error } = await insforge.database
      .from('intervenciones')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting intervencion:', error);
      throw error;
    }
    return true;
  }
}

export const intervencionesService = new IntervencionesService();
