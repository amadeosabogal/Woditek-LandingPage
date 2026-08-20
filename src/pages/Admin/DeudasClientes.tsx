import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import type { ClientDebt } from '../../context/AdminContext';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

export const DeudasClientes = () => {
  const { clientDebts, addClientDebt, updateClientDebt, deleteClientDebt, projects, updateProject, addIncome } = useAdmin();
  const [clientName, setClientName] = useState('');
  const [licenseExpiration, setLicenseExpiration] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !licenseExpiration) return;

    addClientDebt({
      id: Date.now().toString(),
      clientName,
      licenseExpiration,
      paidAdvance50: false,
      paidFinal50: false,
    });

    setClientName('');
    setLicenseExpiration('');
  };

  const toggleAdvance = (debt: ClientDebt) => {
    updateClientDebt({ ...debt, paidAdvance50: !debt.paidAdvance50 });
  };

  const toggleFinal = (debt: ClientDebt) => {
    const isNowPaid = !debt.paidFinal50;
    
    if (window.confirm(isNowPaid ? '¿Confirmas el pago del 50% final? Esta deuda desaparecerá de la lista, el proyecto se marcará como finalizado y se registrará un Ingreso.' : '¿Desmarcar pago final?')) {
      
      if (isNowPaid) {
        const defaultAmount = debt.finalAmountWithIgv ? debt.finalAmountWithIgv.toFixed(2) : "0.00";
        const amountStr = window.prompt(`Se registrará el pago en Ingresos. Ingresa el monto final cobrado (con IGV) para ${debt.clientName}:`, defaultAmount);
        if (amountStr !== null) {
          const amount = parseFloat(amountStr);
          if (!isNaN(amount) && amount > 0) {
            const projName = debt.projectId ? (projects.find(p => p.id === debt.projectId)?.name || 'Proyecto') : 'Licencia/Servicio';
            const today = new Date().toLocaleDateString('en-CA');
            
            const bnAmount = Math.round(amount * 0.12);
            const interbankAmount = amount - bnAmount;

            // Banco de la Nación (12%)
            addIncome({
              id: Date.now().toString() + '-fbn',
              date: today,
              description: `Pago Final 50% (BN) - ${projName} (${debt.clientName})`,
              amount: bnAmount,
              bank: 'banco_nacion'
            });

            // Interbank (88%)
            addIncome({
              id: Date.now().toString() + '-fib',
              date: today,
              description: `Pago Final 50% (Interbank) - ${projName} (${debt.clientName})`,
              amount: interbankAmount,
              bank: 'interbank'
            });
          }
        }
      }

      updateClientDebt({ ...debt, paidFinal50: isNowPaid });

      if (debt.projectId) {
        const project = projects.find(p => p.id === debt.projectId);
        if (project) {
          updateProject({ ...project, paidFinal50: isNowPaid });
        }
      }
    }
  };

  const visibleDebts = clientDebts.filter(d => !d.paidFinal50);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Control de Deudas y Licencias</h2>

      <div className="bg-white border border-slate-300 p-6 shadow-sm rounded-none">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cliente / Empresa</label>
            <input 
              type="text" 
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full border border-slate-300 p-2.5 text-sm outline-none focus:border-slate-900 rounded-none bg-slate-50"
              placeholder="Nombre del Cliente"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Vencimiento de Licencia</label>
            <input 
              type="date" 
              value={licenseExpiration}
              onChange={(e) => setLicenseExpiration(e.target.value)}
              className="w-full border border-slate-300 p-2.5 text-sm outline-none focus:border-slate-900 rounded-none bg-slate-50"
              required
            />
          </div>
          <button 
            type="submit"
            className="bg-slate-900 text-white px-4 py-2.5 text-sm font-medium uppercase tracking-wider hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 rounded-none h-[42px]"
          >
            <Plus size={18} />
            Agregar Cliente
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-300 shadow-sm rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Cliente</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-center">Adelanto (50%)</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-center">Pago Final (50%)</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Vencimiento Licencia</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {visibleDebts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-light">No hay deudas pendientes.</td>
              </tr>
            ) : (
              visibleDebts.map((debt) => {
                const today = new Date();
                const expDate = new Date(debt.licenseExpiration);
                const isExpired = expDate < today;
                
                return (
                  <tr key={debt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-900 font-medium">{debt.clientName}</td>
                    
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => toggleAdvance(debt)}
                        className={`inline-flex items-center justify-center transition-colors ${debt.paidAdvance50 ? 'text-green-600' : 'text-slate-300 hover:text-slate-500'}`}
                      >
                        {debt.paidAdvance50 ? <CheckCircle size={22} /> : <Circle size={22} />}
                      </button>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => toggleFinal(debt)}
                        className={`inline-flex items-center justify-center transition-colors ${debt.paidFinal50 ? 'text-green-600' : 'text-slate-300 hover:text-slate-500'}`}
                      >
                        {debt.paidFinal50 ? <CheckCircle size={22} /> : <Circle size={22} />}
                      </button>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${isExpired ? 'text-red-600' : 'text-slate-700'}`}>
                        {debt.licenseExpiration}
                      </span>
                      {isExpired && (
                        <span className="ml-2 text-[10px] bg-red-100 text-red-800 px-2 py-0.5 uppercase tracking-wider font-bold">
                          Vencida
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => deleteClientDebt(debt.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};
