import React from 'react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  {
    title: 'Empresas',
    description: 'Administrar el listado de empresas registradas en el sistema.',
    icon: 'domain',
    path: '/super-admin/empresas',
    colorClass: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Registrar Empresa',
    description: 'Dar de alta una nueva empresa y configurar su entorno inicial.',
    icon: 'add_business',
    path: '/super-admin/empresas/nueva',
    colorClass: 'bg-green-50 text-green-600',
  },
  {
    title: 'Usuarios',
    description: 'Gestión global de usuarios de todas las empresas.',
    icon: 'group',
    path: '/super-admin/usuarios',
    colorClass: 'bg-purple-50 text-purple-600',
  },
  {
    title: 'Roles y Permisos',
    description: 'Administración de roles predeterminados para las empresas.',
    icon: 'shield_person',
    path: '/super-admin/roles',
    colorClass: 'bg-orange-50 text-orange-600',
  },
  {
    title: 'Configuraciones',
    description: 'Ajustes globales y variables de entorno del sistema.',
    icon: 'settings',
    path: '/super-admin/configuracion',
    colorClass: 'bg-slate-100 text-slate-700',
  },
  {
    title: 'Migración de Datos',
    description: 'Copiar configuraciones, roles y plantillas entre empresas.',
    icon: 'move_up',
    path: '/super-admin/migracion',
    colorClass: 'bg-teal-50 text-teal-600',
  },
];

const MenuSA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-8 industrial-pattern">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="glass-panel p-8 rounded-xl border border-border-subtle industrial-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-110"></div>
          <div className="relative flex items-center gap-6">
            <div className="p-4 bg-primary-container rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-4xl text-on-primary-container">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="font-display-lg text-on-background mb-1">Panel de Super Administrador</h1>
              <p className="font-body-md text-outline">
                Centro de control global del sistema. Gestiona empresas, usuarios y configuraciones maestras.
              </p>
            </div>
          </div>
        </div>

        {/* Grid Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <div 
              key={item.title}
              onClick={() => navigate(item.path)}
              className="glass-panel p-6 rounded-xl border border-border-subtle industrial-shadow hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-full"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-4 rounded-xl shadow-sm ${item.colorClass} group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                  </div>
                  <div className="flex-1 mt-1">
                    <h3 className="font-headline-sm text-on-background mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  </div>
                </div>
                <p className="font-body-md text-outline leading-relaxed">
                  {item.description}
                </p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button className="text-primary font-label-caps flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                  GESTIONAR <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MenuSA;
