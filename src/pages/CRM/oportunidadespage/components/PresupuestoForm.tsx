import React, { useState, useEffect } from 'react';
import Button from '../../../../components/CRM/ui/Button';
import organizacionService from '../../../../services/organizacionService';

interface PresupuestoFormProps {
  oportunidad: any;
  onDiscard: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any; // For editing an existing presupuesto
}

const PresupuestoForm: React.FC<PresupuestoFormProps> = ({ oportunidad, onDiscard, onSave, initialData }) => {
  const [activeTab, setActiveTab] = useState('lineas');
  const [isSaving, setIsSaving] = useState(false);

  const currentDate = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const [moneda, setMoneda] = useState(initialData?.moneda || 'USD');
  const [fecha, setFecha] = useState(initialData?.fecha || currentDate.split(',')[0]);
  const [fechaVencimiento, setFechaVencimiento] = useState(initialData?.fechaVencimiento || initialData?.validez || '');
  const [validezOferta, setValidezOferta] = useState(initialData?.validezOferta || '15 días');
  const [formaPago, setFormaPago] = useState(initialData?.formaPago || 'CREDITO');
  const [observaciones, setObservaciones] = useState(initialData?.observaciones || 'Lugar de entrega: \nCondición de pago: 15 días');

  const [cliente, setCliente] = useState(initialData?.cliente || oportunidad.name || '');
  const [clienteRuc, setClienteRuc] = useState(initialData?.clienteRuc || '');
  const [clienteDireccion, setClienteDireccion] = useState(initialData?.clienteDireccion || '');
  const [nomContacto, setNomContacto] = useState(initialData?.nomContacto || oportunidad.contactName || '');
  const [emailContacto, setEmailContacto] = useState(initialData?.emailContacto || oportunidad.email || '');
  const [telfContacto, setTelfContacto] = useState(initialData?.telfContacto || oportunidad.phone || '');
  const [telfVendedor, setTelfVendedor] = useState(initialData?.telfVendedor || '');

  useEffect(() => {
    if (oportunidad.organizacion_id && !initialData) {
      organizacionService.getOrganizaciones().then(orgs => {
        const org = orgs.find((o: any) => o.id === oportunidad.organizacion_id);
        if (org && org.perfil) {
          try {
            const perfil = org.perfil;
            if (!clienteRuc) setClienteRuc(perfil.ruc || perfil.documento || '');
            if (!clienteDireccion) setClienteDireccion(perfil.direccion || '');
          } catch (e) { }
        }
      }).catch(console.error);
    }
  }, [oportunidad.organizacion_id, initialData]);
  const [lineas, setLineas] = useState(initialData?.lineas || [{
    id: Date.now().toString(),
    codigo: 'PD00001',
    producto: 'Nuevo Producto',
    cantidad: 1,
    udm: 'KG',
    precio: 0,
    impuesto: 18,
  }]);

  const importeLibre = lineas.reduce((acc: number, line: any) => acc + (line.cantidad * line.precio), 0);
  const importeIva = lineas.reduce((acc: number, line: any) => acc + ((line.cantidad * line.precio) * line.impuesto / 100), 0);
  const total = importeLibre + importeIva;


  const handleSave = async () => {
    setIsSaving(true);
    try {
        const data = {
        id: initialData?.id || Date.now().toString(),
        moneda,
        fecha,
        fechaVencimiento,
        validezOferta,
        formaPago,
        observaciones,
        cliente,
        clienteRuc,
        clienteDireccion,
        nomContacto,
        emailContacto,
        telfContacto,
        telfVendedor,
        lineas,
        importeLibre,
        importeIva,
        total,
      };
      await onSave(data);
    } finally {
      setIsSaving(false);
    }
  };

  const updateLinea = (id: string, field: string, value: any) => {
    setLineas(lineas.map((l: any) => l.id === id ? { ...l, [field]: value } : l));
  };

  const addLinea = () => {
    setLineas([...lineas, {
      id: Date.now().toString(),
      codigo: '',
      producto: 'Nuevo Producto',
      cantidad: 1,
      udm: 'KG',
      precio: 0,
      impuesto: 18,
    }]);
  };

  const removeLinea = (id: string) => {
    setLineas(lineas.filter((l: any) => l.id !== id));
  };

  const tabs = [
    { id: 'lineas', label: 'Líneas del pedido' },
    { id: 'opcionales', label: 'Productos opcionales' },
    { id: 'otra', label: 'Otra Información' },
    { id: 'firma', label: 'Firma del Cliente' },
  ];

  return (
    <div className="absolute inset-0 z-50 bg-background flex flex-col animate-fade-in overflow-y-auto custom-scrollbar">
      {/* Top Header / Breadcrumbs */}
      <div className="bg-surface border-b border-border-subtle sticky top-0 z-10">
        <div className="px-6 py-3 flex items-center gap-2 text-on-surface-variant text-[14px]">
          <span className="font-semibold text-primary cursor-pointer hover:underline">Pipeline</span>
          <span className="text-on-surface-variant">/</span>
          <span className="font-semibold text-primary cursor-pointer hover:underline">{oportunidad.name || 'Posible Venta'}</span>
          <span className="text-on-surface-variant">/</span>
          <span className="text-on-surface">Nuevo Presupuesto</span>
        </div>

        <div className="px-6 py-2 flex items-center gap-3 border-t border-border-subtle bg-surface-bright">
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            loadingText="Guardando..."
            className="!text-[13px] !px-5 !py-1.5 !uppercase !tracking-wide !shadow-sm"
          >
            Guardar
          </Button>
          <button
            onClick={onDiscard}
            className="text-on-surface-variant text-[13px] font-bold px-4 py-1.5 rounded hover:bg-surface-muted transition-colors uppercase tracking-wide"
          >
            Descartar
          </button>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="p-6 max-w-[1200px] mx-auto w-full flex-1 flex flex-col">

        {/* Top Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 mb-6 bg-surface-muted/30 p-4 rounded-lg border border-border-subtle">

          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-3">Datos Generales</h3>
            <div className="flex items-center">
              <label className="w-[40%] text-[11px] font-bold text-on-surface-variant">Moneda</label>
              <div className="w-[60%] border-b border-border-subtle focus-within:border-primary transition-colors flex items-center">
                <select
                  className="w-full bg-transparent outline-none py-0.5 text-[12px] text-on-surface appearance-none cursor-pointer"
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                >
                  <option value="USD">Dólares (US$)</option>
                  <option value="PEN">Soles (S/)</option>
                </select>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant pointer-events-none">arrow_drop_down</span>
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-[40%] text-[11px] font-bold text-on-surface-variant">Forma de pago</label>
              <div className="w-[60%] border-b border-border-subtle focus-within:border-primary transition-colors">
                <input
                  type="text"
                  value={formaPago}
                  onChange={(e) => setFormaPago(e.target.value)}
                  className="w-full bg-transparent outline-none py-0.5 text-[12px] text-on-surface"
                />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-[40%] text-[11px] font-bold text-on-surface-variant">Fecha Emisión</label>
              <div className="w-[60%] border-b border-border-subtle focus-within:border-primary transition-colors">
                <input
                  type="text"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-transparent outline-none py-0.5 text-[12px] text-on-surface"
                />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-[40%] text-[11px] font-bold text-on-surface-variant leading-tight">Fec. Vencimiento</label>
              <div className="w-[60%] border-b border-border-subtle focus-within:border-primary transition-colors">
                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  className="w-full bg-transparent outline-none py-0.5 text-[12px] text-on-surface cursor-pointer"
                />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-[40%] text-[11px] font-bold text-on-surface-variant leading-tight">Validez (Texto)</label>
              <div className="w-[60%] border-b border-border-subtle focus-within:border-primary transition-colors">
                <input
                  type="text"
                  value={validezOferta}
                  onChange={(e) => setValidezOferta(e.target.value)}
                  className="w-full bg-transparent outline-none py-0.5 text-[12px] text-on-surface"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-3">Empresa / Cliente</h3>
            <div className="flex items-center">
              <label className="w-[30%] text-[11px] font-bold text-on-surface-variant">Cliente</label>
              <div className="w-[70%] border-b border-border-subtle focus-within:border-primary transition-colors">
                <input
                  type="text"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full bg-transparent outline-none py-0.5 text-[12px] text-on-surface font-semibold"
                />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-[30%] text-[11px] font-bold text-on-surface-variant">RUC</label>
              <div className="w-[70%] border-b border-border-subtle focus-within:border-primary transition-colors">
                <input
                  type="text"
                  value={clienteRuc}
                  onChange={(e) => setClienteRuc(e.target.value)}
                  className="w-full bg-transparent outline-none py-0.5 text-[12px] text-on-surface"
                />
              </div>
            </div>
            <div className="flex items-start">
              <label className="w-[30%] text-[11px] font-bold text-on-surface-variant pt-1">Dirección</label>
              <div className="w-[70%] border-b border-border-subtle focus-within:border-primary transition-colors">
                <textarea
                  value={clienteDireccion}
                  onChange={(e) => setClienteDireccion(e.target.value)}
                  className="w-full bg-transparent outline-none py-0.5 text-[12px] text-on-surface resize-none h-[40px] custom-scrollbar"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-3">Contacto</h3>
            <div className="flex items-center">
              <label className="w-[30%] text-[11px] font-bold text-on-surface-variant">Nombre</label>
              <div className="w-[70%] border-b border-border-subtle focus-within:border-primary transition-colors">
                <input
                  type="text"
                  value={nomContacto}
                  onChange={(e) => setNomContacto(e.target.value)}
                  className="w-full bg-transparent outline-none py-0.5 text-[12px] text-on-surface"
                />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-[30%] text-[11px] font-bold text-on-surface-variant">Teléfono</label>
              <div className="w-[70%] border-b border-border-subtle focus-within:border-primary transition-colors">
                <input
                  type="text"
                  value={telfContacto}
                  onChange={(e) => setTelfContacto(e.target.value)}
                  className="w-full bg-transparent outline-none py-0.5 text-[12px] text-on-surface"
                />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-[30%] text-[11px] font-bold text-on-surface-variant">Email</label>
              <div className="w-[70%] border-b border-border-subtle focus-within:border-primary transition-colors">
                <input
                  type="text"
                  value={emailContacto}
                  onChange={(e) => setEmailContacto(e.target.value)}
                  className="w-full bg-transparent outline-none py-0.5 text-[12px] text-on-surface"
                />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <label className="w-[30%] text-[11px] font-bold text-primary">Teléf. Vendedor</label>
              <div className="w-[70%] border-b border-border-subtle focus-within:border-primary transition-colors">
                <input
                  type="text"
                  value={telfVendedor}
                  onChange={(e) => setTelfVendedor(e.target.value)}
                  className="w-full bg-transparent outline-none py-0.5 text-[12px] text-on-surface font-semibold text-primary"
                  placeholder="Opcional"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="flex border-b border-border-subtle mb-4 overflow-x-auto custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-[14px] font-semibold whitespace-nowrap transition-colors border-t border-l border-r rounded-t-sm -mb-px ${activeTab === tab.id
                ? 'bg-surface text-on-surface border-border-subtle'
                : 'bg-transparent text-on-surface-variant border-transparent hover:text-on-surface'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'lineas' && (
            <div className="flex-1 flex flex-col">
              <div className="overflow-x-auto border-b border-border-subtle pb-4 mb-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="font-bold text-[13px] text-on-surface py-2 px-2 w-32">CÓDIGO</th>
                      <th className="font-bold text-[13px] text-on-surface py-2 px-2 min-w-[200px]">DESCRIPCIÓN</th>
                      <th className="font-bold text-[13px] text-on-surface py-2 px-2 text-right w-24">CANT.</th>
                      <th className="font-bold text-[13px] text-on-surface py-2 px-2 w-24">U.M.</th>
                      <th className="font-bold text-[13px] text-on-surface py-2 px-2 text-right w-32">V. UNIT.</th>
                      <th className="font-bold text-[13px] text-on-surface py-2 px-2 w-40">I.G.V.</th>
                      <th className="font-bold text-[13px] text-on-surface py-2 px-2 text-right w-32">IMPORTE</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineas.map((line: any) => (
                      <tr key={line.id} className="border-b border-border-subtle hover:bg-surface-muted/50 transition-colors group">
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={line.codigo}
                            onChange={(e) => updateLinea(line.id, 'codigo', e.target.value)}
                            className="w-full bg-transparent text-[13px] outline-none"
                            placeholder="CÓDIGO"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={line.producto}
                            onChange={(e) => updateLinea(line.id, 'producto', e.target.value)}
                            className="w-full bg-transparent text-[13px] outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            value={line.cantidad}
                            onChange={(e) => updateLinea(line.id, 'cantidad', parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent text-[13px] text-right outline-none"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            className="w-full bg-transparent text-[13px] outline-none"
                            value={line.udm}
                            onChange={(e) => updateLinea(line.id, 'udm', e.target.value)}
                            placeholder="KG"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            value={line.precio}
                            onChange={(e) => updateLinea(line.id, 'precio', parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent text-[13px] text-right outline-none"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            className="bg-transparent text-[13px] outline-none cursor-pointer"
                            value={line.impuesto}
                            onChange={(e) => updateLinea(line.id, 'impuesto', parseFloat(e.target.value) || 0)}
                          >
                            <option value={18}>18%</option>
                            <option value={0}>0%</option>
                          </select>
                        </td>
                        <td className="py-2 px-2 text-right text-[13px] text-on-surface">
                          {((line.cantidad * line.precio) * (1 + line.impuesto / 100)).toFixed(2)} {moneda === 'USD' ? 'US$' : 'S/'}
                        </td>
                        <td className="py-2 px-2 text-center text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                          <span
                            className="material-symbols-outlined text-[16px] cursor-pointer hover:text-error"
                            onClick={() => removeLinea(line.id)}
                          >
                            delete
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Actions Below Table */}
                <div className="flex gap-4 mt-4 px-2">
                  <button onClick={addLinea} className="text-[13px] text-primary hover:underline font-medium">Agregar un producto</button>
                </div>
              </div>

              {/* Footer Section (Terms and Totals) */}
              <div className="flex flex-col md:flex-row justify-between gap-8 mt-auto pt-4">
                <div className="flex-1 max-w-xl">
                  <span className="text-[13px] font-bold text-on-surface-variant block mb-1">Observaciones</span>
                  <textarea
                    placeholder="Lugar de entrega:..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full bg-transparent border border-border-subtle rounded p-3 text-[13px] text-on-surface outline-none focus:border-primary transition-colors resize-y custom-scrollbar min-h-[100px]"
                  ></textarea>
                </div>

                <div className="w-full md:w-80 space-y-2">
                  <div className="flex justify-between items-center text-[13px] text-on-surface">
                    <span className="font-semibold">OP. GRAVADAS:</span>
                    <span>{moneda === 'USD' ? 'US$' : 'S/'} {importeLibre.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] text-on-surface">
                    <span className="text-on-surface-variant">I.G.V.:</span>
                    <span>{moneda === 'USD' ? 'US$' : 'S/'} {importeIva.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-px bg-border-subtle my-2"></div>
                  <div className="flex justify-between items-center text-[16px] text-on-surface font-bold">
                    <span>IMPORTE TOTAL:</span>
                    <span>{moneda === 'USD' ? 'US$' : 'S/'} {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'lineas' && (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-lg bg-surface-muted/30 min-h-[300px]">
              <span className="material-symbols-outlined text-[48px] text-outline mb-4">construction</span>
              <h2 className="text-[18px] font-bold text-on-surface mb-2">Pestaña en Construcción</h2>
              <p className="text-on-surface-variant text-[14px]">El contenido de {tabs.find(t => t.id === activeTab)?.label} se implementará más adelante.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PresupuestoForm;
