import React, { useState, useEffect, useRef } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View, Event as RBCEvent } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { calendarService } from '../../../../services/calendarService';
import oportunidadesService, { type Seguimiento } from '../../../../services/oportunidadesService';
import Button from '../../../../components/CRM/ui/Button';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export interface CalendarioReunionesModalProps {
  onClose: () => void;
  proyectoId?: number; // For global project view
  oportunidadId?: number; // For specific opportunity view
  activities?: Seguimiento[]; // Pre-loaded activities (for opportunity view)
  onDeleteMeet?: (eventId: string) => Promise<void>; // Optional custom delete handler
  reloadActivities?: () => void; // Callback to reload activities after changes
}

interface CustomEvent extends RBCEvent {
  id: string;
  resource: any;
}

// Small avatar helper used in both calendar cell and list
const UserAvatar: React.FC<{ usuario?: { nombre?: string; apellido?: string; email?: string }; size?: 'sm' | 'md' }> = ({ usuario, size = 'sm' }) => {
  if (!usuario) return null;
  const initials = `${(usuario.nombre || '')[0] || ''}${(usuario.apellido || '')[0] || ''}`.toUpperCase() || '?';
  const colors = [
    'bg-[#4059aa]', 'bg-[#0ea5e9]', 'bg-[#10B981]', 'bg-[#f97316]',
    'bg-[#8b5cf6]', 'bg-[#EF4444]', 'bg-[#F59E0B]', 'bg-[#06b6d4]'
  ];
  const colorIdx = (usuario.nombre?.charCodeAt(0) || 0) % colors.length;
  const sizeClasses = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-[11px]';
  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${colors[colorIdx]} ring-2 ring-surface`}
      title={`${usuario.nombre || ''} ${usuario.apellido || ''}`.trim()}
    >
      {initials}
    </div>
  );
};

const CalendarioReunionesModal: React.FC<CalendarioReunionesModalProps> = ({ 
  onClose, 
  proyectoId,
  oportunidadId,
  activities,
  onDeleteMeet,
  reloadActivities
}) => {
  const isGlobal = !!proyectoId;
  
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<CustomEvent[]>([]);
  const [oportunidades, setOportunidades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(isGlobal);
  
  // Edit State
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editSummary, setEditSummary] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [createDate, setCreateDate] = useState<Date | null>(null);
  const [createTime, setCreateTime] = useState('10:00');
  const [createSummary, setCreateSummary] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createGenerateMeet, setCreateGenerateMeet] = useState(false);
  const [createOportunidadId, setCreateOportunidadId] = useState<number | ''>(oportunidadId || '');
  const [isScheduling, setIsScheduling] = useState(false);
  
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isGlobal) {
      loadData();
    } else if (activities) {
      const parsedEvents = activities.map(act => {
        try {
          const data = JSON.parse(act.contenido);
          return {
            id: data.google_event_id,
            title: data.summary || 'Reunión',
            start: new Date(data.fecha_inicio),
            end: new Date(data.fecha_fin),
            resource: {
              id: data.google_event_id,
              description: data.description,
              meetLink: data.meet_link,
              htmlLink: data.html_link,
              activityId: act.id,
              oportunidad_name: '' 
            }
          } as CustomEvent;
        } catch (e) {
          return null;
        }
      }).filter(Boolean) as CustomEvent[];
      
      setEvents(parsedEvents);
    }
  }, [proyectoId, activities]);

  const loadData = async () => {
    if (!proyectoId) return;
    setIsLoading(true);
    try {
      const fetchedEvents = await calendarService.getEvents(proyectoId);
      const formattedEvents: CustomEvent[] = fetchedEvents.map(ev => ({
        id: ev.id,
        title: ev.title,
        start: new Date(ev.start),
        end: new Date(ev.end),
        resource: ev
      }));
      setEvents(formattedEvents);

      try {
        const opList = await oportunidadesService.getPorProyecto(proyectoId);
        setOportunidades(opList);
      } catch (e) {
        console.error('Error fetching oportunidades:', e);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEvent = (event: CustomEvent) => {
    setDate(event.start!);
    const element = document.getElementById(`event-list-item-${event.id}`);
    if (element && listRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      element.classList.add('ring-2', 'ring-primary', 'bg-primary/5');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-primary', 'bg-primary/5');
      }, 1500);
    }
    setIsCreating(false);
  };

  const handleSelectSlot = (slotInfo: { start: Date, end: Date, action: string }) => {
    setDate(slotInfo.start);
    setCreateDate(slotInfo.start);
    setCreateTime(format(slotInfo.start, 'HH:mm'));
    
    if (!isCreating) {
      setIsCreating(true);
      setCreateSummary('Reunión');
      setCreateDescription('');
      setCreateGenerateMeet(true);
      if (!isGlobal && oportunidadId) {
        setCreateOportunidadId(oportunidadId);
      }
    }
    setEditingEventId(null);
  };

  const handleCreateMeet = async () => {
    if (!createDate || !createOportunidadId) return;
    setIsScheduling(true);
    try {
      const [hours, minutes] = createTime.split(':').map(Number);
      const startDateTime = new Date(createDate);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + 1);

      let eventId = '';
      let meetLink = '';
      let htmlLink = '';

      if (createGenerateMeet) {
        const meetResponse = await calendarService.createMeet({
          summary: createSummary,
          description: createDescription,
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          generateMeet: true
        });
        eventId = meetResponse.eventId || '';
        meetLink = meetResponse.meetLink || '';
        htmlLink = meetResponse.eventHtmlLink || '';
      }

      const jsonContent = {
        google_event_id: eventId,
        fecha_inicio: startDateTime.toISOString(),
        fecha_fin: endDateTime.toISOString(),
        meet_link: meetLink,
        htmlLink: htmlLink,
        summary: createSummary,
        description: createDescription
      };

      await oportunidadesService.createSeguimiento(Number(createOportunidadId), {
        tipo_seguimiento: 'reunion',
        contenido: JSON.stringify(jsonContent)
      });
      
      setIsCreating(false);
      
      if (isGlobal) {
        loadData();
      } else if (reloadActivities) {
        reloadActivities();
      }
    } catch (e) {
      console.error(e);
      alert('Error creando la reunión');
    } finally {
      setIsScheduling(false);
    }
  };

  const startEdit = (ev: CustomEvent) => {
    setEditingEventId(ev.id);
    setEditSummary(ev.title as string);
    setEditDescription(ev.resource.description || '');
    setIsCreating(false);
  };

  const saveEdit = async (eventId: string) => {
    try {
      await calendarService.updateMeet(eventId, {
        summary: editSummary,
        description: editDescription
      });
      setEditingEventId(null);
      if (isGlobal) {
        loadData();
      } else if (reloadActivities) {
        reloadActivities();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMeet = async (eventId: string) => {
    try {
      if (isGlobal) {
        await calendarService.deleteMeet(eventId);
        loadData();
      } else if (onDeleteMeet) {
        await onDeleteMeet(eventId);
        if (reloadActivities) reloadActivities();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const dayPropGetter = (currentDate: Date) => {
    const isToday = new Date().setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0);
    const isSelected = createDate && createDate.setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0);
    
    let className = `calendar-date-${format(currentDate, 'yyyy-MM-dd')} transition-all duration-300 `;
    if (isSelected) {
      className += '!bg-primary';
    } else if (isToday) {
      className += '!bg-primary/20';
    }
    return { className };
  };

  const components = {
    month: {
      dateHeader: ({ label, date }: any) => {
        const isSelected = createDate && createDate.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0);
        const isToday = new Date().setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0);
        return (
          <button className={`w-full text-right pr-1 pb-1 ${isSelected ? '!text-white font-bold' : isToday ? 'text-primary font-bold' : ''}`}>
            {label}
          </button>
        );
      }
    },
    event: ({ event }: any) => {
      const e = event as CustomEvent;
      const usuario = e.resource?.usuario;
      return (
        <div className="flex items-center justify-between overflow-hidden h-full gap-1">
          <div className="flex flex-col flex-1 overflow-hidden justify-center">
            <span className="truncate">{e.title as string}</span>
            {isGlobal && e.resource.oportunidad_name && (
              <span className="text-[10px] font-normal truncate opacity-80 leading-tight">
                {e.resource.oportunidad_name}
              </span>
            )}
          </div>
          {usuario && <UserAvatar usuario={usuario} size="sm" />}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-[60] backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface h-full w-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-border-subtle bg-surface-muted flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">event</span>
            <h2 className="text-[18px] font-display font-bold text-on-surface">
              {isGlobal ? 'Calendario Global del Proyecto' : 'Calendario de la Oportunidad'}
            </h2>
            {!isLoading && (
              <span className="ml-2 text-[12px] bg-primary text-white font-bold px-2 py-0.5 rounded-full">
                {events.length} Reuniones
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-border-subtle">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Calendar Area */}
          <div className="flex-1 p-4 border-r border-border-subtle bg-surface flex flex-col">
            <div className="flex-1">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                selectable={true}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                dayPropGetter={dayPropGetter}
                popup={true}
                style={{ height: '100%' }}
                messages={{
                  next: "Sig",
                  previous: "Ant",
                  today: "Hoy",
                  month: "Mes",
                  week: "Semana",
                  day: "Día",
                  agenda: "Agenda",
                  date: "Fecha",
                  time: "Hora",
                  event: "Evento",
                  noEventsInRange: "No hay eventos.",
                }}
                eventPropGetter={(event: any) => ({
                  className: `rounded-md border border-transparent text-[12px] font-bold px-1 calendar-event-${event.id} transition-all duration-300`,
                  style: { backgroundColor: '#00236f', color: 'white' }
                })}
                components={components}
              />
            </div>
          </div>

          {/* Right Panel (List or Creator) */}
          <div className={`${isGlobal ? 'w-[450px]' : 'w-[400px]'} flex flex-col bg-surface-bright relative`}>
            
            {isCreating ? (
              <div className="flex-1 flex flex-col overflow-y-auto animate-in slide-in-from-right-4 duration-200">
                <div className="p-4 border-b border-border-subtle bg-surface-muted flex justify-between items-center">
                  <h3 className="font-bold text-[14px] text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">add_circle</span>
                    Programar Reunión
                  </h3>
                  <button onClick={() => setIsCreating(false)} className="text-on-surface-variant hover:text-status-hp transition-colors">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  {isGlobal && (
                    <div>
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase">Oportunidad *</label>
                      <select
                        className="w-full mt-1 text-[13px] border border-border-subtle rounded bg-surface p-2 outline-none focus:border-primary"
                        value={createOportunidadId}
                        onChange={e => setCreateOportunidadId(e.target.value ? Number(e.target.value) : '')}
                      >
                        <option value="">Seleccione una oportunidad...</option>
                        {oportunidades.map(op => (
                          <option key={op.id} value={op.id}>{op.nombre || op.contacto_data?.product || 'Oportunidad sin nombre'}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Fecha</label>
                    <div className="mt-1 font-bold text-[14px] text-on-surface bg-surface-muted px-3 py-2 rounded border border-border-subtle">
                      {createDate ? format(createDate, 'dd MMMM yyyy', { locale: es }) : ''}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Hora</label>
                    <input 
                      type="time" 
                      className="w-full mt-1 text-[13px] border border-border-subtle rounded bg-surface p-2 outline-none focus:border-primary"
                      value={createTime}
                      onChange={(e) => setCreateTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Título</label>
                    <input 
                      type="text"
                      className="w-full mt-1 text-[13px] border border-border-subtle rounded bg-surface p-2 outline-none focus:border-primary"
                      value={createSummary}
                      onChange={(e) => setCreateSummary(e.target.value)}
                      placeholder="Ej: Presentación de Propuesta"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Descripción</label>
                    <textarea 
                      className="w-full mt-1 text-[13px] border border-border-subtle rounded bg-surface p-2 h-24 resize-none outline-none focus:border-primary"
                      value={createDescription}
                      onChange={(e) => setCreateDescription(e.target.value)}
                      placeholder="Detalles de la reunión..."
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="genMeetCalG"
                      checked={createGenerateMeet}
                      onChange={(e) => setCreateGenerateMeet(e.target.checked)}
                      className="accent-primary w-4 h-4"
                    />
                    <label htmlFor="genMeetCalG" className="text-[13px] font-bold text-on-surface-variant cursor-pointer flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">videocam</span>
                      Generar enlace de Google Meet
                    </label>
                  </div>
                  <div className="pt-4 mt-4 border-t border-border-subtle">
                    <Button 
                      onClick={handleCreateMeet}
                      disabled={!createSummary || !createOportunidadId}
                      isLoading={isScheduling}
                      className="w-full"
                    >
                      Programar Reunión
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-y-auto animate-in slide-in-from-left-4 duration-200">
                <div className="p-4 border-b border-border-subtle bg-surface-muted">
                  <h3 className="font-bold text-[14px] text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">list_alt</span>
                    {isGlobal ? 'Lista de Reuniones del Proyecto' : 'Lista de Reuniones'}
                  </h3>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-3" ref={listRef}>
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center p-6 text-[13px] text-on-surface-variant border border-dashed border-border-subtle rounded-lg">
                      {isGlobal ? 'No hay reuniones programadas en este proyecto. Haz clic en el calendario para crear una.' : 'No hay reuniones programadas. Haz clic en el calendario para crear una.'}
                    </div>
                  ) : (
                    [...events].sort((a, b) => (a.start as Date).getTime() - (b.start as Date).getTime()).map((ev) => {
                      const isEditing = editingEventId === ev.id;
                      
                      return (
                        <div 
                          key={ev.id}
                          id={`event-list-item-${ev.id}`}
                          className="bg-surface border border-border-subtle rounded-lg shadow-sm transition-all duration-300 overflow-hidden group cursor-pointer hover:border-primary/50"
                          onClick={() => {
                            setDate(ev.start!);
                            
                            const dateStr = format(ev.start!, 'yyyy-MM-dd');
                            const dateCells = document.querySelectorAll(`.calendar-date-${dateStr}`);
                            dateCells.forEach(cell => {
                              cell.classList.add('!ring-2', '!ring-primary', '!ring-inset');
                              setTimeout(() => cell.classList.remove('!ring-2', '!ring-primary', '!ring-inset'), 1500);
                            });

                            const eventBlocks = document.querySelectorAll(`.calendar-event-${ev.id}`);
                            eventBlocks.forEach(block => {
                              block.classList.add('!border-red-500', '!bg-red-500', '!text-white');
                              setTimeout(() => {
                                block.classList.remove('!border-red-500', '!bg-red-500', '!text-white');
                              }, 1500);
                            });
                          }}
                        >
                          <div className="p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                {isEditing ? (
                                  <input 
                                    autoFocus
                                    type="text" 
                                    className="w-full text-[14px] font-bold border-b border-border-subtle bg-transparent outline-none focus:border-primary p-1 mb-2 text-on-surface"
                                    value={editSummary}
                                    onChange={e => setEditSummary(e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                  />
                                ) : (
                                  <h4 className="font-bold text-[14px] text-on-surface">{ev.title as string}</h4>
                                )}
                                {isGlobal && (
                                  <div className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-1 font-medium bg-surface-muted w-max px-2 py-0.5 rounded">
                                    <span className="material-symbols-outlined text-[14px]">handshake</span>
                                    {ev.resource.oportunidad_name || 'Sin Oportunidad'}
                                  </div>
                                )}
                                <p className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-1 font-medium">
                                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                                  {format(ev.start!, "dd MMM yyyy", { locale: es })} • {format(ev.start!, "HH:mm")}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 ml-2">
                                {/* User avatar */}
                                <UserAvatar usuario={ev.resource?.usuario} size="md" />
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!isEditing && (
                                  <>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); startEdit(ev); }}
                                      className="p-1.5 text-on-surface-variant hover:bg-surface-muted hover:text-primary rounded-md transition-colors"
                                      title="Editar"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">edit</span>
                                    </button>
                                    <button 
                                      onClick={async (e) => { 
                                        e.stopPropagation(); 
                                        await deleteMeet(ev.id);
                                      }}
                                      className="p-1.5 text-on-surface-variant hover:bg-status-hp/10 hover:text-status-hp rounded-md transition-colors"
                                      title="Eliminar"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                  </>
                                )}
                                </div>
                              </div>
                            </div>
                            
                            {isEditing ? (
                              <div className="mt-3">
                                <textarea 
                                  className="w-full text-[12px] border border-border-subtle rounded-md bg-transparent outline-none focus:border-primary p-2 h-16 resize-none text-on-surface"
                                  value={editDescription}
                                  onChange={e => setEditDescription(e.target.value)}
                                  onClick={e => e.stopPropagation()}
                                />
                                <div className="flex gap-2 justify-end mt-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setEditingEventId(null); }}
                                    className="text-[11px] px-3 py-1 font-bold rounded hover:bg-surface-muted text-on-surface-variant transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); saveEdit(ev.id); }}
                                    className="text-[11px] px-3 py-1 font-bold rounded bg-primary text-white hover:bg-primary-hover transition-colors"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              ev.resource.description && (
                                <div className="mt-2 text-[12px] text-on-surface bg-surface-muted p-2 rounded max-h-20 overflow-y-auto whitespace-pre-wrap">
                                  {ev.resource.description}
                                </div>
                              )
                            )}
                            
                            {!isEditing && (ev.resource.meetLink || ev.resource.htmlLink) && (
                              <div className="flex gap-2 mt-3 pt-3 border-t border-border-subtle">
                                {ev.resource.meetLink && (
                                  <a 
                                    href={ev.resource.meetLink} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="flex-1 flex items-center justify-center gap-1.5 text-[11px] bg-primary/10 text-primary font-bold px-2 py-1.5 rounded hover:bg-primary/20 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">videocam</span>
                                    Unirse
                                  </a>
                                )}
                                {ev.resource.htmlLink && (
                                  <a 
                                    href={ev.resource.htmlLink} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="flex-1 flex items-center justify-center gap-1.5 text-[11px] border border-border-subtle text-on-surface-variant font-bold px-2 py-1.5 rounded hover:bg-surface-muted transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                    Calendar
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarioReunionesModal;
