import React, { useState, useEffect } from 'react';
import PresupuestoForm from './PresupuestoForm';
import oportunidadesService, { type Seguimiento } from '../../../../services/oportunidadesService';
import organizacionService from '../../../../services/organizacionService';
import { calendarService } from '../../../../services/calendarService';
import Button from '../../../../components/CRM/ui/Button';
import CalendarioReunionesModal from './CalendarioReunionesModal';
import { userService } from '../../../../services/userService';
import UserSelector from '../../../../components/CRM/ui/UserSelector';
import { useAuth } from '../../../../context/CRM/AuthContext';
import { useDialog } from '../../../../context/CRM/DialogContext';
import { formatMoney } from '../../../../utils/formatters';

const getActivityIcon = (tipo: string, isIncoming?: boolean) => {
  if (!tipo) return 'person';
  const typeLower = tipo.toLowerCase();
  if (typeLower.includes('email') || typeLower.includes('correo')) return isIncoming ? 'mark_email_read' : 'mail';
  if (typeLower.includes('reunion') || typeLower.includes('reunión')) return 'event';
  if (typeLower.includes('llamada')) return 'call';
  if (typeLower.includes('nota') || typeLower.includes('hacer')) return 'sticky_note_2';
  if (typeLower.includes('cotización') || typeLower.includes('cotizacion') || typeLower.includes('presupuesto')) return 'request_quote';
  return 'list_alt'; // Default for other activities
};

const getActivityColor = (tipo: string, isIncoming?: boolean) => {
  if (!tipo) return 'bg-[#9CA3AF] text-white';
  const typeLower = tipo.toLowerCase();

  // Email / Correo → Celeste (sky blue)
  if (typeLower.includes('email') || typeLower.includes('correo')) {
    return isIncoming ? 'bg-[#0ea5e9] text-white' : 'bg-[#38bdf8] text-white';
  }
  // Reunión → Rojo
  if (typeLower.includes('reunion') || typeLower.includes('reuni\u00f3n')) {
    return 'bg-[#EF4444] text-white';
  }
  // Llamada → Naranja
  if (typeLower.includes('llamada')) {
    return 'bg-[#f97316] text-white';
  }
  // Nota → Morado
  if (typeLower.includes('nota')) {
    return 'bg-[#8b5cf6] text-white';
  }
  // Por hacer → Ámbar
  if (typeLower.includes('hacer')) {
    return 'bg-[#F59E0B] text-white';
  }
  // Presupuesto / Cotización → Verde
  if (typeLower.includes('cotizaci\u00f3n') || typeLower.includes('cotizacion') || typeLower.includes('presupuesto')) {
    return 'bg-[#10B981] text-white';
  }

  return 'bg-[#4059aa] text-white'; // Default azul corporativo
};

const getDisplayFileName = (url: string) => {
  if (!url) return 'Archivo';
  try {
    const parts = url.split('/');
    let fileName = decodeURIComponent(parts[parts.length - 1]);
    fileName = fileName.split('?')[0];
    if (!fileName) return 'Archivo';
    if (fileName.length <= 25) return fileName;
    
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === 0) return fileName.slice(0, 22) + '...';
    
    const ext = fileName.slice(lastDotIndex);
    const nameWithoutExt = fileName.slice(0, lastDotIndex);
    return `${nameWithoutExt.slice(0, 20)}...${ext}`;
  } catch (e) {
    return 'Archivo';
  }
};
// Re-using the types locally for ease of extraction if needed.
// Ideally, these would be exported from a types file.
interface Oportunidad {
  id: number;
  uid: string;
  name: string;
  product: string;
  organizacion_id?: number;
  volume: string;
  periodicity: string;
  value: string;
  email?: string;
  phone?: string;
  contactName?: string;
  stars?: number;
  notes?: string;
  informacion_adicional?: any;
  fecha_cierre_esperado?: string;
  contacto_data?: any;
  probabilidad?: number;
  etiquetas?: any;
  responsible: {
    name: string;
    avatar?: string;
    id?: number;
    email?: string;
  };
  colaboradores?: { id: number; nombre: string; apellido: string; email: string }[];
  tipo_unidad?: number;
  cantidad_unidad?: number;
  monto_unidad?: number | string;
  ub_usd_ano?: number;
  mercado_potencial?: string;
}

interface Column {
  id: string;
  title: string;
  status: string;
  colorClass: string;
}

interface OportunidadDetalleProps {
  oportunidad: Oportunidad;
  currentColumnId: string;
  columnsList: Column[];
  onClose: () => void;
  onChangeStage: (newColumnId: string) => Promise<void> | void;
  onUpdate?: () => void;
}

