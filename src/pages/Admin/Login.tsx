import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import logoUrl from '../../assets/logo_blue.png';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login exitoso
        localStorage.setItem('woditek_admin_auth', 'true');
        if (data.token) {
          localStorage.setItem('woditek_admin_token', data.token);
        }
        if (data.user) {
          localStorage.setItem('woditek_admin_user', JSON.stringify(data.user));
        }
        navigate('/administracion');
      } else {
        // Error de credenciales o de servidor
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      console.error('Error de login:', err);
      // Fallback a hardcoded en caso de que el backend no esté encendido aún
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('woditek_admin_auth', 'true');
        navigate('/administracion');
      } else {
        setError('Error al conectar con el servidor. ¿Está encendido el backend?');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Elementos decorativos de fondo similares a la landing pero más sutiles */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#3162fa]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#00d1ff]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="bg-white border border-slate-200 shadow-xl p-10 flex flex-col items-center">
          {/* Logo */}
          <div className="mb-8 w-40">
            <img src={logoUrl} alt="Woditek Logo" className="w-full h-auto" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight mb-2">
            Acceso Administrativo
          </h2>
          <p className="text-slate-500 text-sm mb-8 text-center">
            Ingresa tus credenciales para acceder al panel de control
          </p>

          <form onSubmit={handleLogin} className="w-full space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuario"
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-[#3162fa] focus:ring-1 focus:ring-[#3162fa] transition-colors"
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-[#3162fa] focus:ring-1 focus:ring-[#3162fa] transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3162fa] hover:bg-[#1a4cd6] text-white font-semibold py-3 uppercase tracking-wider transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Verificando...</span>
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
            <a href="/" className="text-sm text-slate-500 hover:text-[#3162fa] transition-colors">
              &larr; Volver al sitio principal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
