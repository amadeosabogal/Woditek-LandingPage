import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Plus, Trash2, Briefcase, CheckCircle, Circle } from 'lucide-react';

export const Proyectos = () => {
  const { projects, clients, addProject, updateProject, deleteProject } = useAdmin();
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [paidInitial50, setPaidInitial50] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !name.trim()) return;

    addProject({
      id: Date.now().toString(),
      clientId,
      name: name.trim(),
      paidInitial50,
      paidFinal50: false,
      createdAt: new Date().toLocaleDateString()
    });

    setClientId('');
    setName('');
    setPaidInitial50(false);
  };

  const toggleInitial50 = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      updateProject({ ...project, paidInitial50: !project.paidInitial50 });
    }
  };

  const getClientName = (id: string) => {
    const client = clients.find(c => c.id === id);
    return client ? client.name : 'Cliente Desconocido';
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Gestión de Proyectos</h2>

      <div className="bg-white border border-slate-300 p-6 shadow-sm rounded-none">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cliente Asociado</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full border border-slate-300 p-2.5 text-sm outline-none focus:border-slate-900 rounded-none bg-slate-50"
              required
            >
              <option value="" disabled>Seleccionar cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.document})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Nombre del Proyecto</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 p-2.5 text-sm outline-none focus:border-slate-900 rounded-none bg-slate-50"
              placeholder="Ej: Desarrollo de App Móvil"
              required
            />
          </div>
          <div className="space-y-2 flex items-center h-[42px] mt-6 md:mt-0 px-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={paidInitial50}
                onChange={(e) => setPaidInitial50(e.target.checked)}
                className="w-4 h-4 text-slate-900 bg-slate-100 border-slate-300 rounded focus:ring-slate-900 focus:ring-2"
              />
              <span className="text-sm font-medium text-slate-700">Pago 50% Inicial Completado</span>
            </label>
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
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs w-16 text-center"></th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Proyecto</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Cliente</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Fecha Creación</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-center">50% Inicial</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-light">No hay proyectos registrados.</td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-400 flex justify-center">
                    <Briefcase size={20} />
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-medium">{project.name}</td>
                  <td className="px-6 py-4 text-slate-700">{getClientName(project.clientId)}</td>
                  <td className="px-6 py-4 text-slate-500">{project.createdAt}</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => toggleInitial50(project.id)}
                      className="transition-colors inline-block"
                      title={project.paidInitial50 ? "Marcar como pendiente" : "Marcar como pagado"}
                    >
                      {project.paidInitial50 ? (
                        <CheckCircle size={22} className="text-emerald-600" />
                      ) : (
                        <Circle size={22} className="text-slate-300 hover:text-slate-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteProject(project.id)}
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
