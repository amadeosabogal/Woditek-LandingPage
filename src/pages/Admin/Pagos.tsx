import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Plus, Trash2 } from 'lucide-react';

import type { BankType } from '../../context/AdminContext';

export const Pagos = () => {
  const { payments, addPayment, deletePayment } = useAdmin();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [bank, setBank] = useState<BankType>('interbank');
  
  const [activeTab, setActiveTab] = useState<BankType>('interbank');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    addPayment({
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      date,
      bank
    });

    setDescription('');
    setAmount('');
    setDate('');
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Registro de Pagos y Egresos</h2>

      <div className="bg-white border border-slate-300 p-6 shadow-sm rounded-none">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cuenta Origen</label>
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value as BankType)}
              className="w-full border border-slate-300 p-2.5 text-sm outline-none focus:border-slate-900 rounded-none bg-slate-50"
            >
              <option value="interbank">Interbank</option>
              <option value="banco_nacion">Banco de la Nación</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Concepto</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 p-2.5 text-sm outline-none focus:border-slate-900 rounded-none bg-slate-50"
              placeholder="Ej. Alquiler de oficina"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Monto (S/)</label>
            <input 
              type="number" 
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-slate-300 p-2.5 text-sm outline-none focus:border-slate-900 rounded-none bg-slate-50"
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Fecha</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-300 p-2.5 text-sm outline-none focus:border-slate-900 rounded-none bg-slate-50"
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

      <div className="flex gap-4 border-b border-slate-300">
        <button
          onClick={() => setActiveTab('interbank')}
          className={`pb-3 px-4 font-semibold tracking-wide uppercase transition-colors text-sm ${
            activeTab === 'interbank' 
              ? 'border-b-2 border-slate-900 text-slate-900' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Interbank
        </button>
        <button
          onClick={() => setActiveTab('banco_nacion')}
          className={`pb-3 px-4 font-semibold tracking-wide uppercase transition-colors text-sm ${
            activeTab === 'banco_nacion' 
              ? 'border-b-2 border-slate-900 text-slate-900' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Banco de la Nación
        </button>
      </div>

      <div className="bg-white border border-slate-300 shadow-sm rounded-none overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Fecha</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Concepto</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Monto</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {payments.filter(p => (p.bank || 'interbank') === activeTab).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-light">No hay pagos registrados en esta cuenta.</td>
              </tr>
            ) : (
              payments.filter(p => (p.bank || 'interbank') === activeTab).map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-700">{payment.date}</td>
                  <td className="px-6 py-4 text-slate-900 font-medium">{payment.description}</td>
                  <td className="px-6 py-4 text-red-700 font-semibold">S/ {payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deletePayment(payment.id)}
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
          <tfoot className="bg-slate-50 border-t border-slate-300">
            <tr>
              <td colSpan={2} className="px-6 py-4 text-right font-bold text-slate-700 uppercase tracking-wider text-xs">Total Gastado:</td>
              <td colSpan={2} className="px-6 py-4 text-red-700 font-bold text-lg">
                S/ {payments.filter(p => (p.bank || 'interbank') === activeTab).reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
