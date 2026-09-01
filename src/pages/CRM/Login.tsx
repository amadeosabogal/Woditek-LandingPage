import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/CRM/AuthContext';
import Button from '../../components/CRM/ui/Button';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const empresa_id = '1';
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
            if (!empresa_id) throw new Error("Falta identificador de empresa en la URL");
            const data = await authService.login({ email, password }, empresa_id);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            login(data.token, data.user);
            navigate(`/crm/leads`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full min-h-screen bg-surface-bright selection:bg-primary-container selection:text-white overflow-hidden text-on-surface">
            {/* Left Side: Visual/Branding Panel (Hidden on small mobile) */}
            <div className="hidden lg:flex w-1/2 relative bg-primary-container overflow-hidden items-center justify-center border-r border-border-subtle">
                <div className="absolute inset-0 opacity-10 industrial-pattern"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-secondary opacity-90"></div>

                <div className="relative z-10 p-12 max-w-lg text-white">
                    <div className="mb-8 inline-flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>factory</span>
                        </div>
                        <div>
                            <h1 className="font-headline-md text-headline-md tracking-tight leading-none">Wimprove</h1>
                            <p className="font-label-caps text-label-caps opacity-80 uppercase">BPO & Contact Center</p>
                        </div>
                    </div>
                    <h2 className="font-display-lg text-display-lg mb-6 leading-tight">Optimice su gestión omnicanal e IA.</h2>
                    <p className="font-body-md text-body-md text-on-primary-container leading-relaxed mb-8">
                        La plataforma centralizada impulsada por Inteligencia Artificial para el control de operaciones, servicios BPO, automatización de Contact Center y captación de clientes de Wimprove.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded bg-white/10 border border-white/20 backdrop-blur-sm">
                            <span className="material-symbols-outlined mb-2">dashboard</span>
                            <p className="font-label-caps text-label-caps text-white">Panel Integrado</p>
                        </div>
                        <div className="p-4 rounded bg-white/10 border border-white/20 backdrop-blur-sm">
                            <span className="material-symbols-outlined mb-2">security</span>
                            <p className="font-label-caps text-label-caps text-white">Acceso Seguro</p>
                        </div>
                    </div>
                </div>

                {/* Decorative background image */}
                <div className="absolute bottom-0 right-0 w-full h-full opacity-20 pointer-events-none">
                    <img className="w-full h-full object-cover"
                        alt="Industrial Background"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuABV5RVglRYQy07fsS-q11z7UtT-oHoML4GLdjMcFov2Rp1ViOySOlUYwlQ4ArRsghaYM_eH29NeH0xrya6UWyhyRCSr8rZyOkPJVeko401A6ASLHgF8FJs52dHpnUIGvnNEELbDYrUOzIHtKwQ-nKCIsOevIJ1qJNiq3suRld3UACeC3OkWM_kCWJEMTLTvCRtWgNf6m_v5eSAHzy8X00laSAonHCZiqMzfiIlWdhsBdWp-EiuADxC0CmiLnJGwoy8eWzp8wPBl2I" />
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-gutter relative">
                <div className="absolute inset-0 opacity-5 industrial-pattern lg:hidden"></div>
                <div className="w-full max-w-md space-y-8 z-10">
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden mb-6 flex justify-center">
                            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>factory</span>
                            </div>
                        </div>
                        <h3 className="font-headline-md text-headline-md text-primary mb-2">Bienvenido al Portal CRM</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">Ingrese sus credenciales corporativas para continuar.</p>
                    </div>

                    {error && (
                        <div className="bg-status-na/10 border border-status-na text-status-na px-4 py-3 rounded relative flex items-center gap-2" role="alert">
                            <span className="material-symbols-outlined text-[20px]">error</span>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase" htmlFor="email">Correo Corporativo</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                                        <span className="material-symbols-outlined text-[20px]">mail</span>
                                    </div>
                                    <input
                                        className="block w-full pl-10 pr-3 py-3 bg-surface border border-border-subtle rounded text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none"
                                        id="email" name="email" placeholder="nombre.apellido@wimprove.com" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block font-label-caps text-label-caps text-on-surface uppercase" htmlFor="password">Contraseña</label>
                                    <a className="font-label-caps text-label-caps text-secondary hover:underline transition-colors" href="#">Olvidé mi contraseña</a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                                        <span className="material-symbols-outlined text-[20px]">lock</span>
                                    </div>
                                    <input
                                        className="block w-full pl-10 pr-10 py-3 bg-surface border border-border-subtle rounded text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none"
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

                        <div className="flex items-center">
                            <input className="h-4 w-4 text-primary focus:ring-primary-container border-border-subtle rounded" id="remember-me" name="remember-me" type="checkbox" />
                            <label className="ml-2 block font-body-sm text-body-sm text-on-surface-variant" htmlFor="remember-me">Recordar sesión en este equipo</label>
                        </div>
                        <div className="space-y-4">
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full uppercase font-body-md py-3 gap-2"
                                isLoading={isLoading}
                                loadingText="Iniciando sesión..."
                            >
                                {!isLoading && <span className="material-symbols-outlined text-[20px]">login</span>}
                                Iniciar Sesión
                            </Button>
                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-border-subtle"></div>
                                <span className="flex-shrink mx-4 font-label-caps text-label-caps text-outline uppercase">O</span>
                                <div className="flex-grow border-t border-border-subtle"></div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full uppercase font-body-md py-3 gap-2"
                                type="button"
                                onClick={() => navigate(`/crm/register`)}>
                                <span className="material-symbols-outlined text-[20px]">person_add</span>
                                Crear cuenta
                            </Button>
                        </div>
                    </form>

                    <div className="pt-8 text-center">
                        <p className="font-body-sm text-body-sm text-outline">
                            Soporte Técnico: <a className="text-primary hover:underline" href="mailto:support@wimprove.com">support@wimprove.com</a>
                        </p>
                        <div className="mt-4 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">verified_user</span>
                                <span className="font-label-caps text-[10px]">ISO 27001</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">shield</span>
                                <span className="font-label-caps text-[10px]">GDPR COMPLIANT</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 font-label-caps text-[10px] text-outline tracking-widest uppercase">
                    © 2024 WIMPROVE INDUSTRIAL SYSTEMS. TODOS LOS DERECHOS RESERVADOS.
                </div>
            </div>
        </div>
    );
};

export default Login;
