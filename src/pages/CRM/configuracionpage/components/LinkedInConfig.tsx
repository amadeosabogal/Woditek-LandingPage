import React, { useState, useEffect } from 'react';
import { useLoader } from '../../../../context/CRM/LoaderContext';

const API_BASE = 'http://127.0.0.1:8000/api';

const LinkedInConfig: React.FC = () => {
  const { showLoader, hideLoader } = useLoader();
  const [sessionData, setSessionData] = useState<any>(null);

  const fetchStatus = async () => {
    try {
      showLoader('Comprobando estado de sesión...');
      const res = await fetch(`${API_BASE}/session/status`);
      const data = await res.json();
      setSessionData(data);
    } catch (err) {
      console.error(err);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleLogin = async () => {
    showLoader('Iniciando sesión manual (revisa la ventana que se abrió)...');
    try {
      await fetch(`${API_BASE}/session/login`, { method: 'POST' });
      await fetchStatus();
    } catch (err) {
      console.error(err);
    } finally {
      hideLoader();
    }
  };

  const isActive = sessionData?.status === 'Activa' || (sessionData?.exists === true && sessionData?.cookies_count > 0);

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-6 shadow-sm max-w-4xl text-on-surface w-full">
      <div className="flex items-center gap-4 mb-6">
        <div className={`px-3 py-1 rounded-full text-[13px] font-bold ${isActive ? 'bg-status-pp/10 text-status-pp border border-status-pp/30' : 'bg-status-na/10 text-status-na border border-status-na/30'}`}>
          {isActive ? 'Activa' : 'Inactiva'}
        </div>
        <h3 className="font-headline-sm text-[20px] font-bold text-on-surface m-0">Gestión de Autenticación de LinkedIn</h3>
      </div>

      <p className="text-on-surface-variant text-[14px] mb-6 leading-relaxed">
        Esta aplicación utiliza las cookies de tu sesión guardadas en <code className="bg-surface-muted px-1.5 py-0.5 rounded text-primary font-mono text-[13px]">linkedin_session.json</code>. Para poder extraer perfiles, publicaciones y empleos sin bloqueos, tu sesión debe estar activa.
      </p>

      <div className="border border-border-subtle rounded-lg bg-surface-lowest p-0 overflow-hidden mb-6">
        <table className="w-full text-left text-[14px]">
          <tbody>
            <tr className="border-b border-border-subtle/50">
              <td className="py-3 px-4 text-on-surface-variant w-1/3">Estado:</td>
              <td className="py-3 px-4 text-on-surface font-bold text-right">
                {isActive ? 'Conectada y lista' : 'Requiere autenticación'}
              </td>
            </tr>
            <tr className="border-b border-border-subtle/50">
              <td className="py-3 px-4 text-on-surface-variant">Ruta del archivo:</td>
              <td className="py-3 px-4 text-on-surface text-right font-mono text-[12px] break-all">
                {sessionData?.path || 'Desconocida'}
              </td>
            </tr>
            <tr className="border-b border-border-subtle/50">
              <td className="py-3 px-4 text-on-surface-variant">Cookies activas:</td>
              <td className="py-3 px-4 text-on-surface text-right font-bold">
                {sessionData?.cookies_count || 0}
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-on-surface-variant">Última actualización:</td>
              <td className="py-3 px-4 text-on-surface text-right font-bold">
                {sessionData?.last_modified || 'Nunca'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={handleLogin}
          className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-2.5 px-5 rounded-lg flex items-center transition-colors shadow-sm"
        >
          Iniciar Sesión en Navegador (1 Clic)
        </button>
        <button 
          onClick={fetchStatus}
          className="bg-transparent border border-border-subtle hover:bg-surface-muted text-on-surface font-semibold py-2.5 px-5 rounded-lg transition-colors"
        >
          Comprobar Estado
        </button>
      </div>
    </div>
  );
};

export default LinkedInConfig;
