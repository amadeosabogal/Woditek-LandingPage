import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminService } from '../../../services/superAdminService';
import type { Empresa } from '../../../services/superAdminService';
import Button from '../../../components/CRM/ui/Button';

const EmpresasSA: React.FC<{ initialOpenModal?: boolean }> = ({ initialOpenModal = false }) => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(initialOpenModal);
  const [nombre, setNombre] = useState('');
  const [ruc, setRuc] = useState('');
  const [emailContacto, setEmailContacto] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchEmpresas = async () => {
    setIsLoading(true);
    try {
      const data = await superAdminService.getEmpresas();
      setEmpresas(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las empresas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const handleCreateEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setIsSaving(true);
    try {
      await superAdminService.createEmpresa({
        nombre,
        ruc,
        email_contacto: emailContacto
      });
      setShowModal(false);
      setNombre('');
      setRuc('');
      setEmailContacto('');
      fetchEmpresas();
    } catch (err: any) {
      alert(err.message || 'Error al registrar la empresa');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 industrial-pattern">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/super-admin')}
              className="p-3 bg-surface rounded-xl border border-border-subtle hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <h1 className="font-display-lg text-on-background">Administración de Empresas</h1>
              <p className="font-body-md text-outline">Listado completo de empresas registradas en el CRM</p>
            </div>
          </div>
          
          <Button 
            variant="primary" 
            onClick={() => setShowModal(true)}
            className="gap-2 py-3 px-6 rounded-xl shadow-md"
          >
            <span className="material-symbols-outlined text-xl">add_business</span>
            Registrar Empresa
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {/* Content Table */}
        <div className="glass-panel rounded-2xl border border-border-subtle industrial-shadow overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-outline flex justify-center items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
              Cargando empresas...
            </div>
          ) : empresas.length === 0 ? (
            <div className="p-12 text-center text-outline">
              <span className="material-symbols-outlined text-5xl mb-2 text-slate-300">domain_disabled</span>
              <p className="font-headline-sm">No hay empresas registradas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-border-subtle font-label-caps text-outline uppercase">
                    <th className="py-4 px-6">ID / Código</th>
                    <th className="py-4 px-6">Nombre de Empresa</th>
                    <th className="py-4 px-6">RUC / ID Fiscal</th>
                    <th className="py-4 px-6">Email Contacto</th>
                    <th className="py-4 px-6 text-center">Total Usuarios</th>
                    <th className="py-4 px-6 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle font-body-md text-on-surface">
                  {empresas.map((emp) => (
                    <tr key={emp.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="py-4 px-6 font-data-mono font-bold text-primary">#{emp.id}</td>
                      <td className="py-4 px-6 font-semibold">{emp.nombre}</td>
                      <td className="py-4 px-6 text-outline">{emp.ruc || 'N/A'}</td>
                      <td className="py-4 px-6 text-outline">{emp.email_contacto || 'N/A'}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                          {emp.total_usuarios || 0} usuarios
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span> Activa
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Modal Registrar Empresa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-2xl border border-border-subtle p-6 w-full max-w-lg shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">add_business</span>
                <h2 className="font-headline-sm text-on-background">Nueva Empresa</h2>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-outline hover:text-on-background p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateEmpresa} className="space-y-4">
              <div>
                <label className="block font-label-caps text-outline uppercase mb-2">Nombre de la Empresa *</label>
                <input 
                  type="text" 
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Corp Industrial S.A.C."
                  className="w-full p-3 rounded-xl bg-background border border-border-subtle focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-label-caps text-outline uppercase mb-2">RUC / ID Fiscal</label>
                <input 
                  type="text" 
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value)}
                  placeholder="Ej: 20601234567"
                  className="w-full p-3 rounded-xl bg-background border border-border-subtle focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-label-caps text-outline uppercase mb-2">Email de Contacto</label>
                <input 
                  type="email" 
                  value={emailContacto}
                  onChange={(e) => setEmailContacto(e.target.value)}
                  placeholder="contacto@empresa.com"
                  className="w-full p-3 rounded-xl bg-background border border-border-subtle focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                <Button 
                  variant="ghost" 
                  type="button" 
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  isLoading={isSaving}
                  loadingText="Registrando..."
                >
                  Guardar Empresa
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpresasSA;
