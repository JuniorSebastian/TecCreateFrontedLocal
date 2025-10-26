import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario y token desde localStorage al montar
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsuario = localStorage.getItem('usuario');

    if (savedToken && savedUsuario) {
      try {
        const usuarioData = JSON.parse(savedUsuario);
        setToken(savedToken);
        setUsuario(usuarioData);
      } catch (error) {
        console.error('Error al parsear usuario guardado:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (tokenData, usuarioData) => {
    localStorage.setItem('token', tokenData);
    localStorage.setItem('usuario', JSON.stringify(usuarioData));
    setToken(tokenData);
    setUsuario(usuarioData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    // Redirigir usando window.location en lugar de navigate para evitar problemas de contexto
    window.location.href = '/';
  };

  const updateUsuario = (nuevosDatos) => {
    const usuarioActualizado = { ...usuario, ...nuevosDatos };
    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
    setUsuario(usuarioActualizado);
  };

  // Helpers para verificar roles y estados
  const isAuthenticated = () => !!token && !!usuario;

  const hasRole = (roles) => {
    if (!usuario?.rol) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    const rolNormalizado = usuario.rol.toLowerCase();
    return rolesArray.some((r) => r.toLowerCase() === rolNormalizado);
  };

  const isAdmin = () => hasRole('admin');
  const isSoporte = () => hasRole('soporte');
  const isUsuario = () => hasRole('usuario');

  const getEstado = () => {
    if (!usuario?.estado) return null;
    return usuario.estado.toLowerCase();
  };

  const isActivo = () => getEstado() === 'activo';
  const isInactivo = () => getEstado() === 'inactivo';
  const isSuspendido = () => getEstado() === 'suspendido';

  const canCreatePresentations = () => {
    if (!isAuthenticated()) return false;
    if (isSuspendido()) return false;
    if (isInactivo()) return false;
    // Solo usuario y admin pueden crear presentaciones
    return hasRole(['usuario', 'admin']);
  };

  const canExportPresentations = () => {
    return canCreatePresentations(); // Mismas reglas que crear
  };

  const getRedirectPath = () => {
    if (!usuario?.rol) return '/';
    const rolNormalizado = usuario.rol.toLowerCase();
    
    if (rolNormalizado === 'admin') return '/admindashboard';
    if (rolNormalizado === 'soporte') return '/soporte';
    return '/perfil';
  };

  const value = {
    usuario,
    token,
    loading,
    login,
    logout,
    updateUsuario,
    isAuthenticated,
    hasRole,
    isAdmin,
    isSoporte,
    isUsuario,
    getEstado,
    isActivo,
    isInactivo,
    isSuspendido,
    canCreatePresentations,
    canExportPresentations,
    getRedirectPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
