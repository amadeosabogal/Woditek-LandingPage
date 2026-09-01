import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import Button from '../../components/CRM/ui/Button';

const RecuperarContrasena: React.FC = () => {
  const empresa_id = '1';
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token no proporcionado en la URL.');
        setIsLoading(false);
        return;
      }

      try {
        const data = await userService.validatePasswordResetToken(token);
        if (data.valid) {
          setEmail(data.email);
        }
      } catch (err: any) {
        setError(err.message || 'El enlace es inválido, ha expirado o ya fue utilizado.');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await userService.confirmPasswordReset(token!, password);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/crm/login`);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-muted flex flex-col justify-center items-center px-4">
        <span className="material-symbols-outlined text-[48px] animate-spin text-primary">refresh</span>
        <p className="mt-4 text-on-surface-variant font-medium">Validando enlace de recuperación...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[28px]">lock_reset</span>
          </div>
        </div>
        <h2 className="mt-2 text-center text-display-xs font-bold text-on-surface tracking-tight">
          Restablecer Contraseña
        </h2>
        {email && !success && (
          <p className="mt-2 text-center text-[14px] text-on-surface-variant">
            Creando nueva contraseña para <br/>
            <strong className="text-on-surface">{email}</strong>
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[400px]">
        <div className="bg-surface py-8 px-4 shadow-xl shadow-black/5 sm:rounded-xl border border-border-subtle sm:px-10 animate-in fade-in zoom-in duration-300">
          
          {error && (
            <div className="mb-6 bg-status-na/10 border border-status-na/20 rounded-lg p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-status-na text-[20px]">error</span>
              <p className="text-[13px] text-status-na font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-2">
              <span className="material-symbols-outlined text-[64px] text-status-pp mb-4">check_circle</span>
              <h3 className="text-[18px] font-bold text-on-surface mb-2">¡Contraseña Actualizada!</h3>
              <p className="text-[14px] text-on-surface-variant mb-6">
                Tu contraseña ha sido restablecida con éxito. Serás redirigido al login en unos segundos.
              </p>
              <Button onClick={() => navigate(`/crm/login`)} className="w-full">
                Ir al Login Ahora
              </Button>
            </div>
          ) : !error ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[13px] font-bold text-on-surface-variant mb-1.5">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none material-symbols-outlined text-on-surface-variant/50 text-[18px]">
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-border-subtle rounded-lg text-[14px] bg-surface text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-on-surface-variant mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none material-symbols-outlined text-on-surface-variant/50 text-[18px]">
                    lock_clock
                  </span>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-border-subtle rounded-lg text-[14px] bg-surface text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder="Repite tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full flex justify-center py-2.5"
                  isLoading={isSubmitting}
                  loadingText="Actualizando..."
                >
                  Restablecer Contraseña
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center pt-2">
              <Button variant="ghost" onClick={() => navigate(`/crm/login`)} className="w-full">
                Volver al Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecuperarContrasena;
