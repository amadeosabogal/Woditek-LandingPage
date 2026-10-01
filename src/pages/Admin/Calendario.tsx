import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Plus, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay eventos en este rango.',
  showMore: (total: number) => `+ Ver más (${total})`
};

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  desc?: string;
}

export const Calendario = () => {
  const { calendarEvents, addCalendarEvent, deleteCalendarEvent } = useAdmin();
  const [view, setView] = useState<View>('week');
  const [date, setDate] = useState(new Date());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(new Date().setHours(new Date().getHours() + 1)),
    desc: ''
  });

  // Error Modal State
  const [errorMessage, setErrorMessage] = useState('');

  // Convert backend events to react-big-calendar format
  const mappedEvents = calendarEvents.map(e => ({
    id: e.id,
    title: e.title,
    start: new Date(e.start_date),
    end: new Date(e.end_date),
    desc: e.description
  }));

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setNewEvent({ title: '', start, end, desc: '' });
    setIsModalOpen(true);
  };

  const handleSelectEvent = async (event: any) => {
    if (window.confirm(`¿Deseas eliminar el evento "${event.title}"?`)) {
      if (event.id) {
        try {
          await deleteCalendarEvent(event.id);
        } catch (error: any) {
          setErrorMessage('No se pudo eliminar el evento. Verifica tu conexión al servidor.');
        }
      }
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;

    try {
      await addCalendarEvent({
        title: newEvent.title,
        start_date: newEvent.start.toISOString(),
        end_date: newEvent.end.toISOString(),
        description: newEvent.desc
      });
      setIsModalOpen(false);
    } catch (error: any) {
      setErrorMessage('No se pudo guardar el evento. Verifica tu conexión al servidor.');
    }
  };

  const eventStyleGetter = (event: Event, start: Date, end: Date, isSelected: boolean) => {
    return {
      style: {
        backgroundColor: '#3162fa',
        borderRadius: '0px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon size={28} className="text-[#3162fa]" />
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Calendario Semanal</h2>
        </div>
        <button 
          onClick={() => {
            setNewEvent({
              title: '',
              start: new Date(),
              end: new Date(new Date().setHours(new Date().getHours() + 1)),
              desc: ''
            });
            setIsModalOpen(true);
          }}
          className="bg-[#3162fa] text-white px-4 py-2 text-sm font-semibold hover:bg-[#1a4cd6] transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Nuevo Evento
        </button>
      </div>

      <div className="bg-white border border-slate-300 shadow-sm p-4 h-[700px]">
        <Calendar
          localizer={localizer}
          events={mappedEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          culture="es"
          messages={messages}
          view={view}
          onView={(newView) => setView(newView)}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          popup
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 uppercase">Nuevo Evento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEvent} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Título</label>
                <input 
                  type="text" 
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full border border-slate-300 p-2 text-sm outline-none focus:border-slate-900"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Inicio</label>
                  <input 
                    type="datetime-local" 
                    value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setNewEvent({...newEvent, start: new Date(e.target.value)})}
                    className="w-full border border-slate-300 p-2 text-sm outline-none focus:border-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Fin</label>
                  <input 
                    type="datetime-local" 
                    value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setNewEvent({...newEvent, end: new Date(e.target.value)})}
                    className="w-full border border-slate-300 p-2 text-sm outline-none focus:border-slate-900"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Descripción</label>
                <textarea 
                  value={newEvent.desc}
                  onChange={(e) => setNewEvent({...newEvent, desc: e.target.value})}
                  className="w-full border border-slate-300 p-2 text-sm outline-none focus:border-slate-900 resize-none h-24"
                />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#3162fa] text-white text-sm font-semibold hover:bg-[#1a4cd6]"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white max-w-sm w-full shadow-xl border border-red-200">
            <div className="bg-red-50 p-4 border-b border-red-100 flex items-center justify-between">
              <h3 className="text-red-800 font-bold uppercase tracking-wide text-sm">Error</h3>
              <button onClick={() => setErrorMessage('')} className="text-red-500 hover:text-red-700">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-700 text-sm">{errorMessage}</p>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setErrorMessage('')}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
