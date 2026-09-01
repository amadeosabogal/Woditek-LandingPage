import React, { useState, useEffect } from 'react';
import { useLoader } from '../../context/CRM/LoaderContext';

const API_BASE = 'http://127.0.0.1:8000/api';

const CaptacionLeads: React.FC = () => {
  const { showLoader, hideLoader } = useLoader();
  const [sessionActive, setSessionActive] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tabs State
  const [activeTab, setActiveTab] = useState<'leads' | 'jobs' | 'company' | 'inspect'>('leads');

  // Custom Notification State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000); // Ocultar después de 5 segundos
  };

  // Search States
  const [isSearching, setIsSearching] = useState(false);
  
  const [searchLeadsForm, setSearchLeadsForm] = useState({
    title: 'Gerente de Ventas',
    location: 'Mexico',
    keywords: 'SaaS, CRM',
    require_email: false
  });

  const [searchJobsForm, setSearchJobsForm] = useState({
    keywords: 'Software Engineer',
    location: 'Remote',
    user_skills: 'React, Node, Python',
    remote_only: false
  });

  const [companyForm, setCompanyForm] = useState({
    company_url: '',
    include_posts: true
  });

  const [inspectForm, setInspectForm] = useState({
    url: ''
  });

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/session/status`);
      if (!res.ok) throw new Error('Error al verificar sesión');
      const data = await res.json();
      const isActive = data.status === 'Activa' || (data.exists === true && data.cookies_count > 0);
      setSessionActive(isActive);
    } catch (err: any) {
      console.error(err);
      setError('No se pudo conectar con el servidor de LinkedIn Scraper. Verifica que esté corriendo en el puerto 8000.');
      setSessionActive(false);
    }
  };

  const handleLogin = async () => {
    showLoader('Iniciando sesión en LinkedIn (puede tardar un momento)...');
    try {
      const res = await fetch(`${API_BASE}/session/login`, { method: 'POST' });
      if (!res.ok) throw new Error('Falló el intento de login');
      await checkSession();
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      hideLoader();
    }
  };

  // --- Search Handlers ---
  const handleSearchLeads = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSearching(true);
      showLoader('Iniciando búsqueda de leads...');
      const res = await fetch(`${API_BASE}/search/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchLeadsForm)
      });
      if (!res.ok) throw new Error('Error al iniciar la búsqueda');
      showNotification('Búsqueda iniciada. Ve a "Lista de Leads" para ver los perfiles conforme el scraper los extraiga.');
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setIsSearching(false);
      hideLoader();
    }
  };

  const handleSearchJobs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSearching(true);
      showLoader('Iniciando búsqueda de empleos...');
      const res = await fetch(`${API_BASE}/search/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchJobsForm)
      });
      if (!res.ok) throw new Error('Error al iniciar la búsqueda');
      showNotification('Búsqueda de empleos iniciada. Ve a "Lista de Leads" para ver los resultados.');
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setIsSearching(false);
      hideLoader();
    }
  };

  const handleAnalyzeCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSearching(true);
      showLoader('Analizando empresa...');
      const res = await fetch(`${API_BASE}/company/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm)
      });
      if (!res.ok) throw new Error('Error al analizar la empresa');
      showNotification('Análisis de empresa iniciado. Ve a "Lista de Leads" para ver los resultados.');
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setIsSearching(false);
      hideLoader();
    }
  };

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSearching(true);
      showLoader('Inspeccionando enlace...');
      const res = await fetch(`${API_BASE}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectForm)
      });
      if (!res.ok) throw new Error('Error al inspeccionar el enlace');
      showNotification('Inspección iniciada. Ve a "Lista de Leads" en unos segundos.');
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setIsSearching(false);
      hideLoader();
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md font-headline-md text-primary">Captación de Leads (LinkedIn Scraper)</h1>
          <p className="text-on-surface-variant text-body-sm mt-1">
            Conexión directa con la API de LinkedIn Lead Hunter. Realiza búsquedas y análisis para extraer prospectos hacia tu Lista de Leads.
          </p>
        </div>
      </div>

      {/* Custom Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-lg border flex items-center gap-3 z-50 transition-all duration-300 transform translate-y-0 opacity-100 ${
          notification.type === 'success' 
            ? 'bg-[#10b981] border-[#059669] text-white' 
            : 'bg-[#ef4444] border-[#b91c1c] text-white'
        }`}>
          <span className="material-symbols-outlined text-[24px]">
            {notification.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <div className="flex-1 pr-6">
            <h4 className="font-bold font-headline-sm text-sm mb-0.5">
              {notification.type === 'success' ? 'Éxito' : 'Error'}
            </h4>
            <p className="text-sm opacity-90">{notification.message}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {error && (
        <div className="bg-status-na/10 border border-status-na text-status-na p-4 rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined">error</span>
          <div>
            <h4 className="font-bold">Error de conexión</h4>
            <p className="text-body-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Pestañas de Búsqueda */}
      {sessionActive && (
        <div className="bg-surface border border-border-subtle rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
          {/* Nav Tabs */}
          <div className="flex border-b border-border-subtle bg-surface-muted/30">
            <button 
              className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'leads' ? 'bg-surface text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:bg-surface-muted'}`}
              onClick={() => setActiveTab('leads')}
            >
              Leads & Directores B2B
            </button>
            <button 
              className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'jobs' ? 'bg-surface text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:bg-surface-muted'}`}
              onClick={() => setActiveTab('jobs')}
            >
              Buscador de Empleo
            </button>
            <button 
              className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'company' ? 'bg-surface text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:bg-surface-muted'}`}
              onClick={() => setActiveTab('company')}
            >
              Empresas & Señales
            </button>
            <button 
              className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'inspect' ? 'bg-surface text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:bg-surface-muted'}`}
              onClick={() => setActiveTab('inspect')}
            >
              Inspector de Enlace
            </button>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
            {/* Tab: Leads */}
            {activeTab === 'leads' && (
              <form onSubmit={handleSearchLeads} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mt-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1">Cargo / Rol Objetivo</label>
                  <input 
                    type="text" 
                    value={searchLeadsForm.title}
                    onChange={e => setSearchLeadsForm({...searchLeadsForm, title: e.target.value})}
                    className="w-full bg-surface-muted border border-border-subtle rounded-lg p-3 text-body-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
                    required
                  />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1">Ubicación</label>
                  <input 
                    type="text" 
                    value={searchLeadsForm.location}
                    onChange={e => setSearchLeadsForm({...searchLeadsForm, location: e.target.value})}
                    className="w-full bg-surface-muted border border-border-subtle rounded-lg p-3 text-body-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
                    required
                  />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1">Palabras Clave (Opcional)</label>
                  <input 
                    type="text" 
                    value={searchLeadsForm.keywords}
                    onChange={e => setSearchLeadsForm({...searchLeadsForm, keywords: e.target.value})}
                    className="w-full bg-surface-muted border border-border-subtle rounded-lg p-3 text-body-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
                  />
                </div>
                <div className="md:col-span-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4 border-t border-border-subtle pt-6">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="require_email"
                      checked={searchLeadsForm.require_email}
                      onChange={e => setSearchLeadsForm({...searchLeadsForm, require_email: e.target.checked})}
                      className="w-5 h-5 text-primary bg-surface-muted border-border-subtle rounded focus:ring-primary focus:ring-2 cursor-pointer"
                    />
                    <label htmlFor="require_email" className="text-body-sm text-on-surface font-semibold cursor-pointer">Requerir correo en Info de Contacto</label>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSearching}
                    className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 w-full md:w-auto justify-center"
                  >
                    <span className="material-symbols-outlined">search_insights</span>
                    {isSearching ? 'Iniciando Scraper...' : 'Buscar y Calificar Leads'}
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Jobs */}
            {activeTab === 'jobs' && (
              <form onSubmit={handleSearchJobs} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mt-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1">Cargo / Puesto (Keywords)</label>
                  <input 
                    type="text" 
                    value={searchJobsForm.keywords}
                    onChange={e => setSearchJobsForm({...searchJobsForm, keywords: e.target.value})}
                    className="w-full bg-surface-muted border border-border-subtle rounded-lg p-3 text-body-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
                    required
                  />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1">Ubicación</label>
                  <input 
                    type="text" 
                    value={searchJobsForm.location}
                    onChange={e => setSearchJobsForm({...searchJobsForm, location: e.target.value})}
                    className="w-full bg-surface-muted border border-border-subtle rounded-lg p-3 text-body-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
                    required
                  />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1">Tus Habilidades (User Skills para el Match)</label>
                  <input 
                    type="text" 
                    value={searchJobsForm.user_skills}
                    onChange={e => setSearchJobsForm({...searchJobsForm, user_skills: e.target.value})}
                    placeholder="Ej. React, Node, Python, AWS"
                    className="w-full bg-surface-muted border border-border-subtle rounded-lg p-3 text-body-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
                  />
                </div>
                <div className="md:col-span-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4 border-t border-border-subtle pt-6">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="remote_only"
                      checked={searchJobsForm.remote_only}
                      onChange={e => setSearchJobsForm({...searchJobsForm, remote_only: e.target.checked})}
                      className="w-5 h-5 text-primary bg-surface-muted border-border-subtle rounded focus:ring-primary focus:ring-2 cursor-pointer"
                    />
                    <label htmlFor="remote_only" className="text-body-sm text-on-surface font-semibold cursor-pointer">Solo buscar opciones 100% remotas</label>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSearching}
                    className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 w-full md:w-auto justify-center"
                  >
                    <span className="material-symbols-outlined">work</span>
                    {isSearching ? 'Iniciando Scraper...' : 'Buscar y Hacer Match de Empleos'}
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Company */}
            {activeTab === 'company' && (
              <form onSubmit={handleAnalyzeCompany} className="grid grid-cols-1 gap-6 mt-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1">URL de la Empresa en LinkedIn</label>
                  <input 
                    type="url" 
                    value={companyForm.company_url}
                    onChange={e => setCompanyForm({...companyForm, company_url: e.target.value})}
                    placeholder="https://www.linkedin.com/company/microsoft/"
                    className="w-full bg-surface-muted border border-border-subtle rounded-lg p-3 text-body-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
                    required
                  />
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4 border-t border-border-subtle pt-6">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="include_posts"
                      checked={companyForm.include_posts}
                      onChange={e => setCompanyForm({...companyForm, include_posts: e.target.checked})}
                      className="w-5 h-5 text-primary bg-surface-muted border-border-subtle rounded focus:ring-primary focus:ring-2 cursor-pointer"
                    />
                    <label htmlFor="include_posts" className="text-body-sm text-on-surface font-semibold cursor-pointer">Analizar señales en publicaciones recientes de la empresa</label>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSearching}
                    className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 w-full md:w-auto justify-center"
                  >
                    <span className="material-symbols-outlined">domain</span>
                    {isSearching ? 'Analizando...' : 'Analizar Empresa'}
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Inspect */}
            {activeTab === 'inspect' && (
              <form onSubmit={handleInspect} className="grid grid-cols-1 gap-6 mt-4">
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-1">Inspeccionar cualquier Enlace de LinkedIn</label>
                  <input 
                    type="url" 
                    value={inspectForm.url}
                    onChange={e => setInspectForm({...inspectForm, url: e.target.value})}
                    placeholder="Pega un enlace de un perfil, trabajo o empresa..."
                    className="w-full bg-surface-muted border border-border-subtle rounded-lg p-3 text-body-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
                    required
                  />
                </div>
                <div className="flex justify-end mt-4 border-t border-border-subtle pt-6">
                  <button 
                    type="submit" 
                    disabled={isSearching}
                    className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 w-full md:w-auto justify-center"
                  >
                    <span className="material-symbols-outlined">manage_search</span>
                    {isSearching ? 'Inspeccionando...' : 'Inspeccionar Enlace'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptacionLeads;
