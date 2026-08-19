import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type BankType = 'interbank' | 'banco_nacion';

export interface Income {
  id: string;
  date: string;
  description: string;
  amount: number;
  bank?: BankType;
}

export interface Advance {
  id: string;
  workerName: string;
  totalToPay: number;
  amountGiven: number;
  date: string;
  bank?: BankType;
}

export interface Payment {
  id: string;
  description: string;
  amount: number;
  date: string;
  bank?: BankType;
}

export interface ClientDebt {
  id: string;
  clientName: string;
  paidAdvance50: boolean;
  paidFinal50: boolean;
  licenseExpiration: string;
  projectId?: string;
  finalAmountWithIgv?: number;
}

export type ClientType = 'empresa' | 'persona' | 'dni';

export interface Client {
  id: string;
  type: ClientType;
  document: string;
  name: string;
  createdAt: string;
}

export interface Worker {
  id: string;
  fullName: string;
  dni: string;
  role: string;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  paidInitial50: boolean;
  paidFinal50: boolean;
  createdAt: string;
}

export interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  currency?: 'PEN' | 'USD';
  exchangeRate?: number;
}

export interface Quote {
  id: string;
  clientId: string;
  description: string;
  baseAmount: number;
  taxPercent: number;
  paid50Percent: boolean;
  createdAt: string;
  currency?: 'PEN' | 'USD';
  exchangeRate?: number;
  developmentTime?: string;
  items?: QuoteItem[];
}

interface AdminContextProps {
  incomes: Income[];
  addIncome: (income: Income) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

  advances: Advance[];
  addAdvance: (advance: Advance) => Promise<void>;
  updateAdvance: (advance: Advance) => Promise<void>;
  deleteAdvance: (id: string) => Promise<void>;

  payments: Payment[];
  addPayment: (payment: Payment) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;

  clientDebts: ClientDebt[];
  addClientDebt: (debt: ClientDebt) => Promise<void>;
  updateClientDebt: (debt: ClientDebt) => Promise<void>;
  deleteClientDebt: (id: string) => Promise<void>;

  clients: Client[];
  addClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  workers: Worker[];
  addWorker: (worker: Worker) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;

