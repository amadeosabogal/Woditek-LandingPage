import { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, Mail, Phone, Calendar } from 'lucide-react';
import { io } from 'socket.io-client';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  details: string;
  created_at: string;
}

export const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeads();

    // Configurar WebSocket
    const API_BASE = import.meta.env.VITE_API_ADMIN || 'http://localhost:3001/admin';
    const socketUrl = API_BASE.replace('/admin', '');
    const newSocket = io(socketUrl);

    newSocket.on('connect', () => {
      console.log('Conectado a WebSockets para Leads');
    });

    newSocket.on('newLead', (lead: Lead) => {
      console.log('Nuevo lead recibido en tiempo real:', lead);
      setLeads((prevLeads) => [lead, ...prevLeads]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_ADMIN || 'http://localhost:3001/admin';
      const token = localStorage.getItem('woditek_admin_token') || 'dev-token-bypass';
      const response = await fetch(`${API_BASE}/leads`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      } else {
        console.error('Error fetching leads:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.phone && lead.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Leads Recibidos</h2>
          <p className="text-slate-500 mt-1">Prospectos capturados desde la landing page</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, correo o celular..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter size={18} className="mr-2" />
            Filtros
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Prospecto</th>
                <th scope="col" className="px-6 py-4 font-semibold">Contacto</th>
                <th scope="col" className="px-6 py-4 font-semibold w-1/3">Detalles del Proyecto</th>
                <th scope="col" className="px-6 py-4 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                      Cargando leads...
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <MessageSquare size={48} className="text-slate-300 mb-4" />
                      <p className="text-lg font-medium text-slate-600">No hay leads para mostrar</p>
                      <p className="text-sm">Aún no se han recibido mensajes o la búsqueda no arrojó resultados.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{lead.name}</div>
                      <div className="text-xs text-slate-400 mt-1">ID: #{lead.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-600 mb-1">
                        <Mail size={14} className="mr-2 text-slate-400" />
                        <a href={`mailto:${lead.email}`} className="hover:text-blue-600 hover:underline">{lead.email}</a>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center text-slate-600">
                          <Phone size={14} className="mr-2 text-slate-400" />
                          <a href={`https://wa.me/${lead.phone.replace(/\\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">{lead.phone}</a>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                        {lead.details}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-slate-500">
                        <Calendar size={14} className="mr-2 text-slate-400" />
                        {new Date(lead.created_at).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
