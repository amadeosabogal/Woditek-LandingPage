import React, { useState } from 'react';
import Button from '../ui/Button';

interface ConfirmDeleteModalProps {
  projectName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ projectName, onClose, onConfirm }) => {
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const isMatch = inputValue === projectName;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-md rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border-subtle bg-status-na/10">
          <span className="material-symbols-outlined text-status-na text-[24px]">warning</span>
          <div className="text-[16px] font-bold text-status-na">
            Eliminar Proyecto
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {step === 1 ? (
            <>
              <p className="text-[13px] text-on-surface">
                Estás a punto de eliminar permanentemente el proyecto <span className="font-bold text-on-surface">"{projectName}"</span>.
              </p>
              <div className="bg-status-na/10 border border-status-na/30 rounded p-3 text-[12px] text-status-na font-medium">
                Esta acción eliminará todas las etapas, oportunidades y actividades asociadas. <strong>No se puede deshacer.</strong>
              </div>
              
              <div className="pt-2">
                <label className="block text-[12px] font-bold text-on-surface-variant mb-2">
                  Por favor, escribe <strong>{projectName}</strong> para confirmar.
                </label>
                <input 
                  type="text" 
                  className="w-full text-[14px] p-2 border border-border-subtle rounded bg-transparent outline-none focus:border-status-na transition-colors text-on-surface"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoFocus
                />
              </div>
            </>
          ) : (
            <div className="py-4 text-center">
              <span className="material-symbols-outlined text-[48px] text-status-na mb-4 block">error</span>
              <p className="text-[16px] text-on-surface font-medium">
                ¿Estás seguro que deseas eliminar el proyecto <br/><strong className="text-status-na">"{projectName}"</strong>?
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle bg-surface-bright flex justify-end gap-3">
          <Button 
            variant="ghost"
            onClick={step === 1 ? onClose : () => setStep(1)}
            disabled={isLoading}
          >
            {step === 1 ? 'Cancelar' : 'Atrás'}
          </Button>
          
          {step === 1 ? (
            <Button 
              variant="danger"
              onClick={() => { if (isMatch) setStep(2); }}
              disabled={!isMatch}
            >
              Continuar
            </Button>
          ) : (
            <Button 
              variant="danger"
              onClick={handleConfirm}
              isLoading={isLoading}
              loadingText="Eliminando..."
            >
              Sí, Eliminar Definitivamente
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
