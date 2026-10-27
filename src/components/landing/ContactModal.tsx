import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  details: string;
}

interface ContactModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  formData: LeadFormData;
  onChange: (data: LeadFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 transition-all outline-none disabled:opacity-60';

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  isSubmitting,
  isSuccess,
  formData,
  onChange,
  onSubmit,
  onClose,
}) => {
  // Cierra con Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Contacto">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-ink-900 shadow-[0_30px_100px_-20px_rgba(37,99,235,0.5)] animate-fade-up">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-600/25 rounded-pill blur-3xl pointer-events-none"></div>

        <div className="relative p-6 md:p-8">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="relative w-20 h-20 mb-6">
                <span className="absolute inset-0 rounded-pill bg-emerald-500/30 animate-pulse-ring"></span>
                <div className="relative w-20 h-20 bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 rounded-pill flex items-center justify-center">
                  <Check size={40} />
                </div>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-black uppercase [font-variation-settings:'wdth'_125] text-white mb-4">
                ¡Mensaje enviado!
              </h3>
              <p className="text-slate-400 mb-8 text-lg px-2">
                Gracias por contactarnos. Nos comunicaremos contigo muy pronto para hacer realidad tu proyecto.
              </p>
              <button
                onClick={onClose}
                className="glow-button w-full bg-blue-600 hover:bg-blue-500 text-white font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-base py-4 rounded-pill shadow-[0_0_30px_rgba(37,99,235,0.45)] transition-colors"
              >
                Entendido
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                  <h3 className="font-heading text-xl sm:text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-white">
                    Cuéntanos tu proyecto
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Te respondemos con una propuesta sin compromiso.</p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="shrink-0 w-9 h-9 rounded-pill border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form className="space-y-4" onSubmit={onSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-1.5">Nombre completo</label>
                  <input type="text" id="name" required className={inputClass} placeholder="Tu nombre" value={formData.name} onChange={(e) => onChange({ ...formData, name: e.target.value })} disabled={isSubmitting} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-1.5">Correo electrónico</label>
                  <input type="email" id="email" required className={inputClass} placeholder="tucorreo@ejemplo.com" value={formData.email} onChange={(e) => onChange({ ...formData, email: e.target.value })} disabled={isSubmitting} />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-300 mb-1.5">Celular / WhatsApp</label>
                  <input type="tel" id="phone" className={inputClass} placeholder="+51 999 999 999" value={formData.phone} onChange={(e) => onChange({ ...formData, phone: e.target.value })} disabled={isSubmitting} />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-300 mb-1.5">Detalles del proyecto</label>
                  <textarea id="message" rows={4} required className={`${inputClass} resize-none`} placeholder="¿Qué solución digital tienes en mente?" value={formData.details} onChange={(e) => onChange({ ...formData, details: e.target.value })} disabled={isSubmitting}></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="glow-button w-full bg-blue-600 hover:bg-blue-500 text-white font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-base py-4 rounded-pill shadow-[0_0_30px_rgba(37,99,235,0.45)] transition-colors mt-2 disabled:bg-slate-600 disabled:shadow-none flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-pill animate-spin"></div>
                      Enviando...
                    </>
                  ) : (
                    'Enviar mensaje'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
