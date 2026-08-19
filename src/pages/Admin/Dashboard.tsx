
import { useAdmin } from '../../context/AdminContext';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export const Dashboard = () => {
  const { incomes, advances, payments, netInterbank, netBancoNacion, clients, workers, projects } = useAdmin();

  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalAdvances = advances.reduce((acc, curr) => acc + curr.amountGiven, 0);
  const totalPayments = payments.reduce((acc, curr) => acc + curr.amount, 0);

  type BankType = 'interbank' | 'banco_nacion';
  const getIncomeByBank = (bank: BankType) => incomes.filter(i => (i.bank || 'interbank') === bank).reduce((acc, curr) => acc + curr.amount, 0);
  const incomeInterbank = getIncomeByBank('interbank');
  const incomeBancoNacion = getIncomeByBank('banco_nacion');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Resumen de Capital</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Net Money Cards */}
        <div className="bg-slate-900 text-white p-6 border-l-4 border-green-500 rounded-none shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold tracking-wide uppercase text-sm text-slate-300">Saldo Interbank</h3>
          </div>
          <p className="text-3xl font-bold tracking-tight mb-4">
            S/ {netInterbank.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <div className="pt-4 border-t border-slate-700 flex justify-between text-xs text-slate-400">
            <span>Total Recaudado: <strong className="text-white">S/ {incomeInterbank.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong></span>
            <span>Gastos/Adelantos: <strong className="text-white">S/ {(incomeInterbank - netInterbank).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong></span>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 border-l-4 border-red-500 rounded-none shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold tracking-wide uppercase text-sm text-slate-300">Saldo Banco de la Nación</h3>
          </div>
          <p className="text-3xl font-bold tracking-tight mb-4">
            S/ {netBancoNacion.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <div className="pt-4 border-t border-slate-700 flex justify-between text-xs text-slate-400">
            <span>Total Recaudado: <strong className="text-white">S/ {incomeBancoNacion.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong></span>
            <span>Gastos/Adelantos: <strong className="text-white">S/ {(incomeBancoNacion - netBancoNacion).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong></span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Income */}
        <div className="bg-white p-6 border border-slate-300 rounded-none shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <ArrowUpCircle size={18} className="text-green-600" />
            <span className="text-xs font-semibold uppercase tracking-wider">Ingresos Totales</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            S/ {totalIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Total Advances */}
        <div className="bg-white p-6 border border-slate-300 rounded-none shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <ArrowDownCircle size={18} className="text-orange-600" />
            <span className="text-xs font-semibold uppercase tracking-wider">Adelantos Otorgados</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            S/ {totalAdvances.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Total Payments */}
        <div className="bg-white p-6 border border-slate-300 rounded-none shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <ArrowDownCircle size={18} className="text-red-600" />
            <span className="text-xs font-semibold uppercase tracking-wider">Pagos Realizados</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            S/ {totalPayments.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-slate-300 rounded-none shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Clientes</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {clients.length}
          </p>
        </div>

        <div className="bg-white p-6 border border-slate-300 rounded-none shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Trabajadores</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {workers.length}
          </p>
        </div>

        <div className="bg-white p-6 border border-slate-300 rounded-none shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Proyectos Activos</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {projects.length}
          </p>
        </div>
      </div>

      <div className="mt-8 bg-white border border-slate-300 p-8 rounded-none">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 uppercase tracking-wide">Desglose de Capital</h3>
        <p className="text-slate-600 leading-relaxed font-light">
          El <strong>Capital Neto</strong> actual en la empresa se calcula restando todos los <em>Pagos Realizados</em> y los <em>Adelantos Otorgados</em> a los trabajadores, de los <em>Ingresos Totales</em>. Esta cifra refleja el dinero líquido y disponible de la empresa al día de hoy.
        </p>
      </div>
    </div>
  );
};
