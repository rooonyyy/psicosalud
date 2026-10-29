import React, { useState, useMemo } from 'react';
import { obtenerNombreCompleto } from '../features/users/utils/users.utils';
import { usersService } from '../features/users/api/users.service';
import UsersBusqueda from '../features/users/components/UsersBusqueda';
import UsersTabla from '../features/users/components/UsersTabla';
import UsersPaginacion from '../features/users/components/UsersPaginacion';
import LoadingSpinner from '../components/LoadingSpinner';
import ModalNuevoUsuario from '../features/users/components/ModalNuevoUsuario';
import ModalEditarUsuario from '../features/users/components/ModalEditarUsuario';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
// Componente principal de administración de usuarios (orquestador)
export default function Users() {
  const toast = useToast();
  const confirm = useConfirm();
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const data = await usersService.getUsers();
        setUsuarios(data || []);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setErrorMsg(err.message || JSON.stringify(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);
  const [search, setSearch] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  // Estados para la visualización de modales
  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);

  // Estados para los usuarios seleccionados en los flujos de editar y eliminar
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);

  // Filtrado de usuarios por nombre completo, ID o rol en tiempo real
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const nombreCompleto = obtenerNombreCompleto(u).toLowerCase();
      const idStr = u.id ? String(u.id).toLowerCase() : '';
      const rolStr = u.rol.toLowerCase();
      const s = search.toLowerCase();
      
      return nombreCompleto.includes(s) || idStr.includes(s) || rolStr.includes(s);
    });
  }, [usuarios, search]);

  // Lógica de paginación (5 usuarios por página)
  const itemsPorPagina = 5;
  const totalEntradas = usuariosFiltrados.length;
  const totalPaginas = Math.ceil(totalEntradas / itemsPorPagina) || 1;

  // Ajuste automático del índice por si cambian los filtros
  const paginaActiva = Math.min(paginaActual, totalPaginas);

  const inicioIndice = (paginaActiva - 1) * itemsPorPagina;
  const finIndice = Math.min(inicioIndice + itemsPorPagina, totalEntradas);

  const itemsPaginados = useMemo(() => {
    return usuariosFiltrados.slice(inicioIndice, finIndice);
  }, [usuariosFiltrados, inicioIndice, finIndice]);

  // Guardar un nuevo usuario
  const handleGuardarNuevo = async (nuevo) => {
    const iniciales = (nuevo.nombre[0] + nuevo.apellido1[0]).toUpperCase();
    const nuevoUsuario = {
      nombre: nuevo.nombre,
      apellido1: nuevo.apellido1,
      apellido2: nuevo.apellido2,
      password: nuevo.password,
      iniciales,
      rol: nuevo.rol,
      email: nuevo.email
    };

    try {
      const createdUser = await usersService.createUser(nuevoUsuario);
      setUsuarios([createdUser, ...usuarios]);
      setShowModalNuevo(false);
      toast.success('Usuario creado correctamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al crear usuario.');
    }
  };

  // Guardar la edición de un usuario existente
  const handleGuardarEdicion = async (editado) => {
    const iniciales = (editado.nombre[0] + editado.apellido1[0]).toUpperCase();
    const userData = {
      nombre: editado.nombre,
      apellido1: editado.apellido1,
      apellido2: editado.apellido2,
      rol: editado.rol,
      email: editado.email,
      ...(editado.password ? { password: editado.password } : {}),
      iniciales
    };

    try {
      const updatedUser = await usersService.updateUser(editado.id, userData);
      setUsuarios(
        usuarios.map((u) => (u.id === editado.id ? { ...u, ...updatedUser } : u))
      );
      setShowModalEditar(false);
      setUsuarioAEditar(null);
      toast.success('Usuario actualizado correctamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar usuario.');
    }
  };

  // Confirmar y procesar la eliminación
  const handleConfirmarEliminar = async (user) => {
    try {
      await usersService.deleteUser(user.id);
      setUsuarios(usuarios.filter((u) => u.id !== user.id));
      toast.success('Usuario eliminado correctamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar usuario.');
    }
  };

  return (
    <div className="py-8 px-16 max-w-[100rem] mx-auto">
      {/* Encabezado */}
      <div className="flex justify-between items-start mb-8 flex-col sm:flex-row gap-4 sm:gap-0">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-[-0.02em] m-0">Usuarios</h2>
          <p className="text-on-surface-variant mt-1 text-sm mb-0">Gestiona los perfiles y accesos de los profesionales y administradores del sistema.</p>
        </div>
        <button
          onClick={() => setShowModalNuevo(true)}
          className="px-5 py-2.5 bg-primary text-white border-none rounded-lg font-bold text-sm cursor-pointer font-sans flex items-center gap-2 transition-opacity duration-200 hover:opacity-90"
        >
          + Registrar Usuario
        </button>
      </div>

      {/* Componente para barra de filtrado */}
      <UsersBusqueda
        search={search}
        onSearch={(val) => { setSearch(val); setPaginaActual(1); }}
        onLimpiar={() => {
          setSearch('');
          setPaginaActual(1);
        }}
      />

      {/* Tabla con la grilla de usuarios */}
      {isLoading ? (
        <LoadingSpinner message="Cargando usuarios..." />
      ) : usuarios.length === 0 ? (
        <div className="text-center p-[3.75rem_1.25rem] bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
          <span className="material-symbols-outlined text-5xl text-outline mb-4">group_off</span>
          <h3 className="text-lg font-semibold text-on-surface mb-2">Sin usuarios</h3>
          <p className="text-on-surface-variant max-w-[25rem] mx-auto mb-5">
            {errorMsg ? 'Hubo un problema al conectar con la base de datos.' : 'Aún no hay usuarios registrados en el sistema.'}
          </p>
          <button onClick={() => setShowModalNuevo(true)} className="px-5 py-2.5 bg-primary text-white border-none rounded-lg font-bold text-sm cursor-pointer font-sans flex items-center justify-center gap-2 transition-opacity duration-200 hover:opacity-90 mt-4 mx-auto">
            + Registrar Primer Usuario
          </button>
        </div>
      ) : (
        <UsersTabla
          items={itemsPaginados}
          onEditar={(user) => {
            setUsuarioAEditar(user);
            setShowModalEditar(true);
          }}
          onEliminar={async (user) => {
            const confirmed = await confirm(`¿Estás seguro de que deseas eliminar al usuario "${obtenerNombreCompleto(user)}"? Esta acción no se puede deshacer.`);
            if (confirmed) {
              handleConfirmarEliminar(user);
            }
          }}
        />
      )}

      {/* Paginación */}
      {totalEntradas > 0 && (
        <UsersPaginacion
          paginaActual={paginaActiva}
          totalPaginas={totalPaginas}
          inicio={totalEntradas === 0 ? 0 : inicioIndice + 1}
          fin={finIndice}
          total={totalEntradas}
          onCambiar={setPaginaActual}
        />
      )}

      {/* Modal: Crear Nuevo Usuario */}
      <ModalNuevoUsuario
        visible={showModalNuevo}
        onCerrar={() => setShowModalNuevo(false)}
        onGuardar={handleGuardarNuevo}
      />

      {/* Modal: Editar Datos de Usuario */}
      <ModalEditarUsuario
        visible={showModalEditar}
        usuario={usuarioAEditar}
        onCerrar={() => {
          setShowModalEditar(false);
          setUsuarioAEditar(null);
        }}
        onGuardar={handleGuardarEdicion}
      />

    </div>
  );
}
