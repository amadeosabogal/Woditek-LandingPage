import React, { useState } from 'react';
import Button from '../../../../components/CRM/ui/Button';
import calendarService from '../../../../services/calendarService';

interface PlanificarActividadModalProps {
  onClose: () => void;
  onSave: (data: { tipo: string, descripcion: string, fecha: string, hora: string }) => Promise<void>;
  defaultAssignedTo?: string;
}

const PlanificarActividadModal: React.FC<PlanificarActividadModalProps> = ({ onClose, onSave }) => {
  const [tipo, setTipo] = useState('Por hacer');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [generateMeet, setGenerateMeet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let finalDescripcion = descripcion;
      if (tipo === 'Reunión' && generateMeet) {
        try {
          const dateStr = fecha && hora ? `${fecha}T${hora}` : new Date().toISOString();
          const meetResponse = await calendarService.createMeet({
            summary: `Reunión de CRM`,
            description: descripcion,
            startDateTime: dateStr
          });
          finalDescripcion += `\n\nEnlace de Google Meet: ${meetResponse.meetLink}`;
        } catch (error) {
          console.error('Error creating Google Meet:', error);
          alert('Hubo un error al generar el enlace de Google Meet. La actividad se guardará sin el enlace.');
        }
      }
      await onSave({ tipo, descripcion: finalDescripcion, fecha, hora });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-3xl rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-surface-bright">
          <div className="flex items-center gap-2 text-primary font-bold">
            <span className="material-symbols-outlined">event</span>
            Planificación de actividad
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-muted rounded-full p-1 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="w-32 text-[13px] font-bold text-on-surface-variant">Tipo de actividad</label>
                <select 
                  className="flex-1 p-1.5 border-b border-border-subtle bg-transparent text-[13px] text-on-surface outline-none focus:border-primary transition-colors"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option value="Por hacer">Por hacer</option>
                  <option value="Correo electrónico">Correo electrónico</option>
                  <option value="Llamada">Llamada</option>
                  <option value="Reunión">Reunión</option>
                  <option value="Cotización de seguimiento">Cotización de seguimiento</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-[13px] font-bold text-on-surface-variant">Descripción</label>
                <input 
                  type="text" 
                  placeholder="Ej. Discutir propuesta"
                  className="flex-1 p-1.5 border-b border-border-subtle bg-transparent text-[13px] text-on-surface outline-none focus:border-primary transition-colors"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="w-32 text-[13px] font-bold text-on-surface-variant">Fecha</label>
                <input 
                  type="date" 
                  className="flex-1 p-1.5 border-b border-border-subtle bg-transparent text-[13px] text-on-surface outline-none focus:border-primary transition-colors"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-[13px] font-bold text-on-surface-variant">Hora</label>
                <input 
                  type="time" 
                  className="flex-1 p-1.5 border-b border-border-subtle bg-transparent text-[13px] text-on-surface outline-none focus:border-primary transition-colors"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </div>
            </div>
            
            {/* Third row for Meet checkbox if it's a meeting */}
            {tipo === 'Reunión' && (
              <div className="col-span-1 md:col-span-2 pt-2 border-t border-border-subtle mt-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="generateMeetCheckboxModal"
                    checked={generateMeet}
                    onChange={(e) => setGenerateMeet(e.target.checked)}
                    className="cursor-pointer accent-primary"
                  />
                  <label htmlFor="generateMeetCheckboxModal" className="text-[13px] cursor-pointer text-on-surface-variant font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">videocam</span>
                    Generar enlace de Google Meet
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle bg-surface-bright flex justify-end gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            isLoading={isLoading}
            loadingText="Agendando..."
            disabled={!tipo || !fecha || !hora}
          >
            Agendar Actividad
          </Button>
        </div>

      </div>
    </div>
  );
};

export default PlanificarActividadModal;
