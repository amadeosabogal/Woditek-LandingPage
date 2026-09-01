import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/CRM/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermiso?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermiso }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const empresa_id = '1';
  const { hasPermiso, isLoading } = useAuth();

  if (!token) {
    const loginUrl = location.pathname.startsWith('/super-admin')
      ? '/super-admin/login'
      : (empresa_id ? `/crm/login` : '/1/login');
    return <Navigate to={loginUrl} state={{ from: location }} replace />;
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  if (requiredPermiso && !hasPermiso(requiredPermiso)) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-4">
        <span className="material-symbols-outlined text-[64px] text-status-na mb-4">gpp_bad</span>
        <h1 className="text-headline-md text-on-surface mb-2">Acceso Denegado</h1>
        <p className="text-on-surface-variant text-body-lg">No tienes permisos suficientes para acceder a esta sección.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
