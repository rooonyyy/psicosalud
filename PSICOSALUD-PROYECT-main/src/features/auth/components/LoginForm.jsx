import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersService } from '../../users/api/users.service';
import { useAuth } from '../../../context/AuthContext';

/**
 * Componente LoginForm
 * Renderiza el formulario de inicio de sesión para el rol de administrador.
 * Gestiona los estados locales de email, contraseña y visibilidad del password.
 * Tras un envío de formulario exitoso, establece la sesión en memoria vía AuthContext
 * y redirige al usuario al panel de administración.
 */

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Estados locales para los campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión activa, redirigir al dashboard automáticamente
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  // Manejador del submit de inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await usersService.authenticateUser(email, password);
      if (response && response.user) {
        // Establecer sesión en memoria y localStorage vía AuthContext
        login(response.user, response.token);
        // Redirigir al dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Correo institucional o código de acceso incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      {/* Campo: Correo Institucional */}
      <div className="mb-4">
        <label className="block text-[0.6875rem] font-bold text-primary uppercase tracking-wider mb-1.5">
          Correo Institucional
        </label>
        <input
          type="email"
          placeholder="nombre@psicosalud.com"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          className="w-full py-3 px-4 bg-slate-50 border border-outline rounded-xl text-sm text-on-surface outline-none font-sans transition-colors duration-200 focus:bg-white focus:border-secondary"
          required
          autoComplete="username"
          pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
          title="El correo debe estar en minúsculas y tener un formato válido (ej. usuario@dominio.com)"
        />
      </div>

      {/* Campo: Código de Acceso (Contraseña) */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-[0.6875rem] font-bold text-primary uppercase tracking-wider">
            Código de Acceso
          </label>
          <a href="#" className="text-[0.625rem] font-extrabold text-secondary uppercase tracking-wider hover:underline">
            ¿Lo olvidaste?
          </a>
        </div>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-3 px-4 bg-slate-50 border border-outline rounded-xl text-sm text-on-surface outline-none font-sans transition-colors duration-200 focus:bg-white focus:border-secondary"
            required
            autoComplete="current-password"
          />
          {/* Botón para alternar la visibilidad de la contraseña */}
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant flex items-center justify-center"
          >
            <span className="material-symbols-outlined">
              {showPass ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
      </div>

      {/* Renderizado condicional del error */}
      {error && (
        <div className="text-[0.8125rem] text-error mb-4 flex items-center gap-1.5 bg-error-container p-2.5 rounded-lg">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {/* Botón de envío */}
      <button
        type="submit"
        className="w-full p-4 bg-primary text-white rounded-xl font-bold text-[0.9375rem] font-sans mt-1 flex items-center justify-center gap-2 transition-opacity duration-200 hover:opacity-90 disabled:opacity-70 disabled:cursor-wait"
        disabled={loading}
      >
        {loading ? 'Verificando...' : 'Ingresar al sistema'}
        {!loading && (
          <span className="material-symbols-outlined">
            arrow_forward
          </span>
        )}
      </button>
    </form>
  );
}