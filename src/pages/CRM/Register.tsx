import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import Button from '../../components/CRM/ui/Button';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const empresa_id = '1';
  
  const [showPassword, setShowPassword] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (!empresa_id) throw new Error("Falta identificador de empresa en la URL");
      
      await authService.register({ nombre, apellido, email, password }, empresa_id);
      
      setSuccess('Usuario registrado exitosamente. Redirigiendo al login...');
      setTimeout(() => {
        navigate(`/crm/login`);
      }, 2000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-screen bg-surface-bright selection:bg-primary-container selection:text-white overflow-hidden text-on-surface">
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
                      <p className="font-label-caps text-label-caps opacity-80 uppercase">Crear Cuenta</p>
                  </div>
              </div>
              <h2 className="font-display-lg text-display-lg mb-6 leading-tight">Únete a nuestra plataforma.</h2>
              <p className="font-body-md text-body-md text-on-primary-container leading-relaxed mb-8">
                  Crea tu cuenta corporativa para comenzar a gestionar tus operaciones y base comercial.
              </p>
          </div>
      </div>
      
      <div className="w-full lg:w-1/2 flex items-center justify-center p-gutter relative">
          <div className="absolute inset-0 opacity-5 industrial-pattern lg:hidden"></div>
          <div className="w-full max-w-md space-y-8 z-10">
              <div className="text-center lg:text-left">
                  <div className="lg:hidden mb-6 flex justify-center">
                      <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>factory</span>
                      </div>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-primary mb-2">Crear nueva cuenta</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">Ingresa tus datos corporativos.</p>
              </div>
              
              {error && (
                <div className="bg-status-na/10 border border-status-na text-status-na px-4 py-3 rounded relative flex items-center gap-2" role="alert">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              
              {success && (
                <div className="bg-status-success/10 border border-status-success text-status-success px-4 py-3 rounded relative flex items-center gap-2" role="alert">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span className="block sm:inline">{success}</span>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase">Nombre</label>
                          <input
                              className="block w-full px-3 py-3 bg-surface border border-border-subtle rounded text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none"
                              required type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                      </div>
                      <div>
                          <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase">Apellido</label>
                          <input
                              className="block w-full px-3 py-3 bg-surface border border-border-subtle rounded text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none"
                              required type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                      </div>
                  </div>
                  
                  <div>
                      <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase">Correo Corporativo</label>
                      <input
                          className="block w-full px-3 py-3 bg-surface border border-border-subtle rounded text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none"
                          placeholder="nombre.apellido@wimprove.com" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  
                  <div>
                      <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase">Contraseña</label>
                      <div className="relative group">
                          <input
                              className="block w-full px-3 pr-10 py-3 bg-surface border border-border-subtle rounded text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none"
                              required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                          <button
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-primary transition-colors"
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                          >
                              <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                          </button>
                      </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="w-full uppercase font-body-md py-3 gap-2"
                      isLoading={isLoading}
                      loadingText="Registrando..."
                    >
                      {!isLoading && <span className="material-symbols-outlined text-[20px]">person_add</span>}
                      Crear Cuenta
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full uppercase font-body-md py-3 gap-2"
                        type="button"
                        onClick={() => navigate(`/crm/login`)}>
                        <span className="material-symbols-outlined text-[20px]">login</span>
                        Volver a Iniciar Sesión
                    </Button>
                  </div>
              </form>
          </div>
      </div>
    </div>
  );
};

export default Register;
