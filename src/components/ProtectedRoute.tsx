import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  // Verificamos si existe la sesión en localStorage
  const isAuthenticated = localStorage.getItem('woditek_admin_auth') === 'true';
  const hasToken = localStorage.getItem('woditek_admin_token');

  if (!isAuthenticated || !hasToken) {
    // Si no está autenticado, lo redirigimos al login
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizamos las rutas hijas
  return <Outlet />;
};
