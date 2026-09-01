import React, { useState, useEffect, useRef } from 'react';
import { settingsService } from '../../../../services/settingsService';

const LogoEmpresaConfig: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const data = await settingsService.getAllSettings();
      const logoSetting = data.find((s: any) => s.name === 'empresa_logo');
      if (logoSetting && logoSetting.content) {
        setLogoUrl(logoSetting.content);
      }
    } catch (error) {
      console.error('Error fetching logo setting:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatus({ type: 'error', message: 'El archivo seleccionado debe ser una imagen' });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus({ type: '', message: '' });
  };

  const handleSaveLogo = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('token');
      const uploadRes = await fetch(`${import.meta.env.VITE_URL_BASE || 'http://localhost:3007'}/api/settings/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.message || 'Error al guardar el logo en el servidor');
      }

      const uploadData = await uploadRes.json();
      const newLogoUrl = uploadData.url;

      if (!newLogoUrl) {
        throw new Error('El servidor no devolvió una URL válida');
      }

      setLogoUrl(newLogoUrl);
      setSelectedFile(null);
      setPreviewUrl('');
      setStatus({ type: 'success', message: 'Logo de la empresa actualizado exitosamente.' });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Error al actualizar el logo.' });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    setIsLoading(true);
    try {
      await settingsService.upsertSetting('empresa_logo', '');
      setLogoUrl('');
      setStatus({ type: 'success', message: 'Logo de la empresa removido exitosamente.' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Error al remover el logo.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface industrial-shadow border border-border-subtle rounded-lg p-6 h-fit mt-8">
      <h3 className="font-headline-sm text-headline-sm mb-6 border-b border-border-subtle pb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">image</span>
        Logo de la Empresa
      </h3>

      {status.message && (
        <div className={`mb-6 px-4 py-3 rounded relative flex items-center gap-2 ${status.type === 'error' ? 'bg-status-na/10 border border-status-na text-status-na' : 'bg-status-ip/10 border border-status-ip text-status-ip'}`} role="alert">
          <span className="material-symbols-outlined text-[20px]">
            {status.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span className="block sm:inline font-body-md">{status.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-32 h-32 border-2 border-dashed border-border-subtle rounded-lg flex items-center justify-center bg-surface-muted relative overflow-hidden shrink-0">
          {isLoading ? (
            <span className="material-symbols-outlined text-outline animate-spin text-[32px]">refresh</span>
          ) : previewUrl ? (
            <img src={previewUrl} alt="Vista previa del logo" className="w-full h-full object-contain p-2" />
          ) : logoUrl ? (
            <img src={logoUrl} alt="Logo de la empresa" className="w-full h-full object-contain p-2" />
          ) : (
            <span className="material-symbols-outlined text-outline text-[48px] opacity-30">store</span>
          )}
        </div>

        <div className="flex flex-col gap-3 w-full">
          <p className="text-[13px] text-on-surface-variant mb-2">
            Este logo se utilizará en general para toda la aplicación (barra lateral, generación de PDFs, etc). Recomendado: formato PNG con fondo transparente o JPG.
          </p>
          
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container hover:bg-primary hover:text-white font-bold rounded transition-colors text-[13px] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">image_search</span>
              Seleccionar Imagen
            </button>
            
            {selectedFile && (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSaveLogo}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded transition-colors text-[13px] disabled:opacity-50 shadow-sm"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">save</span>
                )}
                Guardar Logo
              </button>
            )}

            {logoUrl && !selectedFile && (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleRemoveLogo}
                className="flex items-center gap-2 px-4 py-2 text-status-na hover:bg-status-na/10 font-bold rounded transition-colors text-[13px] disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Quitar Logo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoEmpresaConfig;
