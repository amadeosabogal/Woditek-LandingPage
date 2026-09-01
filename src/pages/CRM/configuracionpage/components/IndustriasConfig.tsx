import React, { useState, useEffect } from 'react';
import { settingsService } from '../../../../services/settingsService';

export interface Industria {
  id: string;
  nombre: string;
}

const DEFAULT_INDUSTRIAS: Industria[] = [
  { id: '1', nombre: "Minería" },
  { id: '2', nombre: "Petróleo y Gas" },
  { id: '3', nombre: "Tratamiento de Agua" },
  { id: '4', nombre: "Energía" },
  { id: '5', nombre: "Construcción" },
  { id: '6', nombre: "Manufactura" },
  { id: '7', nombre: "Tecnología" },
  { id: '8', nombre: "Agroindustria" },
  { id: '9', nombre: "Servicios" },
  { id: '10', nombre: "Comercio" }
];

const IndustriasConfig: React.FC = () => {
  const [industrias, setIndustrias] = useState<Industria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    loadIndustrias();
  }, []);

  const loadIndustrias = async () => {
    try {
      const res = await settingsService.getSettingByName('industrias');
      if (res && res.content) {
        setIndustrias(JSON.parse(res.content));
      } else {
        // Seed default list if not initialized
        setIndustrias(DEFAULT_INDUSTRIAS);
      }
    } catch (e) {
      console.log('No global industries setting found yet');
      setIndustrias(DEFAULT_INDUSTRIAS);
    }
  };

  const saveIndustrias = async (newIndustrias: Industria[]) => {
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await settingsService.upsertSetting('industrias', JSON.stringify(newIndustrias));
      setIndustrias(newIndustrias);
      setStatus({ type: 'success', message: 'Industrias guardadas exitosamente.' });
      resetForm();
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Error al guardar industrias' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (editingId) {
      const updated = industrias.map(ind => ind.id === editingId ? { ...ind, nombre: nombre.trim() } : ind);
      saveIndustrias(updated);
    } else {
      const newInd: Industria = {
        id: Date.now().toString(),
        nombre: nombre.trim()
      };
      saveIndustrias([...industrias, newInd]);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta industria?')) {
      const updated = industrias.filter(ind => ind.id !== id);
      saveIndustrias(updated);
    }
  };

  const handleEdit = (ind: Industria) => {
    setEditingId(ind.id);
    setNombre(ind.nombre);
  };

  const resetForm = () => {
    setEditingId(null);
    setNombre('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Formulario */}
      <div className="bg-surface industrial-shadow border border-border-subtle rounded-lg p-6 h-fit">
        <h3 className="font-headline-sm text-headline-sm mb-6 border-b border-border-subtle pb-4">
          {editingId ? 'Editar Industria' : 'Nueva Industria'}
        </h3>

        {status.message && (
          <div className={`mb-6 px-4 py-3 rounded relative flex items-center gap-2 ${status.type === 'error' ? 'bg-status-na/10 border border-status-na text-status-na' : 'bg-status-ip/10 border border-status-ip text-status-ip'}`} role="alert">
            <span className="material-symbols-outlined text-[20px]">
              {status.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <span className="block sm:inline font-body-md">{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase" htmlFor="nombre">Nombre de la Industria</label>
            <input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="block w-full px-3 py-2 bg-surface border border-border-subtle rounded text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none"
              placeholder="Ej. Minería, Petróleo y Gas, Energía"
            />
          </div>

          <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-border-subtle text-on-surface-variant font-body-md font-semibold rounded hover:bg-surface-muted transition-all active:scale-[0.98]"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-body-md font-semibold rounded hover:bg-opacity-90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">{editingId ? 'save' : 'add'}</span>
              )}
              {isLoading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Crear Industria')}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Industrias */}
      <div className="bg-surface border border-border-subtle rounded-lg p-6">
        <h3 className="font-headline-sm text-headline-sm mb-6 border-b border-border-subtle pb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">domain</span>
          Industrias Actuales
        </h3>

        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
          {industrias.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant italic">No hay industrias registradas.</p>
          ) : (
            industrias.map(ind => (
              <div key={ind.id} className="p-3 border border-border-subtle rounded hover:border-primary transition-colors bg-surface-bright flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[14px] text-on-surface">{ind.nombre}</span>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(ind)}
                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-muted rounded transition-colors"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(ind.id)}
                    className="p-1.5 text-status-na hover:text-status-hp hover:bg-status-hp/10 rounded transition-colors"
                    title="Eliminar"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default IndustriasConfig;
