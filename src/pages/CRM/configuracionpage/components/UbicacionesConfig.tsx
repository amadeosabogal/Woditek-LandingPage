import React, { useState, useEffect } from 'react';
import { settingsService } from '../../../../services/settingsService';

export interface Ciudad {
  id: string;
  nombre: string;
}

export interface Departamento {
  id: string;
  nombre: string;
  ciudades: Ciudad[];
}

export interface Pais {
  id: string;
  nombre: string;
  departamentos: Departamento[];
}

const SEED_UBICACIONES: Pais[] = [
  {
    id: "1",
    nombre: "Perú",
    departamentos: [
      {
        id: "1-1",
        nombre: "Piura",
        ciudades: [
          { id: "1-1-1", "nombre": "Talara" },
          { id: "1-1-2", "nombre": "La Brea" },
          { id: "1-1-3", "nombre": "Piura" }
        ]
      },
      {
        id: "1-2",
        nombre: "Lima",
        ciudades: [
          { id: "1-2-1", "nombre": "Lima" }
        ]
      }
    ]
  },
  {
    id: "2",
    nombre: "México",
    departamentos: [
      {
        id: "2-1",
        nombre: "Ciudad de México",
        ciudades: [
          { id: "2-1-1", "nombre": "Ciudad de México" }
        ]
      },
      {
        id: "2-2",
        nombre: "Coahuila",
        ciudades: [
          { id: "2-2-1", "nombre": "Torreón" }
        ]
      },
      {
        id: "2-3",
        nombre: "Zacatecas",
        ciudades: [
          { id: "2-3-1", "nombre": "Fresnillo" }
        ]
      }
    ]
  },
  {
    id: "3",
    nombre: "Canadá",
    departamentos: [
      {
        id: "3-1",
        nombre: "Ontario",
        ciudades: [
          { id: "3-1-1", "nombre": "Toronto" }
        ]
      }
    ]
  },
  {
    id: "4",
    nombre: "USA",
    departamentos: [
      {
        id: "4-1",
        nombre: "Colorado",
        ciudades: [
          { id: "4-1-1", "nombre": "Denver" }
        ]
      }
    ]
  }
];

