import React, { useState, useEffect } from 'react';
import organizacionService, { type Organizacion } from '../../../../services/organizacionService';
import Button from '../../../../components/CRM/ui/Button';


import UserSelector from '../../../../components/CRM/ui/UserSelector';

export interface OportunidadFormData {
  oportunidad_id: number; // organizacion id
  usuario_asignado_id?: number;
  product: string;
  value: string;
  email: string;
  phone: string;
  contact_name: string;
  contact_cargo: string;
  contact_action?: 'update' | 'create';
  original_email?: string;
  stars: number;
  mercado_potencial?: string;
}

interface RegistrarOportunidadProps {
  columnId: string;
  isEditing?: boolean;
  initialData?: Partial<OportunidadFormData>;
  users?: any[];
  onSubmit: (data: OportunidadFormData, columnId: string) => Promise<void>;
  onCancel: () => void;
}

const RegistrarOportunidad: React.FC<RegistrarOportunidadProps> = ({
  columnId,
  isEditing = false,
  initialData,
  users: propUsers,
  onSubmit,
  onCancel
}) => {
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([]);
  const [oportunidad_id, setOportunidadId] = useState<number | ''>(initialData?.oportunidad_id || '');
  const [product, setProduct] = useState(initialData?.product || '');
  const [value, setValue] = useState(initialData?.value || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [contactName, setContactName] = useState(initialData?.contact_name || '');
  const [contactCargo, setContactCargo] = useState(initialData?.contact_cargo || '');
  const [contactAction] = useState<'update' | 'create'>('update');
  const [contactSaveStatus, setContactSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [contactSaveAction, setContactSaveAction] = useState<'update' | 'create' | null>(null);
  const [originalContact, setOriginalContact] = useState<{email: string; phone: string; name: string; cargo: string} | null>(null);
  const [stars, setStars] = useState(initialData?.stars || 1);
  const [isLoading, setIsLoading] = useState(false);

  // Autocomplete state
  const [orgSearch, setOrgSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Contact Picker State
  const [pendingContacts, setPendingContacts] = useState<any[] | null>(null);

  // Assignee state
  const [assignedToId, setAssignedToId] = useState<number | ''>('');

  // Unit price state
  const [tipoUnidad, setTipoUnidad] = useState<string>(''); // Venta, Kg/mes
  const [cantidadUnidad, setCantidadUnidad] = useState<string>(''); // C.U., USD/Kg
  const [montoUnidad, setMontoUnidad] = useState<string>(''); // Margen bruto, %
  const [ubUsdAno, setUbUsdAno] = useState<string>(''); // U.B., USD/año

  useEffect(() => {
    loadOrganizaciones();
    const currentUserStr = localStorage.getItem('user');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      setAssignedToId(currentUser.id);
    }
  }, []);
  useEffect(() => {
    if (initialData && organizaciones.length > 0) {
      setOportunidadId(initialData.oportunidad_id || '');
      setProduct(initialData.product || '');
      setValue(initialData.value || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setContactName(initialData.contact_name || '');
      setContactCargo(initialData.contact_cargo || '');
      setStars(initialData.stars || 1);
      if (initialData.usuario_asignado_id) setAssignedToId(initialData.usuario_asignado_id);

      if (initialData.oportunidad_id) {
        const org = organizaciones.find(o => o.id === initialData.oportunidad_id);
        if (org) {
          setOrgSearch(org.perfil?.nombre || 'Sin nombre');
        }
      }
    }
  }, [initialData, organizaciones]);

  const loadOrganizaciones = async () => {
    try {
      const data = await organizacionService.getOrganizaciones();
      setOrganizaciones(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oportunidad_id) return;
    setIsLoading(true);
    let finalValue = value;
    if (tipoUnidad && cantidadUnidad) {
      finalValue = String(parseFloat(tipoUnidad) * parseFloat(cantidadUnidad) * 12);
    }
    try {
      await onSubmit({
        oportunidad_id: Number(oportunidad_id),
        product,
        value: finalValue,
        email,
        phone,
        contact_name: contactName,
        contact_cargo: contactCargo,
        contact_action: isContactModified ? contactAction : 'update',
        original_email: originalContact?.email,
        stars,
        usuario_asignado_id: assignedToId ? Number(assignedToId) : undefined,
        mercado_potencial: JSON.stringify({
          venta_kg_mes: tipoUnidad ? parseFloat(tipoUnidad) : null,
          costo_unitario_usd_kg: cantidadUnidad ? parseFloat(cantidadUnidad) : null,
          venta_usd_anio: finalValue ? parseFloat(finalValue) : null,
          margen_bruto_porcentaje: montoUnidad ? parseFloat(montoUnidad) : null,
          utilidad_bruta_usd_anio: ubUsdAno ? parseFloat(ubUsdAno) : null
        })
      }, columnId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOrg = (org: Organizacion) => {
    setOportunidadId(org.id!);
    const name = org.perfil?.nombre || 'Sin nombre';
    setOrgSearch(name);
    setIsDropdownOpen(false);

    // Contact logic
    const contactos = org.contactos || [];
    if (contactos.length === 1) {
      setEmail(contactos[0].email || '');
      setPhone(contactos[0].telefono || '');
      setContactName(contactos[0].nombre || '');
      setContactCargo(contactos[0].cargo || '');
      setOriginalContact({ email: contactos[0].email || '', phone: contactos[0].telefono || '', name: contactos[0].nombre || '', cargo: contactos[0].cargo || '' });
    } else if (contactos.length > 1) {
      setPendingContacts(contactos);
    } else {
      setEmail('');
      setPhone('');
      setContactName('');
      setContactCargo('');
      setOriginalContact(null);
    }
  };

  const handleSelectContact = (contact: any) => {
    setEmail(contact.email || '');
    setPhone(contact.telefono || '');
    setContactName(contact.nombre || '');
    setContactCargo(contact.cargo || '');
    setOriginalContact({ email: contact.email || '', phone: contact.telefono || '', name: contact.nombre || '', cargo: contact.cargo || '' });
    setPendingContacts(null);
  };

  const handleSaveContact = async (action: 'update' | 'create') => {
    if (!oportunidad_id) return;
    const org = organizaciones.find(o => o.id === oportunidad_id);
    if (!org) return;

    setContactSaveAction(action);
    setContactSaveStatus('loading');

    try {
      const newContactos = [...(org.contactos || [])];
      const updatedContact = { email, telefono: phone, nombre: contactName, cargo: contactCargo };

      if (action === 'update' && originalContact) {
        let index = newContactos.findIndex(c => c.email && originalContact.email && c.email.toLowerCase() === originalContact.email.toLowerCase());
        if (index === -1) {
          index = newContactos.findIndex(c => c.nombre && originalContact.name && c.nombre.toLowerCase() === originalContact.name.toLowerCase());
        }
        if (index >= 0) {
          newContactos[index] = { ...newContactos[index], ...updatedContact };
        } else {
          newContactos.push(updatedContact);
        }
      } else {
        newContactos.push(updatedContact);
      }

      await organizacionService.updateOrganizacion(org.id!, { perfil: org.perfil, contactos: newContactos });
      setOrganizaciones(prev => prev.map(o => o.id === org.id ? { ...o, contactos: newContactos } : o));

      setContactSaveStatus('success');
      setTimeout(() => {
        setContactSaveStatus('idle');
        setContactSaveAction(null);
        setOriginalContact({ email, phone, name: contactName, cargo: contactCargo });
      }, 2000);
    } catch (error) {
      setContactSaveStatus('error');
      setTimeout(() => {
        setContactSaveStatus('idle');
        setContactSaveAction(null);
      }, 3000);
    }
  };

  const isContactModified = originalContact && (
    email !== originalContact.email ||
    phone !== originalContact.phone ||
    contactName !== originalContact.name ||
    contactCargo !== originalContact.cargo
  );
  
  const shouldShowContactButtons = isContactModified || contactSaveStatus !== 'idle';

  const filteredOrgs = organizaciones.filter(org => 
    (org.perfil?.nombre || '').toLowerCase().includes(orgSearch.toLowerCase())
  );

  return (
    <div className="bg-surface border border-border-subtle p-4 rounded shadow-lg mb-2 z-10 relative">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label className="text-[12px] font-bold text-on-surface mb-1 flex items-center gap-1">
            Organización/Cliente <span className="text-[10px] text-primary cursor-help" title="Selecciona la empresa">?</span>
          </label>
          <div className="relative">
            <input
              autoFocus
              type="text"
              placeholder="Escribe para buscar..."
              value={orgSearch}
              onChange={(e) => {
                setOrgSearch(e.target.value);
                setOportunidadId('');
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              className="w-full text-body-sm font-semibold border-b border-border-subtle bg-transparent outline-none pb-1 pr-6 focus:border-primary transition-colors"
              required={!oportunidad_id}
            />
            <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant pointer-events-none">search</span>
          </div>

          {/* Dropdown de Autocompletado */}
          {isDropdownOpen && filteredOrgs.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-surface border border-border-subtle rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {filteredOrgs.map(org => (
                <div 
                  key={org.id} 
                  className="px-3 py-2 text-[13px] hover:bg-surface-muted cursor-pointer text-on-surface"
                  onMouseDown={(e) => {
                    e.preventDefault(); // previene que el input pierda foco antes del click
                    handleSelectOrg(org);
                  }}
                >
                  {org.perfil?.nombre || 'Sin nombre'}
                </div>
              ))}
            </div>
          )}
          {isDropdownOpen && filteredOrgs.length === 0 && orgSearch && (
            <div className="absolute z-20 w-full mt-1 bg-surface border border-border-subtle rounded-lg shadow-xl px-3 py-2 text-[13px] text-on-surface-variant">
              No se encontraron coincidencias.
            </div>
          )}
        </div>
        <div>
          <label className="text-[12px] font-bold text-on-surface mb-1 block">Oportunidad</label>
          <input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Por ejemplo, precios de productos"
            className="w-full text-[13px] text-on-surface-variant border-b border-border-subtle bg-transparent outline-none pb-1 focus:border-primary transition-colors placeholder:text-outline"
            required
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-[12px] font-bold text-on-surface mb-1 block">Nombre del contacto</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Por ejemplo, &quot;Juan Pérez&quot;"
              className="w-full text-[13px] text-on-surface-variant border-b border-border-subtle bg-transparent outline-none pb-1 focus:border-primary transition-colors placeholder:text-outline"
            />
          </div>
          <div className="flex-1">
            <label className="text-[12px] font-bold text-on-surface mb-1 block">Cargo</label>
            <input
              type="text"
              value={contactCargo}
              onChange={(e) => setContactCargo(e.target.value)}
              placeholder="Por ejemplo, &quot;Gerente&quot;"
              className="w-full text-[13px] text-on-surface-variant border-b border-border-subtle bg-transparent outline-none pb-1 focus:border-primary transition-colors placeholder:text-outline"
            />
          </div>
        </div>
        <div>
          <label className="text-[12px] font-bold text-on-surface mb-1 block">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Por ejemplo, &quot;correo@electronico.com&quot;"
            className="w-full text-[13px] text-on-surface-variant border-b border-border-subtle bg-transparent outline-none pb-1 focus:border-primary transition-colors placeholder:text-outline"
          />
        </div>
        <div>
          <label className="text-[12px] font-bold text-on-surface mb-1 block">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Por ejemplo, &quot;0123456789&quot;"
            className="w-full text-[13px] text-on-surface-variant border-b border-border-subtle bg-transparent outline-none pb-1 focus:border-primary transition-colors placeholder:text-outline"
          />
          {shouldShowContactButtons && (
            <div className="flex gap-2 text-[11px] mt-2 bg-surface-muted p-2 rounded border border-border-subtle animate-in fade-in slide-in-from-top-2">
              <button 
                type="button" 
                onClick={() => handleSaveContact('update')}
                disabled={contactSaveStatus === 'loading'}
                className={`flex-1 py-1 rounded transition-colors flex items-center justify-center gap-1 ${
                  contactSaveAction === 'update' && contactSaveStatus === 'loading' ? 'bg-primary/50 text-white' : 
                  contactSaveAction === 'update' && contactSaveStatus === 'success' ? 'bg-status-pp text-white' : 
                  contactSaveAction === 'update' && contactSaveStatus === 'error' ? 'bg-status-hp text-white' : 
                  contactAction === 'update' ? 'bg-primary text-white font-bold' : 'bg-surface hover:bg-surface-bright text-on-surface-variant border border-border-subtle'
                }`}
              >
                {contactSaveAction === 'update' && contactSaveStatus === 'loading' ? <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span> :
                 contactSaveAction === 'update' && contactSaveStatus === 'success' ? <span className="material-symbols-outlined text-[14px]">check</span> :
                 contactSaveAction === 'update' && contactSaveStatus === 'error' ? <span className="material-symbols-outlined text-[14px]">close</span> : null}
                Actualizar contacto
              </button>
              <button 
                type="button" 
                onClick={() => handleSaveContact('create')}
                disabled={contactSaveStatus === 'loading'}
                className={`flex-1 py-1 rounded transition-colors flex items-center justify-center gap-1 ${
                  contactSaveAction === 'create' && contactSaveStatus === 'loading' ? 'bg-primary/50 text-white' : 
                  contactSaveAction === 'create' && contactSaveStatus === 'success' ? 'bg-status-pp text-white' : 
                  contactSaveAction === 'create' && contactSaveStatus === 'error' ? 'bg-status-hp text-white' : 
                  contactAction === 'create' ? 'bg-primary text-white font-bold' : 'bg-surface hover:bg-surface-bright text-on-surface-variant border border-border-subtle'
                }`}
              >
                {contactSaveAction === 'create' && contactSaveStatus === 'loading' ? <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span> :
                 contactSaveAction === 'create' && contactSaveStatus === 'success' ? <span className="material-symbols-outlined text-[14px]">check</span> :
                 contactSaveAction === 'create' && contactSaveStatus === 'error' ? <span className="material-symbols-outlined text-[14px]">close</span> : null}
                Crear como nuevo
              </button>
            </div>
          )}
        </div>
        <div>
          <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-[12px] font-bold text-on-surface mb-1 block">Mercado potencial</label>
            
            {/* Venta Kg/mes, CU USD/Kg, Venta USD/año (Agrupados) */}
            <div className="space-y-1 mb-4">
              <div className="flex items-center">
                <span className="text-[11px] text-on-surface font-bold bg-surface-muted border border-border-subtle p-1 px-2 w-32 shrink-0">Venta, Kg/mes</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tipoUnidad}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTipoUnidad(val);
                    if (val && cantidadUnidad) {
                      const venta = parseFloat(val) * parseFloat(cantidadUnidad) * 12;
                      setValue(String(venta));
                      if (montoUnidad) setUbUsdAno(String(venta * parseFloat(montoUnidad) / 100));
                    }
                  }}
                  className="flex-1 border border-l-0 border-border-subtle p-1 px-2 text-[11px] outline-none focus:border-primary bg-[#ffffcc]"
                />
              </div>
              <div className="flex items-center">
                <span className="text-[11px] text-on-surface font-bold bg-surface-muted border border-border-subtle p-1 px-2 w-32 shrink-0">C.U., USD/Kg</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cantidadUnidad}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCantidadUnidad(val);
                    if (tipoUnidad && val) {
                      const venta = parseFloat(tipoUnidad) * parseFloat(val) * 12;
                      setValue(String(venta));
                      if (montoUnidad) setUbUsdAno(String(venta * parseFloat(montoUnidad) / 100));
                    }
                  }}
                  className="flex-1 border border-l-0 border-border-subtle p-1 px-2 text-[11px] outline-none focus:border-primary bg-[#ffffcc]"
                />
              </div>
              <div className="flex items-center">
                <span className="text-[11px] text-on-surface font-bold bg-surface-muted border border-border-subtle p-1 px-2 w-32 shrink-0">Venta, USD/año</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (e.target.value && montoUnidad) {
                      setUbUsdAno(String(parseFloat(e.target.value) * parseFloat(montoUnidad) / 100));
                    }
                  }}
                  className="flex-1 border border-l-0 border-border-subtle p-1 px-2 text-[11px] outline-none bg-white"
                />
              </div>
            </div>

            {/* Margen bruto y UB separados */}
            <div className="space-y-1 mb-4">
              <div className="flex items-center">
                <span className="text-[11px] text-on-surface font-bold bg-surface-muted border border-border-subtle p-1 px-2 w-32 shrink-0">Margen bruto, %</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={montoUnidad}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMontoUnidad(val);
                    if (value && val) {
                      setUbUsdAno(String(parseFloat(value) * parseFloat(val) / 100));
                    }
                  }}
                  className="flex-1 border border-l-0 border-border-subtle p-1 px-2 text-[11px] outline-none focus:border-primary bg-[#ffffcc]"
                />
              </div>
            </div>

            <div className="space-y-1 mb-2">
              <div className="flex items-center">
                <span className="text-[11px] text-on-surface font-bold bg-surface-muted border border-border-subtle p-1 px-2 w-32 shrink-0">U.B., USD/año</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={ubUsdAno}
                  onChange={(e) => setUbUsdAno(e.target.value)}
                  className="flex-1 border border-l-0 border-border-subtle p-1 px-2 text-[11px] outline-none bg-white"
                />
              </div>
            </div>

            </div>
          </div>
        </div>
        
        <div>
          <label className="text-[12px] font-bold text-on-surface mb-1 block">Responsable</label>
          <div className="flex items-center gap-2">
            <UserSelector
              selectedUserId={assignedToId ? Number(assignedToId) : undefined}
              onSelect={id => setAssignedToId(id)}
              usersList={propUsers}
            />
            {assignedToId && (
              <span className="text-[12px] text-on-surface-variant">
                {propUsers?.find(u => u.id === assignedToId)?.name || ''}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="text-[12px] font-bold text-on-surface mb-1 block">Prioridad</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setStars(star)}
                className="hover:scale-125 transition-transform p-0.5"
              >
                <span className={`material-symbols-outlined text-[20px] [font-variation-settings:'FILL'_1] ${stars >= star ? 'text-status-ip' : 'text-on-surface-variant/30'}`}>star</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={!oportunidad_id} className="flex-1 py-1.5 text-[12px]">
            {isEditing ? 'Guardar Cambios' : 'Agregar'}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading} className="flex-1 py-1.5 text-[12px]">
            Cancelar
          </Button>
        </div>
      </form>

      {/* Modal de Contactos Pendientes */}
      {pendingContacts && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm p-4 rounded animate-in fade-in zoom-in duration-200">
          <div className="bg-surface border border-border-subtle w-full rounded shadow-2xl p-4 flex flex-col max-h-full">
            <h4 className="text-[13px] font-bold text-on-surface mb-2">Múltiples Contactos Encontrados</h4>
            <p className="text-[11px] text-on-surface-variant mb-4">Selecciona un contacto para autocompletar la oportunidad.</p>
            
            <div className="overflow-y-auto flex-1 space-y-2 mb-4 pr-1">
              {pendingContacts.map((contact, idx) => (
                <div 
                  key={idx} 
                  className="border border-border-subtle p-2 rounded hover:border-primary cursor-pointer transition-colors bg-surface-bright"
                  onClick={() => handleSelectContact(contact)}
                >
                  <p className="text-[12px] font-bold text-on-surface">{contact.nombre || 'Sin Nombre'}</p>
                  {contact.cargo && <p className="text-[10px] text-primary font-semibold">{contact.cargo}</p>}
                  <div className="flex flex-col gap-0.5 mt-1">
                    {contact.email && <span className="text-[10px] text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">mail</span>{contact.email}</span>}
                    {contact.telefono && <span className="text-[10px] text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">phone</span>{contact.telefono}</span>}
                  </div>
                </div>
              ))}
            </div>

            <Button variant="ghost" onClick={() => setPendingContacts(null)} className="w-full text-[12px] py-1">
              Omitir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarOportunidad;
