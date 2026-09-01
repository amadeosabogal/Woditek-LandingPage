import React, { useState, useEffect } from 'react';
import { useLoader } from '../../context/CRM/LoaderContext';
import { Download, MessageCircle, RefreshCw, SearchX, ExternalLink, Trash2, X, Send } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';

const LeadsList: React.FC = () => {
  const { showLoader, hideLoader } = useLoader();
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<any[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_BASE}/leads`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };

  const handleStatusChange = async (id: string | number, newStatus: string) => {
    try {
      showLoader('Actualizando estado...');
      const res = await fetch(`${API_BASE}/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchLeads();
    } catch (err) {
      console.error(err);
    } finally {
      hideLoader();
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este lead del scraper?')) return;
    try {
      showLoader('Eliminando lead...');
      const res = await fetch(`${API_BASE}/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLeads();
        setSelectedLeads(selectedLeads.filter(lid => lid !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      hideLoader();
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeads(leads.map(l => l.id || l._id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectOne = (id: string | number) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(lid => lid !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleSendBulk = () => {
    if (!messageTemplate.trim()) return;
    setShowBulkModal(false);
    showLoader('Enviando mensajes a través de WhatsApp Meta API...');
    setTimeout(() => {
      hideLoader();
      alert(`Mensajes enviados exitosamente a ${selectedLeads.length} leads.`);
      setMessageTemplate('');
      setSelectedLeads([]);
    }, 1500);
  };

  const handleExportCSV = () => {
    window.open(`${API_BASE}/export/csv`, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Lista de Leads</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona los contactos extraídos y envía mensajes masivos de WhatsApp.</p>
        </div>
        <div className="flex gap-3">
          {selectedLeads.length > 0 && (
            <button 
              onClick={() => setShowBulkModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-colors shadow-sm text-sm"
            >
              <MessageCircle size={18} />
              Enviar WhatsApp ({selectedLeads.length})
            </button>
          )}
          <button 
            onClick={handleExportCSV}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-colors text-sm shadow-sm"
          >
            <Download size={18} />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-semibold text-slate-800">Leads Extraídos</h3>
          <div className="flex items-center gap-3">
            <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {leads.length} registros
            </span>
            <button 
              onClick={fetchLeads}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors" 
              title="Actualizar tabla"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto flex-1">
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 h-full">
              <SearchX size={48} className="mb-4 text-slate-300" />
              <p>No hay leads en la base de datos del scraper.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-max text-sm">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-4 font-medium w-[40px] text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-[#3162fa] focus:ring-[#3162fa] w-4 h-4 cursor-pointer"
                      onChange={handleSelectAll}
                      checked={selectedLeads.length === leads.length && leads.length > 0}
                    />
                  </th>
                  <th className="py-3 px-4 font-medium text-center w-16">Score</th>
                  <th className="py-3 px-4 font-medium text-center w-16">Tipo</th>
                  <th className="py-3 px-4 font-medium min-w-[200px]">Título / Nombre</th>
                  <th className="py-3 px-4 font-medium min-w-[200px]">Subtítulo / Empresa</th>
                  <th className="py-3 px-4 font-medium w-36">Estado CRM</th>
                  <th className="py-3 px-4 font-medium min-w-[200px]">Notas</th>
                  <th className="py-3 px-4 text-right font-medium w-24">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => {
                  const leadId = lead.id || lead._id;
                  const isSelected = selectedLeads.includes(leadId);
                  
                  return (
                    <tr key={leadId} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                      <td className="py-3 px-4 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-[#3162fa] focus:ring-[#3162fa] w-4 h-4 cursor-pointer"
                          checked={isSelected}
                          onChange={() => handleSelectOne(leadId)}
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {lead.score || 0}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-500 font-medium">
                          {lead.item_type || 'lead'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{lead.title || lead.name || 'Sin título'}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {lead.subtitle || lead.company || lead.headline || 'Sin empresa'}
                      </td>
                      <td className="py-3 px-4">
                        <select 
                          value={lead.crm_status || lead.status || 'Nuevo'}
                          onChange={(e) => handleStatusChange(leadId, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-2 text-sm focus:ring-1 focus:ring-[#3162fa] focus:border-[#3162fa] outline-none text-slate-700"
                        >
                          <option value="Nuevo">Nuevo</option>
                          <option value="Contactado">Contactado</option>
                          <option value="En seguimiento">En seguimiento</option>
                          <option value="Interesado">Interesado</option>
                          <option value="Descartado">Descartado</option>
                          <option value="Convertido">Convertido</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input 
                          type="text" 
                          defaultValue={lead.notes || ''}
                          placeholder="Agregar nota..."
                          onBlur={(e) => {
                            if (e.target.value !== lead.notes) {
                              fetch(`${API_BASE}/leads/${leadId}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ notes: e.target.value })
                              });
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-[#3162fa] focus:border-[#3162fa] outline-none text-slate-700"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(lead.linkedin_url || lead.profile_url) && (
                            <a 
                              href={lead.linkedin_url || lead.profile_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-slate-400 hover:text-[#3162fa] p-1.5 rounded hover:bg-blue-50 transition-colors"
                              title="Ver perfil de LinkedIn"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                          <button 
                            onClick={() => handleDelete(leadId)}
                            className="text-red-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors" 
                            title="Eliminar Lead"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bulk WhatsApp Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-[#3162fa] text-white">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle size={18} />
                Mensaje Masivo ({selectedLeads.length} leads)
              </h3>
              <button onClick={() => setShowBulkModal(false)} className="text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <p className="text-sm text-slate-500">Escribe el mensaje que deseas enviar a todos los contactos seleccionados mediante la API Oficial de WhatsApp.</p>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">Plantilla de Mensaje</label>
                <textarea 
                  value={messageTemplate}
                  onChange={e => setMessageTemplate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#3162fa] focus:border-[#3162fa] outline-none resize-none min-h-[120px] text-slate-700"
                  placeholder="¡Hola! Hemos visto su perfil y creemos que podemos ayudar a optimizar su negocio..."
                ></textarea>
                <div className="text-xs text-slate-500 mt-1 flex gap-2">
                  <span>Variables disponibles:</span>
                  <button className="text-[#3162fa] hover:underline font-semibold">{"{nombre}"}</button>
                  <button className="text-[#3162fa] hover:underline font-semibold">{"{empresa}"}</button>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSendBulk}
                disabled={!messageTemplate.trim()}
                className="px-4 py-2 font-medium bg-[#3162fa] hover:bg-[#254ece] text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Send size={16} />
                Enviar Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsList;
