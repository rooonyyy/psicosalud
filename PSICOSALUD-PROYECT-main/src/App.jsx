import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';

// Páginas públicas e inicio de sesión
import Login from './pages/Login';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeQuiz from './pages/EmployeeQuiz';

// Páginas de error
import NotFound from './pages/NotFound';
import AccessDenied from './pages/AccessDenied';

// Páginas de administración interna (requieren layout)
import Dashboard from './pages/Dashboard';
import Areas from './pages/Areas';
import Reports from './pages/Reports';
import Users from './pages/Users';
import QuizList from './pages/QuizList';
import QuizEditor from './pages/QuizEditor';
import QuizPreview from './pages/QuizPreview';
import Settings from './pages/Settings';
import Intervenciones from './pages/Intervenciones';

/**
 * Componente AdminLayout
 * Envuelve las páginas de administración interna.
 * Proporciona una barra lateral de navegación (Sidebar) fija a la izquierda
 * y un contenedor de desplazamiento vertical a la derecha para renderizar el contenido.
 */

function AdminLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      {/* Barra lateral de navegación global */}
      <Sidebar />
      {/* Panel principal de contenido de la página actual */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
}

/**
 * Componente principal App
 * Configura el enrutamiento de la aplicación usando React Router.
 * Todas las rutas administrativas están protegidas por ProtectedRoute,
 * que verifica sesión activa en memoria y permisos por rol.
 */
function App() {
  return (
    <ToastProvider>
    <ConfirmProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rutas públicas (portales de inicio de sesión y evaluación) */}
            <Route path="/login" element={<Login />} />
            <Route path="/login-empleado" element={<EmployeeLogin />} />
            <Route path="/evaluacion" element={<EmployeeQuiz />} />

            {/* Página de acceso denegado (403) */}
            <Route path="/acceso-denegado" element={<AccessDenied />} />

            {/* Rutas administrativas protegidas — Administrador y Psicólogo */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['Administrador', 'Psicólogo']}>
                <AdminLayout><Dashboard /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/areas" element={
              <ProtectedRoute allowedRoles={['Administrador', 'Psicólogo']}>
                <AdminLayout><Areas /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/registros" element={
              <ProtectedRoute allowedRoles={['Administrador', 'Psicólogo']}>
                <AdminLayout><Reports /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/intervenciones" element={
              <ProtectedRoute allowedRoles={['Administrador', 'Psicólogo']}>
                <AdminLayout><Intervenciones /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/quizzes" element={
              <ProtectedRoute allowedRoles={['Administrador', 'Psicólogo']}>
                <AdminLayout><QuizList /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/quizzes/editor/:id?" element={
              <ProtectedRoute allowedRoles={['Administrador', 'Psicólogo']}>
                <AdminLayout><QuizEditor /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/quizzes/preview/:id" element={
              <ProtectedRoute allowedRoles={['Administrador', 'Psicólogo']}>
                <AdminLayout><QuizPreview /></AdminLayout>
              </ProtectedRoute>
            } />

            {/* Rutas restringidas — Solo Administrador */}
            <Route path="/usuarios" element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <AdminLayout><Users /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/configuracion" element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <AdminLayout><Settings /></AdminLayout>
              </ProtectedRoute>
            } />

            {/* Redirección por defecto y ruta 404 */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;