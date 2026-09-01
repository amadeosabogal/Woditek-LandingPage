import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/CRM/AuthContext';
import { 
  Search, 
  List, 
  MessageSquare, 
  Users, 
  ShieldAlert, 
  Settings,
  LogOut,
  X
} from 'lucide-react';

// You will need logoUrl to match the Admin logo if possible, but we'll use text for now
import logoUrl from '../../../assets/logo_blue.png';

interface SideNavProps {
  isMobileMenuOpen: boolean;
  closeMobileMenu: () => void;
}

const SideNav: React.FC<SideNavProps> = ({ isMobileMenuOpen, closeMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasPermiso } = useAuth();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate(`/crm/login`);
  };
  
  const navItems = [
    { path: `/crm/captacion-leads`, icon: <Search size={20} />, label: 'Captación de Leads', show: true },
    { path: `/crm/leads`, icon: <List size={20} />, label: 'Lista de Leads', show: true },
    { path: `/crm/bandeja`, icon: <MessageSquare size={20} />, label: 'Bandeja de Mensajes', show: true },
    { path: `/crm/usuarios`, icon: <Users size={20} />, label: 'Usuarios', show: hasPermiso('usuarios.ver') },
    { path: `/crm/roles`, icon: <ShieldAlert size={20} />, label: 'Roles y Permisos', show: hasPermiso('usuarios.editar') },
    { path: `/crm/configuracion`, icon: <Settings size={20} />, label: 'Configuración', show: hasPermiso('configuracion.ver') },
  ].filter(item => item.show);

  return (
    <aside 
      className={`w-64 md:w-64 bg-white border-r border-slate-300 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-300">
        <div className="flex items-center gap-2">
           <img src={logoUrl} alt="Woditek Logo" className="h-8 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
           <span className="font-bold text-lg text-slate-800">CRM</span>
        </div>
        <button 
          className="md:hidden text-slate-500 hover:text-slate-700"
          onClick={closeMobileMenu}
        >
          <X size={24} />
        </button>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-none border-l-4 ${
                isActive 
                  ? 'bg-slate-100 text-slate-900 border-[#3162fa]' 
                  : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={isActive ? 'text-[#3162fa]' : ''}>
                {item.icon}
              </div>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-300 space-y-2">
        <div className="flex items-center gap-3 mb-4 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#3162fa] text-white flex items-center justify-center font-bold text-sm">
              {user?.nombre?.[0] || 'U'}{user?.apellido?.[0] || ''}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-900 truncate">{user ? `${user.nombre} ${user.apellido}` : 'Cargando...'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.rol || ''}</p>
            </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <LogOut size={20} />
          Salir
        </button>
      </div>
    </aside>
  );
};

export default SideNav;
