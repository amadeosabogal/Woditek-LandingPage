import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import logoUrl from '../../assets/logo_blue.webp';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const API_BASE = import.meta.env.VITE_API_ADMIN || 'http://localhost:3001/admin';
      const response = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Error al enviar el correo');
      }
    } catch (err) {
      console.error('Error:', err);
      setStatus('error');
      setErrorMessage('Error al conectar con el servidor.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#3162fa]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#00d1ff]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="bg-white border border-slate-200 shadow-xl p-10 flex flex-col items-center">
          <div className="mb-8 w-40">
            <img src={logoUrl} alt="Woditek Logo" className="w-full h-auto" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight mb-2">
            Recuperar Contraseña
          </h2>
          
          {status === 'success' ? (
            <div className="w-full flex flex-col items-center text-center mt-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">¡Correo enviado!</h3>
              <p className="text-slate-600 mb-8">
                Si existe una cuenta asociada, recibirás un enlace para restablecer tu contraseña. Revisa también tu bandeja de spam.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#3162fa] hover:bg-[#1a4cd6] text-white font-semibold py-3 uppercase tracking-wider transition-colors flex justify-center items-center gap-2"
              >
                Volver al Login
              </button>
            </div>
          ) : (
            <>
              <p className="text-slate-500 text-sm mb-8 text-center">
                Ingresa tu correo o usuario y te enviaremos un enlace para crear una nueva contraseña.
              </p>

              <form onSubmit={handleSubmit} className="w-full space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo o Usuario"
                    className="w-full pl-10 pr-3 py-3 border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-[#3162fa] focus:ring-1 focus:ring-[#3162fa] transition-colors"
                    disabled={status === 'loading'}
                    required
                  />
                </div>

                {status === 'error' && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || !email}
                  className="w-full bg-[#3162fa] hover:bg-[#1a4cd6] text-white font-semibold py-3 uppercase tracking-wider transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    'Enviar enlace'
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-sm text-slate-500 hover:text-[#3162fa] transition-colors flex items-center justify-center mx-auto"
                >
                  <ArrowLeft size={16} className="mr-1" /> Volver al Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
