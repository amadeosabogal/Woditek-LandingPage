import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { LayoutContextType } from '../../../components/CRM/layout/Layout';
import type { DropResult } from '@hello-pangea/dnd';
import RegistrarOportunidad, { type OportunidadFormData } from './components/RegistrarOportunidad';
import OportunidadDetalle from './components/OportunidadDetalle';
import ConfigurarEtapaModal from './components/ConfigurarEtapaModal';
import CambiarEtapaModal from './components/CambiarEtapaModal';
import proyectosService from '../../../services/proyectosService';
import oportunidadesService from '../../../services/oportunidadesService';
import { useLoader } from '../../../context/CRM/LoaderContext';
import { useAuth } from '../../../context/CRM/AuthContext';
import { useDialog } from '../../../context/CRM/DialogContext';
import CalendarioReunionesModal from './components/CalendarioReunionesModal';
import OportunidadesCharts from './components/OportunidadesCharts';
import OportunidadesReporte from './components/OportunidadesReporte';
import { formatMoney } from '../../../utils/formatters';

interface Column {
  id: string;
  title: string;
  status: 'PP' | 'QP' | 'IP' | 'HP' | 'NA';
  colorClass: string;
  isFolded?: boolean;
  isWon?: boolean;
  isLost?: boolean;
  requirements?: string;
  items: any[];
}

