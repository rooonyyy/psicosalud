import { insforge } from '../../../lib/insforge';

export const usersService = {
  async getUsers() {
    const { data, error } = await insforge.database
      .from('users')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data;
  },

  async authenticateUser(email, password) {
    const { data, error } = await insforge.functions.invoke('auth-login', {
      body: { email, password }
    });

    if (error) {
      throw new Error(error.message || 'Credenciales inválidas');
    }
    
    return data; // Retorna { user, token }
  },

  async getUserById(id) {
    const { data, error } = await insforge.database
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createUser(userData) {
    // Invocamos la Edge Function de InsForge para crear el usuario en Auth y DB de forma segura
    const { data, error } = await insforge.functions.invoke('create-user', {
      body: userData
    });

    if (error) {
      console.error("Error en create-user:", error);
      // Extraemos el mensaje de error si está disponible
      throw new Error(error.message || 'Error al crear el usuario');
    }
    
    return data;
  },

  async updateUser(id, userData) {
    const { data, error } = await insforge.functions.invoke('update-user', {
      body: { id, ...userData }
    });

    if (error) {
      console.error("Error en update-user:", error);
      throw new Error(error.message || 'Error al actualizar el usuario');
    }
    
    return data;
  },

  async deleteUser(id) {
    const { error } = await insforge.database
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
