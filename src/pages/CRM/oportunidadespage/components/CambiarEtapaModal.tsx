import React, { useState } from 'react';
import Button from '../../../../components/CRM/ui/Button';

export interface EtapaOption {
  id: string;
  title: string;
  colorClass: string;
}

interface CambiarEtapaModalProps {
  currentEtapaId: string;
  etapas: EtapaOption[];
  onClose: () => void;
  onSelect: (etapaId: string) => Promise<void>;
}

const CambiarEtapaModal: React.FC<CambiarEtapaModalProps> = ({ currentEtapaId, etapas, onClose, onSelect }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-surface rounded-xl shadow-2xl max-w-sm w-full p-6">
        <h3 className="text-[16px] font-bold text-on-surface mb-4">Cambiar de etapa</h3>
        <p className="text-[13px] text-on-surface-variant mb-4">Selecciona la nueva etapa para esta oportunidad:</p>
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mb-6">
          {etapas.map(etapa => (
            <Button
              key={etapa.id}
              variant="ghost"
              disabled={loadingId !== null || successId !== null || etapa.id === currentEtapaId}
              isLoading={loadingId === etapa.id}
              isSuccess={successId === etapa.id}
              onClick={async () => {
                setLoadingId(etapa.id);
                try {
                  await onSelect(etapa.id);
                  setLoadingId(null);
                  setSuccessId(etapa.id);
                  setTimeout(() => {
                    onClose();
                  }, 800);
                } catch (e) {
                  console.error(e);
                  setLoadingId(null);
                }
              }}
              className={`w-full text-left px-4 py-3 rounded-lg border flex items-center justify-between transition-colors ${
                etapa.id === currentEtapaId
                  ? 'bg-surface-muted border-border-subtle cursor-not-allowed opacity-60'
                  : 'bg-surface border-border-subtle hover:border-primary hover:bg-primary/5 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`w-3 h-3 rounded-full shrink-0 ${etapa.colorClass}`}></div>
                <span className="font-bold text-[13px] text-on-surface">{etapa.title}</span>
              </div>
              {etapa.id === currentEtapaId && (
                <span className="text-[10px] bg-surface-muted px-2 py-1 rounded font-bold text-on-surface-variant shrink-0">ACTUAL</span>
              )}
            </Button>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loadingId !== null || successId !== null}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CambiarEtapaModal;