const UbicacionesConfig: React.FC = () => {
  const [paises, setPaises] = useState<Pais[]>([]);
  const [selectedPaisId, setSelectedPaisId] = useState<string | null>(null);
  const [selectedDepId, setSelectedDepId] = useState<string | null>(null);

  const [status, setStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });

  // Creation & Editing states
  const [newPaisName, setNewPaisName] = useState('');
  const [editingPaisId, setEditingPaisId] = useState<string | null>(null);
  const [editPaisName, setEditPaisName] = useState('');

  const [newDepName, setNewDepName] = useState('');
  const [editingDepId, setEditingDepId] = useState<string | null>(null);
  const [editDepName, setEditDepName] = useState('');

  const [newCityName, setNewCityName] = useState('');
  const [editingCityId, setEditingCityId] = useState<string | null>(null);
  const [editCityName, setEditCityName] = useState('');

  useEffect(() => {
    loadUbicaciones();
  }, []);

  const loadUbicaciones = async () => {
    try {
      const res = await settingsService.getSettingByName('ubicaciones');
      if (res && res.content) {
        setPaises(JSON.parse(res.content));
      } else {
        setPaises(SEED_UBICACIONES);
      }
    } catch (e) {
      console.log('No global locations setting found, seeding defaults');
      setPaises(SEED_UBICACIONES);
    }
  };

  const saveUbicaciones = async (newPaises: Pais[]) => {
    setStatus({ type: '', message: '' });
    try {
      await settingsService.upsertSetting('ubicaciones', JSON.stringify(newPaises));
      setPaises(newPaises);
      setStatus({ type: 'success', message: 'Ubicaciones guardadas exitosamente.' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Error al guardar ubicaciones' });
    }
  };

  // Helper getters
  const selectedPais = paises.find(p => p.id === selectedPaisId);
  const selectedDep = selectedPais?.departamentos.find(d => d.id === selectedDepId);

  // Country actions
  const handleAddPais = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaisName.trim()) return;
    const newPais: Pais = {
      id: Date.now().toString(),
      nombre: newPaisName.trim(),
      departamentos: []
    };
    const updated = [...paises, newPais];
    saveUbicaciones(updated);
    setNewPaisName('');
  };

  const handleEditPais = (id: string, name: string) => {
    const updated = paises.map(p => p.id === id ? { ...p, nombre: name.trim() } : p);
    saveUbicaciones(updated);
    setEditingPaisId(null);
  };

  const handleDeletePais = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este país y todas sus ubicaciones hijas?')) {
      const updated = paises.filter(p => p.id !== id);
      saveUbicaciones(updated);
      if (selectedPaisId === id) {
        setSelectedPaisId(null);
        setSelectedDepId(null);
      }
    }
  };

  // Department actions
  const handleAddDep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaisId || !newDepName.trim()) return;
    const newDep: Departamento = {
      id: `${selectedPaisId}-${Date.now()}`,
      nombre: newDepName.trim(),
      ciudades: []
    };
    const updated = paises.map(p => {
      if (p.id === selectedPaisId) {
        return { ...p, departamentos: [...p.departamentos, newDep] };
      }
      return p;
    });
    saveUbicaciones(updated);
    setNewDepName('');
  };

  const handleEditDep = (id: string, name: string) => {
    if (!selectedPaisId) return;
    const updated = paises.map(p => {
      if (p.id === selectedPaisId) {
        return {
          ...p,
          departamentos: p.departamentos.map(d => d.id === id ? { ...d, nombre: name.trim() } : d)
        };
      }
      return p;
    });
    saveUbicaciones(updated);
    setEditingDepId(null);
  };

  const handleDeleteDep = (id: string) => {
    if (!selectedPaisId) return;
    if (confirm('¿Estás seguro de eliminar este departamento y todas sus ciudades?')) {
      const updated = paises.map(p => {
        if (p.id === selectedPaisId) {
          return {
            ...p,
            departamentos: p.departamentos.filter(d => d.id !== id)
          };
        }
        return p;
      });
      saveUbicaciones(updated);
      if (selectedDepId === id) {
        setSelectedDepId(null);
      }
    }
  };

  // City actions
  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaisId || !selectedDepId || !newCityName.trim()) return;
    const newCity: Ciudad = {
      id: `${selectedDepId}-${Date.now()}`,
      nombre: newCityName.trim()
    };
    const updated = paises.map(p => {
      if (p.id === selectedPaisId) {
        return {
          ...p,
          departamentos: p.departamentos.map(d => {
            if (d.id === selectedDepId) {
              return { ...d, ciudades: [...d.ciudades, newCity] };
            }
            return d;
          })
        };
      }
      return p;
    });
    saveUbicaciones(updated);
    setNewCityName('');
  };

  const handleEditCity = (id: string, name: string) => {
    if (!selectedPaisId || !selectedDepId) return;
    const updated = paises.map(p => {
      if (p.id === selectedPaisId) {
        return {
          ...p,
          departamentos: p.departamentos.map(d => {
            if (d.id === selectedDepId) {
              return {
                ...d,
                ciudades: d.ciudades.map(c => c.id === id ? { ...c, nombre: name.trim() } : c)
              };
            }
            return d;
          })
        };
      }
      return p;
    });
    saveUbicaciones(updated);
    setEditingCityId(null);
  };

  const handleDeleteCity = (id: string) => {
    if (!selectedPaisId || !selectedDepId) return;
    if (confirm('¿Estás seguro de eliminar esta ciudad o distrito?')) {
      const updated = paises.map(p => {
        if (p.id === selectedPaisId) {
          return {
            ...p,
            departamentos: p.departamentos.map(d => {
              if (d.id === selectedDepId) {
                return {
                  ...d,
                  ciudades: d.ciudades.filter(c => c.id !== id)
                };
              }
              return d;
            })
          };
        }
        return p;
      });
      saveUbicaciones(updated);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {status.message && (
        <div className={`px-4 py-3 rounded relative flex items-center gap-2 ${status.type === 'error' ? 'bg-status-na/10 border border-status-na text-status-na' : 'bg-status-ip/10 border border-status-ip text-status-ip'}`} role="alert">
          <span className="material-symbols-outlined text-[20px]">
            {status.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span className="block sm:inline font-body-md">{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Países */}
        <div className="bg-surface border border-border-subtle rounded-lg p-5 flex flex-col min-h-[450px]">
          <h3 className="font-headline-sm text-[16px] mb-4 border-b border-border-subtle pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">flag</span>
            1. Países
          </h3>

          <form onSubmit={handleAddPais} className="flex gap-2 mb-4 shrink-0">
            <input
              type="text"
              required
              value={newPaisName}
              onChange={(e) => setNewPaisName(e.target.value)}
              placeholder="Añadir país..."
              className="flex-1 px-3 py-1.5 bg-surface border border-border-subtle rounded text-body-sm focus:ring-2 focus:ring-primary-container outline-none"
            />
            <button type="submit" className="p-1.5 bg-primary text-white rounded hover:bg-opacity-95 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {paises.map(p => (
              <div
                key={p.id}
                onClick={() => { setSelectedPaisId(p.id); setSelectedDepId(null); }}
                className={`p-2.5 border rounded cursor-pointer transition-colors flex items-center justify-between group ${selectedPaisId === p.id ? 'border-primary bg-primary/5 font-bold text-primary' : 'border-border-subtle bg-surface-bright hover:border-primary/50'}`}
              >
                {editingPaisId === p.id ? (
                  <div className="flex items-center gap-1.5 w-full" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editPaisName}
                      onChange={e => setEditPaisName(e.target.value)}
                      className="flex-1 px-2 py-0.5 border border-primary rounded text-body-sm outline-none bg-surface text-on-surface"
                      autoFocus
                    />
                    <button onClick={() => handleEditPais(p.id, editPaisName)} className="p-1 text-primary hover:bg-primary-container rounded">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </button>
                    <button onClick={() => setEditingPaisId(null)} className="p-1 text-on-surface-variant hover:bg-surface-muted rounded">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="truncate text-body-sm">{p.nombre}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { setEditingPaisId(p.id); setEditPaisName(p.nombre); }}
                        className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-surface-muted"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeletePais(p.id)}
                        className="p-1 text-status-na hover:text-status-hp rounded hover:bg-status-hp/10"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Columna Departamentos */}
        <div className={`bg-surface border border-border-subtle rounded-lg p-5 flex flex-col min-h-[450px] transition-opacity duration-200 ${!selectedPaisId ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="font-headline-sm text-[16px] mb-4 border-b border-border-subtle pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">map</span>
            2. Departamentos
          </h3>

          {selectedPaisId ? (
            <>
              <form onSubmit={handleAddDep} className="flex gap-2 mb-4 shrink-0">
                <input
                  type="text"
                  required
                  value={newDepName}
                  onChange={(e) => setNewDepName(e.target.value)}
                  placeholder={`Añadir departamento en ${selectedPais?.nombre}...`}
                  className="flex-1 px-3 py-1.5 bg-surface border border-border-subtle rounded text-body-sm focus:ring-2 focus:ring-primary-container outline-none"
                />
                <button type="submit" className="p-1.5 bg-primary text-white rounded hover:bg-opacity-95 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </form>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {selectedPais?.departamentos.length === 0 ? (
                  <p className="text-body-xs text-on-surface-variant italic">No hay departamentos agregados.</p>
                ) : (
                  selectedPais?.departamentos.map(d => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDepId(d.id)}
                      className={`p-2.5 border rounded cursor-pointer transition-colors flex items-center justify-between group ${selectedDepId === d.id ? 'border-primary bg-primary/5 font-bold text-primary' : 'border-border-subtle bg-surface-bright hover:border-primary/50'}`}
                    >
                      {editingDepId === d.id ? (
                        <div className="flex items-center gap-1.5 w-full" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editDepName}
                            onChange={e => setEditDepName(e.target.value)}
                            className="flex-1 px-2 py-0.5 border border-primary rounded text-body-sm outline-none bg-surface text-on-surface"
                            autoFocus
                          />
                          <button onClick={() => handleEditDep(d.id, editDepName)} className="p-1 text-primary hover:bg-primary-container rounded">
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          </button>
                          <button onClick={() => setEditingDepId(null)} className="p-1 text-on-surface-variant hover:bg-surface-muted rounded">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="truncate text-body-sm">{d.nombre}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => { setEditingDepId(d.id); setEditDepName(d.nombre); }}
                              className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-surface-muted"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteDep(d.id)}
                              className="p-1 text-status-na hover:text-status-hp rounded hover:bg-status-hp/10"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center border border-dashed border-border-subtle rounded-lg bg-surface-muted/30">
              <p className="text-body-xs text-on-surface-variant italic text-center px-4">Seleccione un país de la lista anterior para gestionar sus departamentos.</p>
            </div>
          )}
        </div>

        {/* Columna Ciudades */}
        <div className={`bg-surface border border-border-subtle rounded-lg p-5 flex flex-col min-h-[450px] transition-opacity duration-200 ${!selectedDepId ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="font-headline-sm text-[16px] mb-4 border-b border-border-subtle pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
            3. Provincias
          </h3>

          {selectedDepId ? (
            <>
              <form onSubmit={handleAddCity} className="flex gap-2 mb-4 shrink-0">
                <input
                  type="text"
                  required
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  placeholder={`Añadir ciudad en ${selectedDep?.nombre}...`}
                  className="flex-1 px-3 py-1.5 bg-surface border border-border-subtle rounded text-body-sm focus:ring-2 focus:ring-primary-container outline-none"
                />
                <button type="submit" className="p-1.5 bg-primary text-white rounded hover:bg-opacity-95 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </form>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {selectedDep?.ciudades.length === 0 ? (
                  <p className="text-body-xs text-on-surface-variant italic">No hay ciudades agregadas.</p>
                ) : (
                  selectedDep?.ciudades.map(c => (
                    <div
                      key={c.id}
                      className="p-2.5 border border-border-subtle bg-surface-bright rounded transition-colors flex items-center justify-between group hover:border-primary/50"
                    >
                      {editingCityId === c.id ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <input
                            type="text"
                            value={editCityName}
                            onChange={e => setEditCityName(e.target.value)}
                            className="flex-1 px-2 py-0.5 border border-primary rounded text-body-sm outline-none bg-surface text-on-surface"
                            autoFocus
                          />
                          <button onClick={() => handleEditCity(c.id, editCityName)} className="p-1 text-primary hover:bg-primary-container rounded">
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          </button>
                          <button onClick={() => setEditingCityId(null)} className="p-1 text-on-surface-variant hover:bg-surface-muted rounded">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="truncate text-body-sm">{c.nombre}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setEditingCityId(c.id); setEditCityName(c.nombre); }}
                              className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-surface-muted"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCity(c.id)}
                              className="p-1 text-status-na hover:text-status-hp rounded hover:bg-status-hp/10"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center border border-dashed border-border-subtle rounded-lg bg-surface-muted/30">
              <p className="text-body-xs text-on-surface-variant italic text-center px-4">Seleccione un departamento de la lista anterior para gestionar sus ciudades.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UbicacionesConfig;
