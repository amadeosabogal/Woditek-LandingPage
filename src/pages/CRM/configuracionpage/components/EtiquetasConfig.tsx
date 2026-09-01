import React, { useState, useEffect } from 'react';
import { settingsService } from '../../../../services/settingsService';

export interface Etiqueta {
  id: string;
  nombre: string;
  color: string;
}

const EtiquetasConfig: React.FC = () => {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('#6e2c00'); // default color

  useEffect(() => {
    loadEtiquetas();
  }, []);

  const loadEtiquetas = async () => {
    try {
      const res = await settingsService.getSettingByName('etiquetas');
      if (res && res.content) {
        setEtiquetas(JSON.parse(res.content));
      } else {
        setEtiquetas([]);
      }
    } catch (e) {
      console.log('No global tags setting found yet');
      setEtiquetas([]);
    }
  };

  const saveEtiquetas = async (newEtiquetas: Etiqueta[]) => {
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await settingsService.upsertSetting('etiquetas', JSON.stringify(newEtiquetas));
      setEtiquetas(newEtiquetas);
      setStatus({ type: 'success', message: 'Etiquetas guardadas exitosamente.' });
      resetForm();
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Error al guardar etiquetas' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (editingId) {
      const updated = etiquetas.map(t => t.id === editingId ? { ...t, nombre, color } : t);
      saveEtiquetas(updated);
    } else {
      const newTag: Etiqueta = {
        id: Date.now().toString(),
        nombre,
        color
      };
      saveEtiquetas([...etiquetas, newTag]);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta etiqueta?')) {
      const updated = etiquetas.filter(t => t.id !== id);
      saveEtiquetas(updated);
    }
  };

  const handleEdit = (tag: Etiqueta) => {
    setEditingId(tag.id);
    setNombre(tag.nombre);
    setColor(tag.color || '#000000');
  };

  const resetForm = () => {
    setEditingId(null);
    setNombre('');
    setColor('#6e2c00');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Formulario */}
      <div className="bg-surface industrial-shadow border border-border-subtle rounded-lg p-6 h-fit">
        <h3 className="font-headline-sm text-headline-sm mb-6 border-b border-border-subtle pb-4">
          {editingId ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
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
            <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase" htmlFor="nombre">Nombre de la Etiqueta</label>
            <input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="block w-full px-3 py-2 bg-surface border border-border-subtle rounded text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none"
              placeholder="Ej. Importante, VIP, Urgente"
            />
          </div>

          <div>
            <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase" htmlFor="color">Color de la Etiqueta</label>
            <div className="flex items-center gap-3">
              <input
                id="color"
                type="color"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-12 p-1 bg-surface border border-border-subtle rounded cursor-pointer"
              />
              <div className="flex-1 px-3 py-2 border border-border-subtle rounded text-body-md font-data-mono bg-surface-muted">
                {color}
              </div>
            </div>
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
              {isLoading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Crear Etiqueta')}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Etiquetas */}
      <div className="bg-surface border border-border-subtle rounded-lg p-6">
        <h3 className="font-headline-sm text-headline-sm mb-6 border-b border-border-subtle pb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">label</span>
          Etiquetas Actuales
        </h3>

        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
          {etiquetas.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant italic">No hay etiquetas registradas.</p>
          ) : (
            etiquetas.map(tag => (
              <div key={tag.id} className="p-3 border border-border-subtle rounded hover:border-primary transition-colors bg-surface-bright flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm border border-black/10" 
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  <span className="font-semibold text-[14px] text-on-surface">{tag.nombre}</span>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(tag)}
                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-muted rounded transition-colors"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
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

export default EtiquetasConfig;