const OportunidadDetalle: React.FC<OportunidadDetalleProps> = ({
  oportunidad,
  currentColumnId,
  columnsList,
  onClose,
  onChangeStage,
  onUpdate
}) => {

  const { hasPermiso } = useAuth();
  const { confirm } = useDialog();
  const [activeRightTab, setActiveRightTab] = useState<'mensaje' | 'nota' | 'actividad'>('nota');
  const [noteText, setNoteText] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailFrom, setEmailFrom] = useState(oportunidad.responsible?.email || '');
  const [emailTo, setEmailTo] = useState(oportunidad.email || '');
  const [activityType, setActivityType] = useState('Reunión');
  const [activityDate, setActivityDate] = useState('');
  const [isCreatingPresupuesto, setIsCreatingPresupuesto] = useState(false);
  const [changingStageId, setChangingStageId] = useState<string | null>(null);
  const [expandedEmailId, setExpandedEmailId] = useState<number | null>(null);
  const [generateMeet, setGenerateMeet] = useState(true);
  const [activityTitle, setActivityTitle] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  
  // PDF Generation states
  const [loadingPDFId, setLoadingPDFId] = useState<number | null>(null);
  const [successPDFId, setSuccessPDFId] = useState<number | null>(null);

  // Collaborators states
  const [localColaboradores, setLocalColaboradores] = useState<{ id: number; nombre: string; apellido: string; email: string }[]>(() => {
    if (Array.isArray((oportunidad as any).colaboradores)) return (oportunidad as any).colaboradores;
    return [];
  });
  const [showColaboradorDropdown, setShowColaboradorDropdown] = useState(false);
  const [allUsers, setAllUsers] = useState<{ id: number; nombre: string; apellido: string; email: string }[]>([]);

  // Inline editing states
  const [editingField, setEditingField] = useState<'name' | 'mercado_potencial' | 'probabilidad' | 'cierre' | 'etiquetas' | 'contactName' | 'contactEmail' | 'contactPhone' | null>(null);
  const [editName, setEditName] = useState<string>(oportunidad.product || '');
  const [editTipoUnidad, setEditTipoUnidad] = useState<string>(oportunidad.tipo_unidad ? String(oportunidad.tipo_unidad) : '');
  const [editCantidadUnidad, setEditCantidadUnidad] = useState<string>(oportunidad.cantidad_unidad ? String(oportunidad.cantidad_unidad) : '');
  const [editIngreso, setEditIngreso] = useState<string>(oportunidad.value ? oportunidad.value.replace(/[^0-9.,]/g, '') : '');
  const [editMontoUnidad, setEditMontoUnidad] = useState<string>(oportunidad.monto_unidad ? String(oportunidad.monto_unidad) : '');
  const [editUbUsdAno, setEditUbUsdAno] = useState<string>(oportunidad.ub_usd_ano ? String(oportunidad.ub_usd_ano) : '');
  
  const [editProbabilidad, setEditProbabilidad] = useState<string>(oportunidad.probabilidad !== undefined && oportunidad.probabilidad !== null ? String(oportunidad.probabilidad) : String((oportunidad.stars || 1) * 33.3));
  const [editCierre, setEditCierre] = useState<string>(oportunidad.fecha_cierre_esperado ? oportunidad.fecha_cierre_esperado.split('T')[0] : '');
  const [editContactName, setEditContactName] = useState(oportunidad.contactName || '');
  const [editContactEmail, setEditContactEmail] = useState(oportunidad.email || '');
  const [editContactPhone, setEditContactPhone] = useState(oportunidad.phone || '');
  const [savingContactField, setSavingContactField] = useState<string | null>(null);

  // Tag management states
  const [globalTags, setGlobalTags] = useState<{ id: string, nombre: string, color: string }[]>([]);
  const [localTags, setLocalTags] = useState<{ id: string, nombre: string, color?: string }[]>(() => {
    if (Array.isArray(oportunidad.etiquetas)) {
      if (typeof oportunidad.etiquetas[0] === 'string') {
        return oportunidad.etiquetas.map((t: any) => ({ id: Date.now().toString() + Math.random().toString(), nombre: t }));
      }
      return oportunidad.etiquetas;
    }
    return [];
  });
  const [newTagInput, setNewTagInput] = useState('');

  const COLORS = ['#f8bbd0', '#ce93d8', '#b39ddb', '#9fa8da', '#90caf9', '#81d4fa', '#80cbc4', '#a5d6a7', '#e6ee9c', '#ffe082', '#ffcc80', '#ffab91'];
  const [newTagColor, setNewTagColor] = useState(COLORS[Math.floor(Math.random() * COLORS.length)]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Activity editing & file upload states
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
  const [editActivityText, setEditActivityText] = useState<string>('');
  const [editActivityFiles, setEditActivityFiles] = useState<any[]>([]);
  const [isUploadingActivityFile, setIsUploadingActivityFile] = useState(false);
  const [newActivityFiles, setNewActivityFiles] = useState<any[]>([]);
  const [isUploadingNewFile, setIsUploadingNewFile] = useState(false);
  const URL_UPLOAD = import.meta.env.VITE_URL_UPLOAD || 'https://app.wimprove.com/files/upload';

  useEffect(() => {
    // Reset forms when oportunidad changes
    setEditName(oportunidad.product || '');
    let mp: any = {};
    if (oportunidad.mercado_potencial) {
      try { mp = JSON.parse(oportunidad.mercado_potencial); } catch(e){}
    }
    
    setEditTipoUnidad(mp.venta_kg_mes != null ? String(mp.venta_kg_mes) : '');
    setEditCantidadUnidad(mp.costo_unitario_usd_kg != null ? String(mp.costo_unitario_usd_kg) : '');
    setEditIngreso(mp.venta_usd_anio != null ? String(mp.venta_usd_anio) : (oportunidad.value ? oportunidad.value.replace(/[^0-9.,]/g, '') : ''));
    setEditMontoUnidad(mp.margen_bruto_porcentaje != null ? String(mp.margen_bruto_porcentaje) : '');
    setEditUbUsdAno(mp.utilidad_bruta_usd_anio != null ? String(mp.utilidad_bruta_usd_anio) : '');
    setEditProbabilidad(oportunidad.probabilidad !== undefined && oportunidad.probabilidad !== null ? String(oportunidad.probabilidad) : String((oportunidad.stars || 1) * 33.3));
    setEditCierre(oportunidad.fecha_cierre_esperado ? oportunidad.fecha_cierre_esperado.split('T')[0] : '');
    setEditContactName(oportunidad.contactName || '');
    setEditContactEmail(oportunidad.email || '');
    setEditContactPhone(oportunidad.phone || '');

    if (Array.isArray(oportunidad.etiquetas)) {
      if (typeof oportunidad.etiquetas[0] === 'string') {
        setLocalTags(oportunidad.etiquetas.map((t: any) => ({ id: Date.now().toString() + Math.random().toString(), nombre: t })));
      } else {
        setLocalTags(oportunidad.etiquetas);
      }
    } else {
      setLocalTags([]);
    }

    // Reset collaborators
    if (Array.isArray((oportunidad as any).colaboradores)) {
      setLocalColaboradores((oportunidad as any).colaboradores);
    } else {
      setLocalColaboradores([]);
    }
  }, [oportunidad]);



  const handleAddTag = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const tagName = newTagInput.trim();

      if (!localTags.some(t => t.nombre.toLowerCase() === tagName.toLowerCase())) {
        const updatedLocalTags = [...localTags, { id: Date.now().toString(), nombre: tagName, color: newTagColor }];
        setLocalTags(updatedLocalTags);
        oportunidad.etiquetas = updatedLocalTags;
        oportunidadesService.updateDetalles(oportunidad.id!, { etiquetas: updatedLocalTags }).catch(console.error);
      }
      setNewTagInput('');
      setEditingField(null);
      setNewTagColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
      setShowColorPicker(false);
    }
  };

  const handleSelectAutocompleteTag = (tag: any) => {
    if (!localTags.some(t => t.nombre.toLowerCase() === tag.nombre.toLowerCase())) {
      const updatedLocalTags = [...localTags, { id: tag.id, nombre: tag.nombre, color: tag.color }];
      setLocalTags(updatedLocalTags);
      oportunidad.etiquetas = updatedLocalTags;
      oportunidadesService.updateDetalles(oportunidad.id!, { etiquetas: updatedLocalTags }).catch(console.error);
    }
    setNewTagInput('');
    setEditingField(null);
    setShowColorPicker(false);
  };

  const handleRemoveTag = (tagName: string) => {
    const updatedLocalTags = localTags.filter(t => t.nombre !== tagName);
    setLocalTags(updatedLocalTags);
    oportunidad.etiquetas = updatedLocalTags;
    oportunidadesService.updateDetalles(oportunidad.id!, { etiquetas: updatedLocalTags }).catch(console.error);
  };

  const handleSaveContactField = async (field: 'contactName' | 'contactEmail' | 'contactPhone', value: string) => {
    setSavingContactField(field);
    const updatedContactData = {
      nombre: field === 'contactName' ? value : oportunidad.contactName,
      email: field === 'contactEmail' ? value : oportunidad.email,
      telefono: field === 'contactPhone' ? value : oportunidad.phone
    };
    try {
      await oportunidadesService.updateContacto(oportunidad.id!, updatedContactData);
      
      // Update local object to reflect changes immediately
      oportunidad.contactName = updatedContactData.nombre;
      oportunidad.email = updatedContactData.email;
      oportunidad.phone = updatedContactData.telefono;
      
      if (onUpdate) onUpdate();
      setEditingField(null);
    } catch (e) {
      console.error('Error saving contact field', e);
    } finally {
      setSavingContactField(null);
    }
  };

  const getTagColor = (tag: { nombre: string, color?: string }) => {
    if (tag.color) return tag.color;
    const globalTag = globalTags.find(t => t.nombre.toLowerCase() === tag.nombre.toLowerCase());
    if (globalTag) return globalTag.color;
    let hash = 0;
    for (let i = 0; i < tag.nombre.length; i++) hash = tag.nombre.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 85%)`;
  };

  // Close collaborator dropdown on outside click — handled by backdrop overlay

  // Contact Selection states
  const [showContactModal, setShowContactModal] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [orgContacts, setOrgContacts] = useState<any[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactCargo, setNewContactCargo] = useState('');

  // Meeting edit state
  const [editingMeetId, setEditingMeetId] = useState<string | null>(null);
  const [editMeetSummary, setEditMeetSummary] = useState('');
  const [editMeetDescription, setEditMeetDescription] = useState('');
  const [isUpdatingMeet, setIsUpdatingMeet] = useState(false);
  const [isOportunidadCalendarOpen, setIsOportunidadCalendarOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // Presupuesto editing
  const [editingPresupuesto, setEditingPresupuesto] = useState<{ activityId: number; data: any } | null>(null);

  // Real state for activity feed
  const [activities, setActivities] = useState<Seguimiento[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [oportunidad.id]);

  const loadActivities = async () => {
    if (!oportunidad.id) return;
    if (!hasPermiso('oportunidades.seguimientos.ver')) return;
    try {
      setIsLoadingActivities(true);
      const data = await oportunidadesService.getOportunidadDetailData(oportunidad.id);
      setActivities(data.seguimientos || []);
      setAllUsers(data.users || []);
      setGlobalTags(data.etiquetas || []);
    } catch (e) {
      console.error('Error loading detail data:', e);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const currentColumn = columnsList.find(c => c.id === currentColumnId);

  const isActionDisabled = () => {
    if (!oportunidad.id) return true;
    if (activeRightTab === 'nota' && !noteText.trim()) return true;
    if (activeRightTab === 'mensaje' && (!noteText.trim() || !emailSubject.trim() || !emailFrom.trim().toLowerCase().endsWith('@wimprove.com') || !emailTo.trim())) return true;
    if (activeRightTab === 'actividad') {
      if (activityType === 'Reunión' && (!activityDate || !activityTitle.trim())) return true;
      if (activityType === 'Otro' && (!activityDate || !noteText.trim())) return true;
      if (activityType !== 'Reunión' && activityType !== 'Otro' && !activityDate && !noteText.trim() && newActivityFiles.length === 0) return true;
    }
    return false;
  };

  const handleAddNote = async () => {
    if (isActionDisabled()) return;

    setIsScheduling(true);
    let contenido: any = noteText;
    let tipoStr = activeRightTab === 'mensaje' ? 'email' : activeRightTab === 'actividad' ? 'actividad' : 'nota';

    if (activeRightTab === 'nota') {
      contenido = JSON.stringify({ texto: noteText, adjuntos: newActivityFiles });
    }

    if (activeRightTab === 'mensaje') {
      const emailPayload = {
        de: emailFrom,
        para: emailTo,
        asunto: emailSubject || 'Sin asunto',
        mensaje: noteText
      };

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append('tipo_seguimiento', 'email');
        formData.append('contenido', JSON.stringify(emailPayload));
        selectedFiles.forEach(file => {
          formData.append('attachments', file);
        });

        try {
          await oportunidadesService.createSeguimiento(oportunidad.id, formData);
          setNoteText('');
          setEmailSubject('');
          setActivityDate('');
          setActivityTitle('');
          setSelectedFiles([]);
          loadActivities();
        } catch (e) {
          console.error('Error adding note:', e);
        } finally {
          setIsScheduling(false);
        }
        return;
      } else {
        contenido = JSON.stringify(emailPayload);
      }
    } else if (activeRightTab === 'actividad') {
      if (activityType === 'Reunión') {
        try {
          const startDate = activityDate ? new Date(activityDate) : new Date();
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora después

          let eventId = '';
          let meetLink = '';
          let htmlLink = '';

          if (generateMeet) {
            const meetResponse = await calendarService.createMeet({
              summary: activityTitle || `Reunión: ${oportunidad.name}`,
              description: noteText,
              startDateTime: startDate.toISOString()
            });
            eventId = meetResponse.eventId;
            meetLink = meetResponse.meetLink;
            htmlLink = meetResponse.eventHtmlLink;
          }

          const reunionPayload = {
            google_event_id: eventId,
            fecha_inicio: startDate.toISOString(),
            fecha_fin: endDate.toISOString(),
            meet_link: meetLink,
            html_link: htmlLink,
            summary: activityTitle || `Reunión: ${oportunidad.name}`,
            description: noteText
          };

          tipoStr = 'reunion';
          contenido = JSON.stringify(reunionPayload);
        } catch (error) {
          console.error('Error scheduling meeting:', error);
          alert('Hubo un error al generar la reunión. Inténtalo de nuevo.');
          setIsScheduling(false);
          return;
        }
      } else {
        const text = `[${activityType}] ${activityDate ? 'Programado para: ' + activityDate + '\n\n' : ''}${noteText}`;
        contenido = JSON.stringify({ texto: text, adjuntos: newActivityFiles });
      }
    }

    try {
      await oportunidadesService.createSeguimiento(oportunidad.id, {
        tipo_seguimiento: tipoStr,
        contenido: contenido
      });
      setNoteText('');
      setEmailSubject('');
      setActivityDate('');
      setActivityTitle('');
      setSelectedFiles([]);
      setNewActivityFiles([]);
      loadActivities();
    } catch (e) {
      console.error('Error adding note:', e);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDeleteMeet = async (eventId: string) => {
    const isConfirmed = await confirm({
      title: 'Eliminar Reunión',
      message: '¿Estás seguro de que deseas eliminar esta reunión? Se borrará también de tu calendario de Google.',
      confirmText: 'Sí, Eliminar'
    });
    if (!isConfirmed) {
      return;
    }

    try {
      await calendarService.deleteMeet(eventId);
      loadActivities();
    } catch (e) {
      console.error('Error eliminando la reunión:', e);
      alert('Hubo un error al intentar eliminar la reunión.');
    }
  };

  const handleUpdateMeet = async (eventId: string) => {
    setIsUpdatingMeet(true);
    try {
      await calendarService.updateMeet(eventId, {
        summary: editMeetSummary,
        description: editMeetDescription
      });
      setEditingMeetId(null);
      loadActivities();
    } catch (e) {
      console.error('Error actualizando la reunión:', e);
      alert('Hubo un error al intentar actualizar la reunión.');
    } finally {
      setIsUpdatingMeet(false);
    }
  };

  const handleStageChange = async (colId: string) => {
    if (colId === currentColumnId || changingStageId) return;
    setChangingStageId(colId);
    try {
      await onChangeStage(colId);
    } finally {
      setChangingStageId(null);
    }
  };

  const handleUpdatePriority = async (stars: number) => {
    if (!oportunidad.id) return;
    try {
      await oportunidadesService.updatePrioridad(oportunidad.id, stars);
      oportunidad.stars = stars;
      setChangingStageId('stars_update_' + Date.now());
      setTimeout(() => setChangingStageId(null), 10);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExpandEmail = async (activity: any) => {
    const isExpanding = expandedEmailId !== activity.id;
    setExpandedEmailId(isExpanding ? activity.id! : null);

    if (isExpanding && activity.tipo_seguimiento === 'email') {
      try {
        const contenido = JSON.parse(activity.contenido || '{}');
        if (contenido.leido === false) {
          await oportunidadesService.markSeguimientoAsRead(activity.id);
          // Update locally
          setActivities(prev => prev.map(a => {
            if (a.id === activity.id) {
              const newContenido = JSON.parse(a.contenido || '{}');
              newContenido.leido = true;
              return { ...a, contenido: JSON.stringify(newContenido) };
            }
            return a;
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleChangeAssignee = async (userId: number) => {
    if (!oportunidad.id) return;
    try {
      // Optistic UI
      const users = await userService.getAllUsers();
      const newAssignee = users.find((u: any) => u.id === userId);
      if (newAssignee) {
        oportunidad.responsible = {
          id: newAssignee.id,
          name: `${newAssignee.nombre} ${newAssignee.apellido}`,
          email: newAssignee.email
        };
        setChangingStageId('assignee_update_' + Date.now());
        setTimeout(() => setChangingStageId(null), 10);
      }

      await oportunidadesService.reassign(oportunidad.id, userId);
    } catch (e) {
      console.error('Error changing assignee', e);
    }
  };

  const saveDetalles = async (field: 'mercado_potencial' | 'probabilidad' | 'cierre') => {
    if (!oportunidad.id) return;
    try {
      const data: any = {};
      if (field === 'mercado_potencial') {
        const mp = {
          venta_kg_mes: editTipoUnidad ? parseFloat(editTipoUnidad) : null,
          costo_unitario_usd_kg: editCantidadUnidad ? parseFloat(editCantidadUnidad) : null,
          venta_usd_anio: parseFloat(editIngreso) || 0,
          margen_bruto_porcentaje: editMontoUnidad ? parseFloat(editMontoUnidad) : null,
          utilidad_bruta_usd_anio: editUbUsdAno ? parseFloat(editUbUsdAno) : null
        };
        data.mercado_potencial = JSON.stringify(mp);
        oportunidad.mercado_potencial = data.mercado_potencial;
        oportunidad.value = String(mp.venta_usd_anio);
      }
      if (field === 'probabilidad') {
        data.probabilidad = parseFloat(editProbabilidad) || 0;
        oportunidad.probabilidad = data.probabilidad;
      }
      if (field === 'cierre') {
        data.fecha_cierre_esperado = editCierre || null;
        oportunidad.fecha_cierre_esperado = data.fecha_cierre_esperado;
      }

      // Close immediately for optimistic UI
      setEditingField(null);

      await oportunidadesService.updateDetalles(oportunidad.id, data);
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error('Error updating details:', e);
    }
  };

  const startEditActivity = (activity: Seguimiento) => {
    setEditingActivityId(activity.id!);
    try {
      const parsed = JSON.parse(activity.contenido || '');
      if (typeof parsed === 'object' && parsed !== null) {
        setEditActivityText(parsed.texto || parsed.description || '');
        setEditActivityFiles(Array.isArray(parsed.adjuntos) ? parsed.adjuntos : []);
      } else {
        setEditActivityText(typeof activity.contenido === 'string' ? activity.contenido : '');
        setEditActivityFiles([]);
      }
    } catch {
      setEditActivityText(typeof activity.contenido === 'string' ? activity.contenido : '');
      setEditActivityFiles([]);
    }
  };

  const uploadActivityFile = async (file: File): Promise<{url: string, name: string} | null> => {
    setIsUploadingActivityFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(URL_UPLOAD, { method: 'POST', body: formData });
      const json = await response.json();
      return json?.file?.RutaUrl ? { url: json.file.RutaUrl, name: file.name } : null;
    } catch (e) {
      console.error('Error uploading file:', e);
      return null;
    } finally {
      setIsUploadingActivityFile(false);
    }
  };

  const saveActivityEdit = async (activityId: number) => {
    const contenido = JSON.stringify({ texto: editActivityText, adjuntos: editActivityFiles });
    try {
      await oportunidadesService.updateSeguimiento(activityId, contenido);
      setActivities(prev => prev.map(a => a.id === activityId ? { ...a, contenido } : a));
      setEditingActivityId(null);
    } catch (e) {
      console.error('Error saving activity edit:', e);
    }
  };

  const handleDeleteActivity = async (activityId: number) => {
    const isConfirmed = await confirm({
      title: 'Eliminar Actividad',
      message: '¿Estás seguro de que deseas eliminar esta actividad?',
      confirmText: 'Sí, Eliminar'
    });
    if (!isConfirmed) return;
    try {
      await oportunidadesService.deleteSeguimiento(activityId);
      setActivities(prev => prev.filter(a => a.id !== activityId));
    } catch (e) {
      console.error('Error eliminando actividad:', e);
    }
  };


  const saveContactoData = async (field: 'product') => {
    if (!oportunidad.id) return;
    try {
      if (field === 'product') {
        oportunidad.product = editName; // We keep product property mapped internally in frontend
        setEditingField(null);
        await oportunidadesService.updateNombre(oportunidad.id, editName);
        if (onUpdate) onUpdate();
      }
    } catch (e) {
      console.error('Error updating name:', e);
    }
  };

  const openContactModal = async () => {
    setShowContactModal(true);
    setIsLoadingContacts(true);
    setOrgContacts([]);
    if (!oportunidad.organizacion_id) {
      setIsLoadingContacts(false);
      return;
    }
    try {
      const orgs = await organizacionService.getOrganizaciones();
      const org = orgs.find((o: any) => o.id === oportunidad.organizacion_id);
      if (org && org.contactos) {
        setOrgContacts(org.contactos);
      }
    } catch (e) {
      console.error('Error fetching org contacts', e);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const selectContact = async (contact: any) => {
    if (!oportunidad.id) return;
    try {
      const updatedData = { ...contact, product: oportunidad.product };
      await oportunidadesService.updateContacto(oportunidad.id, updatedData);
      oportunidad.email = contact.email;
      oportunidad.phone = contact.telefono || contact.phone;
      oportunidad.contactName = contact.nombre;
      oportunidad.contacto_data = updatedData;
      setShowContactModal(false);
    } catch (e) {
      console.error('Error updating contact', e);
    }
  };

  const saveNewContact = async () => {
    if (!oportunidad.id || !oportunidad.organizacion_id) return;
    try {
      // 1. Add to org contacts
      const orgs = await organizacionService.getOrganizaciones();
      const org = orgs.find((o: any) => o.id === oportunidad.organizacion_id);
      if (!org) return;

      const newContact = { email: newContactEmail, phone: newContactPhone, nombre: newContactName, cargo: newContactCargo, product: '' };
      const updatedContacts = [...(org.contactos || []), newContact];

      await organizacionService.updateOrganizacion(org.id, {
        perfil: org.perfil,
        contactos: updatedContacts
      });

      // 2. Select it
      await selectContact(newContact);

      setNewContactEmail('');
      setNewContactPhone('');
      setNewContactName('');
      setNewContactCargo('');
      setIsAddingContact(false);
    } catch (e) {
      console.error('Error adding new contact', e);
    }
  };

  if (isCreatingPresupuesto) {
    return (
      <PresupuestoForm
        oportunidad={oportunidad}
        onDiscard={() => setIsCreatingPresupuesto(false)}
        onSave={async (data: any) => {
          try {
            await oportunidadesService.createSeguimiento(Number(oportunidad.id), {
              tipo_seguimiento: 'presupuesto',
              contenido: JSON.stringify(data)
            });
            await loadActivities();
            setIsCreatingPresupuesto(false);
          } catch (error) {
            console.error("Error al guardar presupuesto:", error);
            alert("Error al guardar presupuesto");
          }
        }}
      />
    );
  }

  // Show edit form when editing a presupuesto
  if (editingPresupuesto) {
    return (
      <PresupuestoForm
        oportunidad={oportunidad}
        initialData={editingPresupuesto.data}
        onDiscard={() => setEditingPresupuesto(null)}
        onSave={async (data: any) => {
          try {
            await oportunidadesService.updateSeguimiento(editingPresupuesto.activityId, JSON.stringify(data));
            await loadActivities();
            setEditingPresupuesto(null);
          } catch (error) {
            console.error("Error al actualizar presupuesto:", error);
            alert("Error al actualizar presupuesto");
          }
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0 bg-surface flex flex-col overflow-hidden border-b border-border-subtle">

      {/* Ribbon for status (Odoo style) */}
      {currentColumn && (
        <div className="absolute -right-12 top-10 rotate-45 z-20">
          <div className={`${currentColumn.colorClass} text-white font-bold text-[13px] py-1.5 w-48 text-center uppercase tracking-widest shadow-md`}>
            {currentColumn.title}
          </div>
        </div>
      )}

      {/* Top Actions Bar */}
      <div className="flex items-center justify-between border-b border-border-subtle p-3 px-6 bg-surface-tint">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="flex items-center gap-1 text-white/90 hover:text-white transition-colors text-[13px] font-bold mr-4">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Volver
          </button>
          <div className="h-6 w-px bg-white/20 mr-2 hidden sm:block"></div>
          {hasPermiso('oportunidades.eliminar') && (
            <button
              onClick={async () => {
                const isConfirmed = await confirm({
                  title: 'Eliminar Oportunidad',
                  message: '¿Estás seguro de que deseas eliminar esta oportunidad? Esta acción no se puede deshacer y borrará todo el historial.',
                  confirmText: 'Sí, Eliminar'
                });
                if (isConfirmed) {
                  try {
                    await oportunidadesService.deleteOportunidad(oportunidad.id!);
                    window.location.reload(); // Quick way to refresh the view
                  } catch (e) {
                    console.error('Error al eliminar:', e);
                    alert('Hubo un error al eliminar la oportunidad.');
                  }
                }
              }}
              className="text-white/80 text-[13px] font-bold px-3 py-1.5 rounded hover:bg-status-pp/80 hover:text-white transition-colors mr-2"
              title="Eliminar Oportunidad"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          )}
          {hasPermiso('oportunidades.seguimientos.crear') && (
            <button
              className="bg-primary text-white text-[13px] font-bold px-4 py-1.5 rounded hover:bg-primary-hover transition-colors uppercase tracking-wide"
              onClick={() => setIsCreatingPresupuesto(true)}
            >
              Nuevo presupuesto
            </button>
          )}
          {hasPermiso('oportunidades.editar') && (
            <>
              <button
                className="text-white/80 text-[13px] font-bold px-4 py-1.5 rounded hover:bg-white/10 hover:text-white transition-colors uppercase tracking-wide"
                onClick={() => alert("Marcar como Ganado")}
              >
                Ganado
              </button>
              <button
                className="text-white/80 text-[13px] font-bold px-4 py-1.5 rounded hover:bg-white/10 hover:text-white transition-colors uppercase tracking-wide"
                onClick={() => alert("Marcar como Perdido")}
              >
                Perdido
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden bg-surface">

        {/* Left Column - Details */}
        <div className="w-full md:w-3/5 p-6 overflow-y-auto relative">

          {/* Stat Buttons Container */}
          <div className="absolute top-6 right-6 flex border border-border-subtle rounded divide-x divide-border-subtle bg-surface shadow-sm z-10">
            <button
              onClick={() => setIsOportunidadCalendarOpen(true)}
              className="flex flex-col items-center justify-center px-4 py-1.5 hover:bg-surface-muted transition-colors min-w-[90px]"
            >
              <div className="flex items-center gap-1 text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-primary">event</span>
                <span className="font-bold text-[14px]">
                  {activities.filter(a => a.tipo_seguimiento === 'reunion').length}
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant">Reuniones</span>
            </button>
            <button className="flex flex-col items-center justify-center px-4 py-1.5 hover:bg-surface-muted transition-colors min-w-[90px]">
              <div className="flex items-center gap-1 text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-primary">request_quote</span>
                <span className="font-bold text-[14px]">{activities.filter(a => a.tipo_seguimiento === 'presupuesto').length}</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">Presupuestos</span>
            </button>
          </div>

          <div className="mb-8 mt-2 md:mt-0">
            {editingField === 'name' ? (
              <input
                type="text"
                className="text-3xl font-display font-bold text-on-surface mb-6 pr-40 border-b-2 border-primary outline-none bg-transparent w-full"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={() => saveContactoData('product')}
                onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                autoFocus
              />
            ) : (
              <h1
                className={`text-3xl font-display font-bold text-on-surface mb-6 pr-40 transition-colors group flex items-center gap-2 ${hasPermiso('oportunidades.editar') ? 'cursor-pointer hover:text-primary' : ''}`}
                onClick={() => hasPermiso('oportunidades.editar') && setEditingField('name')}
              >
                {oportunidad.product}
                {hasPermiso('oportunidades.editar') && <span className="material-symbols-outlined text-[20px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">edit</span>}
              </h1>
            )}

            <div className="flex flex-col gap-y-8">
              {/* Sección Oportunidad y Organización */}
              <div>
                <div className="border-b border-border-subtle pb-2 mb-4">
                  <h3 className="text-[11px] font-label-caps text-outline uppercase font-bold tracking-wider">Oportunidad y Organización</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[12px] font-bold text-on-surface-variant block mb-1">Organización</label>
                      <p className="text-[13px] text-on-surface font-bold cursor-pointer hover:text-primary transition-colors">{oportunidad.name}</p>
                    </div>
                    <div className="col-span-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[12px] font-bold text-on-surface-variant block">Mercado potencial</label>
                        {!hasPermiso('oportunidades.editar') ? null : (
                          <button
                            type="button"
                            onClick={() => {
                              if (editingField === 'mercado_potencial') saveDetalles('mercado_potencial');
                              else setEditingField('mercado_potencial');
                            }}
                            className="text-[12px] text-primary hover:underline font-bold flex items-center gap-1"
                          >
                            {editingField === 'mercado_potencial' ? (
                              <><span className="material-symbols-outlined text-[14px]">save</span> Guardar</>
                            ) : (
                              <><span className="material-symbols-outlined text-[14px]">edit</span> Editar</>
                            )}
                          </button>
                        )}
                      </div>
                      
                      <div className="text-xl font-bold text-on-surface mt-2">
                        {editingField === 'mercado_potencial' ? (
                          <div className="space-y-4">
                            {/* Venta Kg/mes, CU USD/Kg, Venta USD/año (Agrupados) */}
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <span className="text-[11px] text-on-surface font-bold bg-surface-muted border border-border-subtle p-1 px-2 w-32 shrink-0">Venta, Kg/mes</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editTipoUnidad}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditTipoUnidad(val);
                                    if (val && editCantidadUnidad) {
                                      const venta = parseFloat(val) * parseFloat(editCantidadUnidad) * 12;
                                      setEditIngreso(String(venta));
                                      if (editMontoUnidad) setEditUbUsdAno(String(venta * parseFloat(editMontoUnidad) / 100));
                                    }
                                  }}
                                  className="flex-1 border border-l-0 border-border-subtle p-1 px-2 text-[12px] outline-none focus:border-primary bg-[#ffffcc] font-normal"
                                />
                              </div>
                              <div className="flex items-center">
                                <span className="text-[11px] text-on-surface font-bold bg-surface-muted border border-border-subtle p-1 px-2 w-32 shrink-0">C.U., USD/Kg</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editCantidadUnidad}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditCantidadUnidad(val);
                                    if (editTipoUnidad && val) {
                                      const venta = parseFloat(editTipoUnidad) * parseFloat(val) * 12;
                                      setEditIngreso(String(venta));
                                      if (editMontoUnidad) setEditUbUsdAno(String(venta * parseFloat(editMontoUnidad) / 100));
                                    }
                                  }}
                                  className="flex-1 border border-l-0 border-border-subtle p-1 px-2 text-[12px] outline-none focus:border-primary bg-[#ffffcc] font-normal"
                                />
                              </div>
                              <div className="flex items-center">
                                <span className="text-[11px] text-on-surface font-bold bg-surface-muted border border-border-subtle p-1 px-2 w-32 shrink-0">Venta, USD/año</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editIngreso}
                                  onChange={(e) => {
                                    setEditIngreso(e.target.value);
                                    if (e.target.value && editMontoUnidad) {
                                      setEditUbUsdAno(String(parseFloat(e.target.value) * parseFloat(editMontoUnidad) / 100));
                                    }
                                  }}
                                  className="flex-1 border border-l-0 border-border-subtle p-1 px-2 text-[12px] outline-none bg-white font-normal"
                                />
                              </div>
                            </div>

                            {/* Margen bruto y UB separados */}
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <span className="text-[11px] text-on-surface font-bold bg-surface-muted border border-border-subtle p-1 px-2 w-32 shrink-0">Margen bruto, %</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editMontoUnidad}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditMontoUnidad(val);
                                    if (editIngreso && val) {
                                      setEditUbUsdAno(String(parseFloat(editIngreso) * parseFloat(val) / 100));
                                    }
                                  }}
                                  className="flex-1 border border-l-0 border-border-subtle p-1 px-2 text-[12px] outline-none focus:border-primary bg-[#ffffcc] font-normal"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center">
                                <span className="text-[11px] text-on-surface font-bold bg-surface-muted border border-border-subtle p-1 px-2 w-32 shrink-0">U.B., USD/año</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editUbUsdAno}
                                  onChange={(e) => setEditUbUsdAno(e.target.value)}
                                  className="flex-1 border border-l-0 border-border-subtle p-1 px-2 text-[12px] outline-none bg-white font-normal"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <span className="text-[11px] text-on-surface font-bold bg-surface-muted border border-border-subtle p-1 px-2 w-32 shrink-0">Venta, Kg/mes</span>
                                <div className="flex-1 border border-l-0 border-border-subtle p-1 px-2 text-[12px] bg-white font-normal text-on-surface-variant">
                                  {(() => {
                                    try {
                                      const mp = JSON.parse(oportunidad.mercado_potencial || '{}');
                                      return mp.venta_kg_mes != null ? Number(mp.venta_kg_mes).toLocaleString() : '-';
                                    } catch(e) { return '-'; }
                                  })()}
                                </div>
                              </div>
                              <div className="flex items-center">
                                <span className="text-[11px] text-on-surface font-bold bg-surface-muted border border-border-subtle p-1 px-2 w-32 shrink-0">C.U., USD/Kg</span>
                                <div className="flex-1 border border-l-0 border-border-subtle p-1 px-2 text-[12px] bg-white font-normal text-on-surface-variant">
                                  {(() => {
                                    try {
                                      const mp = JSON.parse(oportunidad.mercado_potencial || '{}');
                                      return mp.costo_unitario_usd_kg != null ? Number(mp.costo_unitario_usd_kg).toLocaleString(undefined, {minimumFractionDigits: 2}) : '-';
                                    } catch(e) { return '-'; }
                                  })()}
                                </div>
                              </div>
                              <div className="flex items-center">
                                <span className="text-[11px] text-on-surface font-bold bg-surface-muted border border-border-subtle p-1 px-2 w-32 shrink-0">Venta, USD/año</span>
                                <div className="flex-1 border border-l-0 border-border-subtle p-1 px-2 text-[12px] bg-white font-bold text-on-surface">
                                  {(() => {
                                    try {
                                      const mp = JSON.parse(oportunidad.mercado_potencial || '{}');
                                      return mp.venta_usd_anio != null ? Number(mp.venta_usd_anio).toLocaleString(undefined, {minimumFractionDigits: 2}) : '-';
                                    } catch(e) { return '-'; }
                                  })()}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center">
                                <span className="text-[11px] text-on-surface font-bold bg-surface-muted border border-border-subtle p-1 px-2 w-32 shrink-0">Margen bruto, %</span>
                                <div className="flex-1 border border-l-0 border-border-subtle p-1 px-2 text-[12px] bg-white font-normal text-on-surface-variant">
                                  {(() => {
                                    try {
                                      const mp = JSON.parse(oportunidad.mercado_potencial || '{}');
                                      return mp.margen_bruto_porcentaje != null ? `${Number(mp.margen_bruto_porcentaje)}%` : '-';
                                    } catch(e) { return '-'; }
                                  })()}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center">
                                <span className="text-[11px] text-on-surface font-bold bg-surface-muted border border-border-subtle p-1 px-2 w-32 shrink-0">U.B., USD/año</span>
                                <div className="flex-1 border border-l-0 border-border-subtle p-1 px-2 text-[12px] bg-white font-bold text-on-surface">
                                  {(() => {
                                    try {
                                      const mp = JSON.parse(oportunidad.mercado_potencial || '{}');
                                      return mp.utilidad_bruta_usd_anio != null ? Number(mp.utilidad_bruta_usd_anio).toLocaleString(undefined, {minimumFractionDigits: 2}) : '-';
                                    } catch(e) { return '-'; }
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-on-surface-variant block mb-1">Vendedor</label>
                      <div className="flex items-center gap-2">
                        {hasPermiso('oportunidades.asignar_vendedor') ? (
                          <UserSelector 
                            selectedUserId={oportunidad.responsible.id} 
                            onSelect={handleChangeAssignee} 
                            usersList={allUsers}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[14px] uppercase shadow-sm shrink-0">
                            {oportunidad.responsible.name?.charAt(0)}
                          </div>
                        )}
                        <span className="text-[13px] text-on-surface">{oportunidad.responsible.name}</span>
                      </div>
                    </div>

                    {/* Colaboradores */}
                    <div>
                      <label className="text-[12px] font-bold text-on-surface-variant block mb-1">Colaboradores</label>
                      <div className="flex flex-wrap items-center gap-1.5 relative">
                        {localColaboradores.map(colab => (
                          <div key={colab.id} className="group relative">
                            <div
                              title={`${colab.nombre} ${colab.apellido}`}
                              className="w-7 h-7 rounded-full bg-[#6366f1] text-white flex items-center justify-center font-bold text-[11px] uppercase shadow-sm"
                            >
                              {colab.nombre?.charAt(0)}{colab.apellido?.charAt(0)}
                            </div>
                            {hasPermiso('oportunidades.asignar_colaborador') && (
                              <button
                                onClick={() => {
                                  const updated = localColaboradores.filter(c => c.id !== colab.id);
                                  setLocalColaboradores(updated);
                                  (oportunidad as any).colaboradores = updated;
                                  oportunidadesService.updateColaboradores(oportunidad.id!, updated).catch(console.error);
                                }}
                                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white rounded-full items-center justify-center text-[8px] hidden group-hover:flex shadow-sm transition-all"
                                title="Quitar colaborador"
                              >
                                <span className="material-symbols-outlined text-[10px]">close</span>
                              </button>
                            )}
                          </div>
                        ))}

                        {/* Add collaborator button */}
                        {hasPermiso('oportunidades.asignar_colaborador') && (
                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowColaboradorDropdown(!showColaboradorDropdown); }}
                              className="w-7 h-7 rounded-full border-2 border-dashed border-on-surface-variant/40 text-on-surface-variant hover:border-[#6366f1] hover:text-[#6366f1] flex items-center justify-center transition-colors"
                              title="Añadir colaborador"
                          >
                            <span className="material-symbols-outlined text-[16px]">person_add</span>
                          </button>

                          {showColaboradorDropdown && (
                            <>
                              {/* Transparent backdrop to close on outside click */}
                              <div
                                className="fixed inset-0 z-40"
                                onClick={(e) => { e.stopPropagation(); setShowColaboradorDropdown(false); }}
                              />
                              <div className="absolute left-0 top-full mt-2 w-52 bg-surface border border-border-subtle rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                                <div className="p-2 border-b border-border-subtle bg-surface-muted text-[11px] font-bold text-on-surface-variant sticky top-0">
                                  Añadir colaborador
                                </div>
                                {allUsers
                                  .filter(u =>
                                    u.id !== oportunidad.responsible.id &&
                                    !localColaboradores.some(c => c.id === u.id)
                                  )
                                  .map(user => (
                                    <button
                                      key={user.id}
                                      type="button"
                                      className="w-full text-left px-3 py-2 text-[12px] hover:bg-surface-muted transition-colors flex items-center gap-2"
                                      onClick={() => {
                                        const newColab = { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email };
                                        const updated = [...localColaboradores, newColab];
                                        setLocalColaboradores(updated);
                                        (oportunidad as any).colaboradores = updated;
                                        oportunidadesService.updateColaboradores(oportunidad.id!, updated).catch(console.error);
                                        setShowColaboradorDropdown(false);
                                      }}
                                    >
                                      <div className="w-6 h-6 rounded-full bg-[#6366f1]/10 text-[#6366f1] flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                                        {user.nombre?.charAt(0)}
                                      </div>
                                      <span className="font-bold text-on-surface truncate">{user.nombre} {user.apellido}</span>
                                    </button>
                                  ))}
                                {allUsers.filter(u => u.id !== oportunidad.responsible.id && !localColaboradores.some(c => c.id === u.id)).length === 0 && (
                                  <p className="text-[11px] text-on-surface-variant italic text-center py-3">Todos los usuarios ya son colaboradores.</p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        )}

                        {localColaboradores.length === 0 && !showColaboradorDropdown && (
                          <span className="text-[12px] text-on-surface-variant/60 italic">Sin colaboradores</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[12px] font-bold text-on-surface-variant block mb-1">CAP: Captación Anual del Potencial</label>
                      <div className="text-[14px] text-on-surface flex items-center gap-2">
                        {editingField === 'probabilidad' ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.01"
                              className="border border-primary rounded px-2 py-1 outline-none text-[13px] w-20"
                              value={editProbabilidad}
                              onChange={e => setEditProbabilidad(e.target.value)}
                              onBlur={() => saveDetalles('probabilidad')}
                              onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                              autoFocus
                            />
                            <span>%</span>
                          </div>
                        ) : (
                          <div className={`flex items-center gap-2 group ${hasPermiso('oportunidades.editar') ? 'cursor-pointer' : ''}`} onClick={() => hasPermiso('oportunidades.editar') && setEditingField('probabilidad')}>
                            <span className="mr-1">en</span>
                            <span className="font-bold border-b border-border-subtle pb-0.5">
                              {oportunidad.probabilidad !== undefined && oportunidad.probabilidad !== null
                                ? Number(oportunidad.probabilidad).toFixed(2)
                                : ((oportunidad.stars || 1) * 33.3).toFixed(2)}%
                            </span>
                            {hasPermiso('oportunidades.editar') && <span className="material-symbols-outlined text-[16px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">edit</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-on-surface-variant block mb-1">Valor CAP</label>
                      <div className="text-[14px] text-on-surface">
                        USD {((parseFloat(editIngreso || '0') || 0) * (parseFloat(editProbabilidad || '0') || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-on-surface-variant block mb-1">Cierre esperado</label>
                      <div className="flex items-center gap-2">
                        {editingField === 'cierre' ? (
                          <div>
                            <input
                              type="date"
                              className="border border-primary rounded px-2 py-1 outline-none text-[13px] w-32"
                              value={editCierre}
                              onChange={e => setEditCierre(e.target.value)}
                              onBlur={() => saveDetalles('cierre')}
                              onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className={`flex items-center gap-2 group ${hasPermiso('oportunidades.editar') ? 'cursor-pointer' : ''}`} onClick={() => hasPermiso('oportunidades.editar') && setEditingField('cierre')}>
                            <p className="text-[13px] text-on-surface">{oportunidad.fecha_cierre_esperado ? new Date(oportunidad.fecha_cierre_esperado).toLocaleDateString() : '—'}</p>
                            {hasPermiso('oportunidades.editar') && <span className="material-symbols-outlined text-[16px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">edit</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-on-surface-variant block mb-1">Prioridad</label>
                      <div className={`flex items-center text-status-ip ${hasPermiso('oportunidades.editar') ? 'cursor-pointer' : ''}`}>
                        {[1, 2, 3, 4, 5].map(star => {
                          const isFilled = oportunidad.stars && oportunidad.stars >= star;
                          return (
                            <span
                              key={star}
                              onClick={() => hasPermiso('oportunidades.editar') && handleUpdatePriority(star)}
                              style={isFilled ? { fontVariationSettings: "'FILL' 1" } : {}}
                              className={`material-symbols-outlined text-[18px] transition-colors ${isFilled ? 'text-primary' : 'text-outline hover:text-primary/50'}`}>
                              star
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-on-surface-variant block mb-1">Etiquetas</label>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1 flex-wrap min-h-[24px]">
                          {oportunidad.volume !== '0' && <span className="bg-surface-muted px-2 py-0.5 rounded text-[11px] text-on-surface-variant flex items-center">{oportunidad.volume} kg</span>}
                          {oportunidad.periodicity !== 'Por definir' && oportunidad.periodicity !== 'N/A' && <span className="bg-primary/10 px-2 py-0.5 rounded text-[11px] text-primary flex items-center">{oportunidad.periodicity}</span>}

                          {localTags.map(tagObj => {
                            return (
                              <span key={tagObj.id} style={{ backgroundColor: getTagColor(tagObj) }} className="px-2 py-0.5 rounded text-[11px] text-on-surface flex items-center gap-1 shadow-sm font-bold">
                                {tagObj.nombre}
                                {hasPermiso('oportunidades.editar') && <span className="material-symbols-outlined text-[10px] cursor-pointer hover:text-black/50" onClick={() => handleRemoveTag(tagObj.nombre)}>close</span>}
                              </span>
                            );
                          })}

                          {editingField !== 'etiquetas' ? (
                            hasPermiso('oportunidades.editar') && (
                              <button onClick={() => setEditingField('etiquetas')} className="text-[11px] text-primary hover:bg-primary/10 px-2 py-0.5 rounded border border-dashed border-primary transition-colors flex items-center">
                                + Añadir
                              </button>
                            )
                          ) : (
                            <div className="relative flex items-center gap-1">
                              <div className="relative flex items-center">
                                <input
                                  type="text"
                                  className="border border-primary rounded pl-2 pr-6 py-0.5 outline-none text-[11px] w-28"
                                  placeholder="Escribe..."
                                  value={newTagInput}
                                  onChange={e => setNewTagInput(e.target.value)}
                                  onKeyDown={e => {
                                    handleAddTag(e);
                                    if (e.key === 'Escape') {
                                      setEditingField(null);
                                      setShowColorPicker(false);
                                      setNewTagInput('');
                                    }
                                  }}
                                  onBlur={() => {
                                    setEditingField(null);
                                    setShowColorPicker(false);
                                    setNewTagInput('');
                                  }}
                                  autoFocus
                                />
                                <div
                                  className="absolute right-1 w-4 h-4 rounded-full border border-border-subtle cursor-pointer hover:scale-110 transition-transform"
                                  style={{ backgroundColor: newTagColor }}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => setShowColorPicker(!showColorPicker)}
                                ></div>
                              </div>

                              {showColorPicker && (
                                <div className="absolute top-full right-0 mt-1 p-2 bg-surface border border-border-subtle rounded shadow-xl z-50 grid grid-cols-4 gap-1">
                                  {COLORS.map(color => (
                                    <div
                                      key={color}
                                      className={`w-5 h-5 rounded-full cursor-pointer border ${newTagColor === color ? 'border-primary scale-110' : 'border-transparent hover:scale-110'} transition-all`}
                                      style={{ backgroundColor: color }}
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => {
                                        setNewTagColor(color);
                                        setShowColorPicker(false);
                                      }}
                                    ></div>
                                  ))}
                                </div>
                              )}

                              {globalTags.filter(t => t.nombre.toLowerCase().includes(newTagInput.toLowerCase()) && !localTags.some(lt => lt.nombre === t.nombre)).length > 0 && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-surface border border-border-subtle rounded shadow-xl z-40 max-h-32 overflow-y-auto">
                                  {globalTags
                                    .filter(t => t.nombre.toLowerCase().includes(newTagInput.toLowerCase()) && !localTags.some(lt => lt.nombre === t.nombre))
                                    .map(t => (
                                      <div
                                        key={t.id}
                                        className="px-2 py-1 text-[11px] hover:bg-surface-muted cursor-pointer flex items-center gap-2"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          handleSelectAutocompleteTag(t);
                                        }}
                                      >
                                        <div className="w-3 h-3 rounded-full border border-border-subtle" style={{ backgroundColor: t.color }}></div>
                                        {t.nombre}
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección Contacto */}
              <div>
                <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-4">
                  <h3 className="text-[11px] font-label-caps text-outline uppercase font-bold tracking-wider">Datos del Contacto</h3>
                  {hasPermiso('oportunidades.editar') && (
                    <button onClick={openContactModal} className="text-[10px] text-primary hover:underline uppercase font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">swap_horiz</span> ¿Deseas Cambiar de Contacto?
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[12px] font-bold text-on-surface-variant block mb-1">Nombre de Contacto</label>
                      {editingField === 'contactName' ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            className="w-full border-border-subtle rounded text-[13px] px-2 py-1 focus:ring-1 focus:ring-primary-container disabled:opacity-50"
                            value={editContactName} 
                            disabled={savingContactField === 'contactName'}
                            onChange={e => setEditContactName(e.target.value)} 
                            onKeyDown={e => {
                              if (e.key === 'Enter' && savingContactField !== 'contactName') handleSaveContactField('contactName', editContactName);
                              if (e.key === 'Escape') { setEditingField(null); setEditContactName(oportunidad.contactName || ''); }
                            }}
                            autoFocus
                          />
                          {savingContactField === 'contactName' ? (
                            <span className="p-1 text-primary"><span className="material-symbols-outlined text-[16px] animate-spin">refresh</span></span>
                          ) : (
                            <button onClick={() => handleSaveContactField('contactName', editContactName)} className="p-1 text-primary hover:bg-primary-container rounded"><span className="material-symbols-outlined text-[16px]">check</span></button>
                          )}
                          <button onClick={() => { setEditingField(null); setEditContactName(oportunidad.contactName || ''); }} disabled={savingContactField === 'contactName'} className="p-1 text-on-surface-variant hover:bg-surface-muted rounded disabled:opacity-50"><span className="material-symbols-outlined text-[16px]">close</span></button>
                        </div>
                      ) : (
                        <p className="text-[13px] text-on-surface font-bold group flex items-center cursor-pointer" onClick={() => hasPermiso('oportunidades.editar') && setEditingField('contactName')}>
                          {oportunidad.contactName || '—'}
                          {hasPermiso('oportunidades.editar') && <span className="material-symbols-outlined text-[14px] text-on-surface-variant opacity-0 group-hover:opacity-100 ml-2">edit</span>}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-on-surface-variant block mb-1">Correo electrónico</label>
                      {editingField === 'contactEmail' ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="email" 
                            className="w-full border-border-subtle rounded text-[13px] px-2 py-1 focus:ring-1 focus:ring-primary-container disabled:opacity-50"
                            value={editContactEmail} 
                            disabled={savingContactField === 'contactEmail'}
                            onChange={e => setEditContactEmail(e.target.value)} 
                            onKeyDown={e => {
                              if (e.key === 'Enter' && savingContactField !== 'contactEmail') handleSaveContactField('contactEmail', editContactEmail);
                              if (e.key === 'Escape') { setEditingField(null); setEditContactEmail(oportunidad.email || ''); }
                            }}
                            autoFocus
                          />
                          {savingContactField === 'contactEmail' ? (
                            <span className="p-1 text-primary"><span className="material-symbols-outlined text-[16px] animate-spin">refresh</span></span>
                          ) : (
                            <button onClick={() => handleSaveContactField('contactEmail', editContactEmail)} className="p-1 text-primary hover:bg-primary-container rounded"><span className="material-symbols-outlined text-[16px]">check</span></button>
                          )}
                          <button onClick={() => { setEditingField(null); setEditContactEmail(oportunidad.email || ''); }} disabled={savingContactField === 'contactEmail'} className="p-1 text-on-surface-variant hover:bg-surface-muted rounded disabled:opacity-50"><span className="material-symbols-outlined text-[16px]">close</span></button>
                        </div>
                      ) : (
                        <p className="text-[13px] text-primary cursor-pointer group flex items-center" onClick={() => hasPermiso('oportunidades.editar') && setEditingField('contactEmail')}>
                          <span className="hover:underline">{oportunidad.email || '—'}</span>
                          {hasPermiso('oportunidades.editar') && <span className="material-symbols-outlined text-[14px] text-on-surface-variant opacity-0 group-hover:opacity-100 ml-2">edit</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[12px] font-bold text-on-surface-variant block mb-1">Teléfono</label>
                      {editingField === 'contactPhone' ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="tel" 
                            className="w-full border-border-subtle rounded text-[13px] px-2 py-1 focus:ring-1 focus:ring-primary-container disabled:opacity-50"
                            value={editContactPhone} 
                            disabled={savingContactField === 'contactPhone'}
                            onChange={e => setEditContactPhone(e.target.value)} 
                            onKeyDown={e => {
                              if (e.key === 'Enter' && savingContactField !== 'contactPhone') handleSaveContactField('contactPhone', editContactPhone);
                              if (e.key === 'Escape') { setEditingField(null); setEditContactPhone(oportunidad.phone || ''); }
                            }}
                            autoFocus
                          />
                          {savingContactField === 'contactPhone' ? (
                            <span className="p-1 text-primary"><span className="material-symbols-outlined text-[16px] animate-spin">refresh</span></span>
                          ) : (
                            <button onClick={() => handleSaveContactField('contactPhone', editContactPhone)} className="p-1 text-primary hover:bg-primary-container rounded"><span className="material-symbols-outlined text-[16px]">check</span></button>
                          )}
                          <button onClick={() => { setEditingField(null); setEditContactPhone(oportunidad.phone || ''); }} disabled={savingContactField === 'contactPhone'} className="p-1 text-on-surface-variant hover:bg-surface-muted rounded disabled:opacity-50"><span className="material-symbols-outlined text-[16px]">close</span></button>
                        </div>
                      ) : (
                        <p className="text-[13px] text-on-surface group flex items-center cursor-pointer" onClick={() => hasPermiso('oportunidades.editar') && setEditingField('contactPhone')}>
                          {oportunidad.phone || '—'}
                          {hasPermiso('oportunidades.editar') && <span className="material-symbols-outlined text-[14px] text-on-surface-variant opacity-0 group-hover:opacity-100 ml-2">edit</span>}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Right Column - Activity Feed */}
        <div className="w-full md:w-2/5 flex flex-col bg-surface border-l border-border-subtle overflow-y-auto">
          {/* Pipeline Chevron Bar (Moved here) */}
          <div className="flex flex-nowrap border-b border-l border-border-subtle bg-surface px-2 pt-2 pb-2 gap-y-2 w-full overflow-hidden shrink-0">
            <div className="flex flex-1 items-center justify-start overflow-x-auto no-scrollbar mask-gradient-right pl-2 pb-1 w-full">
              {columnsList.map((col, index) => {
                const isActive = col.id === currentColumnId;
                // Simple logic for "past" stages: assume array order is logical flow
                const colIndex = columnsList.findIndex(c => c.id === col.id);
                const currIndex = columnsList.findIndex(c => c.id === currentColumnId);
                const isPast = colIndex < currIndex;

                return (
                  <div
                    key={col.id}
                    onClick={() => handleStageChange(col.id)}
                    className={`relative flex items-center h-8 px-4 text-[12px] font-bold cursor-pointer transition-colors whitespace-nowrap
                        ${isActive ? 'text-primary' : isPast ? 'text-on-surface' : 'text-on-surface-variant'}
                      `}
                  >
                    <div className={`absolute inset-0 border-y border-r border-border-subtle -skew-x-[20deg] ${isActive ? 'bg-primary/5 border-b-primary border-b-2' : 'hover:bg-surface-muted'}`} style={{ borderLeft: index === 0 ? '1px solid var(--border-subtle)' : 'none' }}></div>
                    <span className="relative z-10 flex items-center gap-1">
                      {changingStageId === col.id && <span className="material-symbols-outlined animate-spin text-[14px]">refresh</span>}
                      {col.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {hasPermiso('oportunidades.seguimientos.crear') && (
            <div className="flex border-b border-l border-border-subtle shrink-0">
              <button
                onClick={() => setActiveRightTab('mensaje')}
                className={`flex-1 py-3 text-[12px] font-bold transition-colors border-r border-border-subtle ${activeRightTab === 'mensaje' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-muted'}`}>
                Enviar email
              </button>
              <button
                onClick={() => setActiveRightTab('nota')}
                className={`flex-1 py-3 text-[12px] font-bold transition-colors border-r border-border-subtle ${activeRightTab === 'nota' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-muted'}`}>
                Registrar una nota
              </button>
              <button
                onClick={() => setActiveRightTab('actividad')}
                className={`flex-1 py-3 text-[12px] font-bold transition-colors ${activeRightTab === 'actividad' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-muted'}`}>
                Actividades
              </button>
            </div>
          )}

          {/* Input Note Area */}
          {hasPermiso('oportunidades.seguimientos.crear') && (
            <div className="p-4 border-b border-l border-border-subtle bg-surface shrink-0">
              <div className="border border-border-subtle rounded-lg bg-surface focus-within:border-primary transition-colors overflow-hidden">
                {activeRightTab === 'mensaje' && (
                  <div className="p-3 border-b border-border-subtle space-y-2 bg-surface-bright">
                    <div className="flex items-center text-[12px]">
                      <span className="text-on-surface-variant w-12 font-bold">De:</span>
                      <input 
                        type="email" 
                        value={emailFrom} 
                        onChange={(e) => setEmailFrom(e.target.value)} 
                        placeholder="vendedor@wimprove.com"
                        className={`flex-1 bg-transparent border-none outline-none p-0 text-[13px] ${!emailFrom.toLowerCase().endsWith('@wimprove.com') ? 'text-status-hp font-bold' : 'text-on-surface'}`} 
                      />
                    </div>
                    <div className="flex items-center text-[12px]">
                      <span className="text-on-surface-variant w-12 font-bold">Para:</span>
                      <input 
                        type="email" 
                        value={emailTo} 
                        onChange={(e) => setEmailTo(e.target.value)} 
                        placeholder="cliente@ejemplo.com"
                        className="flex-1 bg-transparent border-none outline-none p-0 text-[13px] text-on-surface" 
                      />
                    </div>
                    <div className="flex items-center text-[12px] pt-1">
                      <span className="text-on-surface-variant w-12 font-bold">Asunto:</span>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none p-0 text-[13px]"
                      placeholder="Escribe el asunto..."
                    />
                  </div>
                  <div className="flex flex-col text-[12px] pt-2 border-t border-border-subtle mt-2">
                    <input
                      type="file"
                      multiple
                      className="text-[11px] text-on-surface-variant file:mr-2 file:py-1 file:px-2 file:border-0 file:rounded file:text-[11px] file:font-bold file:bg-surface-muted file:text-on-surface hover:file:bg-border-subtle cursor-pointer outline-none"
                      onChange={e => {
                        if (e.target.files) {
                          setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                        }
                      }}
                    />
                    {selectedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3">
                        {selectedFiles.map((f, i) => (
                          <div key={i} className="flex items-center gap-1 bg-surface border border-border-subtle rounded px-2 py-1 text-[11px]">
                            <span className="truncate max-w-[150px]">{f.name}</span>
                            <button type="button" className="text-on-surface-variant hover:text-status-ip" onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}>
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeRightTab === 'actividad' && (
                <div className="p-3 border-b border-border-subtle flex flex-col gap-3 bg-surface-bright">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-[12px] font-bold text-on-surface-variant">Tipo:</label>
                      <select
                        value={activityType}
                        onChange={(e) => setActivityType(e.target.value)}
                        className="text-[12px] border border-border-subtle rounded px-2 py-1 outline-none bg-surface"
                      >
                        <option value="Reunión">Reunión</option>
                        <option value="Llamada">Llamada</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[12px] font-bold text-on-surface-variant">Fecha:</label>
                      <input
                        type="datetime-local"
                        value={activityDate}
                        onChange={(e) => setActivityDate(e.target.value)}
                        className="text-[12px] border border-border-subtle rounded px-2 py-1 outline-none bg-surface"
                      />
                    </div>
                  </div>
                  {activityType === 'Reunión' && (
                    <div className="flex flex-col gap-2 mt-1 border-t border-border-subtle pt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-[12px] font-bold text-on-surface-variant w-[45px]">Título:</label>
                        <input
                          type="text"
                          value={activityTitle}
                          onChange={(e) => setActivityTitle(e.target.value)}
                          placeholder="Ej: Presentación de propuesta"
                          className="flex-1 text-[12px] border border-border-subtle rounded px-2 py-1 outline-none bg-surface"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          id="generateMeetCheckbox"
                          checked={generateMeet}
                          onChange={(e) => setGenerateMeet(e.target.checked)}
                          className="cursor-pointer accent-primary"
                        />
                        <label htmlFor="generateMeetCheckbox" className="text-[12px] cursor-pointer text-on-surface-variant font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">videocam</span>
                          Generar enlace de Google Meet
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full p-3 text-[13px] outline-none bg-transparent resize-none h-20"
                placeholder={
                  activeRightTab === 'mensaje' ? 'Escribe tu correo aquí...' :
                    activeRightTab === 'nota' ? 'Registrar un apunte interno...' :
                      'Detalles de la actividad...'
                }
              ></textarea>
              
              {newActivityFiles.length > 0 && activeRightTab !== 'mensaje' && (
                <div className="flex flex-wrap gap-2 px-3 pb-2">
                  {newActivityFiles.map((item, i) => {
                    const url = typeof item === 'string' ? item : item.url;
                    const name = typeof item === 'string' ? getDisplayFileName(item) : item.name;
                    return (
                      <div key={i} className="flex items-center gap-1 bg-surface-muted px-2 py-1 rounded text-[11px] border border-border-subtle">
                        <a href={url} target="_blank" rel="noreferrer" className="truncate max-w-[150px] text-primary hover:underline">{name}</a>
                        <button onClick={() => setNewActivityFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-status-hp hover:text-status-hp/70"><span className="material-symbols-outlined text-[14px]">close</span></button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="bg-surface-muted p-2 flex justify-between items-center">
                <div>
                  {(activeRightTab === 'nota' || (activeRightTab === 'actividad' && activityType !== 'Reunión')) && (
                    <>
                      <input
                        type="file"
                        id="new-activity-file"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                            setIsUploadingNewFile(true);
                            const url = await uploadActivityFile(e.target.files[0]);
                            if (url) setNewActivityFiles(prev => [...prev, url]);
                            setIsUploadingNewFile(false);
                          }
                        }}
                      />
                      <label htmlFor="new-activity-file" className="cursor-pointer text-on-surface-variant hover:text-primary flex items-center gap-1 text-[11px] font-bold">
                        {isUploadingNewFile ? <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span> : <span className="material-symbols-outlined text-[16px]">attach_file</span>}
                        Adjuntar
                      </label>
                    </>
                  )}
                </div>
                <Button
                  onClick={handleAddNote}
                  isLoading={isScheduling}
                  disabled={isActionDisabled() || isUploadingNewFile}
                  className="!px-4 !py-1.5 !text-[11px]"
                >
                  {activeRightTab === 'mensaje' ? 'Enviar' : 'Programar'}
                </Button>
              </div>
            </div>
          </div>
          )}

          {/* Activity Feed List */}
          {hasPermiso('oportunidades.seguimientos.ver') ? (
            <div className="flex-1 p-6 space-y-6">
            {isLoadingActivities ? (
              <div className="flex justify-center p-4">
                <span className="material-symbols-outlined animate-spin text-primary">refresh</span>
              </div>
            ) : activities.filter(a => activeRightTab === 'mensaje' ? a.tipo_seguimiento === 'email' : true).length === 0 ? (
              <div className="text-center p-4 text-[12px] text-on-surface-variant">No hay actividades aún.</div>
            ) : (() => {
              // Precompute thread bounds outside the map for the visual graph
              let expandedThreadId: string | null = null;
              if (expandedEmailId) {
                const expandedAct = activities.find(a => a.id === expandedEmailId);
                if (expandedAct && expandedAct.tipo_seguimiento === 'email') {
                  try { expandedThreadId = JSON.parse(expandedAct.contenido).threadId; } catch (e) { }
                }
              }

              const threadActs = expandedThreadId ? activities.filter(a => {
                if (a.tipo_seguimiento === 'email') {
                  try { return JSON.parse(a.contenido).threadId === expandedThreadId; } catch (e) { }
                }
                return false;
              }) : [];

              const firstThreadActId = threadActs[0]?.id;
              const lastThreadActId = threadActs[threadActs.length - 1]?.id;

              const filteredActivities = activities.filter(a => activeRightTab === 'mensaje' ? a.tipo_seguimiento === 'email' : true);
              const firstThreadIdx = filteredActivities.findIndex(a => a.id === firstThreadActId);
              const lastThreadIdx = filteredActivities.findIndex(a => a.id === lastThreadActId);

              return filteredActivities
                .map((activity, index) => {
                  let isEmail = activity.tipo_seguimiento === 'email';
                  let isReunion = activity.tipo_seguimiento === 'reunion';
                  let isPresupuesto = activity.tipo_seguimiento === 'presupuesto';
                  let emailData: any = null;
                  let reunionData: any = null;
                  let presupuestoData: any = null;
                  let displayContent = activity.contenido;

                  if (isEmail) {
                    try {
                      emailData = JSON.parse(activity.contenido);
                      displayContent = emailData.mensaje;
                    } catch (e) {
                      // fallback if old format
                    }
                  } else if (isReunion) {
                    try {
                      reunionData = JSON.parse(activity.contenido);
                      displayContent = reunionData.description || '';
                    } catch (e) {
                      // fallback if old format
                    }
                  } else if (isPresupuesto) {
                    try {
                      presupuestoData = JSON.parse(activity.contenido);
                      displayContent = `Presupuesto guardado por total de ${formatMoney(presupuestoData.total || 0)}`;
                    } catch (e) {
                      // fallback
                    }
                  }

                  const isExpanded = expandedEmailId === activity.id;
                  const isInExpandedThread = isEmail && emailData?.threadId && emailData.threadId === expandedThreadId;

                  const isInsideThreadBounds = firstThreadIdx !== -1 && lastThreadIdx !== -1 && index >= firstThreadIdx && index <= lastThreadIdx;
                  const isFirstInThread = index === firstThreadIdx;
                  const isLastInThread = index === lastThreadIdx;

                  // Determine display author and avatar
                  let authorName = `${activity.usuario_nombre || ''} ${activity.usuario_apellido || ''}`.trim() || 'Sistema';
                  let isIncoming = isEmail && emailData?.isIncoming;

                  if (isIncoming && emailData?.de) {
                    // Try to extract name from "Name <email@...>"
                    const match = emailData.de.match(/^([^<]+)</);
                    if (match && match[1].trim()) {
                      authorName = match[1].trim();
                    } else {
                      authorName = emailData.de.split('@')[0];
                    }

                  }

                  return (
                    <div key={activity.id} className={`flex gap-3 relative transition-all duration-300`}>
                      {isInsideThreadBounds && (
                        <>
                          {/* Vertical Spine above this item (reaches up to the previous item) */}
                          {!isFirstInThread && (
                            <div className="absolute top-[-24px] left-[-16px] w-[2px] h-[40px] bg-status-ip/40 z-0"></div>
                          )}

                          {/* Vertical Spine below this item (reaches down to the next item) */}
                          {!isLastInThread && (
                            <div className="absolute top-[16px] bottom-[-24px] left-[-16px] border-l-[2px] border-status-ip/40 z-0"></div>
                          )}

                          {/* The horizontal branch pointing to the avatar */}
                          {isInExpandedThread && (
                            <div className="absolute top-[15px] left-[-16px] w-[16px] border-t-[2px] border-status-ip/40 z-0"></div>
                          )}

                          {/* Dot at the start of the branch if it's the very first item */}
                          {isFirstInThread && (
                            <div className="absolute top-[12px] left-[-19px] w-[8px] h-[8px] rounded-full bg-status-ip/40 z-0"></div>
                          )}
                        </>
                      )}

                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] uppercase flex-shrink-0 shadow-sm z-10 relative ${getActivityColor(activity.tipo_seguimiento, isIncoming)} ${isInExpandedThread ? 'ring-4 ring-status-ip/20' : ''}`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {getActivityIcon(activity.tipo_seguimiento, isIncoming)}
                        </span>
                      </div>
                      <div className="flex-1 max-w-[95%] relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-bold text-on-surface">{authorName}</span>
                          {isEmail && emailData?.leido === false && (
                            <span className="w-2 h-2 rounded-full bg-status-ip shadow-[0_0_8px_rgba(var(--color-status-ip),0.5)] animate-pulse" title="No leído"></span>
                          )}
                          <span className="text-[11px] text-on-surface-variant whitespace-nowrap">- {new Date(activity.created_at || Date.now()).toLocaleDateString()}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase flex items-center gap-1 ${isIncoming ? 'bg-status-ip/10 text-status-ip mr-auto' : 'bg-surface-muted text-on-surface-variant ml-auto'}`}>
                            {isEmail && <span className="material-symbols-outlined text-[12px]">{isIncoming ? 'mark_email_read' : 'mail'}</span>}
                            {isEmail ? (isIncoming ? 'Correo Recibido' : 'Correo Enviado') : activity.tipo_seguimiento}
                          </span>
                        </div>

                        {isEmail && emailData ? (
                          <div
                            className={`${isIncoming ? 'bg-status-ip/10 border-status-ip/30' : 'bg-surface border-border-subtle'} border p-3 rounded-lg rounded-tl-none cursor-pointer hover:border-primary transition-colors shadow-sm ${isInExpandedThread ? 'border-status-ip ring-1 ring-status-ip/50' : ''}`}
                            onClick={() => handleExpandEmail(activity)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-[12px] space-y-1 w-full opacity-90">
                                <div className="flex items-center">
                                  <span className="font-semibold w-12">De:</span>
                                  <span className="truncate">{emailData.de}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="font-bold w-12">Para:</span>
                                  <span className="truncate">{emailData.para}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="font-bold w-12">Asunto:</span>
                                  <span className="font-bold text-on-surface">{emailData.asunto}</span>
                                </div>
                              </div>
                              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                                {isExpanded ? 'expand_less' : 'expand_more'}
                              </span>
                            </div>

                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-border-subtle text-[13px] text-on-surface whitespace-pre-wrap">
                                {displayContent}
                                {emailData.attachments && emailData.attachments.length > 0 && (
                                  <div className="mt-4 space-y-2">
                                    <p className="font-bold text-[12px] text-on-surface-variant">Adjuntos:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {emailData.attachments.map((att: any, idx: number) => {
                                        const fetchEmail = oportunidad.responsible?.email || 'vendedor@empresa.com';
                                        const baseUrl = import.meta.env.VITE_URL_BASE || 'http://localhost:3007';
                                        const token = localStorage.getItem('token') || '';
                                        const downloadUrl = `${baseUrl}/api/oportunidades/gmail/attachment/${encodeURIComponent(fetchEmail)}/${emailData.messageId}/${att.attachmentId}?filename=${encodeURIComponent(att.filename)}&mimeType=${encodeURIComponent(att.mimeType)}&token=${token}`;

                                        return (
                                          <a key={idx} href={downloadUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-surface-muted border border-border-subtle rounded px-2 py-1 text-[11px] text-on-surface hover:border-primary transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                            <span className="material-symbols-outlined text-[14px]">attach_file</span>
                                            <span className="truncate max-w-[150px]">{att.filename}</span>
                                          </a>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : isReunion && reunionData ? (
                          <div className="bg-surface border border-border-subtle p-4 rounded-lg rounded-tl-none shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-[14px] text-on-surface">{reunionData.summary || 'Reunión'}</h4>
                                <p className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-1">
                                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                                  {new Date(reunionData.fecha_inicio).toLocaleString()} - {new Date(reunionData.fecha_fin).toLocaleTimeString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {reunionData.google_event_id && (
                                  <>
                                    {hasPermiso('oportunidades.seguimientos.editar') && (
                                      <button
                                        onClick={() => {
                                          setEditingMeetId(reunionData.google_event_id);
                                          setEditMeetSummary(reunionData.summary || '');
                                          setEditMeetDescription(reunionData.description || '');
                                        }}
                                        className="text-on-surface-variant hover:bg-surface-muted p-1.5 rounded-full transition-colors flex items-center justify-center"
                                        title="Editar reunión"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                      </button>
                                    )}
                                    {hasPermiso('oportunidades.seguimientos.eliminar') && (
                                      <button
                                        onClick={() => handleDeleteMeet(reunionData.google_event_id)}
                                        className="text-status-hp hover:bg-status-hp/10 p-1.5 rounded-full transition-colors flex items-center justify-center"
                                        title="Eliminar reunión"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            {editingMeetId === reunionData.google_event_id ? (
                              <div className="space-y-3 mt-2 bg-surface-bright p-3 rounded-md border border-border-subtle">
                                <div>
                                  <label className="text-[11px] font-bold text-on-surface-variant uppercase">Título</label>
                                  <input
                                    type="text"
                                    className="w-full text-[13px] border-b border-border-subtle bg-transparent outline-none focus:border-primary p-1"
                                    value={editMeetSummary}
                                    onChange={(e) => setEditMeetSummary(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] font-bold text-on-surface-variant uppercase">Descripción</label>
                                  <textarea
                                    className="w-full text-[13px] border border-border-subtle rounded-md bg-transparent outline-none focus:border-primary p-2 h-20 resize-none"
                                    value={editMeetDescription}
                                    onChange={(e) => setEditMeetDescription(e.target.value)}
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => setEditingMeetId(null)} className="text-[11px] px-3 py-1 font-bold rounded-md hover:bg-surface-muted transition-colors text-on-surface-variant">Cancelar</button>
                                  <button
                                    onClick={() => handleUpdateMeet(reunionData.google_event_id)}
                                    disabled={isUpdatingMeet}
                                    className="text-[11px] px-3 py-1 font-bold rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
                                  >
                                    {isUpdatingMeet ? 'Guardando...' : 'Guardar'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {displayContent && (
                                  <div className="text-[13px] text-on-surface bg-surface-muted p-2 rounded whitespace-pre-wrap">
                                    {displayContent}
                                  </div>
                                )}
                              </>
                            )}

                            <div className="flex flex-wrap gap-2 pt-2">
                              {reunionData.meet_link && (
                                <a
                                  href={reunionData.meet_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-[12px] bg-primary/10 text-primary font-bold px-3 py-1.5 rounded hover:bg-primary/20 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">videocam</span>
                                  Unirse a Meet
                                </a>
                              )}
                              {reunionData.html_link && (
                                <a
                                  href={reunionData.html_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-[12px] border border-border-subtle text-on-surface-variant font-bold px-3 py-1.5 rounded hover:bg-surface-muted transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                  Ver en Google Calendar
                                </a>
                              )}
                              {/* Send meeting by email */}
                              <button
                                onClick={() => {
                                  const fechaInicio = reunionData.fecha_inicio ? new Date(reunionData.fecha_inicio).toLocaleString() : 'N/A';
                                  const fechaFin = reunionData.fecha_fin ? new Date(reunionData.fecha_fin).toLocaleTimeString() : 'N/A';
                                  setEmailSubject(`Reunión: ${reunionData.summary || 'Invitación a reunión'}`);
                                  setNoteText(`Estimado cliente,\n\nLe invitamos a una reunión virtual.\n\nTema: ${reunionData.summary || 'Reunión'}\nFecha: ${fechaInicio} - ${fechaFin}\n${reunionData.meet_link ? `\nEnlace para unirse:\n${reunionData.meet_link}` : ''}\n${reunionData.html_link ? `\nCal Evento: ${reunionData.html_link}` : ''}\n\nEsperamos contar con su presencia.\n\nAtentamente.`);
                                  setSelectedFiles([]);
                                  setActiveRightTab('mensaje');
                                }}
                                className="flex items-center gap-1.5 text-[12px] border border-border-subtle text-on-surface-variant font-bold px-3 py-1.5 rounded hover:bg-surface-muted transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
                                Enviar por correo
                              </button>
                            </div>
                          </div>
                        ) : isPresupuesto && presupuestoData ? (
                          <div className="bg-surface border border-border-subtle p-4 rounded-lg rounded-tl-none shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-[14px] text-on-surface">Presupuesto #{presupuestoData.id?.slice(-6) || activity.id}</h4>
                                <p className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-1">
                                  <span className="material-symbols-outlined text-[14px]">request_quote</span>
                                  {new Date(activity.created_at || Date.now()).toLocaleString()}
                                </p>
                                {presupuestoData.expiracion && <p className="text-[12px] text-on-surface-variant mt-0.5">Expira: {presupuestoData.expiracion}</p>}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[16px] font-bold text-primary">{formatMoney(presupuestoData.total || 0)}</span>
                                {/* Edit button */}
                                {hasPermiso('oportunidades.seguimientos.editar') && (
                                  <button
                                    onClick={() => setEditingPresupuesto({ activityId: activity.id!, data: presupuestoData })}
                                    className="text-on-surface-variant hover:bg-surface-muted p-1.5 rounded-full transition-colors flex items-center justify-center ml-2"
                                    title="Editar presupuesto"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                  </button>
                                )}
                                {/* Delete button */}
                                {hasPermiso('oportunidades.seguimientos.eliminar') && (
                                  <button
                                    onClick={async () => {
                                      const isConfirmed = await confirm({
                                        title: 'Eliminar Presupuesto',
                                        message: '¿Eliminar este presupuesto?',
                                        confirmText: 'Eliminar'
                                      });
                                      if (!isConfirmed) return;
                                      await oportunidadesService.deleteSeguimiento(activity.id!);
                                      await loadActivities();
                                    }}
                                    className="text-status-hp hover:bg-status-hp/10 p-1.5 rounded-full transition-colors flex items-center justify-center"
                                    title="Eliminar presupuesto"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="text-[13px] text-on-surface space-y-1 border-t border-border-subtle pt-3">
                              {presupuestoData.plazos && <p><span className="font-semibold">Plazos:</span> {presupuestoData.plazos.replace(/_/g, ' ')}</p>}
                              <div className="mt-1">
                                <p className="font-semibold text-on-surface-variant text-[12px] mb-1">Líneas ({presupuestoData.lineas?.length || 0}):</p>
                                <ul className="list-disc pl-4 text-[12px] text-on-surface">
                                  {presupuestoData.lineas?.map((line: any, i: number) => (
                                    <li key={i}>{line.producto} &times; {line.cantidad} &mdash; {formatMoney(line.cantidad * line.precio * (1 + line.impuesto/100))}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-border-subtle">
                              {/* Generate PDF */}
                              <Button
                                variant="outline"
                                isLoading={loadingPDFId === activity.id}
                                isSuccess={successPDFId === activity.id}
                                loadingText="Generando PDF..."
                                onClick={async () => {
                                  try {
                                    setLoadingPDFId(activity.id!);
                                    setSuccessPDFId(null);
                                    const blob = await oportunidadesService.getPresupuestoPdfBlob(activity.id!);
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `presupuesto-${activity.id!}.pdf`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                    setLoadingPDFId(null);
                                    setSuccessPDFId(activity.id!);
                                    setTimeout(() => setSuccessPDFId(null), 3000);
                                  } catch (e) {
                                    setLoadingPDFId(null);
                                    alert('Error al generar PDF');
                                  }
                                }}
                                className="!py-1.5 !px-3 !text-[12px]"
                              >
                                {!(successPDFId === activity.id) && <span className="material-symbols-outlined text-[16px] mr-1.5">picture_as_pdf</span>}
                                {!(successPDFId === activity.id) ? 'Generar PDF' : 'PDF Generado'}
                              </Button>
                              {/* Send by email - attach PDF */}
                              <button
                                onClick={async () => {
                                  try {
                                    const blob = await oportunidadesService.getPresupuestoPdfBlob(activity.id!);
                                    const pdfFile = new File([blob], `presupuesto-${activity.id!}.pdf`, { type: 'application/pdf' });
                                    setSelectedFiles([pdfFile]);
                                    setEmailSubject(`Presupuesto #${presupuestoData.id?.slice(-6) || activity.id!} - ${formatMoney(presupuestoData.total || 0)}`);
                                    setNoteText(`Estimado cliente,\n\nAdjuntamos el presupuesto solicitado por un total de ${formatMoney(presupuestoData.total || 0)}.\n\nPlazos de pago: ${presupuestoData.plazos?.replace(/_/g, ' ') || 'Pago inmediato'}.\n${presupuestoData.expiracion ? `\nVálido hasta: ${presupuestoData.expiracion}.` : ''}\n\nQuedamos a su disposición para cualquier consulta.\n\nAtentamente.`);
                                    setActiveRightTab('mensaje');
                                  } catch (e) {
                                    alert('Error al preparar correo');
                                  }
                                }}
                                className="flex items-center gap-1.5 text-[12px] bg-primary/10 text-primary font-bold px-3 py-1.5 rounded hover:bg-primary/20 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">mail</span>
                                Enviar por correo
                              </button>
                            </div>
                          </div>
                        ) : editingActivityId === activity.id ? (
                          <div className="bg-surface border border-border-subtle p-3 rounded-lg rounded-tl-none shadow-sm space-y-3">
                            <textarea
                              className="w-full text-[13px] border border-border-subtle rounded bg-transparent p-2 min-h-[80px] outline-none focus:border-primary"
                              value={editActivityText}
                              onChange={e => setEditActivityText(e.target.value)}
                            />
                            {editActivityFiles.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {editActivityFiles.map((item, i) => {
                                  const url = typeof item === 'string' ? item : item.url;
                                  const name = typeof item === 'string' ? getDisplayFileName(item) : item.name;
                                  return (
                                    <div key={i} className="flex items-center gap-1 bg-surface-muted px-2 py-1 rounded text-[11px]">
                                      <a href={url} target="_blank" rel="noreferrer" className="truncate max-w-[150px] text-primary hover:underline">{name}</a>
                                      <button onClick={() => setEditActivityFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-status-hp hover:text-status-hp/70"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div>
                                <input
                                  type="file"
                                  id={`file-${activity.id}`}
                                  className="hidden"
                                  onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                      const url = await uploadActivityFile(e.target.files[0]);
                                      if (url) setEditActivityFiles(prev => [...prev, url]);
                                    }
                                  }}
                                />
                                <label htmlFor={`file-${activity.id}`} className="cursor-pointer text-on-surface-variant hover:text-primary flex items-center gap-1 text-[11px] font-bold">
                                  {isUploadingActivityFile ? <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span> : <span className="material-symbols-outlined text-[16px]">attach_file</span>}
                                  Adjuntar
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => setEditingActivityId(null)} className="text-[11px] px-3 py-1.5 font-bold rounded hover:bg-surface-muted text-on-surface-variant">Cancelar</button>
                                <button onClick={() => saveActivityEdit(activity.id!)} className="text-[11px] px-3 py-1.5 font-bold rounded bg-primary text-white hover:bg-primary-hover">Guardar</button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="group text-[13px] text-on-surface bg-surface border border-border-subtle p-3 rounded-lg rounded-tl-none space-y-2 relative">
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {hasPermiso('oportunidades.seguimientos.editar') && (
                                <button
                                  onClick={() => startEditActivity(activity)}
                                  className="text-on-surface-variant hover:text-primary"
                                >
                                  <span className="material-symbols-outlined text-[16px]">edit</span>
                                </button>
                              )}
                              {hasPermiso('oportunidades.seguimientos.eliminar') && (
                                <button
                                  onClick={() => handleDeleteActivity(activity.id!)}
                                  className="text-on-surface-variant hover:text-status-hp"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              )}
                            </div>
                            <div className="whitespace-pre-wrap pr-6">
                              {(() => {
                                try {
                                  const parsed = JSON.parse(activity.contenido || '');
                                  if (typeof parsed === 'object' && parsed !== null) {
                                    if (parsed.texto !== undefined) return parsed.texto;
                                    if (parsed.description !== undefined) return parsed.description;
                                    return displayContent;
                                  }
                                  return displayContent;
                                } catch {
                                  return displayContent;
                                }
                              })()}
                            </div>
                            {(() => {
                              try {
                                const parsed = JSON.parse(activity.contenido || '');
                                if (parsed && Array.isArray(parsed.adjuntos) && parsed.adjuntos.length > 0) {
                                  return (
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border-subtle">
                                      {parsed.adjuntos.map((item: any, i: number) => {
                                        const url = typeof item === 'string' ? item : item.url;
                                        const name = typeof item === 'string' ? getDisplayFileName(item) : item.name;
                                        const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
                                        return isImage ? (
                                          <a key={i} href={url} target="_blank" rel="noreferrer" className="block relative group/img rounded border border-border-subtle overflow-hidden w-16 h-16">
                                            <img src={url} alt="Adjunto" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"><span className="material-symbols-outlined text-white text-[16px]">open_in_new</span></div>
                                          </a>
                                        ) : (
                                          <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-surface-muted px-2 py-1 rounded text-[11px] hover:border-primary border border-border-subtle transition-colors text-on-surface" title={url}>
                                            <span className="material-symbols-outlined text-[14px]">description</span>
                                            {name}
                                          </a>
                                        );
                                      })}
                                    </div>
                                  );
                                }
                              } catch { }
                              return null;
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
            })()
            }
            </div>
          ) : (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-on-surface-variant opacity-70">
              <span className="material-symbols-outlined text-[48px] mb-2">visibility_off</span>
              <p className="text-[13px] font-bold">No tienes permiso para ver el historial de seguimientos.</p>
            </div>
          )}

        </div>
      </div>
      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-surface-muted">
              <h2 className="text-[14px] font-bold text-on-surface">Seleccionar Contacto</h2>
              <button onClick={() => setShowContactModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto max-h-[60vh]">
              {isLoadingContacts ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                    <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-[20px] text-primary">contacts</span>
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-bold text-on-surface">Obteniendo contactos...</p>
                    <p className="text-[12px] text-on-surface-variant mt-0.5">Cargando la lista de contactos de la organización</p>
                  </div>
                </div>
              ) : !isAddingContact ? (
                <>
                  <div className="space-y-2 mb-4">
                    {orgContacts.map((contact, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectContact(contact)}
                        className="p-3 border border-border-subtle rounded cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <p className="text-[13px] font-bold text-on-surface">{contact.nombre || contact.email || 'Sin nombre'}</p>
                        {contact.cargo && <p className="text-[11px] text-primary font-bold">{contact.cargo}</p>}
                        <div className="flex gap-2 mt-1">
                          <p className="text-[12px] text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">mail</span> {contact.email || 'Sin correo'}</p>
                          <p className="text-[12px] text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">phone</span> {contact.telefono || contact.phone || 'Sin teléfono'}</p>
                        </div>
                      </div>
                    ))}
                    {orgContacts.length === 0 && (
                      <p className="text-[13px] text-on-surface-variant italic text-center py-4">No hay contactos registrados en esta organización.</p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsAddingContact(true)}
                    className="w-full py-2 border border-dashed border-border-subtle rounded text-[13px] text-primary font-bold hover:bg-surface-muted transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Agregar nuevo contacto
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[12px] font-bold text-on-surface-variant block mb-1">Nombre</label>
                      <input
                        type="text"
                        value={newContactName}
                        onChange={e => setNewContactName(e.target.value)}
                        className="w-full border border-border-subtle rounded px-3 py-2 text-[13px] outline-none focus:border-primary"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[12px] font-bold text-on-surface-variant block mb-1">Cargo</label>
                      <input
                        type="text"
                        value={newContactCargo}
                        onChange={e => setNewContactCargo(e.target.value)}
                        className="w-full border border-border-subtle rounded px-3 py-2 text-[13px] outline-none focus:border-primary"
                        placeholder="Gerente"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-on-surface-variant block mb-1">Correo electrónico</label>
                    <input
                      type="email"
                      value={newContactEmail}
                      onChange={e => setNewContactEmail(e.target.value)}
                      className="w-full border border-border-subtle rounded px-3 py-2 text-[13px] outline-none focus:border-primary"
                      placeholder="ejemplo@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-on-surface-variant block mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={newContactPhone}
                      onChange={e => setNewContactPhone(e.target.value)}
                      className="w-full border border-border-subtle rounded px-3 py-2 text-[13px] outline-none focus:border-primary"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={saveNewContact}
                      className="flex-1 bg-primary text-white text-[12px] font-bold py-2 rounded hover:bg-primary-hover transition-colors"
                    >
                      Guardar y Seleccionar
                    </button>
                    <button
                      onClick={() => setIsAddingContact(false)}
                      className="px-4 py-2 text-[12px] font-bold text-on-surface-variant hover:text-on-surface border border-border-subtle rounded transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isOportunidadCalendarOpen && (
        <CalendarioReunionesModal
          onClose={() => setIsOportunidadCalendarOpen(false)}
          activities={activities.filter(a => a.tipo_seguimiento === 'reunion')}
          onDeleteMeet={handleDeleteMeet}
          oportunidadId={oportunidad.id}
          reloadActivities={loadActivities}
        />
      )}
    </div>
  );
};

export default OportunidadDetalle;
