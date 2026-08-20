import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import { AdminLayout } from './pages/Admin/AdminLayout';
import { AdminProvider } from './context/AdminContext';
import { Login } from './pages/Admin/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
// Vistas de administracion
import { Dashboard } from './pages/Admin/Dashboard';
import { Ingresos } from './pages/Admin/Ingresos';
import { Adelantos } from './pages/Admin/Adelantos';
import { Pagos } from './pages/Admin/Pagos';
import { DeudasClientes } from './pages/Admin/DeudasClientes';
import { Cotizaciones } from './pages/Admin/Cotizaciones';
import { Clientes } from './pages/Admin/Clientes';
import { Proyectos } from './pages/Admin/Proyectos';
import { Trabajadores } from './pages/Admin/Trabajadores';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta publica (Landing Page) */}
        <Route path="/" element={<Landing />} />

        {/* Ruta pública de Login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas de Administracion (Protegidas) */}
        <Route element={<ProtectedRoute />}>
          <Route 
            path="/administracion" 
            element={
              <AdminProvider>
                <AdminLayout />
              </AdminProvider>
            }
          >
          <Route index element={<Dashboard />} />
          <Route path="ingresos" element={<Ingresos />} />
          <Route path="adelantos" element={<Adelantos />} />
          <Route path="pagos" element={<Pagos />} />
          <Route path="deudas" element={<DeudasClientes />} />
          <Route path="cotizaciones" element={<Cotizaciones />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="proyectos" element={<Proyectos />} />
          <Route path="trabajadores" element={<Trabajadores />} />
        </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
