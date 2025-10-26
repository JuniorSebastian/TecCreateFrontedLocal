import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Protege rutas que requieren autenticación
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isSuspendido } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (isSuspendido()) {
    return (
      <Navigate
        to="/contacto"
        replace
        state={{ from: location.pathname, motivo: 'suspendido' }}
      />
    );
  }

  return children;
};

/**
 * RoleGuard - Protege rutas según roles permitidos
 */
export const RoleGuard = ({ children, allowedRoles }) => {
  const { hasRole, loading, getRedirectPath } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!hasRole(allowedRoles)) {
    // Redirigir a la ruta apropiada según su rol
    const redirectPath = getRedirectPath();
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

/**
 * StateGuard - Protege según estado del usuario (activo/inactivo)
 */
export const StateGuard = ({ children, requireActive = true }) => {
  const { isInactivo, isSuspendido, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando estado...</p>
        </div>
      </div>
    );
  }

  if (isSuspendido()) {
    return (
      <Navigate
        to="/contacto"
        replace
        state={{ from: location.pathname, motivo: 'suspendido' }}
      />
    );
  }

  if (requireActive && isInactivo()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-yellow-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Cuenta Inactiva</h2>
          <p className="text-gray-600 mb-6">
            Tu cuenta está inactiva. No puedes crear ni exportar presentaciones en este momento.
            Contacta con soporte para reactivarla.
          </p>
          <button
            onClick={() => (window.location.href = '/perfil')}
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition"
          >
            Ir a mi perfil
          </button>
        </div>
      </div>
    );
  }

  return children;
};

/**
 * PublicRoute - Solo accesible si NO está autenticado
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, getRedirectPath } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated()) {
    const redirectPath = getRedirectPath();
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};
