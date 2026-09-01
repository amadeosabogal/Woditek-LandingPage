import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminService } from '../../../services/superAdminService';
import type { Empresa } from '../../../services/superAdminService';
import Button from '../../../components/CRM/ui/Button';
import { useDialog } from '../../../context/CRM/DialogContext';

const MigracionSA: React.FC = () => {
  const navigate = useNavigate();
  const dialog = useDialog();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [origenEmpresaId, setOrigenEmpresaId] = useState<number | null>(null);
  const [destinoEmpresaId, setDestinoEmpresaId] = useState<number | null>(null);

  // Checkboxes de lo que se va a migrar
  const [migrarSettings, setMigrarSettings] = useState(true);
  const [migrarRolesPermisos, setMigrarRolesPermisos] = useState(true);

  const [isMigrating, setIsMigrating] = useState(false);
  const [resumenMigracion, setResumenMigracion] = useState<string[] | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    superAdminService.getEmpresas().then(data => {
      setEmpresas(data);
      if (data.length >= 2) {
        setOrigenEmpresaId(data[0].id);
        setDestinoEmpresaId(data[1].id);
      } else if (data.length === 1) {
        setOrigenEmpresaId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  const handleRunMigration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResumenMigracion(null);

    if (!origenEmpresaId || !destinoEmpresaId) {
      setErrorMsg('Debes seleccionar la empresa origen y la empresa destino.');
      return;
    }

    if (origenEmpresaId === destinoEmpresaId) {
      setErrorMsg('La empresa origen y la empresa destino no pueden ser la misma.');
      return;
    }

    if (!migrarSettings && !migrarRolesPermisos) {
      setErrorMsg('Debes seleccionar al menos un elemento a migrar.');
      return;
    }

    const origenNombre = empresas.find(e => e.id === origenEmpresaId)?.nombre || `#${origenEmpresaId}`;
    const destinoNombre = empresas.find(e => e.id === destinoEmpresaId)?.nombre || `#${destinoEmpresaId}`;

    const confirmed = await dialog.confirm({
      title: 'Confirmar Migración de Datos',
      message: `¿Estás seguro de que deseas copiar los datos seleccionados desde "${origenNombre}" hacia "${destinoNombre}"? Los registros existentes en la empresa destino podrán ser actualizados.`,
      confirmText: 'Sí, Ejecutar Migración',
      cancelText: 'Cancelar'
    });

    if (!confirmed) return;

    setIsMigrating(true);
    try {
      const res = await superAdminService.migrarEmpresa({
        origen_empresa_id: origenEmpresaId,
        destino_empresa_id: destinoEmpresaId,
        opciones: {
          settings: migrarSettings,
          roles_permisos: migrarRolesPermisos
        }
      });

      setResumenMigracion(res.resumen);
      dialog.alert({
        title: 'Migración Completada',
        message: res.message || 'Los datos han sido migrados exitosamente.'
      });
    } catch (err: any) {
      console.error('Error during migration:', err);
      setErrorMsg(err.message || 'Ocurrió un error al migrar los datos.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 industrial-pattern">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/super-admin')}
            className="p-3 bg-surface rounded-xl border border-border-subtle hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h1 className="font-display-lg text-on-background">Migración de Datos entre Empresas</h1>
            <p className="font-body-md text-outline">Copia configuraciones, roles y plantillas de una empresa origen a una empresa destino</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined">error</span>
            {errorMsg}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleRunMigration} className="space-y-8">
          
          {/* Step 1: Select Source & Target Companies */}
          <div className="glass-panel p-8 rounded-2xl border border-border-subtle industrial-shadow space-y-6">
            <h2 className="font-headline-sm text-on-background flex items-center gap-2 border-b border-border-subtle pb-3">
              <span className="material-symbols-outlined text-primary">swap_horiz</span>
              1. Selección de Empresas (Origen y Destino)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Origen */}
              <div className="p-6 rounded-xl bg-surface border border-border-subtle space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <span className="material-symbols-outlined">output</span>
                  <span>Empresa Origen (Copiar desde)</span>
                </div>
                <select 
                  value={origenEmpresaId || ''}
                  onChange={(e) => setOrigenEmpresaId(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-background border border-border-subtle font-body-md text-on-background focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      Empresa #{emp.id}: {emp.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-outline">Se extraerán las configuraciones y roles existentes de esta empresa.</p>
              </div>

              {/* Destino */}
              <div className="p-6 rounded-xl bg-surface border border-border-subtle space-y-3">
                <div className="flex items-center gap-2 text-green-600 font-bold">
                  <span className="material-symbols-outlined">input</span>
                  <span>Empresa Destino (Copiar hacia)</span>
                </div>
                <select 
                  value={destinoEmpresaId || ''}
                  onChange={(e) => setDestinoEmpresaId(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-background border border-border-subtle font-body-md text-on-background focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      Empresa #{emp.id}: {emp.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-outline">Se sobreescribirán o crearán los registros seleccionados en esta empresa.</p>
              </div>

            </div>
          </div>

          {/* Step 2: Select Items to Migrate */}
          <div className="glass-panel p-8 rounded-2xl border border-border-subtle industrial-shadow space-y-6">
            <h2 className="font-headline-sm text-on-background flex items-center gap-2 border-b border-border-subtle pb-3">
              <span className="material-symbols-outlined text-primary">checklist</span>
              2. Elementos a Migrar
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Settings Checkbox Card */}
              <label className={`p-5 rounded-xl border flex items-start gap-4 cursor-pointer transition-all ${
                migrarSettings 
                  ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-500/20' 
                  : 'bg-surface border-border-subtle hover:bg-surface-muted'
              }`}>
                <input 
                  type="checkbox"
                  checked={migrarSettings}
                  onChange={(e) => setMigrarSettings(e.target.checked)}
                  className="w-5 h-5 text-primary rounded border-border-subtle mt-0.5"
                />
                <div>
                  <h4 className="font-bold text-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">settings</span>
                    Configuraciones (`settings`)
                  </h4>
                  <p className="text-xs text-outline mt-1 leading-relaxed">
                    Copia todas las filas de la tabla settings (logo, branding, etiquetas, industrias, ubicaciones y parámetros globales).
                  </p>
                </div>
              </label>

              {/* Roles & Permisos Checkbox Card */}
              <label className={`p-5 rounded-xl border flex items-start gap-4 cursor-pointer transition-all ${
                migrarRolesPermisos 
                  ? 'bg-purple-50/50 border-purple-300 ring-2 ring-purple-500/20' 
                  : 'bg-surface border-border-subtle hover:bg-surface-muted'
              }`}>
                <input 
                  type="checkbox"
                  checked={migrarRolesPermisos}
                  onChange={(e) => setMigrarRolesPermisos(e.target.checked)}
                  className="w-5 h-5 text-primary rounded border-border-subtle mt-0.5"
                />
                <div>
                  <h4 className="font-bold text-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-600 text-xl">shield_person</span>
                    Roles y Matriz de Permisos
                  </h4>
                  <p className="text-xs text-outline mt-1 leading-relaxed">
                    Copia los roles registrados y sincroniza sus árboles de permisos completos para la empresa destino.
                  </p>
                </div>
              </label>

            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              variant="primary" 
              isLoading={isMigrating}
              loadingText="Migrando Datos..."
              className="gap-2 py-4 px-8 rounded-xl shadow-lg font-bold text-base"
            >
              <span className="material-symbols-outlined text-2xl">move_up</span>
              Ejecutar Migración de Datos
            </Button>
          </div>

        </form>

        {/* Resumen de Migración */}
        {resumenMigracion && (
          <div className="glass-panel p-8 rounded-2xl border border-green-200 bg-green-50/30 industrial-shadow space-y-4 animate-fade-in">
            <h3 className="font-headline-sm text-green-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-2xl">verified</span>
              Resumen de la Migración
            </h3>
            <ul className="space-y-2">
              {resumenMigracion.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-green-900 font-medium">
                  <span className="material-symbols-outlined text-green-600 text-lg">check</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};

export default MigracionSA;
