import React, { useState, useEffect } from 'react';
import { useLoader } from '../../context/CRM/LoaderContext';
import { Download, MessageCircle, RefreshCw, SearchX, ExternalLink, Trash2, X, Send, LayoutGrid, AlignJustify, UserPlus, Mail } from 'lucide-react';
import EmailComposeModal from '../../components/CRM/modals/EmailComposeModal';

const API_BASE = import.meta.env.VITE_CRM_API || 'http://127.0.0.1:8000/api';

const LeadsList: React.FC = () => {
  const { showLoader, hideLoader } = useLoader();
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<any[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualLeadForm, setManualLeadForm] = useState({ title: '', subtitle: '', phone: '', email: '', notes: '', crm_status: 'Nuevo' });
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');

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
      // Simulate saving to BandejaMensajes
      const selectedData = leads.filter(l => selectedLeads.includes(l.id || l._id));
      const existingChatsStr = localStorage.getItem('whatsapp_simulated_chats');
      const existingChats = existingChatsStr ? JSON.parse(existingChatsStr) : [];
      
      const newChats = selectedData.map(lead => ({
        id: lead.id || lead._id,
        name: lead.title || lead.name || 'Lead',
        unread: 0,
        lastMessage: messageTemplate,
        time: 'Ahora'
      }));
      
      const existingMessagesStr = localStorage.getItem('whatsapp_simulated_messages');
      const existingMessages = existingMessagesStr ? JSON.parse(existingMessagesStr) : {};
      
      newChats.forEach(chat => {
         existingMessages[chat.id] = [
            { id: Date.now() + chat.id, text: messageTemplate, isMe: true, time: 'Ahora' }
         ];
      });
      
      // Prepend the new chats to existing ones
      localStorage.setItem('whatsapp_simulated_chats', JSON.stringify([...newChats, ...existingChats]));
      localStorage.setItem('whatsapp_simulated_messages', JSON.stringify(existingMessages));

      hideLoader();
      alert(`Mensajes enviados exitosamente a ${selectedLeads.length} leads. Puedes verlos en la Bandeja de Mensajes.`);
      setMessageTemplate('');
      setSelectedLeads([]);
    }, 1500);
  };

  const handleExportCSV = () => {
    window.open(`${API_BASE}/export/csv`, '_blank');
  };

  const handleAddManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLeadForm.title.trim()) return;
    try {
      showLoader('Guardando lead manual...');
      const res = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualLeadForm)
      });
      if (res.ok) {
        setShowManualModal(false);
        setManualLeadForm({ title: '', subtitle: '', phone: '', email: '', notes: '', crm_status: 'Nuevo' });
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    } finally {
      hideLoader();
    }
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
            <>
              <button 
                onClick={() => setShowBulkModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-colors shadow-sm text-sm"
              >
                <MessageCircle size={18} />
                Enviar WhatsApp ({selectedLeads.length})
              </button>
              <button 
                onClick={() => {
                  const emails = leads.filter(l => selectedLeads.includes(l.id || l._id) && l.email).map(l => l.email);
                  if(emails.length === 0) {
                     alert("Ningún lead seleccionado tiene correo electrónico.");
                     return;
                  }
                  setTargetEmail(emails.join(', '));
                  setIsEmailModalOpen(true);
                }}
                className="bg-[#3162fa] hover:bg-[#254ece] text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-colors shadow-sm text-sm"
              >
                <Mail size={18} />
                Enviar Correo
              </button>
            </>
          )}
          <button 
            onClick={() => setShowManualModal(true)}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-colors text-sm shadow-sm"
          >
            <UserPlus size={18} />
            Añadir Lead
          </button>
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
            <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button 
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${viewMode === 'table' ? 'bg-white shadow-sm text-[#3162fa]' : 'text-slate-400 hover:text-slate-600'}`}
                title="Vista de Tabla"
              >
                <AlignJustify size={16} />
              </button>
              <button 
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${viewMode === 'cards' ? 'bg-white shadow-sm text-[#3162fa]' : 'text-slate-400 hover:text-slate-600'}`}
                title="Vista de Tarjetas"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button 
              onClick={fetchLeads}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors" 
              title="Actualizar datos"
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
          ) : viewMode === 'cards' ? (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto">
              {leads.map(lead => {
                const leadId = lead.id || lead._id;
                const isSelected = selectedLeads.includes(leadId);
                const score = lead.score || 0;
                let badgeColor = "bg-slate-100 text-slate-600";
                if (score >= 75) badgeColor = "bg-green-100 text-green-700";
                else if (score >= 45) badgeColor = "bg-yellow-100 text-yellow-700";
                else if (score > 0) badgeColor = "bg-orange-100 text-orange-700";

                return (
                  <div key={leadId} className={`relative bg-white border rounded-xl p-4 flex flex-col gap-3 transition-colors ${isSelected ? 'border-[#3162fa] ring-1 ring-[#3162fa]' : 'border-slate-200 hover:border-blue-300'}`}>
                    <div className="absolute top-4 right-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-[#3162fa] focus:ring-[#3162fa] w-4 h-4 cursor-pointer"
                        checked={isSelected}
                        onChange={() => handleSelectOne(leadId)}
                      />
                    </div>
                    
                    <div className="flex justify-between items-start pr-6">
                      <div className="flex-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 mb-2">
                          {lead.item_type || 'lead'}
                        </span>
                        <h4 className="font-bold text-slate-900 leading-tight mb-1">{lead.title || lead.name || 'Sin título'}</h4>
                        <p className="text-xs text-slate-500">{lead.subtitle || lead.company || lead.headline}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2 border-t border-slate-100 pt-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${badgeColor}`}>
                        {score}% Match
                      </span>
                      <div className="flex items-center gap-1">
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
                    </div>

                    <div className="flex flex-col gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          defaultValue={lead.phone || ''}
                          placeholder="☎ Teléfono"
                          onBlur={(e) => {
                            if (e.target.value !== lead.phone) {
                              fetch(`${API_BASE}/leads/${leadId}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ phone: e.target.value })
                              });
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-2 text-xs focus:ring-1 focus:ring-[#3162fa] focus:border-[#3162fa] outline-none text-slate-700 placeholder:text-slate-400"
                        />
                        <input 
                          type="email" 
                          defaultValue={lead.email || ''}
                          placeholder="✉ Correo"
                          onBlur={(e) => {
                            if (e.target.value !== lead.email) {
                              fetch(`${API_BASE}/leads/${leadId}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email: e.target.value })
                              });
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-2 text-xs focus:ring-1 focus:ring-[#3162fa] focus:border-[#3162fa] outline-none text-slate-700 placeholder:text-slate-400"
                        />
                      </div>
                      <select 
                        value={lead.crm_status || lead.status || 'Nuevo'}
                        onChange={(e) => handleStatusChange(leadId, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-2 text-xs font-medium focus:ring-1 focus:ring-[#3162fa] focus:border-[#3162fa] outline-none text-slate-700"
                      >
                        <option value="Nuevo">Nuevo</option>
                        <option value="Contactado">Contactado</option>
                        <option value="En seguimiento">En seguimiento</option>
                        <option value="Interesado">Interesado</option>
                        <option value="Descartado">Descartado</option>
                        <option value="Convertido">Convertido</option>
                      </select>
                      
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
                        className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-2 text-xs focus:ring-1 focus:ring-[#3162fa] focus:border-[#3162fa] outline-none text-slate-700 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                );
              })}
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
                  <th className="py-3 px-4 font-medium min-w-[150px]">Contacto</th>
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
                        <div className="flex flex-col gap-1.5">
                          <input 
                            type="text" 
                            defaultValue={lead.phone || ''}
                            placeholder="Teléfono"
                            onBlur={(e) => {
                              if (e.target.value !== lead.phone) {
                                fetch(`${API_BASE}/leads/${leadId}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ phone: e.target.value })
                                });
                              }
                            }}
                            className="w-full bg-white border border-slate-200 rounded-md py-1 px-2 text-xs focus:ring-1 focus:ring-[#3162fa] focus:border-[#3162fa] outline-none text-slate-700"
                          />
                          <input 
                            type="email" 
                            defaultValue={lead.email || ''}
                            placeholder="Correo"
                            onBlur={(e) => {
                              if (e.target.value !== lead.email) {
                                fetch(`${API_BASE}/leads/${leadId}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ email: e.target.value })
                                });
                              }
                            }}
                            className="w-full bg-white border border-slate-200 rounded-md py-1 px-2 text-xs focus:ring-1 focus:ring-[#3162fa] focus:border-[#3162fa] outline-none text-slate-700"
                          />
                        </div>
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

      {/* Añadir Lead Manual Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-[#3162fa] text-white">
              <h3 className="font-semibold flex items-center gap-2">
                <UserPlus size={18} />
                Añadir Lead Manualmente
              </h3>
              <button onClick={() => setShowManualModal(false)} className="text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddManualLead} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                <input 
                  type="text" 
                  required
                  value={manualLeadForm.title}
                  onChange={e => setManualLeadForm({...manualLeadForm, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#3162fa] focus:border-[#3162fa] outline-none text-slate-700"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Empresa / Cargo</label>
                <input 
                  type="text" 
                  value={manualLeadForm.subtitle}
                  onChange={e => setManualLeadForm({...manualLeadForm, subtitle: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#3162fa] focus:border-[#3162fa] outline-none text-slate-700"
                  placeholder="Ej: Director en ACME Corp"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input 
                    type="text" 
                    value={manualLeadForm.phone}
                    onChange={e => setManualLeadForm({...manualLeadForm, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#3162fa] focus:border-[#3162fa] outline-none text-slate-700"
                    placeholder="Ej: +52 55..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={manualLeadForm.email}
                    onChange={e => setManualLeadForm({...manualLeadForm, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#3162fa] focus:border-[#3162fa] outline-none text-slate-700"
                    placeholder="Ej: juan@acme.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas Adicionales</label>
                <textarea 
                  value={manualLeadForm.notes}
                  onChange={e => setManualLeadForm({...manualLeadForm, notes: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#3162fa] focus:border-[#3162fa] outline-none resize-none min-h-[80px] text-slate-700"
                  placeholder="Información relevante..."
                ></textarea>
              </div>
              <div className="border-t border-slate-200 pt-4 flex justify-end gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 font-medium bg-[#3162fa] hover:bg-[#254ece] text-white rounded-lg transition-colors text-sm"
                >
                  Guardar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <EmailComposeModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
        toEmail={targetEmail} 
      />
    </div>
  );
};

export default LeadsList;