const Oportunidades: React.FC = () => {
  const { setHideTopNav, searchQuery, setHideSearch } = useOutletContext<LayoutContextType>();
  const { proyecto_id } = useParams<{ proyecto_id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showLoader, hideLoader } = useLoader();
  const { user, hasPermiso } = useAuth();
  const { confirm } = useDialog();

  const getFilteredItems = (items: any[]) => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => {
      const matchName = item.product?.toLowerCase().includes(q);
      const matchOrg = item.name?.toLowerCase().includes(q);
      const matchContact = item.contactName?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q);
      const matchUser = item.responsible?.name?.toLowerCase().includes(q);

      let matchTags = false;
      if (item.etiquetas && Array.isArray(item.etiquetas)) {
        matchTags = item.etiquetas.some((t: any) => {
          const tName = typeof t === 'string' ? t : t.nombre;
          return tName?.toLowerCase().includes(q);
        });
      }
      return matchName || matchOrg || matchContact || matchUser || matchTags;
    });
  };

  const [columns, setColumns] = useState<Record<string, Column>>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [projectMetadata, setProjectMetadata] = useState<any>({});

  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [selectedOportunidadInfo, setSelectedOportunidadInfo] = useState<{ itemId: string, columnId: string } | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  const [configurarEtapaModalOpenFor, setConfigurarEtapaModalOpenFor] = useState<string | null>(null);
  const [reassignPopoverFor, setReassignPopoverFor] = useState<string | null>(null);
  const [reassigningUserId, setReassigningUserId] = useState<number | null>(null);
  const [colaboradoresPopoverFor, setColaboradoresPopoverFor] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<'left-0' | 'right-0'>('right-0');
  const [changingStageFor, setChangingStageFor] = useState<{itemId: string, currentColumnId: string} | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'reporte' | 'charts'>('kanban');

  const [users, setUsers] = useState<any[]>([]);
  const [globalTags, setGlobalTags] = useState<{ id: string, nombre: string, color: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  const uniqueUsers = React.useMemo(() => {
    const usersMap = new Map();
    columnOrder.forEach(colId => {
      columns[colId].items.forEach((item: any) => {
        if (item.responsible && item.responsible.id) {
          usersMap.set(item.responsible.id.toString(), item.responsible.name);
        }
      });
    });
    return Array.from(usersMap.entries()).map(([id, name]) => ({ id, name }));
  }, [columns, columnOrder]);

  const uniqueTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    columnOrder.forEach(colId => {
      const col = columns[colId];
      if (col && Array.isArray(col.items)) {
        col.items.forEach((item: any) => {
          if (Array.isArray(item.etiquetas)) {
            item.etiquetas.forEach((t: any) => {
              const name = typeof t === 'string' ? t : t.nombre;
              if (name) tagsSet.add(name);
            });
          }
        });
      }
    });
    return Array.from(tagsSet).sort();
  }, [columns, columnOrder]);

  const uniqueSectors = React.useMemo(() => {
    const sectorsSet = new Set<string>();
    columnOrder.forEach(colId => {
      const col = columns[colId];
      if (col && Array.isArray(col.items)) {
        col.items.forEach((item: any) => {
          const ind = item.organizacion_perfil?.industria;
          if (ind) sectorsSet.add(ind);
        });
      }
    });
    return Array.from(sectorsSet).sort();
  }, [columns, columnOrder]);

  const [portalNodeLeft, setPortalNodeLeft] = useState<HTMLElement | null>(null);
  const [portalNodeRight, setPortalNodeRight] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!selectedOportunidadInfo) {
      setTimeout(() => {
        setPortalNodeLeft(document.getElementById('topnav-content-left'));
        setPortalNodeRight(document.getElementById('topnav-actions'));
      }, 100);
    } else {
      setPortalNodeLeft(null);
      setPortalNodeRight(null);
    }
  }, [selectedOportunidadInfo]);

  useEffect(() => {
    if (setHideSearch) {
      setHideSearch(viewMode !== 'kanban');
    }
    return () => {
      if (setHideSearch) {
        setHideSearch(false);
      }
    };
  }, [viewMode, setHideSearch]);

  useEffect(() => {
    if (proyecto_id) {
      loadData(Number(proyecto_id));
    }
  }, [proyecto_id]);

  // Sync URL ?oportunidad=X with local state when columns load or URL changes
  useEffect(() => {
    const opId = searchParams.get('oportunidad');
    if (opId && Object.keys(columns).length > 0) {
      let foundColumnId = null;
      for (const col of Object.values(columns)) {
        if (col.items.find(i => i.id?.toString() === opId || i.uid === opId)) {
          foundColumnId = col.id;
          break;
        }
      }
      if (foundColumnId) {
        if (!selectedOportunidadInfo || selectedOportunidadInfo.itemId !== opId) {
          setSelectedOportunidadInfo({ itemId: opId, columnId: foundColumnId });
        }
      }
    } else if (!opId && selectedOportunidadInfo) {
      setSelectedOportunidadInfo(null);
    }
  }, [searchParams, columns]);

  const openDetalle = (columnId: string, itemId: string) => {
    setSearchParams({ oportunidad: itemId });
    setSelectedOportunidadInfo({ columnId, itemId });
  };

  const closeDetalle = () => {
    setSelectedOportunidadInfo(null);
    setHideTopNav(false);
    // Remove query param
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('oportunidad');
    setSearchParams(searchParams);
    if (proyecto_id) loadData(Number(proyecto_id), false);
  };

  // const loadGlobalTags = async () => {
  //   try {
  //     const res = await settingsService.getSettingByName('etiquetas');
  //     if (res && res.content) setGlobalTags(JSON.parse(res.content));
  //   } catch (e) {
  //     console.log('No global tags setting found yet');
  //   }
  // };

  const getTagColor = (tag: any) => {
    let tagName = typeof tag === 'string' ? tag : tag.nombre;
    if (tag.color) return tag.color;
    const globalTag = globalTags.find(t => t.nombre.toLowerCase() === tagName.toLowerCase());
    if (globalTag) return globalTag.color;
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 85%)`;
  };

  // const loadUsers = async () => {
  //   try {
  //     const data = await userService.getAllUsers();
  //     setUsers(data);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuId(null);
      setColaboradoresPopoverFor(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    setHideTopNav(!!selectedOportunidadInfo);
    return () => setHideTopNav(false);
  }, [selectedOportunidadInfo, setHideTopNav]);

  const loadData = async (projId: number, showSpinner: boolean = true) => {
    try {
      if (showSpinner) showLoader('Obteniendo oportunidades...');
      const kanbanData = await proyectosService.getProyectData(projId);
      const etapasRes = kanbanData.etapas || [];
      const optsRes = kanbanData.oportunidades || [];
      
      setUsers(kanbanData.users || []);
      setGlobalTags(kanbanData.etiquetas || []);
      setProjectMetadata(kanbanData.metadata || {});
      // If we needed to set organizaciones globally, we could do it here
      // setOrganizaciones(kanbanData.organizaciones || []);

      const newColumns: Record<string, Column> = {};
      const newOrder: string[] = [];

      etapasRes.forEach((e: any) => {
        const idStr = e.id!.toString();
        newOrder.push(idStr);
        newColumns[idStr] = {
          id: idStr,
          title: e.nombre,
          status: 'PP',
          colorClass: e.color || 'bg-primary',
          isFolded: e.desplegado === false,
          isWon: !!e.is_ganado,
          isLost: !!e.is_perdido,
          requirements: e.requerimiento || '',
          items: optsRes.filter((o: any) => o.etapa_id === e.id).map((o: any) => {
            const orgContactMatch = (o.organizacion_contactos || []).find((c: any) => c.email === o.contacto_data?.email);
            return {
              ...o,
              uid: o.id!.toString(), // for drag and drop
              name: o.organizacion_perfil?.nombre || 'Sin Cliente',
              product: o.nombre || o.contacto_data?.product || 'Oportunidad',
              organizacion_id: o.organizacion_id,
              email: o.contacto_data?.email || '',
              phone: o.contacto_data?.phone || o.contacto_data?.telefono || '',
              contactName: o.contacto_data?.nombre || orgContactMatch?.nombre || '',
              contactStatus: o.contacto_data?.estatus || orgContactMatch?.estatus || '',
              value: (function(){
                if (o.mercado_potencial) {
                  try {
                    const mp = JSON.parse(o.mercado_potencial);
                    if (mp.venta_usd_anio) return String(mp.venta_usd_anio);
                  } catch(e){}
                }
                return '0';
              })(),
              mercado_potencial: o.mercado_potencial || null,
              stars: o.prioridad_estrellas || 0,
              volume: '0',
              periodicity: 'N/A',
              responsible: { name: o.responsable_nombre ? `${o.responsable_nombre} ${o.responsable_apellido || ''}` : 'Sin asignar', id: o.usuario_asignado_id, email: o.responsable_email },
              colaboradores: Array.isArray(o.colaboradores) ? o.colaboradores : [],
              unread_emails: o.unread_emails || 0
            };
          })
        };
      });

      setColumns(newColumns);
      setColumnOrder(newOrder);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      if (showSpinner) hideLoader();
    }
  };

  const submitAddForm = async (data: OportunidadFormData, columnId: string) => {
    if (!proyecto_id) return;
    try {
      if (editingCardId) {
        // TODO update logic
        setEditingCardId(null);
      } else {
        await oportunidadesService.create({
          proyecto_id: Number(proyecto_id),
          oportunidad_id: data.oportunidad_id,
          etapa_id: Number(columnId),
          nombre: data.product,
          usuario_asignado_id: data.usuario_asignado_id,
          contacto_data: {
            nombre: data.contact_name,
            cargo: data.contact_cargo,
            email: data.email,
            phone: data.phone,
            contact_action: data.contact_action,
            original_email: data.original_email
          },
          detalles: {
            prioridad_estrellas: data.stars,
            mercado_potencial: data.mercado_potencial,
          }
        });
        await loadData(Number(proyecto_id), false);
        setAddingToColumn(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onDragEnd = (result: DropResult) => {
    isDraggingRef.current = false;
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    if (result.type === 'column') {
      const newOrder = Array.from(columnOrder);
      const [removed] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, removed);
      setColumnOrder(newOrder);
      return;
    }

    const startCol = columns[source.droppableId];
    const finishCol = columns[destination.droppableId];

    if (startCol === finishCol) {
      const newItems = Array.from(startCol.items);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);
      setColumns({ ...columns, [startCol.id]: { ...startCol, items: newItems } });
      return;
    }

    const startItems = Array.from(startCol.items);
    const [removed] = startItems.splice(source.index, 1);
    const finishItems = Array.from(finishCol.items);
    finishItems.splice(destination.index, 0, removed);

    setColumns({
      ...columns,
      [startCol.id]: { ...startCol, items: startItems },
      [finishCol.id]: { ...finishCol, items: finishItems }
    });

    // Update in background
    oportunidadesService.mover(Number(draggableId), Number(finishCol.id)).catch(e => {
      console.error('Error moviendo oportunidad:', e);
      // Rollback reloading data
      loadData(Number(proyecto_id), false);
    });
  };

  const onDragStart = () => {
    isDraggingRef.current = true;
  };

  const onDragUpdate = () => {
    // Not reliable for continuous scrolling as it only fires on movement.
    // Instead we can rely on a global touchmove listener during drag.
  };

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!scrollContainerRef.current) return;
      
      if (!isDraggingRef.current) {
        if (scrollIntervalRef.current) {
          clearInterval(scrollIntervalRef.current);
          scrollIntervalRef.current = null;
        }
        return;
      }

      const touch = e.touches[0];
      const { clientX } = touch;
      const { innerWidth } = window;
      
      const SCROLL_ZONE_WIDTH = 80; // pixels from edge to trigger scroll
      const SCROLL_SPEED = 15;
      
      if (clientX < SCROLL_ZONE_WIDTH) {
        // Scroll left
        if (!scrollIntervalRef.current) {
          scrollIntervalRef.current = window.setInterval(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollLeft -= SCROLL_SPEED;
            }
          }, 16);
        }
      } else if (clientX > innerWidth - SCROLL_ZONE_WIDTH) {
        // Scroll right
        if (!scrollIntervalRef.current) {
          scrollIntervalRef.current = window.setInterval(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollLeft += SCROLL_SPEED;
            }
          }, 16);
        }
      } else {
        // Stop scrolling
        if (scrollIntervalRef.current) {
          clearInterval(scrollIntervalRef.current);
          scrollIntervalRef.current = null;
        }
      }
    };

    const handleTouchEnd = () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { capture: true, passive: true });
    window.addEventListener('touchend', handleTouchEnd, { capture: true });
    window.addEventListener('touchcancel', handleTouchEnd, { capture: true });
    
    return () => {
      window.removeEventListener('touchmove', handleTouchMove, { capture: true } as EventListenerOptions);
      window.removeEventListener('touchend', handleTouchEnd, { capture: true } as EventListenerOptions);
      window.removeEventListener('touchcancel', handleTouchEnd, { capture: true } as EventListenerOptions);
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, []);

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleReassign = async (e: React.MouseEvent, itemId: string, userId: number, currentUserId: number) => {
    e.stopPropagation();
    if (userId === currentUserId) {
      setReassignPopoverFor(null);
      return;
    }

    setReassigningUserId(userId);
    try {
      // Optimistic update
      const newColumns = { ...columns };
      let foundUser = users.find(u => u.id === userId);
      for (const colId in newColumns) {
        const item = newColumns[colId].items.find(i => i.uid === itemId);
        if (item && foundUser) {
          item.responsible = { name: `${foundUser.nombre} ${foundUser.apellido || ''}`, id: userId };
          break;
        }
      }
      setColumns(newColumns);

      await oportunidadesService.reassign(Number(itemId), userId);
      setReassignPopoverFor(null);
      loadData(Number(proyecto_id), false);
    } catch (error) {
      console.error(error);
      loadData(Number(proyecto_id), false); // revert
    } finally {
      setReassigningUserId(null);
    }
  };

  const handleColaboradorToggle = async (e: React.MouseEvent, itemId: string, user: any, isAdding: boolean) => {
    e.stopPropagation();
    const newColumns = { ...columns };
    for (const colId in newColumns) {
      const item = newColumns[colId].items.find((i: any) => i.uid === itemId);
      if (item) {
        const current: any[] = Array.isArray(item.colaboradores) ? item.colaboradores : [];
        const updated = isAdding
          ? [...current, { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email }]
          : current.filter((c: any) => c.id !== user.id);
        item.colaboradores = updated;
        setColumns({ ...newColumns });
        oportunidadesService.updateColaboradores(Number(itemId), updated).catch((err: any) => {
          console.error(err);
          loadData(Number(proyecto_id), false);
        });
        break;
      }
    }
  };

  const handleUpdatePrioridad = async (e: React.MouseEvent, itemId: string, stars: number) => {
    e.stopPropagation();
    try {
      // Optimizacion optimista
      const newColumns = { ...columns };
      for (const colId in newColumns) {
        const item = newColumns[colId].items.find(i => i.uid === itemId);
        if (item) {
          item.stars = stars;
          break;
        }
      }
      setColumns(newColumns);

      await oportunidadesService.updatePrioridad(Number(itemId), stars);
    } catch (error) {
      console.error(error);
      loadData(Number(proyecto_id), false); // revert if error
    }
  };

  const getTotalValue = (items: any[]) => items.reduce((acc, item) => {
    const num = parseFloat((item.value || '').replace(/[^0-9.-]+/g, ""));
    return acc + (isNaN(num) ? 0 : num);
  }, 0);




  if (!proyecto_id) {
    return (
      <>
        <div className="h-full flex items-center justify-center">
          <div className="text-center p-8 bg-surface border border-border-subtle rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-primary mb-4">handshake</span>
            <h2 className="text-xl font-bold mb-2">Oportunidades</h2>
            <p className="text-on-surface-variant mb-6 max-w-md">Selecciona un proyecto del menú lateral para ver su tablero de oportunidades o crea uno nuevo.</p>
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-surface-muted text-on-surface-variant hover:bg-primary hover:text-white rounded-lg transition-colors font-bold"
            >
              <span className="material-symbols-outlined">calendar_month</span>
              Ver Calendario Global
            </button>
          </div>
        </div>
        {isCalendarOpen && <CalendarioReunionesModal onClose={() => setIsCalendarOpen(false)} proyectoId={Number(proyecto_id)} />}
      </>
    );
  }

  if (selectedOportunidadInfo) {
    const col = columns[selectedOportunidadInfo.columnId];
    const item = col?.items.find(i => i.uid === selectedOportunidadInfo.itemId);
    if (item) {
      return (
        <OportunidadDetalle
          oportunidad={item as any}
          currentColumnId={selectedOportunidadInfo.columnId}
          columnsList={columnOrder.map(id => columns[id])}
          onClose={closeDetalle}
          onChangeStage={async (newColId) => {
            await oportunidadesService.mover(item.id, Number(newColId));
            await loadData(Number(proyecto_id), false);
            // Updating columnId, URL param stays same
            setSelectedOportunidadInfo({ columnId: newColId, itemId: item.uid });
          }}
        />
      );
    }
  }

  const filtersComponent = viewMode === 'charts' ? (
    <div className="flex items-center gap-3">
      {/* Vendedor Filter */}
      <div className="flex items-center gap-1.5 bg-surface border border-border-subtle rounded-lg shadow-sm px-3 py-1.5">
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">person</span>
        <select 
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="bg-transparent text-[13px] font-bold text-on-surface outline-none cursor-pointer border-none p-0 focus:ring-0"
        >
          <option value="all">Todos los vendedores</option>
          {uniqueUsers.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>
      {/* Etiquetas Filter */}
      <div className="flex items-center gap-1.5 bg-surface border border-border-subtle rounded-lg shadow-sm px-3 py-1.5">
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">label</span>
        <select 
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="bg-transparent text-[13px] font-bold text-on-surface outline-none cursor-pointer border-none p-0 focus:ring-0"
        >
          <option value="all">Todas las etiquetas</option>
          {uniqueTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
      {/* Sectores Filter */}
      <div className="flex items-center gap-1.5 bg-surface border border-border-subtle rounded-lg shadow-sm px-3 py-1.5">
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">domain</span>
        <select 
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="bg-transparent text-[13px] font-bold text-on-surface outline-none cursor-pointer border-none p-0 focus:ring-0"
        >
          <option value="all">Todos los sectores</option>
          {uniqueSectors.map(sector => (
            <option key={sector} value={sector}>{sector}</option>
          ))}
        </select>
      </div>
      {/* Limpiar Filtros */}
      {(selectedUser !== 'all' || selectedTag !== 'all' || selectedSector !== 'all') && (
        <button 
          onClick={() => {
            setSelectedUser('all');
            setSelectedTag('all');
            setSelectedSector('all');
          }}
          className="p-1.5 text-outline hover:text-error hover:bg-error/10 rounded transition-colors flex items-center justify-center"
          title="Limpiar filtros"
        >
          <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
        </button>
      )}
    </div>
  ) : null;

  const viewButtonsComponent = hasPermiso('oportunidades.vistas') ? (
    <div className="flex items-center bg-surface border border-border-subtle rounded-lg shadow-sm p-1">
      <button
        onClick={() => setViewMode('kanban')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors font-bold text-[13px] ${viewMode === 'kanban' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}`}
      >
        <span className="material-symbols-outlined text-[18px]">view_kanban</span>
        Kanban
      </button>
      <button
        onClick={() => setViewMode('reporte')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors font-bold text-[13px] ${viewMode === 'reporte' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}`}
      >
        <span className="material-symbols-outlined text-[18px]">table_chart</span>
        Reporte
      </button>
      <button
        onClick={() => setViewMode('charts')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors font-bold text-[13px] ${viewMode === 'charts' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}`}
      >
        <span className="material-symbols-outlined text-[18px]">bar_chart</span>
        Gráficos
      </button>
      <div className="w-px h-6 bg-border-subtle mx-1"></div>
      <button
        onClick={() => setIsCalendarOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors font-bold text-[13px] text-on-surface-variant hover:text-primary hover:bg-primary/5"
      >
        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
        Calendario
      </button>
    </div>
  ) : null;

  return (
    <div className="h-[calc(100vh-88px)] flex flex-col relative">
      {portalNodeLeft && filtersComponent && createPortal(filtersComponent, portalNodeLeft)}
      {portalNodeRight && viewButtonsComponent && createPortal(viewButtonsComponent, portalNodeRight)}
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart} onDragUpdate={onDragUpdate}>
        <div 
          ref={scrollContainerRef}
          className={`flex-1 overflow-x-auto ${viewMode === 'kanban' ? 'pt-2' : '-mt-8'}`}
        >
          {viewMode === 'kanban' && (
            <Droppable droppableId="all-columns" direction="horizontal" type="column">
              {(provided) => (
                <div
                  className="flex gap-gutter min-w-max h-full items-start px-4"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {columnOrder.map((columnId, index) => {
                    const column = columns[columnId];
                    const isCollapsed = column.isFolded;

                    return (
                      <Draggable key={column.id} draggableId={column.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} className={`${isCollapsed ? 'w-12' : 'w-[260px] sm:w-80'} flex-shrink-0 flex flex-col transition-[width] duration-300`}>
                            <div className={`flex flex-col mb-4 px-2 ${isCollapsed ? 'items-center gap-2 py-2 h-full border-r border-border-subtle cursor-grab' : ''}`} {...(isCollapsed ? provided.dragHandleProps : {})}>
                              {!isCollapsed ? (
                                <>
                                  <div className="flex flex-col w-full mb-1">
                                    <div className="flex justify-between items-start w-full">
                                      <div className="flex-1 cursor-grab py-1" {...provided.dragHandleProps}>
                                        <h3 className="font-label-caps text-[13px] font-bold text-on-surface leading-tight">{column.title}</h3>
                                      </div>
                                      <div className="flex items-center gap-1 text-on-surface-variant">
                                        <button onClick={() => setConfigurarEtapaModalOpenFor(column.id)} className="hover:bg-surface-muted hover:text-primary rounded p-0.5 transition-colors" title="Configurar etapa">
                                          <span className="material-symbols-outlined text-[18px]">settings</span>
                                        </button>
                                        <button onClick={() => setAddingToColumn(column.id)} className="hover:bg-surface-muted hover:text-primary rounded p-0.5 transition-colors" title="Añadir oportunidad a esta etapa">
                                          <span className="material-symbols-outlined text-[18px]">add</span>
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center w-full mb-1">
                                      <span className="text-[11px] font-bold text-on-surface-variant leading-none">{column.items.length} oport.</span>
                                      {getTotalValue(column.items) > 0 && (
                                        <span className="text-[11px] font-bold text-primary leading-none">{formatMoney(getTotalValue(column.items))}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className={`h-1.5 rounded-sm w-full mb-1 ${column.colorClass}`}></div>
                                </>
                              ) : (
                                <>
                                  <span className="bg-surface-muted px-2 py-0.5 rounded text-[11px] font-bold mb-4">{column.items.length}</span>
                                  <div className="flex-1 relative w-full flex justify-center pt-8">
                                    <h3 className="font-label-caps text-[12px] font-bold text-on-surface absolute origin-center rotate-90 whitespace-nowrap">{column.title}</h3>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className={isCollapsed ? 'hidden' : 'block'}>
                              <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`space-y-4 min-h-[200px] p-2 -mx-2 rounded-lg transition-all duration-200 border-2 ${snapshot.isDraggingOver ? 'bg-primary/5 border-primary border-dashed shadow-inner' : 'border-transparent'}`}
                                  >
                                    {addingToColumn === column.id && (
                                      <RegistrarOportunidad
                                        columnId={column.id}
                                        users={users}
                                        onSubmit={submitAddForm}
                                        onCancel={() => setAddingToColumn(null)}
                                      />
                                    )}

                                    {getFilteredItems(column.items).map((item, index) => (
                                      <Draggable key={item.uid} draggableId={item.uid} index={index}>
                                        {(provided, snapshot) => {
                                          const isColaboradorCard = item.tipo_acceso === 'colaborador' || (Array.isArray(item.colaboradores) && item.colaboradores.some((c: any) => c.id === user?.id)) && item.responsible?.id !== user?.id;
                                          const cardBgClass = isColaboradorCard ? 'bg-blue-50 border-blue-200' : 'bg-surface border-border-subtle';
                                          
                                          return (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={activeMenuId === item.uid || reassignPopoverFor === item.uid || colaboradoresPopoverFor === item.uid ? 'relative z-50' : ''}
                                            style={{
                                              ...provided.draggableProps.style,
                                              ...(snapshot.isDropAnimating ? { transitionDuration: '0.001s' } : {})
                                            }}
                                          >
                                            <div className={`${cardBgClass} border p-3 rounded cursor-grab relative ${snapshot.isDragging ? 'shadow-lg border-primary scale-[1.02] rotate-1 z-50 opacity-90 transition-none' : 'hover:border-primary/50 transition-colors'}`}>
                                              {isColaboradorCard && (
                                                <div className="absolute top-0 right-0 -mt-2 -mr-2 z-50 bg-[#6366f1] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                                  👥 Colab.
                                                </div>
                                              )}
                                              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l ${column.colorClass}`}></div>

                                              <div className="flex justify-between items-start mb-1 relative z-40">
                                                <div className="flex-1 min-w-0 pr-6 relative">
                                                  <h4 onClick={() => openDetalle(column.id, item.uid)} className="text-[13px] font-bold text-on-surface leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-colors inline">
                                                    {item.product}
                                                  </h4>
                                                  {item.unread_emails > 0 && (
                                                    <span title={`${item.unread_emails} correos no leídos`} className="ml-2 inline-flex items-center justify-center bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full align-middle animate-pulse">
                                                      <span className="material-symbols-outlined text-[10px] mr-0.5">mail</span>
                                                      {item.unread_emails}
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="absolute right-0 top-0">
                                                  <button onClick={(e) => toggleMenu(e, item.uid)} className="text-on-surface-variant hover:bg-surface-muted hover:text-primary rounded p-0.5 transition-colors">
                                                    <span className="material-symbols-outlined text-[16px]">more_vert</span>
                                                  </button>
                                                  {activeMenuId === item.uid && (
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border-subtle rounded shadow-lg z-50 overflow-hidden">
                                                      <button
                                                        className="w-full text-left px-4 py-2 text-[12px] hover:bg-surface-muted transition-colors flex items-center gap-2"
                                                        onClick={() => {
                                                          openDetalle(column.id, item.uid);
                                                          setActiveMenuId(null);
                                                        }}
                                                      >
                                                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                        Ver Detalles
                                                      </button>

                                                      {hasPermiso('oportunidades.editar') && (
                                                        <button
                                                          className="w-full text-left px-4 py-2 text-[12px] hover:bg-surface-muted transition-colors flex items-center gap-2 text-primary"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setChangingStageFor({ itemId: item.uid, currentColumnId: column.id });
                                                            setActiveMenuId(null);
                                                          }}
                                                        >
                                                          <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                                                          Cambiar etapa
                                                        </button>
                                                      )}

                                                      {hasPermiso('oportunidades.eliminar') && (
                                                        <button
                                                          className="w-full text-left px-4 py-2 text-[12px] hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2 text-red-500 border-t border-border-subtle"
                                                          onClick={async (e) => {
                                                            e.stopPropagation();
                                                            setActiveMenuId(null);
                                                            const isConfirmed = await confirm({
                                                              title: 'Eliminar Oportunidad',
                                                              message: '¿Estás seguro de que deseas eliminar esta oportunidad? Esta acción no se puede deshacer y borrará todo el historial.',
                                                              confirmText: 'Sí, Eliminar'
                                                            });
                                                            if (isConfirmed) {
                                                              try {
                                                                await oportunidadesService.deleteOportunidad(item.id!);
                                                                if (proyecto_id) loadData(Number(proyecto_id), false);
                                                              } catch (error) {
                                                                console.error(error);
                                                                alert('Ocurrió un error al eliminar la oportunidad.');
                                                              }
                                                            }
                                                          }}
                                                        >
                                                          <span className="material-symbols-outlined text-[16px]">delete</span>
                                                          Eliminar
                                                        </button>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>

                                              <p className="text-[11px] text-on-surface-variant mb-2 line-clamp-1">{item.name}</p>

                                              <div className="flex flex-wrap gap-1.5 mb-2">
                                                {parseFloat(item.value) > 0 && <span className="bg-surface-muted px-1.5 py-0.5 rounded text-[10px] font-bold text-on-surface-variant">{formatMoney(parseFloat(item.value), item.tipo_unidad)}</span>}
                                              </div>

                                              {item.etiquetas && Array.isArray(item.etiquetas) && item.etiquetas.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                  {item.etiquetas.map((t: any, i: number) => {
                                                    const tagName = typeof t === 'string' ? t : t.nombre;
                                                    return (
                                                      <span
                                                        key={i}
                                                        style={{ backgroundColor: getTagColor(t) }}
                                                        className="px-1.5 py-0.5 rounded text-[9px] text-on-surface shadow-sm font-bold truncate max-w-[80px]"
                                                        title={tagName}
                                                      >
                                                        {tagName}
                                                      </span>
                                                    );
                                                  })}
                                                </div>
                                              )}

                                              {/* Colaboradores en la tarjeta */}
                                              {(Array.isArray(item.colaboradores) && item.colaboradores.length > 0 || true) && (
                                                <div className="flex items-center gap-1 mb-2">
                                                  <span className="material-symbols-outlined text-[12px] text-on-surface-variant/60">group</span>
                                                  <div className="flex items-center gap-0.5 flex-wrap">
                                                    {(item.colaboradores || []).map((colab: any) => (
                                                      <div
                                                        key={colab.id}
                                                        title={`${colab.nombre} ${colab.apellido}`}
                                                        className="w-5 h-5 rounded-full bg-[#6366f1] text-white flex items-center justify-center font-bold text-[8px] uppercase shadow-sm"
                                                      >
                                                        {colab.nombre?.charAt(0)}{colab.apellido?.charAt(0)}
                                                      </div>
                                                    ))}
                                                    {hasPermiso('oportunidades.asignar_colaborador') && (
                                                      <div className="relative">
                                                        <button
                                                          type="button"
                                                          onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            setColaboradoresPopoverFor(colaboradoresPopoverFor === item.uid ? null : item.uid); 
                                                            setReassignPopoverFor(null); 
                                                            setActiveMenuId(null); 
                                                            if (e.clientX < 220) {
                                                              setPopoverPosition('left-0');
                                                            } else {
                                                              setPopoverPosition('right-0');
                                                            }
                                                          }}
                                                          className="w-5 h-5 rounded-full border border-dashed border-on-surface-variant/40 text-on-surface-variant hover:border-[#6366f1] hover:text-[#6366f1] flex items-center justify-center transition-colors"
                                                          title="Gestionar colaboradores"
                                                        >
                                                          <span className="material-symbols-outlined text-[11px]">person_add</span>
                                                        </button>

                                                        {colaboradoresPopoverFor === item.uid && (
                                                          <>
                                                            <div
                                                              className="fixed inset-0 z-40"
                                                              onClick={(e) => { e.stopPropagation(); setColaboradoresPopoverFor(null); }}
                                                            />
                                                            <div className={`absolute ${popoverPosition} bottom-full mb-2 w-52 bg-surface border border-border-subtle rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 max-h-52 overflow-y-auto`}>
                                                              <div className="p-2 border-b border-border-subtle bg-surface-muted text-[11px] font-bold text-on-surface-variant sticky top-0">
                                                                Colaboradores
                                                              </div>
                                                              {users
                                                                .filter((u: any) => u.id !== item.responsible?.id)
                                                                .map((user: any) => {
                                                                  const isColaborador = (item.colaboradores || []).some((c: any) => c.id === user.id);
                                                                  return (
                                                                    <button
                                                                      key={user.id}
                                                                      type="button"
                                                                      className="w-full text-left px-3 py-2 text-[12px] hover:bg-surface-muted transition-colors flex items-center gap-2"
                                                                      onClick={(e) => handleColaboradorToggle(e, item.uid, user, !isColaborador)}
                                                                    >
                                                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[8px] uppercase shrink-0 ${isColaborador ? 'bg-[#6366f1] text-white' : 'bg-[#6366f1]/10 text-[#6366f1]'}`}>
                                                                        {user.nombre?.charAt(0)}
                                                                      </div>
                                                                      <span className="font-bold text-on-surface truncate flex-1">{user.nombre} {user.apellido}</span>
                                                                      {isColaborador && (
                                                                        <span className="material-symbols-outlined text-[14px] text-[#6366f1] shrink-0">check</span>
                                                                      )}
                                                                    </button>
                                                                  );
                                                                })}
                                                            </div>
                                                          </>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              )}

                                              <div className="flex items-center justify-between pt-2 border-t border-border-subtle relative z-30">
                                                <div className="flex items-center gap-0.5">
                                                  {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                      key={star}
                                                      type="button"
                                                      onClick={(e) => handleUpdatePrioridad(e, item.uid, star)}
                                                      className="hover:scale-125 transition-transform p-0.5"
                                                    >
                                                      <span className={`material-symbols-outlined text-[14px] [font-variation-settings:'FILL'_1] ${item.stars >= star ? 'text-status-ip' : 'text-on-surface-variant/30'}`}>star</span>
                                                    </button>
                                                  ))}
                                                </div>
                                                <div className="relative">
                                                  {hasPermiso('oportunidades.asignar_vendedor') ? (
                                                    <button
                                                      onClick={(e) => { e.stopPropagation(); setReassignPopoverFor(reassignPopoverFor === item.uid ? null : item.uid); }}
                                                      className="w-5 h-5 rounded bg-primary text-white flex items-center justify-center font-bold text-[9px] uppercase hover:scale-110 transition-transform shadow-sm"
                                                      title={`Asignado a: ${item.responsible.name}`}
                                                    >
                                                      {item.responsible.name.charAt(0)}
                                                    </button>
                                                  ) : (
                                                    <div
                                                      className="w-5 h-5 rounded bg-primary text-white flex items-center justify-center font-bold text-[9px] uppercase shadow-sm cursor-default"
                                                      title={`Asignado a: ${item.responsible.name}`}
                                                    >
                                                      {item.responsible.name.charAt(0)}
                                                    </div>
                                                  )}

                                                  {hasPermiso('oportunidades.asignar_vendedor') && reassignPopoverFor === item.uid && (
                                                    <>
                                                      <div
                                                        className="fixed inset-0 z-40"
                                                        onClick={(e) => { e.stopPropagation(); setReassignPopoverFor(null); }}
                                                      />
                                                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-surface border border-border-subtle rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 max-h-48 overflow-y-auto">
                                                        <div className="p-2 border-b border-border-subtle bg-surface-muted text-[11px] font-bold text-on-surface-variant sticky top-0">Reasignar oportunidad</div>
                                                        {users.map(user => (
                                                          <button
                                                            key={user.id}
                                                            type="button"
                                                            className="w-full text-left px-3 py-2 text-[12px] hover:bg-surface-muted transition-colors flex items-center gap-2"
                                                            onClick={(e) => handleReassign(e, item.uid, user.id, item.responsible.id)}
                                                          >
                                                            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px] uppercase shrink-0">
                                                              {user.nombre?.charAt(0)}
                                                            </div>
                                                            <div className="flex flex-col flex-1 min-w-0">
                                                              <span className="font-bold text-on-surface leading-tight truncate">{user.nombre} {user.apellido}</span>
                                                            </div>
                                                            {reassigningUserId === user.id ? (
                                                              <svg className="animate-spin h-3 w-3 text-primary ml-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                              </svg>
                                                            ) : user.id === item.responsible.id ? (
                                                              <span className="material-symbols-outlined text-[14px] text-primary ml-auto shrink-0">check</span>
                                                            ) : null}
                                                          </button>
                                                        ))}
                                                      </div>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );}}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}

                  {/* Botón Añadir Etapa */}
                  <div className="w-80 flex-shrink-0">
                    <button
                      onClick={() => setConfigurarEtapaModalOpenFor('new')}
                      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border-subtle rounded-lg text-on-surface-variant hover:text-primary hover:border-primary hover:bg-primary/5 transition-all font-bold text-[13px]"
                    >
                      <span className="material-symbols-outlined text-[20px]">add_circle</span>
                      Añadir etapa
                    </button>
                  </div>
                </div>
              )}
            </Droppable>
          )}

          {viewMode === 'reporte' && (
            <div className="flex-1 overflow-hidden p-0">
              <OportunidadesReporte columns={columns} columnOrder={columnOrder} proyectoId={Number(proyecto_id)} hasGoogleSheet={!!projectMetadata.google_sheet_url} />
            </div>
          )}

          {viewMode === 'charts' && (
            <div className="flex-1 h-full overflow-hidden">
              <OportunidadesCharts 
                columns={columns} 
                columnOrder={columnOrder} 
                selectedUser={selectedUser} 
                selectedTag={selectedTag} 
                selectedSector={selectedSector} 
              />
            </div>
          )}
        </div>
      </DragDropContext>

      {configurarEtapaModalOpenFor && (
        <ConfigurarEtapaModal
          initialTitle={configurarEtapaModalOpenFor === 'new' ? '' : columns[configurarEtapaModalOpenFor].title}
          initialIsFolded={configurarEtapaModalOpenFor === 'new' ? false : columns[configurarEtapaModalOpenFor].isFolded}
          initialIsWon={configurarEtapaModalOpenFor === 'new' ? false : columns[configurarEtapaModalOpenFor].isWon}
          initialIsLost={configurarEtapaModalOpenFor === 'new' ? false : columns[configurarEtapaModalOpenFor].isLost}
          initialRequirements={configurarEtapaModalOpenFor === 'new' ? '' : columns[configurarEtapaModalOpenFor].requirements}
          initialColor={configurarEtapaModalOpenFor === 'new' ? 'bg-primary' : columns[configurarEtapaModalOpenFor].colorClass}
          hasWonStage={Object.values(columns).some(c => c.isWon && c.id !== configurarEtapaModalOpenFor)}
          hasLostStage={Object.values(columns).some(c => c.isLost && c.id !== configurarEtapaModalOpenFor)}
          onClose={() => setConfigurarEtapaModalOpenFor(null)}
          onSave={async (data) => {
            try {
              if (configurarEtapaModalOpenFor === 'new') {
                // Crear nueva etapa
                await proyectosService.createEtapa(Number(proyecto_id), {
                  nombre: data.title,
                  posicion: columnOrder.length,
                  color: data.color,
                  is_ganado: data.isWon,
                  is_perdido: data.isLost,
                  requerimiento: data.requirements,
                  desplegado: !data.isFolded
                });
              } else {
                // Actualizar etapa existente
                await proyectosService.updateEtapa(Number(configurarEtapaModalOpenFor), {
                  nombre: data.title,
                  desplegado: !data.isFolded,
                  requerimiento: data.requirements,
                  is_ganado: data.isWon,
                  is_perdido: data.isLost,
                  color: data.color
                });
              }
              await loadData(Number(proyecto_id));
              setConfigurarEtapaModalOpenFor(null);
            } catch (error) {
              console.error("Error guardando etapa:", error);
            }
          }}
        />
      )}

      {changingStageFor && (
        <CambiarEtapaModal
          currentEtapaId={changingStageFor.currentColumnId}
          etapas={columnOrder.map(id => ({
            id,
            title: columns[id].title,
            colorClass: columns[id].colorClass
          }))}
          onClose={() => setChangingStageFor(null)}
          onSelect={async (newEtapaId) => {
            const itemToMove = columns[changingStageFor.currentColumnId].items.find(i => i.uid === changingStageFor.itemId);
            if (itemToMove && itemToMove.id) {
              await oportunidadesService.mover(itemToMove.id, Number(newEtapaId));
              if (proyecto_id) loadData(Number(proyecto_id), false);
            }
          }}
        />
      )}


      {isCalendarOpen && <CalendarioReunionesModal onClose={() => setIsCalendarOpen(false)} proyectoId={Number(proyecto_id)} />}
    </div>
  );
};

export default Oportunidades;
