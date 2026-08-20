import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  // Verificamos si existe la sesión en localStorage
  const isAuthenticated = localStorage.getItem('woditek_admin_auth') === 'true';

  if (!isAuthenticated) {
    // Si no está autenticado, lo redirigimos al login
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizamos las rutas hijas
  return <Outlet />;
};
