import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import type { LayoutContextType } from '../../components/CRM/layout/Layout';
import { useDialog } from '../../context/CRM/DialogContext';
import organizacionService from '../../services/organizacionService';
import { settingsService } from '../../services/settingsService';

interface Contact {
  id: string;
  nombre: string;
  cargo: string;
  email: string;
  telefono: string;
}

interface Organizacion {
  id?: number;
  perfil: {
    nombre: string;
    industria: string;
    ubicacion?: string;
    pais?: string;
    departamento?: string;
    ciudad?: string;
    sitio_web: string;
    logo_url?: string;
    ruc?: string;
  };
  contactos: Contact[];
}

interface Ciudad {
  id: string;
  nombre: string;
}

interface Departamento {
  id: string;
  nombre: string;
  ciudades: Ciudad[];
}

interface Pais {
  id: string;
  nombre: string;
  departamentos: Departamento[];
}

const PREDEFINED_INDUSTRIAS = [
  "Minería",
  "Petróleo y Gas",
  "Tratamiento de Agua",
  "Energía",
  "Construcción",
  "Manufactura",
  "Tecnología",
  "Agroindustria",
  "Servicios",
  "Comercio"
];

const SEED_UBICACIONES: Pais[] = [
  {
    id: "1",
    nombre: "Perú",
    departamentos: [
      {
        id: "1-1",
        nombre: "Piura",
        ciudades: [
          { id: "1-1-1", nombre: "Talara" },
          { id: "1-1-2", nombre: "La Brea" },
          { id: "1-1-3", nombre: "Piura" }
        ]
      },
      {
        id: "1-2",
        nombre: "Lima",
        ciudades: [
          { id: "1-2-1", nombre: "Lima" }
        ]
      }
    ]
  },
  {
    id: "2",
    nombre: "México",
    departamentos: [
      {
        id: "2-1",
        nombre: "Ciudad de México",
        ciudades: [
          { id: "2-1-1", nombre: "Ciudad de México" }
        ]
      },
      {
        id: "2-2",
        nombre: "Coahuila",
        ciudades: [
          { id: "2-2-1", nombre: "Torreón" }
        ]
      },
      {
        id: "2-3",
        nombre: "Zacatecas",
        ciudades: [
          { id: "2-3-1", nombre: "Fresnillo" }
        ]
      }
    ]
  },
  {
    id: "3",
    nombre: "Canadá",
    departamentos: [
      {
        id: "3-1",
        nombre: "Ontario",
        ciudades: [
          { id: "3-1-1", nombre: "Toronto" }
        ]
      }
    ]
  },
  {
    id: "4",
    nombre: "USA",
    departamentos: [
      {
        id: "4-1",
        nombre: "Colorado",
        ciudades: [
          { id: "4-1-1", nombre: "Denver" }
        ]
      }
    ]
  }
];



const URL_UPLOAD = import.meta.env.VITE_URL_UPLOAD || 'https://app.wimprove.com/files/upload';

