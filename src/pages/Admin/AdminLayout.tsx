
import { NavLink, Outlet } from 'react-router-dom';
import logoUrl from '../../assets/logo_blue.png';

import { 
  LayoutDashboard, 
  WalletCards, 
  Banknote, 
  Receipt, 
  Users, 
  FileText,
  LogOut,
  Briefcase,
  HardHat
} from 'lucide-react';

export const AdminLayout = () => {
  const navItems = [
    { to: '.', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
    { to: 'trabajadores', icon: <HardHat size={20} />, label: 'Trabajadores' },
    { to: 'clientes', icon: <Users size={20} />, label: 'Cliente' },
    { to: 'cotizaciones', icon: <FileText size={20} />, label: 'Cotizaciones' },
    { to: 'ingresos', icon: <WalletCards size={20} />, label: 'Ingresos' },
    { to: 'deudas', icon: <Users size={20} />, label: 'Deudas' },
    { to: 'pagos', icon: <Receipt size={20} />, label: 'Pagos' },
    { to: 'adelantos', icon: <Banknote size={20} />, label: 'Adelantos' },
    { to: 'proyectos', icon: <Briefcase size={20} />, label: 'Proyectos' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 flex font-sans">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-300">
          <img src={logoUrl} alt="Woditek Logo" className="h-8 object-contain" />
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-none border-l-4 ${
                  isActive 
                    ? 'bg-slate-100 text-slate-900 border-slate-900' 
                    : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-300">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <LogOut size={20} />
            Salir
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-300 flex items-center px-8">
          <h1 className="text-lg font-semibold text-slate-800 uppercase tracking-wide">Panel de Administración</h1>
        </header>
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
