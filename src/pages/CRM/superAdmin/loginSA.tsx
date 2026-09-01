import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/CRM/AuthContext';
import { authService } from '../../../services/authService';
import Button from '../../../components/CRM/ui/Button';

const LoginSA: React.FC = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Intentar login para el Super Admin en la tabla super_admins
            const data = await authService.loginSuperAdmin({ email, password });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            login(data.token, data.user);
            navigate('/super-admin');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión como Super Admin');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full min-h-screen bg-surface-bright selection:bg-primary-container selection:text-white overflow-hidden text-on-surface">
            {/* Left Side: Visual/Branding Panel */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center border-r border-border-subtle">
                <div className="absolute inset-0 opacity-10 industrial-pattern"></div>
                <div className="relative z-10 p-12 max-w-lg text-white">
                    <div className="mb-8 inline-flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-white text-3xl">admin_panel_settings</span>
                        </div>
                        <div>
                            <h1 className="font-headline-md text-headline-md tracking-tight leading-none text-white">Super Admin Portal</h1>
                            <p className="font-label-caps text-label-caps opacity-80 uppercase text-slate-300">Control Central de Plataforma</p>
                        </div>
                    </div>
                    <h2 className="font-display-lg text-display-lg mb-6 leading-tight">Gestión Maestra multi-empresa.</h2>
                    <p className="font-body-md text-body-md text-slate-300 leading-relaxed">
                        Acceso restringido únicamente a administradores del sistema global.
                    </p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-gutter relative">
                <div className="w-full max-w-md space-y-8 z-10">
                    <div className="text-center lg:text-left">
                        <h3 className="font-headline-md text-headline-md text-slate-900 mb-2">Iniciar Sesión Super Admin</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">Ingrese sus credenciales de administrador global.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2" role="alert">
                            <span className="material-symbols-outlined text-[20px]">error</span>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase" htmlFor="email">Correo Administrador</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                                        <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                                    </div>
                                    <input
                                        className="block w-full pl-10 pr-3 py-3 bg-surface border border-border-subtle rounded text-body-md focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                        id="email" name="email" placeholder="admin@admin.com" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase" htmlFor="password">Contraseña</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                                        <span className="material-symbols-outlined text-[20px]">lock</span>
                                    </div>
                                    <input
                                        className="block w-full pl-10 pr-10 py-3 bg-surface border border-border-subtle rounded text-body-md focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                        id="password" name="password" placeholder="••••••••••••" required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <button
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-primary transition-colors"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full uppercase font-body-md py-3 gap-2"
                            isLoading={isLoading}
                            loadingText="Autenticando..."
                        >
                            {!isLoading && <span className="material-symbols-outlined text-[20px]">login</span>}
                            Acceder al Sistema Central
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginSA;
