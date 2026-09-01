import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminService } from '../../../services/superAdminService';
import type { Empresa } from '../../../services/superAdminService';
import Button from '../../../components/CRM/ui/Button';

interface SettingItem {
  id?: number;
  name: string;
  content: string;
  empresa_id?: number;
}

const ConfiguracionesSA: React.FC = () => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | null>(null);
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [editableSettings, setEditableSettings] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modal / Form state para nueva configuración
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Cargar empresas
  useEffect(() => {
    superAdminService.getEmpresas().then(data => {
      setEmpresas(data);
      if (data.length > 0) {
        setSelectedEmpresaId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  // Cargar todas las configuraciones de la tabla settings para la empresa seleccionada
  const fetchSettings = async () => {
    if (!selectedEmpresaId) return;
    setIsLoading(true);
    try {
      const data = await superAdminService.getSettingsEmpresa(selectedEmpresaId);
      setSettings(data);
      
      // Inicializar el objeto editable con las claves y valores actuales
      const initialMap: { [key: string]: string } = {};
      data.forEach((item: SettingItem) => {
        initialMap[item.name] = item.content;
      });
      setEditableSettings(initialMap);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [selectedEmpresaId]);

  const handleInputChange = (name: string, value: string) => {
    setEditableSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSetting = async (name: string) => {
    if (!selectedEmpresaId) return;
    const content = editableSettings[name] ?? '';
    setSavingKey(name);
    try {
      await superAdminService.updateSettingsEmpresa(selectedEmpresaId, name, content);
      setSuccessMsg(`Configuración '${name}' guardada correctamente.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchSettings();
    } catch (err: any) {
      alert(err.message || 'Error al guardar la configuración');
    } finally {
      setSavingKey(null);
    }
  };

  const handleCreateNewSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpresaId || !newName.trim()) return;
    setIsAdding(true);
    try {
      await superAdminService.updateSettingsEmpresa(selectedEmpresaId, newName.trim(), newContent);
      setSuccessMsg(`Nueva configuración '${newName.trim()}' agregada exitosamente.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setShowModal(false);
      setNewName('');
      setNewContent('');
      fetchSettings();
    } catch (err: any) {
      alert(err.message || 'Error al crear la configuración');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 industrial-pattern">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/super-admin')}
              className="p-3 bg-surface rounded-xl border border-border-subtle hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <h1 className="font-display-lg text-on-background">Configuraciones de Empresa (Tabla Settings)</h1>
              <p className="font-body-md text-outline">Visualización y gestión dinámica de todos los registros en la tabla `settings` de la empresa seleccionada</p>
            </div>
          </div>

          <Button 
            variant="primary" 
            onClick={() => setShowModal(true)}
            className="gap-2 py-3 px-6 rounded-xl shadow-md"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Agregar Configuración
          </Button>
        </div>

        {/* Company Selector Dropdown */}
        <div className="glass-panel p-6 rounded-2xl border border-border-subtle industrial-shadow flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-3xl">settings_suggest</span>
          <div className="flex-1 md:w-80">
            <label className="block font-label-caps text-xs text-outline uppercase mb-1">Empresa Seleccionada</label>
            <select 
              value={selectedEmpresaId || ''}
              onChange={(e) => setSelectedEmpresaId(Number(e.target.value))}
              className="w-full md:w-96 p-3 rounded-xl bg-surface border border-border-subtle font-body-md text-on-background focus:ring-2 focus:ring-primary outline-none cursor-pointer"
            >
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  Empresa #{emp.id}: {emp.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined">check_circle</span>
            {successMsg}
          </div>
        )}

        {/* Dynamic Settings List */}
        <div className="glass-panel p-8 rounded-2xl border border-border-subtle industrial-shadow space-y-6">
          {isLoading ? (
            <div className="p-12 text-center text-outline flex justify-center items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
              Cargando configuraciones de la empresa...
            </div>
          ) : settings.length === 0 ? (
            <div className="p-12 text-center text-outline space-y-3">
              <span className="material-symbols-outlined text-5xl text-slate-300">settings_off</span>
              <p className="font-headline-sm">Esta empresa no tiene registros de configuración en la tabla `settings`.</p>
              <Button variant="outline" onClick={() => setShowModal(true)}>
                Crear Primera Configuración
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="font-headline-sm text-on-background flex items-center gap-2 pb-2 border-b border-border-subtle">
                <span className="material-symbols-outlined text-primary">tune</span>
                Registros de Configuración (`{settings.length}`)
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {settings.map((item) => {
                  const val = editableSettings[item.name] ?? item.content;
                  const isMultiline = val.length > 80 || val.includes('\n') || val.startsWith('[') || val.startsWith('{');

                  return (
                    <div key={item.name} className="p-6 rounded-xl bg-surface border border-border-subtle space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400">key</span>
                          <span className="font-headline-sm text-primary font-bold">{item.name}</span>
                          {item.id && (
                            <span className="text-xs font-data-mono text-outline px-2 py-0.5 rounded bg-slate-100">
                              ID: #{item.id}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block font-label-caps text-xs text-outline uppercase mb-1">Contenido (Value)</label>
                        {isMultiline ? (
                          <textarea
                            rows={4}
                            value={val}
                            onChange={(e) => handleInputChange(item.name, e.target.value)}
                            className="w-full p-3 rounded-xl bg-background border border-border-subtle font-data-mono text-sm focus:ring-2 focus:ring-primary outline-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => handleInputChange(item.name, e.target.value)}
                            className="w-full p-3 rounded-xl bg-background border border-border-subtle font-body-md focus:ring-2 focus:ring-primary outline-none"
                          />
                        )}
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          variant="primary"
                          isLoading={savingKey === item.name}
                          onClick={() => handleSaveSetting(item.name)}
                          className="gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">save</span>
                          Guardar Registro
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modal Crear Nueva Configuración */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-2xl border border-border-subtle p-6 w-full max-w-lg shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">add_settings</span>
                <h2 className="font-headline-sm text-on-background">Nueva Configuración</h2>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-outline hover:text-on-background p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNewSetting} className="space-y-4">
              <div>
                <label className="block font-label-caps text-outline uppercase mb-2">Clave (Name) *</label>
                <input 
                  type="text" 
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: empresa_logo, etiquetas, industrias..."
                  className="w-full p-3 rounded-xl bg-background border border-border-subtle focus:ring-2 focus:ring-primary outline-none font-data-mono"
                />
              </div>

              <div>
                <label className="block font-label-caps text-outline uppercase mb-2">Valor / Contenido (Content)</label>
                <textarea 
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Valor o texto JSON de la configuración..."
                  className="w-full p-3 rounded-xl bg-background border border-border-subtle focus:ring-2 focus:ring-primary outline-none font-data-mono text-sm"
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
                  isLoading={isAdding}
                  loadingText="Guardando..."
                >
                  Crear Configuración
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracionesSA;
