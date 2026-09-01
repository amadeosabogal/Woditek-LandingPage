import React from 'react';

export interface Actividad {
  id: string;
  type: string; // 'Llamada', 'Reunión', 'Correo electrónico', etc.
  summary: string;
  dueDate: string;
  status: 'planned' | 'done' | 'overdue';
}

interface ActividadesPopoverProps {
  activities: Actividad[];
  onPlanActivity: () => void;
  onMarkDone: (id: string) => void;
}

const ActividadesPopover: React.FC<ActividadesPopoverProps> = ({
  activities,
  onPlanActivity,
  onMarkDone
}) => {
  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'llamada': return 'call';
      case 'reunión': return 'group';
      case 'correo electrónico': return 'mail';
      default: return 'event';
    }
  };

  const getActivityStatus = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dueDate);
    const parts = dueDate.split('-');
    if (parts.length === 3) {
      date.setFullYear(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    date.setHours(0, 0, 0, 0);

    if (date < today) return 'overdue';
    if (date.getTime() === today.getTime()) return 'today';
    return 'planned';
  };

  const getStatusColor = (act: Actividad) => {
    if (act.status === 'done') return 'text-status-pp';
    const s = getActivityStatus(act.dueDate);
    if (s === 'overdue') return 'text-error';
    if (s === 'today') return 'text-amber-500';
    return 'text-status-pp'; // future planned
  };

  return (
    <div 
      className="absolute bottom-full left-0 mb-2 w-72 bg-surface border border-border-subtle rounded-lg shadow-xl z-50 text-[12px] flex flex-col overflow-hidden"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
    >
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-border-subtle bg-surface-bright">
        <span className="font-bold text-status-pp">Planned</span>
        <span className="bg-status-pp text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">
          {activities.filter(a => a.status !== 'done').length}
        </span>
      </div>

      {/* Activities List */}
      <div className="max-h-48 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-on-surface-variant italic">No hay actividades planificadas.</div>
        ) : (
          activities.map(act => (
            <div key={act.id} className="p-3 border-b border-border-subtle hover:bg-surface-muted transition-colors flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant mt-0.5">
                {getIconForType(act.type)}
              </span>
              <div className="flex-1">
                <div className="font-bold text-on-surface">{act.summary || act.type}</div>
                <div className={`flex items-center gap-1 mt-1 ${getStatusColor(act)}`}>
                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                  <span>{act.dueDate}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="text-on-surface-variant hover:text-primary transition-colors" title="Editar">
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button 
                  className="text-on-surface-variant hover:text-status-pp transition-colors" 
                  title="Marcar como hecho"
                  onClick={() => onMarkDone(act.id)}
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Button */}
      <div className="p-2 bg-surface-bright">
        <button 
          onClick={onPlanActivity}
          className="w-full py-2 text-status-pp font-bold hover:bg-status-pp/10 transition-colors rounded flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          PLANIFICAR UNA ACTIVIDAD
        </button>
      </div>
    </div>
  );
};

export default ActividadesPopover;
