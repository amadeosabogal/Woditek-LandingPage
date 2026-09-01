import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import EtiquetasConfig from './components/EtiquetasConfig';
import LogoEmpresaConfig from './components/LogoEmpresaConfig';
import IndustriasConfig from './components/IndustriasConfig';
import UbicacionesConfig from './components/UbicacionesConfig';
import LinkedInConfig from './components/LinkedInConfig';

const Configuracion: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [topNavNode, setTopNavNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTopNavNode(document.getElementById('topnav-content-left'));
  }, []);

  const categories = [
    { id: 'general', label: 'General', icon: 'settings', color: 'text-slate-600' },
    { id: 'conexion', label: 'Conexión LinkedIn', icon: 'link', color: 'text-[#3b82f6]' },
    { id: 'etiquetas', label: 'Etiquetas', icon: 'label', color: 'text-amber-500' },
    { id: 'industrias', label: 'Industrias', icon: 'domain', color: 'text-blue-500' },
    { id: 'ubicaciones', label: 'Ubicaciones', icon: 'map', color: 'text-green-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-64px)] pt-6 flex flex-col">
      
      {activeTab === 'home' ? (
        <>
          {topNavNode && createPortal(
            <h2 className="font-headline-md text-headline-md text-on-surface m-0 pl-4 border-l border-border-subtle ml-4">Configuración General</h2>,
            topNavNode
          )}
          <div className="flex flex-wrap gap-8 justify-center sm:justify-start mt-4">
            {categories.map(cat => (
              <div 
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className="flex flex-col items-center gap-3 cursor-pointer group w-24"
              >
                <div className="w-20 h-20 bg-surface rounded-2xl shadow-sm border border-border-subtle flex items-center justify-center group-hover:shadow-md group-hover:-translate-y-1 transition-all">
                  <span className={`material-symbols-outlined text-[40px] ${cat.color}`}>{cat.icon}</span>
                </div>
                <span className="text-[12px] font-semibold text-on-surface text-center leading-tight group-hover:text-primary transition-colors">
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col mt-4">
          {topNavNode && createPortal(
            <div className="flex items-center gap-4 pl-4 border-l border-border-subtle ml-4">
              <button 
                onClick={() => setActiveTab('home')}
                className="w-10 h-10 rounded-full hover:bg-surface-muted flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                title="Volver a Configuración"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
              </button>
              <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-3 m-0">
                <span className="material-symbols-outlined text-primary text-[28px]">{categories.find(c => c.id === activeTab)?.icon}</span>
                {categories.find(c => c.id === activeTab)?.label}
              </h2>
            </div>,
            topNavNode
          )}

          <div className="flex-1">
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 gap-8">
                <LogoEmpresaConfig />
              </div>
            )}

    {activeTab === 'etiquetas' && (
      <EtiquetasConfig />
    )}

    {activeTab === 'industrias' && (
      <IndustriasConfig />
    )}

    {activeTab === 'ubicaciones' && (
      <UbicacionesConfig />
    )}

    {activeTab === 'conexion' && (
      <div className="flex justify-center mt-6">
        <LinkedInConfig />
      </div>
    )}

    {activeTab !== 'general' && activeTab !== 'conexion' && activeTab !== 'etiquetas' && activeTab !== 'industrias' && activeTab !== 'ubicaciones' && (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border-subtle rounded-lg bg-surface-muted/30">
                <span className="material-symbols-outlined text-[48px] text-outline mb-4">construction</span>
                <h2 className="text-[18px] font-bold text-on-surface mb-2">Sección en Construcción</h2>
                <p className="text-on-surface-variant text-[14px]">Esta configuración estará disponible próximamente.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
