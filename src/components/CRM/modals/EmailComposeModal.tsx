import React, { useState } from 'react';
import { useLoader } from '../../../context/CRM/LoaderContext';
import { sendEmail } from '../../../services/crmApi'; // Assuming this exists or will be added

interface EmailComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  toEmail: string;
}

const EmailComposeModal: React.FC<EmailComposeModalProps> = ({ isOpen, onClose, toEmail }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const { showLoader, hideLoader } = useLoader();

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    
    showLoader('Enviando correo...');
    try {
      await sendEmail(toEmail, subject, body, false);
      alert('Correo enviado exitosamente.');
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al enviar correo. Revisa la consola o asegúrate de que credentials.json está configurado.');
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
          <h3 className="font-bold font-headline-sm flex items-center gap-2">
            <span className="material-symbols-outlined">mail</span>
            Redactar Correo
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Body */}
        <form onSubmit={handleSend} className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-label-lg font-bold text-on-surface mb-1 block">Para:</label>
            <input 
              type="text" 
              value={toEmail} 
              disabled 
              className="w-full border border-border-subtle rounded-lg px-3 py-2 bg-surface-muted text-on-surface-variant cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-label-lg font-bold text-on-surface mb-1 block">Asunto:</label>
            <input 
              type="text" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto del correo"
              className="w-full border border-border-subtle rounded-lg px-3 py-2 bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="text-label-lg font-bold text-on-surface mb-1 block">Mensaje:</label>
            <textarea 
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escribe el cuerpo del correo aquí..."
              className="w-full border border-border-subtle rounded-lg px-3 py-2 bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
              required
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-3 mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface hover:bg-surface-muted transition-colors font-semibold text-body-sm"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-body-sm flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Enviar Correo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailComposeModal;