const BaseComercial: React.FC = () => {
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organizacion | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [expandedOrgId, setExpandedOrgId] = useState<number | null>(null);
  const { confirm } = useDialog();
  const { searchQuery } = useOutletContext<LayoutContextType>();

  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  const [industrias, setIndustrias] = useState<string[]>([]);
  const [paisesList, setPaisesList] = useState<Pais[]>([]);

  useEffect(() => {
    setPortalNode(document.getElementById('topnav-content-left'));
  }, []);

  useEffect(() => {
    loadOrganizaciones();
    loadIndustrias();
    loadUbicaciones();
  }, []);

  const loadIndustrias = async () => {
    try {
      const res = await settingsService.getSettingByName('industrias');
      if (res && res.content) {
        const parsed = JSON.parse(res.content);
        setIndustrias(parsed.map((ind: any) => ind.nombre));
      } else {
        setIndustrias(PREDEFINED_INDUSTRIAS);
      }
    } catch (e) {
      console.log('No global industries setting found, using defaults');
      setIndustrias(PREDEFINED_INDUSTRIAS);
    }
  };

  const loadUbicaciones = async () => {
    try {
      const res = await settingsService.getSettingByName('ubicaciones');
      if (res && res.content) {
        setPaisesList(JSON.parse(res.content));
      } else {
        setPaisesList(SEED_UBICACIONES);
      }
    } catch (e) {
      console.log('No global locations setting found, using defaults');
      setPaisesList(SEED_UBICACIONES);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedOrgId(prev => prev === id ? null : id);
  };

  const loadOrganizaciones = async () => {
    try {
      const data = await organizacionService.getOrganizaciones();
      setOrganizaciones(data);
    } catch (error) {
      console.error("Failed to load organizaciones", error);
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!selectedOrg) return;
    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(URL_UPLOAD, { method: 'POST', body: formData });
      const data = await res.json();
      const logoUrl = data.file?.RutaUrl || data.url || data.fileUrl || null;
      if (logoUrl) {
        setSelectedOrg({ ...selectedOrg, perfil: { ...selectedOrg.perfil, logo_url: logoUrl } });
      }
    } catch (e) {
      console.error('Error uploading logo:', e);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleOpenDrawer = (org?: Organizacion) => {
    if (org) {
      const copy = JSON.parse(JSON.stringify(org));
      if (!copy.perfil.pais) copy.perfil.pais = '';
      if (!copy.perfil.departamento) copy.perfil.departamento = '';
      if (!copy.perfil.ciudad) copy.perfil.ciudad = '';
      setSelectedOrg(copy);
    } else {
      setSelectedOrg({
        perfil: { nombre: '', industria: '', ubicacion: '', pais: '', departamento: '', ciudad: '', sitio_web: '', logo_url: '', ruc: '' },
        contactos: []
      });
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedOrg(null);
  };

  const handleSave = async () => {
    if (!selectedOrg) return;
    setIsLoading(true);
    try {
      if (selectedOrg.id) {
        await organizacionService.updateOrganizacion(selectedOrg.id, {
          perfil: selectedOrg.perfil,
          contactos: selectedOrg.contactos
        });
      } else {
        await organizacionService.createOrganizacion({
          perfil: selectedOrg.perfil,
          contactos: selectedOrg.contactos
        });
      }
      await loadOrganizaciones();
      handleCloseDrawer();
    } catch (error) {
      console.error("Failed to save organizacion", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Eliminar Organización',
      message: '¿Estás seguro que deseas eliminar esta organización y todos sus contactos? Esta acción no se puede deshacer.',
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar'
    });

    if (isConfirmed) {
      try {
        await organizacionService.deleteOrganizacion(id);
        await loadOrganizaciones();
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  const addContactToOrg = () => {
    if (!selectedOrg) return;
    setSelectedOrg({
      ...selectedOrg,
      contactos: [
        ...selectedOrg.contactos,
        { id: Date.now().toString(), nombre: '', cargo: '', email: '', telefono: '' }
      ]
    });
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    if (!selectedOrg) return;
    const newContacts = [...selectedOrg.contactos];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setSelectedOrg({ ...selectedOrg, contactos: newContacts });
  };

  const removeContact = (index: number) => {
    if (!selectedOrg) return;
    const newContacts = selectedOrg.contactos.filter((_, i) => i !== index);
    setSelectedOrg({ ...selectedOrg, contactos: newContacts });
  };

  const filteredOrganizaciones = organizaciones.filter(org => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    // Check organization name
    if (org.perfil?.nombre?.toLowerCase().includes(q)) return true;

    // Check contacts
    if (org.contactos) {
      for (const contact of org.contactos) {
        if (contact.nombre?.toLowerCase().includes(q) ||
          contact.email?.toLowerCase().includes(q) ||
          contact.telefono?.toLowerCase().includes(q)) {
          return true;
        }
      }
    }

    return false;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] pt-4">
      {portalNode && createPortal(
        <div className="flex items-center gap-3 pl-2">
          <button onClick={() => handleOpenDrawer()} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary font-bold text-[12px] rounded hover:bg-opacity-90 transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-[16px]">domain_add</span>
            Nueva Organización
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border-subtle bg-surface-bright text-on-surface font-bold text-[12px] rounded hover:bg-surface-muted transition-colors industrial-shadow">
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            Exportar CSV
          </button>
        </div>,
        portalNode
      )}

      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 lg:col-span-12">
          <div className="bg-surface-bright border border-border-subtle rounded flex flex-col h-full industrial-shadow overflow-hidden">


            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-surface-bright z-10 shadow-sm">
                  <tr>
                    <th className="p-4 w-10"><input className="rounded border-outline-variant text-primary focus:ring-primary-container" type="checkbox" /></th>
                    <th className="p-4 font-label-caps text-outline uppercase">Organización</th>
                    <th className="p-4 font-label-caps text-outline uppercase hidden md:table-cell">Industria</th>
                    <th className="p-4 font-label-caps text-outline uppercase hidden sm:table-cell">Ubicación</th>
                    <th className="p-4 font-label-caps text-outline uppercase text-center">Contactos</th>
                    <th className="p-4 w-12 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredOrganizaciones.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant font-body-md">
                        No se encontraron organizaciones.
                      </td>
                    </tr>
                  ) : filteredOrganizaciones.map((org, index) => (
                    <React.Fragment key={org.id || index}>
                      <tr
                        className={`${index % 2 !== 0 ? 'bg-surface-muted/50' : ''} hover:bg-surface-muted transition-colors group cursor-pointer ${expandedOrgId === org.id ? 'bg-surface-muted/80' : ''}`}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).tagName !== 'INPUT' && !(e.target as HTMLElement).closest('button')) {
                            toggleExpand(org.id!);
                          }
                        }}
                      >
                        <td className="p-3"><input className="rounded border-outline-variant text-primary focus:ring-primary-container" type="checkbox" /></td>
                        <td className="p-3">
                          <div className="font-body-md font-bold text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-outline transition-transform duration-200" style={{ transform: expandedOrgId === org.id ? 'rotate(90deg)' : 'rotate(0deg)' }}>chevron_right</span>
                            {org.perfil?.logo_url ? (
                              <img src={org.perfil.logo_url} alt={org.perfil.nombre} className="w-6 h-6 rounded object-contain bg-surface-muted border border-border-subtle" />
                            ) : (
                              <span className="material-symbols-outlined text-[18px] text-outline/40">corporate_fare</span>
                            )}
                            {org.perfil?.nombre || 'Sin nombre'}
                          </div>
                          <div className="ml-6 flex items-center gap-2 mt-1">
                            {org.perfil?.ruc && <span className="font-data-mono text-[10px] text-on-surface-variant bg-surface-muted border border-border-subtle px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">badge</span> RUC: {org.perfil.ruc}</span>}
                            {org.perfil?.sitio_web && <a href={org.perfil.sitio_web.startsWith('http') ? org.perfil.sitio_web : `https://${org.perfil.sitio_web}`} target="_blank" rel="noreferrer" className="font-data-mono text-[11px] text-outline hover:underline" onClick={e => e.stopPropagation()}>{org.perfil.sitio_web}</a>}
                          </div>
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          <div className="font-body-sm text-on-surface-variant">{org.perfil?.industria || '-'}</div>
                        </td>
                        <td className="p-3 hidden sm:table-cell">
                          <div className="font-body-sm text-on-surface-variant">
                            {org.perfil?.ciudad || org.perfil?.departamento || org.perfil?.pais
                              ? `${org.perfil.ciudad || ''}${org.perfil.departamento ? ', ' + org.perfil.departamento : ''}${org.perfil.pais ? ' (' + org.perfil.pais + ')' : ''}`
                              : org.perfil?.ubicacion || '-'
                            }
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-container text-on-primary-container font-bold text-xs">
                            {org.contactos?.length || 0}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-1 text-outline hover:text-primary transition-colors" onClick={(e) => { e.stopPropagation(); handleOpenDrawer(org); }} title="Editar Organización"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                            <button className="p-1 text-outline hover:text-error transition-colors" onClick={(e) => { e.stopPropagation(); handleDelete(org.id!); }} title="Eliminar Organización"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                          </div>
                        </td>
                      </tr>
                      {expandedOrgId === org.id && (
                        <tr>
                          <td colSpan={6} className="p-0 border-b border-border-subtle bg-surface/50">
                            <div className="py-4 px-12 animate-in slide-in-from-top-2 fade-in duration-200">
                              <h4 className="font-label-caps text-outline mb-3 font-bold text-[11px]">Contactos de la Organización</h4>
                              {(!org.contactos || org.contactos.length === 0) ? (
                                <p className="text-sm text-on-surface-variant italic py-2">No hay contactos registrados para esta organización.</p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {org.contactos.map((contact, cIndex) => (
                                    <div key={cIndex} className="bg-surface-bright border border-border-subtle rounded-lg p-3 flex gap-3 shadow-sm items-start">
                                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold font-body-lg shrink-0 uppercase">
                                        {contact.nombre ? contact.nombre.substring(0, 1) : 'C'}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-body-sm font-bold text-on-surface truncate" title={contact.nombre}>{contact.nombre}</p>
                                        <p className="text-[11px] font-data-mono text-outline truncate" title={contact.cargo}>{contact.cargo}</p>
                                        <div className="mt-2 space-y-1">
                                          <p className="text-[11px] text-on-surface-variant flex items-center gap-1 truncate" title={contact.email}>
                                            <span className="material-symbols-outlined text-[14px]">mail</span> {contact.email || '-'}
                                          </p>
                                          <p className="text-[11px] text-on-surface-variant flex items-center gap-1 truncate" title={contact.telefono}>
                                            <span className="material-symbols-outlined text-[14px]">call</span> {contact.telefono || '-'}
                                          </p>
                                        </div>

                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <div className={`fixed inset-0 z-[60] transition-all duration-300 ${isDrawerOpen ? '' : 'invisible'}`} id="contact-drawer">
        <div className={`absolute inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={handleCloseDrawer}>
        </div>
        <div className={`absolute right-0 top-0 h-full w-full max-w-xl bg-surface shadow-xl transform transition-transform duration-300 flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-surface-bright">
            <h3 className="font-headline-sm text-primary">{selectedOrg?.id ? 'Editar Organización' : 'Nueva Organización'}</h3>
            <button className="p-2 hover:bg-surface-muted rounded-full transition-colors" onClick={handleCloseDrawer}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {selectedOrg && (
              <div className="space-y-8">
                {/* Perfil de Organización */}
                <div className="space-y-4">
                  <h4 className="font-body-md font-bold text-on-surface border-b border-border-subtle pb-2">Perfil de la Organización</h4>

                  {/* Logo Upload */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border-subtle bg-surface-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {selectedOrg.perfil.logo_url ? (
                        <img src={selectedOrg.perfil.logo_url} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="material-symbols-outlined text-[28px] text-outline/40">corporate_fare</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="font-label-caps text-outline text-[11px] uppercase block mb-1">Logo de la Organización</label>
                      <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded border font-body-sm cursor-pointer transition-colors text-[12px] ${isUploadingLogo ? 'opacity-50 cursor-not-allowed border-border-subtle text-outline' : 'border-primary text-primary hover:bg-primary/5'}`}>
                        {isUploadingLogo ? (
                          <><span className="material-symbols-outlined text-[16px] animate-spin">refresh</span> Subiendo...</>
                        ) : (
                          <><span className="material-symbols-outlined text-[16px]">upload</span> Subir logo</>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingLogo}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      {selectedOrg.perfil.logo_url && (
                        <button
                          type="button"
                          onClick={() => setSelectedOrg({ ...selectedOrg, perfil: { ...selectedOrg.perfil, logo_url: '' } })}
                          className="ml-2 text-[11px] text-status-na hover:underline"
                        >
                          Quitar logo
                        </button>
                      )}
                      <p className="text-[10px] text-outline mt-1">PNG, JPG o SVG. Se sube al servidor externo.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[2fr_1fr] gap-4">
                    <div className="grid gap-2">
                      <label className="font-label-caps text-outline">Nombre de la Compañía</label>
                      <input className="w-full border-border-subtle rounded-lg focus:ring-primary-container font-body-md" type="text"
                        value={selectedOrg.perfil.nombre} onChange={(e) => setSelectedOrg({ ...selectedOrg, perfil: { ...selectedOrg.perfil, nombre: e.target.value } })} />
                    </div>
                    <div className="grid gap-2">
                      <label className="font-label-caps text-outline">RUC</label>
                      <input className="w-full border-border-subtle rounded-lg focus:ring-primary-container font-body-md" type="text"
                        value={selectedOrg.perfil.ruc || ''} onChange={(e) => setSelectedOrg({ ...selectedOrg, perfil: { ...selectedOrg.perfil, ruc: e.target.value } })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="font-label-caps text-outline">Industria</label>
                      <select
                        className="w-full border-border-subtle rounded-lg focus:ring-primary-container font-body-md bg-surface p-2"
                        value={selectedOrg.perfil.industria}
                        onChange={(e) => setSelectedOrg({ ...selectedOrg, perfil: { ...selectedOrg.perfil, industria: e.target.value } })}
                      >
                        <option value="">Seleccione una industria</option>
                        {industrias.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                        {selectedOrg.perfil.industria && !industrias.includes(selectedOrg.perfil.industria) && (
                          <option value={selectedOrg.perfil.industria}>{selectedOrg.perfil.industria} (Actual)</option>
                        )}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="font-label-caps text-outline">Sitio Web</label>
                      <input className="w-full border-border-subtle rounded-lg focus:ring-primary-container font-body-md" type="url"
                        value={selectedOrg.perfil.sitio_web} onChange={(e) => setSelectedOrg({ ...selectedOrg, perfil: { ...selectedOrg.perfil, sitio_web: e.target.value } })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <label className="font-label-caps text-outline">País</label>
                      <select
                        className="w-full border-border-subtle rounded-lg focus:ring-primary-container font-body-md bg-surface p-2"
                        value={selectedOrg.perfil.pais || ''}
                        onChange={(e) => {
                          const p = e.target.value;
                          setSelectedOrg({
                            ...selectedOrg,
                            perfil: {
                              ...selectedOrg.perfil,
                              pais: p,
                              departamento: '',
                              ciudad: ''
                            }
                          });
                        }}
                      >
                        <option value="">Seleccione país</option>
                        {paisesList.map(p => (
                          <option key={p.id} value={p.nombre}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="font-label-caps text-outline">Departamento</label>
                      <select
                        className="w-full border-border-subtle rounded-lg focus:ring-primary-container font-body-md bg-surface p-2"
                        value={selectedOrg.perfil.departamento || ''}
                        disabled={!selectedOrg.perfil.pais}
                        onChange={(e) => {
                          const d = e.target.value;
                          setSelectedOrg({
                            ...selectedOrg,
                            perfil: {
                              ...selectedOrg.perfil,
                              departamento: d,
                              ciudad: ''
                            }
                          });
                        }}
                      >
                        <option value="">Seleccione dpto.</option>
                        {paisesList.find(p => p.nombre === selectedOrg.perfil.pais)?.departamentos.map(d => (
                          <option key={d.id} value={d.nombre}>{d.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="font-label-caps text-outline">Ciudad / Distrito</label>
                      <select
                        className="w-full border-border-subtle rounded-lg focus:ring-primary-container font-body-md bg-surface p-2"
                        value={selectedOrg.perfil.ciudad || ''}
                        disabled={!selectedOrg.perfil.departamento}
                        onChange={(e) => setSelectedOrg({
                          ...selectedOrg,
                          perfil: {
                            ...selectedOrg.perfil,
                            ciudad: e.target.value
                          }
                        })}
                      >
                        <option value="">Seleccione ciudad</option>
                        {paisesList.find(p => p.nombre === selectedOrg.perfil.pais)
                          ?.departamentos.find(d => d.nombre === selectedOrg.perfil.departamento)
                          ?.ciudades.map(c => (
                            <option key={c.id} value={c.nombre}>{c.nombre}</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {selectedOrg.perfil.ubicacion && (!selectedOrg.perfil.pais || !selectedOrg.perfil.departamento || !selectedOrg.perfil.ciudad) && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-600 dark:text-amber-400 text-[11px] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                      <span>
                        <strong>Ubicación anterior registrada:</strong> {selectedOrg.perfil.ubicacion}. Por favor, seleccione País, Departamento y Ciudad para actualizar.
                      </span>
                    </div>
                  )}
                </div>

                {/* Contactos */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                    <h4 className="font-body-md font-bold text-on-surface">Contactos Asociados</h4>
                    <button className="text-primary font-body-sm flex items-center hover:underline" onClick={addContactToOrg}>
                      <span className="material-symbols-outlined text-sm mr-1">add</span> Agregar
                    </button>
                  </div>

                  {selectedOrg.contactos.length === 0 && (
                    <p className="text-sm text-on-surface-variant italic">No hay contactos añadidos a esta organización.</p>
                  )}

                  {selectedOrg.contactos.map((contact, index) => (
                    <div key={index} className="bg-surface-muted/30 p-4 rounded-lg border border-border-subtle space-y-3 relative group">
                      <button className="absolute top-2 right-2 text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeContact(index)} title="Eliminar Contacto">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1">
                          <label className="text-[10px] uppercase font-bold text-outline">Nombre</label>
                          <input className="w-full border-border-subtle rounded text-sm p-1.5 focus:ring-1 focus:ring-primary-container" type="text"
                            value={contact.nombre} onChange={(e) => updateContact(index, 'nombre', e.target.value)} />
                        </div>
                        <div className="grid gap-1">
                          <label className="text-[10px] uppercase font-bold text-outline">Cargo</label>
                          <input className="w-full border-border-subtle rounded text-sm p-1.5 focus:ring-1 focus:ring-primary-container" type="text"
                            value={contact.cargo} onChange={(e) => updateContact(index, 'cargo', e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1">
                          <label className="text-[10px] uppercase font-bold text-outline">Email</label>
                          <input className="w-full border-border-subtle rounded text-sm p-1.5 focus:ring-1 focus:ring-primary-container" type="email"
                            value={contact.email} onChange={(e) => updateContact(index, 'email', e.target.value)} />
                        </div>
                        <div className="grid gap-1">
                          <label className="text-[10px] uppercase font-bold text-outline">Teléfono</label>
                          <input className="w-full border-border-subtle rounded text-sm p-1.5 focus:ring-1 focus:ring-primary-container" type="tel"
                            value={contact.telefono} onChange={(e) => updateContact(index, 'telefono', e.target.value)} />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-border-subtle bg-surface-muted/50 flex gap-3">
            <button className="flex-1 py-2 bg-primary text-on-primary rounded font-body-md hover:bg-opacity-90 transition-all flex justify-center items-center" onClick={handleSave} disabled={isLoading}>
              {isLoading ? <span className="material-symbols-outlined animate-spin mr-2">refresh</span> : null}
              {selectedOrg?.id ? 'Guardar Cambios' : 'Crear Organización'}
            </button>
            <button className="flex-1 py-2 border border-border-subtle bg-surface-bright text-on-surface rounded font-body-md hover:bg-surface-muted transition-colors" onClick={handleCloseDrawer} disabled={isLoading}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseComercial;
