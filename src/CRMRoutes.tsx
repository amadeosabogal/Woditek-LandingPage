import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/CRM/AuthContext';
import { DialogProvider } from './context/CRM/DialogContext';
import { LoaderProvider } from './context/CRM/LoaderContext';
import Login from './pages/CRM/Login';
import Register from './pages/CRM/Register';
import RecuperarContrasena from './pages/CRM/RecuperarContrasena';
import Layout from './components/CRM/layout/Layout';
import LeadsList from './pages/CRM/LeadsList';
import BandejaMensajes from './pages/CRM/BandejaMensajes';
import Usuarios from './pages/CRM/Usuarios';
import RolesPermisos from './pages/CRM/RolesPermisos';
import Configuracion from './pages/CRM/configuracionpage/Configuracion';
import CaptacionLeads from './pages/CRM/CaptacionLeads';
import ProtectedRouteCRM from './components/CRM/layout/ProtectedRoute';
import MenuSA from './pages/CRM/superAdmin/MenuSA';
import LoginSA from './pages/CRM/superAdmin/loginSA';
import EmpresasSA from './pages/CRM/superAdmin/EmpresasSA';
import UsuariosSA from './pages/CRM/superAdmin/UsuariosSA';
import ConfiguracionesSA from './pages/CRM/superAdmin/ConfiguracionesSA';
import RolesSA from './pages/CRM/superAdmin/RolesSA';
import MigracionSA from './pages/CRM/superAdmin/MigracionSA';

export default function CRMRoutes() {
  return (
    <LoaderProvider>
      <DialogProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="login" replace />} />
            <Route path="super-admin/login" element={<LoginSA />} />
            <Route path="super-admin" element={<ProtectedRouteCRM><MenuSA /></ProtectedRouteCRM>} />
            <Route path="super-admin/empresas" element={<ProtectedRouteCRM><EmpresasSA /></ProtectedRouteCRM>} />
            <Route path="super-admin/empresas/nueva" element={<ProtectedRouteCRM><EmpresasSA initialOpenModal={true} /></ProtectedRouteCRM>} />
            <Route path="super-admin/usuarios" element={<ProtectedRouteCRM><UsuariosSA /></ProtectedRouteCRM>} />
            <Route path="super-admin/configuracion" element={<ProtectedRouteCRM><ConfiguracionesSA /></ProtectedRouteCRM>} />
            <Route path="super-admin/roles" element={<ProtectedRouteCRM><RolesSA /></ProtectedRouteCRM>} />
            <Route path="super-admin/migracion" element={<ProtectedRouteCRM><MigracionSA /></ProtectedRouteCRM>} />
            <Route path="">
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="recuperar-contrasena" element={<RecuperarContrasena />} />
              <Route path="" element={<ProtectedRouteCRM><Layout /></ProtectedRouteCRM>}>
                <Route index element={<div className="font-display-lg text-display-lg">Dashboard (En construcción)</div>} />
                <Route path="leads" element={<LeadsList />} />
                <Route path="bandeja" element={<BandejaMensajes />} />
                <Route path="captacion-leads" element={<CaptacionLeads />} />
                <Route path="usuarios" element={<ProtectedRouteCRM requiredPermiso="usuarios.ver"><Usuarios /></ProtectedRouteCRM>} />
                <Route path="roles" element={<ProtectedRouteCRM requiredPermiso="usuarios.editar"><RolesPermisos /></ProtectedRouteCRM>} />
                <Route path="configuracion" element={<ProtectedRouteCRM requiredPermiso="configuracion.ver"><Configuracion /></ProtectedRouteCRM>} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </DialogProvider>
    </LoaderProvider>
  );
}
