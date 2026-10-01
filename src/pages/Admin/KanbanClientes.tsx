import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Plus, MoreVertical, Calendar, Mail, Phone, Loader2, X, Trash2, Building2, User, DollarSign } from 'lucide-react';

interface Etapa {
  id: number;
  nombre: string;
  identificador: string;
  color: string;
  orden: number;
}

interface Contacto {
  id?: number;
  nombre: string;
  email: string;
  telefono: string;
  es_principal?: boolean;
}

interface Oportunidad {
  id: number;
  id_etapa: number;
  empresa: string;
  monto_estimado: number | null;
  orden_en_columna: number;
  fecha_creacion: string;
  contactos: Contacto[];
}

const API_ADMIN = import.meta.env.VITE_API_ADMIN || 'http://localhost:3000/admin';

export default function KanbanClientes() {
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states para Nueva Oportunidad
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal state para Detalles
  const [selectedOportunidad, setSelectedOportunidad] = useState<Oportunidad | null>(null);

  // Estado para la pestaña activa en versión móvil
  const [activeTab, setActiveTab] = useState<number | null>(null);
  
  const initialFormState = {
    id_etapa: '',
    empresa: '',
    monto_estimado: '',
    contactos: [{ nombre: '', email: '', telefono: '', es_principal: true }]
  };
  
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('woditek_admin_token') || 'dev-token-bypass';
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resEtapas, resOport] = await Promise.all([
        fetch(`${API_ADMIN}/kanban/etapas`, { headers }),
        fetch(`${API_ADMIN}/kanban/oportunidades`, { headers })
      ]);

      if (resEtapas.ok && resOport.ok) {
        const dataEtapas = await resEtapas.json();
        const dataOport = await resOport.json();
        setEtapas(dataEtapas);
        setOportunidades(dataOport);
        if (dataEtapas.length > 0 && activeTab === null) {
          setActiveTab(dataEtapas[0].id);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del kanban:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columnsData: Record<string, Oportunidad[]> = {};
  etapas.forEach(e => {
    columnsData[e.id.toString()] = oportunidades
      .filter(o => o.id_etapa === e.id)
      .sort((a, b) => a.orden_en_columna - b.orden_en_columna);
  });

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceEtapaId = parseInt(source.droppableId);
    const destEtapaId = parseInt(destination.droppableId);
    const draggedOportunidadId = parseInt(draggableId);

    const newOportunidades = Array.from(oportunidades);
    const draggedIndex = newOportunidades.findIndex(o => o.id === draggedOportunidadId);
    
    if (draggedIndex > -1) {
      newOportunidades[draggedIndex].id_etapa = destEtapaId;
      newOportunidades[draggedIndex].orden_en_columna = destination.index;
      setOportunidades(newOportunidades);
    }

    try {
      const token = localStorage.getItem('woditek_admin_token') || 'dev-token-bypass';
      await fetch(`${API_ADMIN}/kanban/oportunidades/${draggedOportunidadId}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_etapa: destEtapaId,
          orden_en_columna: destination.index
        })
      });
    } catch (error) {
      console.error('Error al mover oportunidad', error);
      fetchData();
    }
  };

  const handleCreateOportunidad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_etapa || formData.contactos.length === 0 || !formData.contactos[0].nombre) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('woditek_admin_token') || 'dev-token-bypass';
      const response = await fetch(`${API_ADMIN}/kanban/oportunidades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_etapa: parseInt(formData.id_etapa),
          empresa: formData.empresa,
          monto_estimado: formData.monto_estimado ? parseFloat(formData.monto_estimado) : null,
          contactos: formData.contactos
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData(initialFormState);
        await fetchData();
      }
    } catch (error) {
      console.error('Error al crear oportunidad:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addContacto = () => {
    setFormData({
      ...formData,
      contactos: [...formData.contactos, { nombre: '', email: '', telefono: '', es_principal: false }]
    });
  };

  const removeContacto = (index: number) => {
    const newContactos = formData.contactos.filter((_, i) => i !== index);
    if (newContactos.length > 0 && index === 0) {
      newContactos[0].es_principal = true;
    }
    setFormData({ ...formData, contactos: newContactos });
  };

  const updateContacto = (index: number, field: keyof Contacto, value: string) => {
    const newContactos = [...formData.contactos];
    newContactos[index] = { ...newContactos[index], [field]: value };
    setFormData({ ...formData, contactos: newContactos });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="w-8 h-8 text-[#3162fa] animate-spin" />
        <p className="mt-4 text-slate-500 font-medium">Cargando Kanban...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#f8f9fa] border-none">
      <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kanban de Clientes</h1>
          <p className="text-slate-500">Gestione el seguimiento y estado de sus clientes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#3162fa] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Nueva Oportunidad
        </button>
      </div>

      <div className="flex-1 overflow-x-auto p-4 md:p-6 pb-24 md:pb-6 relative">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col md:flex-row gap-6 h-full md:min-w-max">
            {etapas.map((columna) => (
              <div 
                key={columna.id} 
                className={`flex-col w-full md:w-80 rounded-xl ${columna.color || 'bg-slate-100'} border border-slate-200 ${activeTab === columna.id ? 'flex' : 'hidden md:flex'}`}
              >
                <div className="p-4 border-b border-slate-200/50 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-700">{columna.nombre}</h3>
                  <span className="bg-white text-slate-600 text-xs px-2 py-1 rounded-full shadow-sm font-medium">
                    {columnsData[columna.id.toString()]?.length || 0}
                  </span>
                </div>
                
                <Droppable droppableId={columna.id.toString()}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-4 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200/50 rounded-b-xl' : ''}`}
                    >
                      {columnsData[columna.id.toString()]?.map((oportunidad, index) => {
                        const contactoPrincipal = oportunidad.contactos?.find(c => c.es_principal) || oportunidad.contactos?.[0];
                        return (
                          <Draggable key={oportunidad.id} draggableId={oportunidad.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-3 group hover:border-[#3162fa] transition-all ${
                                  snapshot.isDragging ? 'shadow-lg rotate-2 scale-105 z-50' : ''
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-semibold text-slate-800">
                                    {contactoPrincipal?.nombre || 'Sin Contacto'}
                                  </h4>
                                  <button 
                                    onClick={() => setSelectedOportunidad(oportunidad)}
                                    className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100"
                                    title="Ver Detalles"
                                  >
                                    <MoreVertical size={16} />
                                  </button>
                                </div>
                                <p className="text-sm text-slate-600 mb-3 font-medium flex items-center gap-1">
                                  <Building2 size={14} className="text-slate-400" />
                                  {oportunidad.empresa || 'Empresa No Definida'}
                                </p>
                                
                                <div className="space-y-1">
                                  {contactoPrincipal?.email && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                                      <Mail size={12} className="shrink-0" /> <span className="truncate">{contactoPrincipal.email}</span>
                                    </div>
                                  )}
                                  {contactoPrincipal?.telefono && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                      <Phone size={12} className="shrink-0" /> {contactoPrincipal.telefono}
                                    </div>
                                  )}
                                  {oportunidad.contactos?.length > 1 && (
                                    <div className="text-xs text-[#3162fa] mt-1 font-medium bg-blue-50 px-2 py-0.5 rounded inline-block">
                                      + {oportunidad.contactos.length - 1} contacto(s)
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                                    <Calendar size={12} /> {new Date(oportunidad.fecha_creacion).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 px-4 py-3 flex overflow-x-auto gap-3 snap-x hide-scrollbar">
        {etapas.map((etapa) => (
          <button
            key={etapa.id}
            onClick={() => setActiveTab(etapa.id)}
            className={`snap-center shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === etapa.id 
                ? 'bg-[#3162fa] text-white shadow-md' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {etapa.nombre}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === etapa.id ? 'bg-white/25' : 'bg-white'}`}>
              {columnsData[etapa.id.toString()]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Modal Nueva Oportunidad */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800">Nueva Oportunidad</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="oportunidadForm" onSubmit={handleCreateOportunidad} className="space-y-6">
                
                <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-800 text-sm">Información del Negocio</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Etapa Inicial *</label>
                    <select required value={formData.id_etapa} onChange={e => setFormData({...formData, id_etapa: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3162fa] focus:border-transparent outline-none transition-all bg-white">
                      <option value="" disabled>Seleccione una etapa</option>
                      {etapas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                      <input type="text" value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3162fa] focus:border-transparent outline-none transition-all bg-white" placeholder="Ej: Woditek S.A.C." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Monto Estimado</label>
                      <input type="number" step="0.01" value={formData.monto_estimado} onChange={e => setFormData({...formData, monto_estimado: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3162fa] focus:border-transparent outline-none transition-all bg-white" placeholder="0.00" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 text-sm">Contactos</h3>
                  </div>

                  {formData.contactos.map((contacto, index) => (
                    <div key={index} className="relative bg-white p-4 rounded-lg border border-slate-200 shadow-sm group">
                      {formData.contactos.length > 1 && (
                        <button type="button" onClick={() => removeContacto(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={16} />
                        </button>
                      )}
                      {index === 0 && <span className="absolute top-2 right-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">Principal</span>}
                      
                      <div className="space-y-3 mt-1">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Nombre Completo *</label>
                          <input required type="text" value={contacto.nombre} onChange={e => updateContacto(index, 'nombre', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#3162fa] focus:border-transparent outline-none transition-all" placeholder="Ej: Juan Pérez" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Teléfono</label>
                            <input type="tel" value={contacto.telefono} onChange={e => updateContacto(index, 'telefono', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#3162fa] focus:border-transparent outline-none transition-all" placeholder="999 999 999" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Correo Electrónico</label>
                            <input type="email" value={contacto.email} onChange={e => updateContacto(index, 'email', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#3162fa] focus:border-transparent outline-none transition-all" placeholder="correo@empresa.com" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    type="button" 
                    onClick={addContacto}
                    className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-[#3162fa] hover:border-[#3162fa] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Plus size={16} /> Agregar otro contacto
                  </button>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button type="submit" form="oportunidadForm" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-[#3162fa] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Guardar Oportunidad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalles de Oportunidad */}
      {selectedOportunidad && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800">Detalles de la Oportunidad</h2>
              <button onClick={() => setSelectedOportunidad(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Info General */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Información del Negocio</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-slate-500 mb-1 uppercase font-medium tracking-wider">Empresa</p>
                    <div className="flex items-center gap-2 font-medium text-slate-800">
                      <Building2 size={16} className="text-[#3162fa]" />
                      {selectedOportunidad.empresa || 'No especificada'}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 uppercase font-medium tracking-wider">Monto Estimado</p>
                    <div className="flex items-center gap-2 font-medium text-slate-800">
                      <DollarSign size={16} className="text-emerald-500" />
                      {selectedOportunidad.monto_estimado ? `$ ${selectedOportunidad.monto_estimado.toLocaleString()}` : 'No definido'}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 uppercase font-medium tracking-wider">Etapa Actual</p>
                    <div className="font-medium text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-md inline-block">
                      {etapas.find(e => e.id === selectedOportunidad.id_etapa)?.nombre || 'Desconocida'}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 uppercase font-medium tracking-wider">Fecha de Creación</p>
                    <div className="flex items-center gap-2 font-medium text-slate-800">
                      <Calendar size={16} className="text-slate-400" />
                      {new Date(selectedOportunidad.fecha_creacion).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Contactos */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Contactos Asociados ({selectedOportunidad.contactos?.length || 0})</h3>
                <div className="space-y-3">
                  {selectedOportunidad.contactos?.map((contacto, i) => (
                    <div key={contacto.id || i} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-[#3162fa] transition-colors relative">
                      
                      {contacto.es_principal && (
                        <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                          Principal
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{contacto.nombre}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            {contacto.email && (
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <Mail size={14} className="text-slate-400" /> {contacto.email}
                              </div>
                            )}
                            {contacto.telefono && (
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <Phone size={14} className="text-slate-400" /> {contacto.telefono}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!selectedOportunidad.contactos || selectedOportunidad.contactos.length === 0) && (
                    <p className="text-slate-500 italic">No hay contactos registrados.</p>
                  )}
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end">
              <button 
                onClick={() => setSelectedOportunidad(null)} 
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors"
              >
                Cerrar Detalles
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
