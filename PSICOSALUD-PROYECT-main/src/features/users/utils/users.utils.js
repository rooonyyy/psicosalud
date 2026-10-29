// Opciones de roles permitidos en la gestión de perfiles
export const ROLES_OPTIONS = ['Psicólogo', 'Administrador'];

// Función de utilidad para generar el nombre completo a partir del objeto de usuario
export function obtenerNombreCompleto(user) {
  if (!user) return '';
  return `${user.nombre} ${user.apellido1} ${user.apellido2 || ''}`.trim();
}