  projects: Project[];
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  quotes: Quote[];
  addQuote: (quote: Quote) => Promise<void>;
  updateQuote: (quote: Quote) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  
  netMoney: number;
  netInterbank: number;
  netBancoNacion: number;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_ADMIN || 'http://localhost:3001/admin';

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clientDebts, setClientDebts] = useState<ClientDebt[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const apiFetch = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res;
    } catch (error) {
      console.error("API Fetch Error:", error);
      alert("Ocurrió un error al guardar los datos en el servidor. Revisa tu conexión o intenta nuevamente.");
      throw error;
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [
        incRes, advRes, payRes,
        debtRes, cliRes, workRes,
        projRes, quoteRes
      ] = await Promise.all([
        fetch(`${API_BASE}/ingresos`), fetch(`${API_BASE}/adelantos`), fetch(`${API_BASE}/pagos`),
        fetch(`${API_BASE}/deudas`), fetch(`${API_BASE}/clientes`), fetch(`${API_BASE}/trabajadores`),
        fetch(`${API_BASE}/proyectos`), fetch(`${API_BASE}/cotizaciones`)
      ]);
      
      setIncomes(await incRes.json());
      setAdvances(await advRes.json());
      setPayments(await payRes.json());
      setClientDebts(await debtRes.json());
      setClients(await cliRes.json());
      setWorkers(await workRes.json());
      setProjects(await projRes.json());
      setQuotes(await quoteRes.json());
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addIncome = async (income: Income) => {
    await apiFetch(`${API_BASE}/ingresos`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(income) });
    setIncomes(prev => [...prev, income]);
  };
  const deleteIncome = async (id: string) => {
    await apiFetch(`${API_BASE}/ingresos/${id}`, { method: 'DELETE' });
    setIncomes(prev => prev.filter(i => i.id !== id));
  };

  const addAdvance = async (advance: Advance) => {
    await apiFetch(`${API_BASE}/adelantos`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(advance) });
    setAdvances(prev => [...prev, advance]);
  };
  const updateAdvance = async (advance: Advance) => {
    await apiFetch(`${API_BASE}/adelantos/${advance.id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(advance) });
    setAdvances(prev => prev.map(a => a.id === advance.id ? advance : a));
  };
  const deleteAdvance = async (id: string) => {
    await apiFetch(`${API_BASE}/adelantos/${id}`, { method: 'DELETE' });
    setAdvances(prev => prev.filter(a => a.id !== id));
  };

  const addPayment = async (payment: Payment) => {
    await apiFetch(`${API_BASE}/pagos`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payment) });
    setPayments(prev => [...prev, payment]);
  };
  const deletePayment = async (id: string) => {
    await apiFetch(`${API_BASE}/pagos/${id}`, { method: 'DELETE' });
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const addClientDebt = async (debt: ClientDebt) => {
    await apiFetch(`${API_BASE}/deudas`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(debt) });
    setClientDebts(prev => [...prev, debt]);
  };
  const updateClientDebt = async (debt: ClientDebt) => {
    await apiFetch(`${API_BASE}/deudas/${debt.id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(debt) });
    setClientDebts(prev => prev.map(c => c.id === debt.id ? debt : c));
  };
  const deleteClientDebt = async (id: string) => {
    await apiFetch(`${API_BASE}/deudas/${id}`, { method: 'DELETE' });
    setClientDebts(prev => prev.filter(c => c.id !== id));
  };

  const addClient = async (client: Client) => {
    await apiFetch(`${API_BASE}/clientes`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(client) });
    setClients(prev => [...prev, client]);
  };
  const deleteClient = async (id: string) => {
    await apiFetch(`${API_BASE}/clientes/${id}`, { method: 'DELETE' });
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const addWorker = async (worker: Worker) => {
    await apiFetch(`${API_BASE}/trabajadores`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(worker) });
    setWorkers(prev => [...prev, worker]);
  };
  const deleteWorker = async (id: string) => {
    await apiFetch(`${API_BASE}/trabajadores/${id}`, { method: 'DELETE' });
    setWorkers(prev => prev.filter(w => w.id !== id));
  };

  const addProject = async (project: Project) => {
    await apiFetch(`${API_BASE}/proyectos`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(project) });
    setProjects(prev => [...prev, project]);
  };
  const updateProject = async (project: Project) => {
    await apiFetch(`${API_BASE}/proyectos/${project.id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(project) });
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
  };
  const deleteProject = async (id: string) => {
    await apiFetch(`${API_BASE}/proyectos/${id}`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const addQuote = async (quote: Quote) => {
    await apiFetch(`${API_BASE}/cotizaciones`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(quote) });
    setQuotes(prev => [...prev, quote]);
  };
  const updateQuote = async (quote: Quote) => {
    await apiFetch(`${API_BASE}/cotizaciones/${quote.id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(quote) });
    setQuotes(prev => prev.map(q => q.id === quote.id ? quote : q));
  };
  const deleteQuote = async (id: string) => {
    await apiFetch(`${API_BASE}/cotizaciones/${id}`, { method: 'DELETE' });
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalAdvances = advances.reduce((acc, curr) => acc + curr.amountGiven, 0);
  const totalPayments = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const netMoney = totalIncome - totalAdvances - totalPayments;

  const getNetByBank = (bank: BankType) => {
    const inc = incomes.filter(i => (i.bank || 'interbank') === bank).reduce((acc, curr) => acc + curr.amount, 0);
    const adv = advances.filter(a => (a.bank || 'interbank') === bank).reduce((acc, curr) => acc + curr.amountGiven, 0);
    const pay = payments.filter(p => (p.bank || 'interbank') === bank).reduce((acc, curr) => acc + curr.amount, 0);
    return inc - adv - pay;
  };

  const netInterbank = getNetByBank('interbank');
  const netBancoNacion = getNetByBank('banco_nacion');

  return (
    <AdminContext.Provider
      value={{
        incomes, addIncome, deleteIncome,
        advances, addAdvance, updateAdvance, deleteAdvance,
        payments, addPayment, deletePayment,
        clientDebts, addClientDebt, updateClientDebt, deleteClientDebt,
        clients, addClient, deleteClient,
        workers, addWorker, deleteWorker,
        projects, addProject, updateProject, deleteProject,
        quotes, addQuote, updateQuote, deleteQuote,
        netMoney, netInterbank, netBancoNacion,
        isLoading
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
