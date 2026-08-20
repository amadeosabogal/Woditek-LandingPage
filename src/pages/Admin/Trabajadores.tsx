import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Plus, Trash2, HardHat } from 'lucide-react';

export const Trabajadores = () => {
  const { workers, addWorker, deleteWorker } = useAdmin();
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !dni.trim() || dni.length !== 8 || !role.trim()) {
      alert('Por favor complete todos los campos correctamente.');
      return;
    }

    addWorker({
      id: Date.now().toString(),
      fullName: fullName.trim(),
      dni: dni.trim(),
      role: role.trim(),
      createdAt: new Date().toLocaleDateString()
    });

    setFullName('');
    setDni('');
    setRole('');
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Gestión de Trabajadores</h2>

      <div className="bg-white border border-slate-300 p-6 shadow-sm rounded-none">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="space-y-2 flex-grow w-full">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Nombre Completo</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-slate-300 p-2.5 text-sm outline-none focus:border-slate-900 rounded-none bg-slate-50"
              placeholder="Ej: Ana María Torres"
              required
            />
          </div>
          <div className="space-y-2 w-full md:w-48">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">DNI</label>
            <input 
              type="text" 
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              maxLength={8}
              className="w-full border border-slate-300 p-2.5 text-sm outline-none focus:border-slate-900 rounded-none bg-slate-50"
              placeholder="Ej: 71234567"
              required
            />
          </div>
          <div className="space-y-2 w-full md:w-48">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cargo</label>
            <input 
              type="text" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-slate-300 p-2.5 text-sm outline-none focus:border-slate-900 rounded-none bg-slate-50"
              placeholder="Ej: Programador Senior"
              required
            />
          </div>
          <button 
            type="submit"
            className="bg-slate-900 text-white px-6 py-2.5 text-sm font-medium uppercase tracking-wider hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 rounded-none h-[42px] w-full md:w-auto"
          >
            <Plus size={18} />
            Registrar
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-300 shadow-sm rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs w-16 text-center"></th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Nombre del Trabajador</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">DNI</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Cargo</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Fecha de Ingreso</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {workers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-light">No hay trabajadores registrados.</td>
              </tr>
            ) : (
              workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-400 flex justify-center">
                    <HardHat size={20} />
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-medium">{worker.fullName}</td>
                  <td className="px-6 py-4 text-slate-600">{worker.dni || 'No registrado'}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{worker.role || 'No registrado'}</td>
                  <td className="px-6 py-4 text-slate-500">{worker.createdAt}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteWorker(worker.id)}
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
    </div>
  );
};
