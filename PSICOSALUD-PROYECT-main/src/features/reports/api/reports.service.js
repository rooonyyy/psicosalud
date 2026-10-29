import { insforge } from '../../../lib/insforge';
import { intervencionesService } from '../../intervenciones/api/intervenciones.service';

export const reportsService = {
  async getReports() {
    const { data, error } = await insforge.database
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  async getResponsables() {
    // Obtener los usuarios con rol Psicólogo o Administrador para el filtro
    const { data, error } = await insforge.database
      .from('users')
      .select('*')
      .in('rol', ['Psicólogo', 'Administrador']);
      
    if (error) throw error;
    return data;
  },

  async createReport(reportData, file) {
    let archivo_url = null;
    let archivo_nombre = null;

    if (file) {
      const ext = file.name.split('.').pop();
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const { data: uploadData, error: uploadError } = await insforge.storage
        .from('reports')
        .upload(uniqueName, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública de forma robusta
      try {
        const publicUrlResult = insforge.storage.from('reports').getPublicUrl(uniqueName);
        const resolved = publicUrlResult instanceof Promise ? await publicUrlResult : publicUrlResult;
        
        if (typeof resolved === 'string') {
          archivo_url = resolved;
        } else if (resolved?.data?.publicUrl) {
          archivo_url = resolved.data.publicUrl;
        } else if (resolved?.publicURL) {
          archivo_url = resolved.publicURL;
        } else if (resolved?.publicUrl) {
          archivo_url = resolved.publicUrl;
        } else {
          // Fallback manual
          const baseUrl = import.meta.env.VITE_INSFORGE_URL;
          archivo_url = `${baseUrl}/storage/v1/object/public/reports/${uniqueName}`;
        }
      } catch (err) {
        console.error('Error al obtener URL pública, usando fallback:', err);
        const baseUrl = import.meta.env.VITE_INSFORGE_URL;
        archivo_url = `${baseUrl}/storage/v1/object/public/reports/${uniqueName}`;
      }
      
      archivo_nombre = uniqueName;
    }

    const { intervencion_id, ...restReportData } = reportData;

    const reportToInsert = {
      ...restReportData,
      intervencion_id: intervencion_id || null,
      archivo_url,
      archivo_nombre
    };

    const { data, error } = await insforge.database
      .from('reports')
      .insert([reportToInsert])
      .select()
      .single();
      
    if (error) throw error;

    // Si se vinculó a una intervención, marcarla como completada automáticamente
    if (intervencion_id) {
      try {
        await intervencionesService.updateEstado(intervencion_id, 'Completada');
      } catch (err) {
        console.error("Error al actualizar estado de la intervención tras subir el informe:", err);
        // Aunque falle la actualización del estado, el informe se guardó correctamente.
      }
    }

    return data;
  },

  async updateReport(id, updateData, newFile, oldFileName) {
    let archivo_url = updateData.archivo_url;
    let archivo_nombre = updateData.archivo_nombre;

    if (newFile) {
      // Si hay archivo nuevo, lo subimos
      const ext = newFile.name.split('.').pop();
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const { error: uploadError } = await insforge.storage
        .from('reports')
        .upload(uniqueName, newFile);

      if (uploadError) throw uploadError;

      // Obtener URL
      try {
        const publicUrlResult = insforge.storage.from('reports').getPublicUrl(uniqueName);
        const resolved = publicUrlResult instanceof Promise ? await publicUrlResult : publicUrlResult;
        
        if (typeof resolved === 'string') {
          archivo_url = resolved;
        } else if (resolved?.data?.publicUrl) {
          archivo_url = resolved.data.publicUrl;
        } else if (resolved?.publicURL) {
          archivo_url = resolved.publicURL;
        } else if (resolved?.publicUrl) {
          archivo_url = resolved.publicUrl;
        } else {
          archivo_url = `${import.meta.env.VITE_INSFORGE_URL}/storage/v1/object/public/reports/${uniqueName}`;
        }
      } catch (err) {
        archivo_url = `${import.meta.env.VITE_INSFORGE_URL}/storage/v1/object/public/reports/${uniqueName}`;
      }
      
      archivo_nombre = uniqueName;

      // Borrar archivo antiguo si existía
      if (oldFileName) {
        insforge.storage.from('reports').remove([oldFileName]).catch(e => console.error(e));
      }
    }

    const reportToUpdate = {
      ...updateData,
      archivo_url,
      archivo_nombre
    };

    const { data, error } = await insforge.database
      .from('reports')
      .update(reportToUpdate)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async deleteReport(id, archivo_nombre) {
    // Si hay un archivo asociado, lo borramos del bucket
    if (archivo_nombre) {
      const { error: storageError } = await insforge.storage
        .from('reports')
        .remove([archivo_nombre]);
      
      if (storageError) {
        console.error('Error al borrar el archivo del bucket:', storageError);
      }
    }

    const { error } = await insforge.database
      .from('reports')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  }
};
