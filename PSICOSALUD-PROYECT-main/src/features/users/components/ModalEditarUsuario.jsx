import React, { useState, useEffect } from 'react';
import { ROLES_OPTIONS } from '../utils/users.utils';
import { insforge } from '../../../lib/insforge';
import { useToast } from '../../../context/ToastContext';
import CustomSelect from '../../../components/ui/CustomSelect';

// Componente de modal para editar un usuario existente
export default function ModalEditarUsuario({ visible, usuario, onCerrar, onGuardar }) {
  const toast = useToast();
  // Estados locales para los campos editables
  const [nombre, setNombre] = useState('');
  const [apellido1, setApellido1] = useState('');
  const [apellido2, setApellido2] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rol, setRol] = useState(ROLES_OPTIONS[0] || 'Psicólogo');

  // Cargar datos cuando el prop usuario cambie o se haga visible el modal
  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || '');
      setApellido1(usuario.apellido1 || '');
      setApellido2(usuario.apellido2 || '');
      setEmail(usuario.email || '');
      setPassword(''); // Dejar vacío; solo enviar si se escribe algo nuevo
      setShowPassword(false);
      setRol(usuario.rol || ROLES_OPTIONS[0] || 'Psicólogo');
    }
  }, [usuario, visible]);

  // Si el modal no es visible, no renderizar nada
  if (!visible) return null;

  // Manejar el submit del formulario de edición
  const handleActualizar = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido1.trim() || !email.trim()) {
      toast.error('Por favor complete todos los campos obligatorios (*).');
      return;
    }
    // Llama al callback de guardar
    onGuardar({
      id: usuario.id,
      nombre,
      apellido1,
      apellido2,
      email,
      ...(password ? { password } : {}), // Solo lo incluimos si escribió una nueva contraseña
      rol
    });
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-[1000]">
      <div className="bg-white rounded-2xl p-8 w-[31.25rem] max-w-[90%] shadow-[0_8px_32px_rgba(4,71,56,0.15)] flex flex-col gap-5 font-sans">
        {/* Encabezado del modal */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="bg-[rgba(4,71,56,0.08)] text-primary w-14 h-14 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[2rem]">edit</span>
          </div>
          <h3 className="text-xl font-bold text-primary m-0">Editar Usuario</h3>
          <p className="text-on-surface-variant text-sm mt-1 mb-0 leading-relaxed">Modifica los datos del perfil seleccionado.</p>
        </div>

        {/* Formulario de edición */}
        <form onSubmit={handleActualizar} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Campo: Nombre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">Nombre</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Ana"
                className="w-full py-2.5 px-3.5 border border-outline-variant rounded-lg text-sm bg-white outline-none font-sans text-on-surface"
              />
            </div>

            {/* Campo: Primer Apellido */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">Primer Apellido</label>
              <input
                type="text"
                required
                value={apellido1}
                onChange={(e) => setApellido1(e.target.value)}
                placeholder="Ej. García"
                className="w-full py-2.5 px-3.5 border border-outline-variant rounded-lg text-sm bg-white outline-none font-sans text-on-surface"
              />
            </div>

            {/* Campo: Segundo Apellido */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">Segundo Apellido</label>
              <input
                type="text"
                value={apellido2}
                onChange={(e) => setApellido2(e.target.value)}
                placeholder="Ej. López"
                className="w-full py-2.5 px-3.5 border border-outline-variant rounded-lg text-sm bg-white outline-none font-sans text-on-surface"
              />
            </div>

            {/* Campo: Correo Electrónico */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="correo@psicosalud.com"
                className="w-full py-2.5 px-3.5 border border-outline-variant rounded-lg text-sm bg-white outline-none font-sans text-on-surface"
                pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                title="El correo debe estar en minúsculas y tener un formato válido (ej. usuario@dominio.com)"
              />
            </div>

            {/* Campo: Contraseña (Opcional en edición) */}
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-xs font-semibold text-on-surface">Nueva Contraseña (Opcional)</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Escribe para cambiar la contraseña actual"
                  className="w-full py-2.5 px-3.5 pr-11 border border-outline-variant rounded-lg text-sm bg-white outline-none font-sans text-on-surface"
                />
                <button
                  type="button"
                  className="absolute right-3 bg-transparent border-none cursor-pointer text-on-surface-variant flex items-center p-0 transition-colors duration-200 hover:text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Campo: Rol */}
          <div className="flex flex-col gap-1.5 z-40">
            <label className="text-xs font-semibold text-on-surface">Rol en el sistema</label>
            <CustomSelect
              value={rol}
              onChange={(val) => setRol(val)}
              options={ROLES_OPTIONS.map(opt => ({ value: opt, label: opt }))}
              placeholder="Selecciona el rol"
            />
          </div>

          {/* Acciones */}
          <div className="flex justify-center gap-3 mt-3">
            <button
              type="button"
              onClick={onCerrar}
              className="px-5 py-2.5 bg-transparent border border-outline-variant rounded-lg font-bold text-sm text-on-surface-variant cursor-pointer font-sans transition-colors duration-200 hover:bg-surface-container-low"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-white border-none rounded-lg font-bold text-sm cursor-pointer font-sans flex items-center gap-2 transition-opacity duration-200 hover:opacity-90"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
