import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Calculator, Download, FileText, CheckCircle, Circle, Trash2, Plus, X, LayoutGrid } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import type { ClientType, Quote, QuoteItem } from '../../context/AdminContext';
import logoUrl from '../../assets/logo_blue.png';

export const Cotizaciones = () => {
  const { 
    clients, addClient, 
    quotes, addQuote, deleteQuote,
    addProject,
    addClientDebt,
    addIncome
  } = useAdmin();

  // Load saved terms from localStorage or default
  const defaultTerms = [
      'El adelanto inicial es del 50% a la aprobación de la cotización',
      '50% al termino del trabajo.',
      'El trabajo cuenta con 1 año de garantía para cubrir posibles bugs (no nuevas funciones)',
      '5 semanas de desarrollo, de las cuales 2 a 3 semanas serían presenciales.',
      'El precio no incluye viáticos, hospedaje ni alimentación durante la implementación presencial',
      'Los costos no incluyen IGV',
      'Cotización válida para 15 días hábiles.'
  ].join('\n');

  const savedTerms = localStorage.getItem('woditek_pdf_terms') || defaultTerms;

  // Quote form state
  const [activeTab, setActiveTab] = useState<'quote' | 'calculator'>('quote');
  const [netAmount, setNetAmount] = useState<number>(0);
  
  const [items, setItems] = useState<QuoteItem[]>([
    { description: '', quantity: 1, unitPrice: 0, currency: 'PEN', exchangeRate: undefined }
  ]);
  const [termsBody, setTermsBody] = useState(savedTerms);
  const [projectDetails, setProjectDetails] = useState(localStorage.getItem('woditek_pdf_details') || '');

  // Client selection / creation state
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientType, setNewClientType] = useState<ClientType>('empresa');
  const [newClientDoc, setNewClientDoc] = useState('');
  const [newClientName, setNewClientName] = useState('');

  // Auto-save terms when changed
  useEffect(() => {
    localStorage.setItem('woditek_pdf_terms', termsBody);
  }, [termsBody]);

  useEffect(() => {
    localStorage.setItem('woditek_pdf_details', projectDetails);
  }, [projectDetails]);

  // Fetch RUC data automatically
  useEffect(() => {
    if ((newClientType === 'empresa' || newClientType === 'persona') && newClientDoc.length === 11) {
      const fetchRuc = async () => {
        try {
                    const res = await fetch(`http://localhost:3001/admin/sunat/${newClientDoc}`, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.razon_social) {
              setNewClientName(data.razon_social);
            }
          }
        } catch (error) {
          console.error("Error fetching RUC data:", error);
        }
      };
      fetchRuc();
    } else if (newClientType === 'dni' && newClientDoc.length === 8) {
      const fetchDni = async () => {
        try {
                    const res = await fetch(`http://localhost:3001/admin/reniec/${newClientDoc}`, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.full_name) {
              setNewClientName(data.full_name);
            } else if (data.first_name) {
              setNewClientName(`${data.first_name} ${data.first_last_name} ${data.second_last_name}`.trim());
            }
          }
        } catch (error) {
          console.error("Error fetching DNI data:", error);
        }
      };
      fetchDni();
    }
  }, [newClientDoc, newClientType]);

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, currency: 'PEN', exchangeRate: undefined }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Cálculos matemáticos
  const subtotal = items.reduce((acc, curr) => {
    const q = curr.quantity || 0;
    const u = curr.unitPrice || 0;
    const tc = curr.currency === 'USD' ? (curr.exchangeRate || 1) : 1;
    return acc + (q * u * tc);
  }, 0);

  const generatePDF = (logoImg: HTMLImageElement | null, clientIdToSave: string, clientInfo: any) => {
    const doc = new jsPDF();
    
    const primaryColor: [number, number, number] = [53, 103, 164];
    const textColor: [number, number, number] = [50, 50, 50];
    
    if (logoImg) {
      const imgRatio = logoImg.width / logoImg.height;
      const targetHeight = 16;
      const targetWidth = targetHeight * imgRatio;
      doc.addImage(logoImg, 'PNG', 14, 15, targetWidth, targetHeight);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.setTextColor(...primaryColor);
      doc.text('woditek', 14, 25);
    }
    
    const rightX = 196;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text('WODITEK DISEÑO Y TECNOLOGÍA S.A.C.', rightX, 15, { align: 'right' });
    doc.text('Calle German Schreiber Nro. 276', rightX, 20, { align: 'right' });
    doc.text('Urb. Santa Ana - San Isidro, Lima, Perú.', rightX, 25, { align: 'right' });
    doc.setTextColor(...primaryColor);
    doc.text('@ soporte@woditek.com', rightX, 35, { align: 'right' });
    doc.text('+51 907 030 003', rightX, 40, { align: 'right' });
    
    doc.setDrawColor(180, 200, 230);
    doc.setLineWidth(0.5);
    doc.line(14, 45, 196, 45);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Cliente', 14, 55);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(clientInfo.name.toUpperCase(), 14, 65);
    doc.text(`DNI/RUC ${clientInfo.document}`, 14, 70);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('COTIZACIÓN', rightX, 55, { align: 'right' });
    
    doc.setFontSize(10);
    const today = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
    doc.text(`Fecha ${today}`, rightX, 65, { align: 'right' });
    
    doc.setDrawColor(180, 200, 230);
    doc.line(14, 75, 196, 75);
    
    const hasUsd = items.some(i => i.currency === 'USD');
    
    const tableBody = items.map(item => {
      const q = item.quantity || 0;
      const u = item.unitPrice || 0; // Lo que ves es lo que se imprime
      const isUsd = item.currency === 'USD';
      const tc = isUsd ? (item.exchangeRate || 1) : 1;
      const itemTotal = q * u * tc;
      
      const formattedUnit = isUsd ? `$${u.toFixed(2)}` : `S/. ${u.toFixed(2)}`;
      
      if (hasUsd) {
        const formattedExRate = isUsd && item.exchangeRate ? item.exchangeRate.toFixed(2) : '';
        return [
          item.description.toUpperCase(),
          q.toString().padStart(2, '0'),
          formattedUnit,
          formattedExRate,
          `S/. ${itemTotal.toFixed(2)}`
        ];
      } else {
        return [
          item.description.toUpperCase(),
          q.toString().padStart(2, '0'),
          formattedUnit,
          `S/. ${itemTotal.toFixed(2)}`
        ];
      }
    });

    const finalBody = [...tableBody];

    autoTable(doc, {
      startY: 75,
      head: hasUsd 
        ? [['Descripción', 'Cantidad', 'Precio Unit.', 'Tipo de Cambio', 'Precio total']]
        : [['Descripción', 'Cantidad', 'Precio Unit.', 'Precio total']],
      body: finalBody,
      foot: hasUsd
        ? [['TOTAL', '', '', '', `S/. ${subtotal.toFixed(2)}`]]
        : [['TOTAL', '', '', `S/. ${subtotal.toFixed(2)}`]],
      theme: 'plain',
      headStyles: {
        textColor: primaryColor,
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'left'
      },
      bodyStyles: {
        textColor: textColor,
        fontSize: 10,
      },
      footStyles: {
        textColor: primaryColor,
        fontStyle: 'bold',
        fontSize: 11,
        halign: 'center'
      },
      columnStyles: hasUsd 
        ? {
            0: { cellWidth: 70, halign: 'left' },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'center' }
          }
        : {
            0: { cellWidth: 80, halign: 'left' },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' }
          },
      didParseCell: (data) => {
        if (data.section === 'head' && data.column.index > 0) {
            data.cell.styles.halign = 'center';
        }
        if (data.section === 'foot' && data.column.index === 0) {
            data.cell.styles.halign = 'left';
        }
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY;
    
    doc.line(14, finalY - 8, 196, finalY - 8);
    doc.line(14, finalY, 196, finalY);
    
    const termsY = finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text('TÉMINOS Y CONDICIONES', 14, termsY);
    
    doc.setFont('helvetica', 'normal');
    const termsArray = termsBody.split('\n').filter((t: string) => t.trim() !== '');
    
    let currentY = termsY + 6;
    termsArray.forEach((term: string) => {
      const splitTerm = doc.splitTextToSize(term, 180);
      doc.text(splitTerm, 14, currentY);
      currentY += splitTerm.length * 5;
    });

    // Calcular posición fija hacia abajo (la página A4 tiene 297mm de alto)
    let sigY = Math.max(currentY + 30, 260);
    if (sigY > 280) {
      doc.addPage();
      sigY = 260;
    }

    doc.setDrawColor(120, 150, 220); // Línea azul clara
    doc.setLineWidth(0.5);
    
    // Firma Izquierda
    doc.line(25, sigY, 95, sigY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('GRACIELLE FABIANA SABOGAL BUITRÓN', 60, sigY + 5, { align: 'center' });
    doc.setTextColor(...primaryColor);
    doc.text('ADMINISTRACIÓN', 60, sigY + 9, { align: 'center' });

    // Firma Derecha
    doc.setDrawColor(120, 150, 220);
    doc.line(115, sigY, 185, sigY);
    doc.setTextColor(100, 100, 100);
    doc.text('AUGUSTO AMADEO SABOGAL BUITRÓN', 150, sigY + 5, { align: 'center' });
    doc.setTextColor(...primaryColor);
    doc.text('INGENIERO DE SISTEMAS', 150, sigY + 9, { align: 'center' });

    // --- Segunda Hoja: Descripción del Trabajo ---
    doc.addPage();
    if (logoImg) {
      const imgRatio = logoImg.width / logoImg.height;
      const targetHeight = 16;
      const targetWidth = targetHeight * imgRatio;
      doc.addImage(logoImg, 'PNG', 14, 15, targetWidth, targetHeight);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.setTextColor(...primaryColor);
      doc.text('woditek', 14, 25);
    }
    
    // Header
    const rightX2 = 196;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.text('WODITEK DISEÑO Y TECNOLOGÍA S.A.C.', rightX2, 19, { align: 'right' });
    doc.text('Calle German Schreiber Nro. 276', rightX2, 24, { align: 'right' });
    doc.text('Urb. Santa Ana - San Isidro, Lima, Perú.', rightX2, 29, { align: 'right' });
    
    doc.setTextColor(...primaryColor);
    doc.text('soporte@woditek.com', rightX2, 39, { align: 'right' });
    doc.text('+51 907 030 003', rightX2, 44, { align: 'right' });

    doc.setDrawColor(180, 200, 230);
    doc.line(14, 49, 196, 49);

    // Title centered
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('DESCRIPCIÓN DEL PROYECTO', 105, 58, { align: 'center' });
    
    // Details text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    
    let detailsY = 72;
    const paragraphs = projectDetails.split('\n');
    paragraphs.forEach((paragraph: string) => {
      if (paragraph.trim() !== '') {
        const lines = doc.splitTextToSize(paragraph, 180);
        doc.text(lines, 14, detailsY, { align: 'justify', maxWidth: 180 });
        detailsY += lines.length * 5 + 4; // Add extra margin between paragraphs
        
        // Handle page overflow within details
        if (detailsY > 280) {
           doc.addPage();
           detailsY = 20;
        }
      }
    });

    doc.save(`Cotizacion_Woditek_${Date.now()}.pdf`);

    addQuote({
      id: Date.now().toString(),
      clientId: clientIdToSave,
      description: items.map(i => i.description).join(' | '),
      baseAmount: subtotal,
      taxPercent: 0,
      paid50Percent: false,
      createdAt: new Date().toLocaleDateString(),
      items: items
    });

    setItems([{ description: '', quantity: 1, unitPrice: 0, currency: 'PEN', exchangeRate: undefined }]);
    setSelectedClientId('');
  };

  const handleExportPDF = () => {
    if (items.some(i => !i.description)) {
      alert('Por favor ingrese la descripción para todos los items.');
      return;
    }
    
    let clientIdToSave = selectedClientId;

    if (isNewClient) {
      if (!newClientDoc || !newClientName) {
        alert('Por favor complete los datos del nuevo cliente.');
        return;
      }
      const reqLength = newClientType === 'empresa' ? 11 : 8;
      if (newClientDoc.length !== reqLength) {
        alert(`El ${newClientType === 'empresa' ? 'RUC' : newClientType === 'dni' ? 'DNI' : 'Documento'} debe tener ${reqLength} dígitos.`);
        return;
      }
      clientIdToSave = Date.now().toString();
      addClient({
        id: clientIdToSave,
        type: newClientType,
        document: newClientDoc,
        name: newClientName,
        createdAt: new Date().toLocaleDateString()
      });
    } else if (!selectedClientId) {
      alert('Por favor seleccione un cliente o registre uno nuevo.');
      return;
    }

    const clientInfo = clients.find(c => c.id === clientIdToSave) || { name: newClientName, document: newClientDoc };

    const img = new Image();
    img.src = logoUrl;
    img.onload = () => generatePDF(img, clientIdToSave, clientInfo);
    img.onerror = () => generatePDF(null, clientIdToSave, clientInfo);
  };

  const handleToggle50 = (quote: Quote) => {
    if (quote.paid50Percent) return;

    if (!window.confirm('¿Confirmar que el cliente pagó el 50% inicial? Esto creará el proyecto y registrará el ingreso.')) {
      return;
    }

    const updatedQuote = { ...quote, paid50Percent: true };
    
    // El monto ya incluye todo según la cotización (WYSIWYG)
    const exactTotal = quote.baseAmount;
    const initial50 = exactTotal / 2;

    const projectId = Date.now().toString();

    // 1. Crear el proyecto
    addProject({
      id: projectId,
      clientId: quote.clientId,
      name: quote.description.split(' | ')[0] || 'Proyecto Web',
      paidInitial50: true,
      paidFinal50: false,
      createdAt: new Date().toLocaleDateString()
    });

    // 2. Registrar el ingreso a Interbank (por defecto)
    addIncome({
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      description: `Adelanto 50% - ${quote.description.split(' | ')[0] || 'Proyecto'}`,
      amount: initial50,
      bank: 'interbank'
    });

    // 3. Crear la deuda en Deudas de Clientes por el 50% restante
    const clientName = clients.find(c => c.id === quote.clientId)?.name || 'Cliente';
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    
    addClientDebt({
      id: Date.now().toString(),
      clientName: clientName,
      paidAdvance50: true,
      paidFinal50: false,
      licenseExpiration: nextYear.toLocaleDateString(),
      projectId: projectId,
      finalAmountWithIgv: initial50
    });

    // Actualizar la cotización
    deleteQuote(quote.id);
    addQuote(updatedQuote);
  };

  const getClientName = (id: string) => {
    const client = clients.find(c => c.id === id);
    return client ? client.name : 'Cliente Eliminado';
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Cotizaciones</h2>

      <div className="flex border-b border-slate-200 mb-8">
        <button 
          onClick={() => setActiveTab('quote')}
          className={`py-3 px-6 font-semibold uppercase tracking-wide text-sm transition-colors ${activeTab === 'quote' ? 'border-b-2 border-[#3162fa] text-[#3162fa]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Generar Cotización
        </button>
        <button 
          onClick={() => setActiveTab('calculator')}
          className={`py-3 px-6 font-semibold uppercase tracking-wide text-sm transition-colors ${activeTab === 'calculator' ? 'border-b-2 border-[#3162fa] text-[#3162fa]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Calculadora de Proyección
        </button>
      </div>

      {activeTab === 'calculator' ? (
        <div className="bg-white border border-slate-300 shadow-sm rounded-none p-8 max-w-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
            <Calculator size={24} className="text-[#3162fa]" />
            <h3 className="text-lg font-semibold text-slate-900 uppercase tracking-wide">Calculadora para Toma de Decisiones</h3>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 block">Monto Líquido Deseado (S/)</label>
              <input 
                type="number" 
                value={netAmount || ''}
                onChange={(e) => setNetAmount(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 p-3 text-lg outline-none focus:border-slate-900 bg-white font-mono"
                placeholder="Ej: 1000"
              />
            </div>
            <div className="bg-slate-50 border border-slate-200 p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-600 uppercase">Líquido:</span>
                <span className="font-mono text-slate-900">S/ {netAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-600 uppercase">+ Renta (2.5%):</span>
                <span className="font-mono text-[#fbbf24]">S/ {(netAmount * 0.025).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-600 uppercase">+ IGV (18%):</span>
                <span className="font-mono text-[#00d1ff]">S/ {(netAmount * 0.18).toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-300">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700 uppercase tracking-wide">Precio Sugerido (SIN IGV):</span>
                  <span className="font-bold text-xl text-slate-700">S/ {(netAmount * 1.025).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-100 p-2 rounded">
                  <span className="font-bold text-slate-900 uppercase tracking-wide">Precio Sugerido (CON IGV):</span>
                  <span className="font-bold text-2xl text-[#3162fa]">S/ {(netAmount * 1.205).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-light mt-4">
              Utiliza uno de estos precios sugeridos copiándolo directamente como el Precio Unitario en la pestaña de Generar Cotización.
            </p>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white border border-slate-300 shadow-sm rounded-none p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-slate-900" />
              <h3 className="text-lg font-semibold text-slate-900 uppercase tracking-wide">Datos del Servicio</h3>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cliente</label>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsNewClient(!isNewClient)}
                    className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-1 transition-colors ${isNewClient ? 'text-red-500 hover:text-red-700' : 'text-[#3162fa] hover:text-[#1a4cd6]'}`}
                  >
                    {isNewClient ? <X size={16} /> : <Plus size={16} />}
                    {isNewClient ? 'Cancelar Registro' : 'Registrar Nuevo Cliente'}
                  </button>
                </div>
              </div>
              
              {!isNewClient ? (
                <select 
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full border border-slate-300 p-3 text-sm outline-none focus:border-slate-900 rounded-none bg-slate-50"
                >
                  <option value="">Seleccione un cliente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.document})</option>
                  ))}
                </select>
              ) : (
                <div className="bg-slate-50 p-4 border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Datos del Nuevo Cliente</h4>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo de Cliente</label>
                    <select
                      value={newClientType}
                      onChange={(e) => setNewClientType(e.target.value as ClientType)}
                      className="w-full border border-slate-300 p-2 text-sm outline-none focus:border-slate-900 rounded-none bg-white"
                    >
                      <option value="empresa">Empresa</option>
                      <option value="persona">Persona Natural</option>
                      <option value="dni">DNI</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {newClientType === 'empresa' ? 'RUC' : newClientType === 'dni' ? 'DNI' : 'Documento'}
                      </label>
                      <input 
                        type="text" 
                        value={newClientDoc}
                        onChange={(e) => setNewClientDoc(e.target.value)}
                        maxLength={newClientType === 'empresa' ? 11 : newClientType === 'dni' ? 8 : 11}
                        className="w-full border border-slate-300 p-2 text-sm outline-none focus:border-slate-900 rounded-none bg-white"
                        placeholder={newClientType === 'empresa' ? 'Ej: 20123456789' : 'Ej: 71234567'}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {newClientType === 'empresa' ? 'Razón Social' : 'Nombre Completo'}
                      </label>
                      <input 
                        type="text" 
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="w-full border border-slate-300 p-2 text-sm outline-none focus:border-slate-900 rounded-none bg-white"
                        placeholder={newClientType === 'empresa' ? 'Ej: Woditek S.A.C.' : 'Ej: Juan Pérez'}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ÍTEMS DE COTIZACIÓN */}
            <div className="pt-4 space-y-4">
              <div className="flex justify-between items-end mb-2 border-b border-slate-200 pb-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block">Detalle de Servicios</label>
              </div>
              
              <div className="space-y-3">
                {items.map((item, index) => {
                  const q = item.quantity || 0;
                  const u = item.unitPrice || 0;
                  const tc = item.currency === 'USD' ? (item.exchangeRate || 1) : 1;
                  const itemTotal = q * u * tc;

                  return (
                    <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-slate-50 p-4 border border-slate-200 relative">
                      {items.length > 1 && (
                        <button 
                          onClick={() => removeItem(index)}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                      
                      <div className="w-full md:w-1/3 space-y-1">
                        {index === 0 && <label className="text-[10px] font-bold text-slate-500 uppercase">Descripción</label>}
                        <input 
                          type="text" 
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full border border-slate-300 p-2 text-xs outline-none focus:border-slate-900 bg-white"
                          placeholder="Software de Gestión"
                        />
                      </div>
                      <div className="w-20 space-y-1">
                        {index === 0 && <label className="text-[10px] font-bold text-slate-500 uppercase">Cantidad</label>}
                        <input 
                          type="number" 
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full border border-slate-300 p-2 text-xs outline-none focus:border-slate-900 bg-white text-center"
                        />
                      </div>
                      <div className="w-24 space-y-1">
                        {index === 0 && <label className="text-[10px] font-bold text-slate-500 uppercase">Precio Unit.</label>}
                        <input 
                          type="number" 
                          value={item.unitPrice === 0 ? '' : item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full border border-slate-300 p-2 text-xs outline-none focus:border-slate-900 bg-white"
                        />
                      </div>
                      
                      <div className="w-24 space-y-1">
                        {index === 0 && <label className="text-[10px] font-bold text-slate-500 uppercase">Moneda</label>}
                        <select 
                          value={item.currency || 'PEN'} 
                          onChange={(e) => handleItemChange(index, 'currency', e.target.value)}
                          className="w-full border border-slate-300 p-2 text-xs outline-none focus:border-slate-900 bg-white"
                        >
                          <option value="PEN">Soles (S/)</option>
                          <option value="USD">Dólares ($)</option>
                        </select>
                      </div>

                      {item.currency === 'USD' && (
                        <div className="w-24 space-y-1">
                          {index === 0 && <label className="text-[10px] font-bold text-slate-500 uppercase">T. Cambio</label>}
                          <input 
                            type="number" 
                            step="0.01"
                            value={item.exchangeRate || ''}
                            onChange={(e) => handleItemChange(index, 'exchangeRate', parseFloat(e.target.value) || undefined)}
                            className="w-full border border-slate-300 p-2 text-xs outline-none focus:border-slate-900 bg-white"
                            placeholder="Ej: 3.75"
                          />
                        </div>
                      )}
                      <div className="w-32 space-y-1">
                        {index === 0 && <label className="text-[10px] font-bold text-slate-500 uppercase">Precio Total</label>}
                        <div className="w-full bg-slate-200 border border-transparent p-2 text-xs font-mono font-bold text-right text-slate-700 h-[34px] flex items-center justify-end">
                          S/ {itemTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={addItem}
                className="text-xs font-semibold text-[#3162fa] hover:text-[#1a4cd6] uppercase tracking-wide flex items-center gap-1 mt-2"
              >
                <LayoutGrid size={16} /> Agregar Descripción
              </button>
            </div>

            <div className="space-y-2 pt-6 border-t border-slate-200">
              <label className="text-xs font-semibold text-[#16a34a] uppercase tracking-wide">Detalle del Trabajo</label>
              <textarea 
                value={projectDetails}
                onChange={(e) => setProjectDetails(e.target.value)}
                className="w-full border border-slate-300 p-3 text-xs outline-none focus:border-slate-900 rounded-none bg-slate-50 min-h-[140px] resize-y"
              />
            </div>

            <div className="space-y-2 pt-6 border-t border-slate-200">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Términos y Condiciones</label>
              <textarea 
                value={termsBody}
                onChange={(e) => setTermsBody(e.target.value)}
                className="w-full border border-slate-300 p-3 text-xs outline-none focus:border-slate-900 rounded-none bg-slate-50 min-h-[140px] resize-y"
              />
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="text-lg font-bold text-slate-900 uppercase tracking-wide text-center md:text-left">
                Monto Total del Documento: S/ {subtotal.toFixed(2)}
              </div>
              <button 
                onClick={handleExportPDF}
                className="w-full md:w-auto bg-[#3162fa] hover:bg-[#1a4cd6] text-white py-3 px-8 font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-3 rounded-none"
              >
                <Download size={18} />
                Generar PDF y Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Historial de Cotizaciones */}
      <div className="bg-white border border-slate-300 shadow-sm rounded-none overflow-hidden mt-8">
        <div className="bg-slate-100 border-b border-slate-300 px-6 py-4 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 uppercase tracking-wide">Historial de Cotizaciones Emitidas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Fecha</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Cliente</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Monto Total</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-center">Pagó 50% Inicial</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-light">No hay cotizaciones registradas.</td>
              </tr>
            ) : (
              [...quotes].reverse().map((quote) => {
                const exactTotal = quote.baseAmount;
                
                return (
                  <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-700">{quote.createdAt}</td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{getClientName(quote.clientId)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">S/ {exactTotal.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggle50(quote)}
                        className={`transition-colors inline-block ${quote.paid50Percent ? 'cursor-default' : 'cursor-pointer'}`}
                        title={quote.paid50Percent ? "50% Pagado (Proyecto y Deuda Creados)" : "Confirmar Pago 50%"}
                      >
                        {quote.paid50Percent ? (
                          <CheckCircle size={22} className="text-emerald-600" />
                        ) : (
                          <Circle size={22} className="text-slate-300 hover:text-[#3162fa]" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => deleteQuote(quote.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Eliminar del historial"
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
