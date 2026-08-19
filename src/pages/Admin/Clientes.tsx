import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import type { ClientType } from '../../context/AdminContext';
import { Plus, Trash2, Building, User } from 'lucide-react';

export const Clientes = () => {
  const { clients, addClient, deleteClient, projects } = useAdmin();
  const [type, setType] = useState<ClientType>('empresa');
  const [document, setDocument] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if ((type === 'empresa' || type === 'persona') && document.length === 11) {
      const fetchRuc = async () => {
        try {
                    const res = await fetch(`http://localhost:3001/admin/sunat/${document}`, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.razon_social) {
              setName(data.razon_social);
            }
          }
        } catch (error) {
          console.error("Error fetching RUC data:", error);
        }
      };
      fetchRuc();
    } else if (type === 'dni' && document.length === 8) {
      const fetchDni = async () => {
        try {
                    const res = await fetch(`http://localhost:3001/admin/reniec/${document}`, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.full_name) {
              setName(data.full_name);
            } else if (data.first_name) {
              setName(`${data.first_name} ${data.first_last_name} ${data.second_last_name}`.trim());
            }
          }
        } catch (error) {
          console.error("Error fetching DNI data:", error);
        }
      };
      fetchDni();
    }
  }, [document, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!document || !name) return;

    const reqLength = type === 'empresa' ? 11 : type === 'dni' ? 8 : 11;
    if ((type === 'empresa' || type === 'dni') && document.length !== reqLength) {
      alert(`El ${type === 'empresa' ? 'RUC' : type === 'dni' ? 'DNI' : 'Documento'} debe tener ${reqLength} dígitos.`);
      return;
    }

    addClient({
      id: Date.now().toString(),
      type,
      document,
      name,
      createdAt: new Date().toLocaleDateString()
    });

    setDocument('');
    setName('');
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Gestión de Clientes</h2>

      <div className="bg-white border border-slate-300 p-6 shadow-sm rounded-none">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tipo de Cliente</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as ClientType);
                setDocument('');
                setName('');
              }}
              className="w-full border border-slate-300 p-2.5 text-sm outline-none focus:border-slate-900 rounded-none bg-slate-50"
            >
              <option value="empresa">Empresa</option>
              <option value="persona">Persona Natural</option>
              <option value="dni">DNI</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              {type === 'empresa' ? 'RUC' : type === 'dni' ? 'DNI' : 'Documento'}
            </label>
            <input 
              type="text" 
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              maxLength={type === 'empresa' ? 11 : type === 'dni' ? 8 : 11}
              className="w-full border border-slate-300 p-2.5 text-sm outline-none focus:border-slate-900 rounded-none bg-slate-50"
              placeholder={type === 'empresa' ? 'Ej: 20123456789' : 'Ej: 71234567'}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              {type === 'empresa' ? 'Razón Social' : 'Nombre Completo'}
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 p-2.5 text-sm outline-none focus:border-slate-900 rounded-none bg-slate-50"
              placeholder={type === 'empresa' ? 'Ej: Woditek S.A.C.' : 'Ej: Juan Pérez'}
              required
            />
          </div>
          <button 
            type="submit"
            className="bg-slate-900 text-white px-4 py-2.5 text-sm font-medium uppercase tracking-wider hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 rounded-none h-[42px]"
          >
            <Plus size={18} />
            Registrar
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-300 shadow-sm rounded-none overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs w-16 text-center">Tipo</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Documento</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Nombre / Razón Social</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Proyectos Finalizados</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Fecha Registro</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-light">No hay clientes registrados.</td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-400 flex justify-center">
                    {client.type === 'empresa' ? <Building size={20} /> : <User size={20} />}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-mono">{client.document}</td>
                  <td className="px-6 py-4 text-slate-900 font-medium">{client.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {projects.filter(p => p.clientId === client.id && p.paidFinal50).length > 0 ? (
                        projects.filter(p => p.clientId === client.id && p.paidFinal50).map(p => (
                          <span key={p.id} className="text-[10px] bg-slate-200 text-slate-800 px-2 py-1 uppercase tracking-wider font-semibold whitespace-nowrap">
                            {p.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Ninguno</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{client.createdAt}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteClient(client.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
