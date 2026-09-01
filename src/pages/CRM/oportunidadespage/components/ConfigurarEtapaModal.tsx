import React, { useState } from 'react';
import Button from '../../../../components/CRM/ui/Button';
import ColorPicker from '../../../../components/CRM/ui/ColorPicker';

interface ConfigurarEtapaModalProps {
  initialTitle: string;
  initialIsFolded?: boolean;
  initialIsWon?: boolean;
  initialIsLost?: boolean;
  initialRequirements?: string;
  initialColor?: string;
  hasWonStage?: boolean;
  hasLostStage?: boolean;
  onClose: () => void;
  onSave: (data: { title: string, isFolded: boolean, isWon: boolean, isLost: boolean, requirements: string, color: string }) => Promise<void>;
}

const ConfigurarEtapaModal: React.FC<ConfigurarEtapaModalProps> = ({ 
  initialTitle, 
  initialIsFolded = false, 
  initialIsWon = false,
  initialIsLost = false,
  initialRequirements = '',
  initialColor = 'bg-primary',
  hasWonStage = false,
  hasLostStage = false,
  onClose, 
  onSave 
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [isFolded, setIsFolded] = useState(initialIsFolded);
  const [isWon, setIsWon] = useState(initialIsWon);
  const [isLost, setIsLost] = useState(initialIsLost);
  const [requirements, setRequirements] = useState(initialRequirements);
  const [color, setColor] = useState(initialColor || 'bg-primary');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({ title, isFolded, isWon, isLost, requirements, color });
    } finally {
      setIsLoading(false);
    }
  };

  const colors = [
    { label: 'Corporativo (Azul Oscuro)', value: 'bg-primary' },
    { label: 'Verde (Nuevo / Activo)', value: 'bg-status-pp' },
    { label: 'Naranja (Calificado)', value: 'bg-status-qp' },
    { label: 'Azul Claro (En Progreso)', value: 'bg-status-ip' },
    { label: 'Rojo (Ganado / Urgente)', value: 'bg-status-hp' },
    { label: 'Gris (Perdido / Inactivo)', value: 'bg-status-na' },
    // Standard Colors
    { label: 'Pizarra', value: 'bg-slate-500' },
    { label: 'Rojo Estándar', value: 'bg-red-500' },
    { label: 'Naranja Estándar', value: 'bg-orange-500' },
    { label: 'Ámbar', value: 'bg-amber-500' },
    { label: 'Amarillo', value: 'bg-yellow-500' },
    { label: 'Lima', value: 'bg-lime-500' },
    { label: 'Verde Estándar', value: 'bg-green-500' },
    { label: 'Esmeralda', value: 'bg-emerald-500' },
    { label: 'Verde Azulado (Teal)', value: 'bg-teal-500' },
    { label: 'Cian', value: 'bg-cyan-500' },
    { label: 'Cielo', value: 'bg-sky-500' },
    { label: 'Azul Estándar', value: 'bg-blue-500' },
    { label: 'Índigo', value: 'bg-indigo-500' },
    { label: 'Violeta', value: 'bg-violet-500' },
    { label: 'Púrpura', value: 'bg-purple-500' },
    { label: 'Fucsia', value: 'bg-fuchsia-500' },
    { label: 'Rosa', value: 'bg-pink-500' },
    { label: 'Rosa Oscuro (Rose)', value: 'bg-rose-500' }
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-2xl rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-surface-bright">
          <div className="text-[14px] font-bold text-on-surface">
            Editar columna
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-muted rounded-full p-1 transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto space-y-6">
          
          {/* Nombre de la etapa */}
          <div>
            <label className="block text-[12px] font-bold text-on-surface-variant mb-1">Nombre de la etapa</label>
            <input 
              type="text" 
              className="w-full text-2xl font-bold p-1 border-b border-border-subtle bg-transparent outline-none focus:border-primary transition-colors text-on-surface"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-4 pt-4">
            {/* Color */}
            <div className="flex items-center gap-4 relative">
              <label className="w-48 text-[13px] font-bold text-on-surface-variant">Color representativo</label>
              <div className="flex-1">
                <ColorPicker 
                  value={color} 
                  onChange={setColor} 
                  options={colors} 
                />
              </div>
            </div>

            {/* Está en la etapa ganada */}
            {!hasWonStage && (
              <div className="flex items-center gap-4">
                <label className="w-48 text-[13px] font-bold text-on-surface-variant">¿Es etapa Ganada?</label>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                  checked={isWon}
                  onChange={(e) => setIsWon(e.target.checked)}
                />
              </div>
            )}

            {/* Está en la etapa perdida */}
            {!hasLostStage && (
              <div className="flex items-center gap-4">
                <label className="w-48 text-[13px] font-bold text-on-surface-variant">¿Es etapa Perdida?</label>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                  checked={isLost}
                  onChange={(e) => setIsLost(e.target.checked)}
                />
              </div>
            )}

            {/* Contraído (doblado en el pipeline) */}
            <div className="flex items-center gap-4">
              <label className="w-48 text-[13px] font-bold text-on-surface-variant">Contraído</label>
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                checked={isFolded}
                onChange={(e) => setIsFolded(e.target.checked)}
              />
            </div>
          </div>

          {/* Requerimientos */}
          <div className="pt-6 border-t border-border-subtle">
            <label className="block text-[12px] font-bold text-on-surface-variant mb-2">Requerimientos (Opcional)</label>
            <textarea 
              className="w-full h-24 p-3 border border-border-subtle rounded bg-transparent focus:border-primary outline-none transition-colors text-[13px] resize-none placeholder:text-outline"
              placeholder="Dale a tu equipo los requerimientos para mover una oportunidad a esta etapa."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            ></textarea>
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
            loadingText="Guardando..."
            disabled={!title.trim()}
          >
            Guardar Cambios
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ConfigurarEtapaModal;
