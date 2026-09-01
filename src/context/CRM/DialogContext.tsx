import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import Button from '../../components/CRM/ui/Button';

interface DialogOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

interface PromptOptions extends DialogOptions {
  label?: string;
  defaultValue?: string;
  placeholder?: string;
}

interface DialogContextType {
  confirm: (options: DialogOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
  alert: (options: DialogOptions) => Promise<void>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'confirm' | 'prompt' | 'alert'>('confirm');
  const [options, setOptions] = useState<PromptOptions | null>(null);
  const [inputValue, setInputValue] = useState('');
  
  // Resolve function stores the Promise's resolve callback
  const [resolveFn, setResolveFn] = useState<((value: any) => void) | null>(null);

  const confirm = (opts: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setType('confirm');
      setResolveFn(() => resolve);
      setIsOpen(true);
    });
  };

  const alert = (opts: DialogOptions): Promise<void> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setType('alert');
      setResolveFn(() => resolve);
      setIsOpen(true);
    });
  };

  const prompt = (opts: PromptOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setType('prompt');
      setInputValue(opts.defaultValue || '');
      setResolveFn(() => resolve);
      setIsOpen(true);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    if (resolveFn) {
      resolveFn(type === 'prompt' ? null : false);
    }
    // Clean up slightly after animation would normally run
    setTimeout(() => {
      setResolveFn(null);
      setOptions(null);
    }, 200);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveFn) {
      resolveFn(type === 'prompt' ? inputValue : true);
    }
    setTimeout(() => {
      setResolveFn(null);
      setOptions(null);
    }, 200);
  };

  return (
    <DialogContext.Provider value={{ confirm, prompt, alert }}>
      {children}
      
      {isOpen && options && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-sm rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="p-5">
              <h3 className="font-headline-sm text-[18px] font-bold text-on-surface mb-2">
                {options.title}
              </h3>
              
              {options.message && (
                <p className="text-[13px] text-on-surface-variant mb-4">
                  {options.message}
                </p>
              )}

              {type === 'prompt' && (
                <div className="mt-2">
                  {options.label && (
                    <label className="block text-[12px] font-bold text-on-surface-variant mb-1">
                      {options.label}
                    </label>
                  )}
                  <input
                    type="text"
                    autoFocus
                    className="w-full text-[14px] p-2 border border-border-subtle rounded bg-transparent outline-none focus:border-primary transition-colors text-on-surface"
                    placeholder={options.placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirm();
                      if (e.key === 'Escape') handleClose();
                    }}
                  />
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-border-subtle bg-surface-bright flex justify-end gap-2">
              {type !== 'alert' && (
                <Button variant="ghost" onClick={handleClose}>
                  {options.cancelText || 'Cancelar'}
                </Button>
              )}
              <Button variant="primary" onClick={handleConfirm}>
                {options.confirmText || 'Aceptar'}
              </Button>
            </div>

          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};
