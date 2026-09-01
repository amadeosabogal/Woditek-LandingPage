import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';

interface TopNavProps {
  setIsMobileMenuOpen: (open: boolean) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  hideSearch?: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ setIsMobileMenuOpen, searchQuery, setSearchQuery, hideSearch }) => {
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case `/crm/captacion-leads`:
        return 'Captación de Leads';
      case `/crm/leads`:
        return 'Lista de Leads';
      case `/crm/bandeja`:
        return 'Bandeja de Mensajes';
      case `/crm/usuarios`:
        return 'Gestión de Usuarios';
      case `/crm/roles`:
        return 'Roles y Permisos';
      case `/crm/configuracion`:
        return 'Configuración General';
      default:
        return 'CRM Woditek';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-300 flex items-center px-4 md:px-8 shrink-0 justify-between">
      <div className="flex items-center">
        <button 
          className="mr-4 md:hidden text-slate-500 hover:text-slate-700"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
        <h1 className="text-base md:text-lg font-semibold text-slate-800 uppercase tracking-wide truncate hidden sm:block">
          {getPageInfo()}
        </h1>
      </div>
      
      {!hideSearch && (
        <div className="relative w-full max-w-md sm:ml-4 flex-1 sm:flex-none">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#3162fa] focus:border-[#3162fa] sm:text-sm transition-colors"
            placeholder="Buscar..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery?.(e.target.value)}
          />
        </div>
      )}
    </header>
  );
};

export default TopNav;
