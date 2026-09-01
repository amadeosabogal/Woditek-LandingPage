import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminService } from '../../../services/superAdminService';
import type { Empresa } from '../../../services/superAdminService';
import Button from '../../../components/CRM/ui/Button';
import { useDialog } from '../../../context/CRM/DialogContext';
import { useLoader } from '../../../context/CRM/LoaderContext';

type TreeNode = {
  name: string;
  fullPath?: string;
  children: Record<string, TreeNode>;
};

const buildTree = (perms: { permiso: string; valor: boolean }[]) => {
  const root: TreeNode = { name: 'root', children: {} };
  perms.forEach(p => {
    const parts = p.permiso.split('.');
    let current = root;
    parts.forEach((part, index) => {
      if (!current.children[part]) current.children[part] = { name: part, children: {} };
      if (index === parts.length - 1) current.children[part].fullPath = p.permiso;
      current = current.children[part];
    });
  });
  return root;
};

const getAllChildPaths = (node: TreeNode): string[] => {
  let paths: string[] = [];
  if (node.fullPath) paths.push(node.fullPath);
  Object.values(node.children).forEach(child => {
    paths = paths.concat(getAllChildPaths(child));
  });
  return paths;
};

const PermissionNode = ({ node, rolePermisos, setRolePermisos, level = 0 }: { node: TreeNode; rolePermisos: any[]; setRolePermisos: any; level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  const childPaths = getAllChildPaths(node);
  const selectedCount = childPaths.filter(path => rolePermisos.find(p => p.permiso === path)?.valor).length;
  const isAllSelected = selectedCount === childPaths.length && childPaths.length > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < childPaths.length;

  const handleToggle = () => {
    const newValue = !isAllSelected;
    setRolePermisos((prev: any[]) => prev.map(p => childPaths.includes(p.permiso) ? { ...p, valor: newValue } : p));
  };

  const isLeaf = Object.keys(node.children).length === 0;

  return (
    <div className={`mt-${level === 0 ? '0' : '2'} ${level > 0 ? 'ml-6 border-l border-border-subtle pl-2' : ''}`}>
      <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${level === 0 ? 'bg-surface-muted border border-border-subtle mb-2' : 'hover:bg-surface-muted/50'}`}>
        {!isLeaf ? (
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-6 h-6 rounded hover:bg-surface-muted">
            <span className="material-symbols-outlined text-[20px] transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>chevron_right</span>
          </button>
        ) : (
          <div className="w-6 h-6 flex items-center justify-center">
             <span className="w-1.5 h-1.5 rounded-full bg-border-subtle" />
          </div>
        )}
        
        <label className="flex items-center gap-3 cursor-pointer flex-1">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={input => { if (input) input.indeterminate = isIndeterminate; }}
            onChange={handleToggle}
            className="w-4 h-4 text-primary rounded border-border-subtle focus:ring-primary focus:ring-offset-0 focus:ring-1"
          />
          <span className={`leading-none ${level === 0 ? 'font-bold text-on-surface uppercase tracking-wide text-[12px]' : isLeaf ? 'text-on-surface-variant text-[13px]' : 'font-medium text-on-surface text-[14px]'}`}>
            {node.name.replace(/_/g, ' ')}
          </span>
          {level === 0 && (
            <span className="ml-auto text-[11px] text-on-surface-variant font-data-mono bg-surface border border-border-subtle px-2 py-0.5 rounded-full shadow-sm">
              {selectedCount}/{childPaths.length}
            </span>
          )}
        </label>
      </div>

      {isExpanded && !isLeaf && (
        <div className="mt-1">
          {Object.values(node.children).map(child => (
            <PermissionNode key={child.name} node={child} rolePermisos={rolePermisos} setRolePermisos={setRolePermisos} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const RolesSA: React.FC = () => {
  const navigate = useNavigate();
  const dialog = useDialog();
  const { showLoader, hideLoader } = useLoader();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | null>(null);

  const [rolesList, setRolesList] = useState<{ id: number; nombre_rol: string }[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [rolePermisos, setRolePermisos] = useState<{ permiso: string; valor: boolean }[]>([]);
  const [isLoadingPermisos, setIsLoadingPermisos] = useState(false);

  // Cargar empresas
  useEffect(() => {
    superAdminService.getEmpresas().then(data => {
      setEmpresas(data);
      if (data.length > 0) {
        setSelectedEmpresaId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  // Cargar roles de la empresa seleccionada
  const fetchRoles = async () => {
    if (!selectedEmpresaId) return;
    try {
      const data = await superAdminService.getRolesEmpresa(selectedEmpresaId);
      setRolesList(data);
      if (data.length > 0 && !selectedRoleId) {
        setSelectedRoleId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  useEffect(() => {
    setSelectedRoleId(null);
    fetchRoles();
  }, [selectedEmpresaId]);

  // Cargar permisos del rol seleccionado
  useEffect(() => {
    if (selectedEmpresaId && selectedRoleId) {
      setIsLoadingPermisos(true);
      superAdminService.getPermisosEmpresa(selectedEmpresaId, selectedRoleId)
        .then(data => {
          if (Array.isArray(data)) setRolePermisos(data);
        })
        .catch(console.error)
        .finally(() => setIsLoadingPermisos(false));
    } else {
      setRolePermisos([]);
    }
  }, [selectedEmpresaId, selectedRoleId]);

  const handleSavePermisos = async () => {
    if (!selectedEmpresaId || !selectedRoleId || rolePermisos.length === 0) return;
    showLoader('Guardando permisos...');
    try {
      await superAdminService.updatePermisosEmpresa(selectedEmpresaId, selectedRoleId, rolePermisos);
      dialog.alert({
        title: 'Permisos Guardados',
        message: 'Los permisos del rol han sido guardados exitosamente.'
      });
    } catch (e: any) {
      console.error(e);
      dialog.alert({
        title: 'Error al guardar',
        message: e.message || 'Error al intentar guardar los permisos del rol.'
      });
    } finally {
      hideLoader();
    }
  };

  const handleAddRole = async () => {
    if (!selectedEmpresaId) return;
    const nombre_rol = await dialog.prompt({
      title: 'Crear Nuevo Rol',
      message: 'Ingresa un nombre descriptivo para el nuevo rol de la empresa.',
      label: 'Nombre del rol:',
      placeholder: 'Ej. Supervisor',
      confirmText: 'Crear Rol'
    });

    if (nombre_rol && nombre_rol.trim() !== '') {
      showLoader(`Creando rol "${nombre_rol}"...`);
      try {
        const res = await superAdminService.createRoleEmpresa(selectedEmpresaId, nombre_rol.trim());
        await fetchRoles();
        if (res.id) setSelectedRoleId(res.id);
      } catch (error: any) {
        console.error('Error creating role:', error);
        dialog.alert({
          title: 'Error al crear',
          message: error.message || 'Error al crear el rol'
        });
      } finally {
        hideLoader();
      }
    }
  };

  const handleEditRoleName = async (role: { id: number; nombre_rol: string }) => {
    if (!selectedEmpresaId) return;
    const nombre_rol = await dialog.prompt({
      title: 'Editar Nombre del Rol',
      message: 'Ingresa un nuevo nombre para este rol.',
      label: 'Nombre del rol:',
      defaultValue: role.nombre_rol,
      confirmText: 'Guardar Cambios'
    });

    if (nombre_rol && nombre_rol.trim() !== '' && nombre_rol.trim() !== role.nombre_rol) {
      showLoader(`Actualizando rol...`);
      try {
        await superAdminService.updateRoleNameEmpresa(selectedEmpresaId, role.id, nombre_rol.trim());
        await fetchRoles();
      } catch (error: any) {
        console.error('Error updating role:', error);
        dialog.alert({
          title: 'Error al actualizar',
          message: error.message || 'Error al actualizar el rol'
        });
      } finally {
        hideLoader();
      }
    }
  };

  const handleDeleteRole = async (role: { id: number; nombre_rol: string }) => {
    if (!selectedEmpresaId) return;

    const confirmed = await dialog.confirm({
      title: 'Eliminar Rol',
      message: `¿Estás seguro de que deseas eliminar permanentemente el rol "${role.nombre_rol}" de esta empresa? Se eliminarán también todos sus permisos asociados.`,
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      showLoader(`Eliminando rol...`);
      try {
        await superAdminService.deleteRoleEmpresa(selectedEmpresaId, role.id);
        if (selectedRoleId === role.id) {
          setSelectedRoleId(null);
        }
        await fetchRoles();
        dialog.alert({
          title: 'Rol Eliminado',
          message: `El rol "${role.nombre_rol}" ha sido eliminado exitosamente.`
        });
      } catch (error: any) {
        console.error('Error deleting role:', error);
        dialog.alert({
          title: 'Error al eliminar',
          message: error.message || 'Ocurrió un error al intentar eliminar el rol.'
        });
      } finally {
        hideLoader();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 industrial-pattern">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/super-admin')}
              className="p-3 bg-surface rounded-xl border border-border-subtle hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <h1 className="font-display-lg text-on-background">Roles y Permisos por Empresa</h1>
              <p className="font-body-md text-outline">Creación, edición y configuración de la matriz de permisos para los roles de la empresa</p>
            </div>
          </div>
          
          <Button onClick={handleAddRole} className="gap-2 py-3 px-6 rounded-xl shadow-md">
            <span className="material-symbols-outlined text-xl">add</span>
            Añadir Rol
          </Button>
        </div>

        {/* Company Selector Dropdown */}
        <div className="glass-panel p-6 rounded-2xl border border-border-subtle industrial-shadow flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-3xl">shield_person</span>
          <div className="flex-1 md:w-80">
            <label className="block font-label-caps text-xs text-outline uppercase mb-1">Empresa Seleccionada</label>
            <select 
              value={selectedEmpresaId || ''}
              onChange={(e) => setSelectedEmpresaId(Number(e.target.value))}
              className="w-full md:w-96 p-3 rounded-xl bg-surface border border-border-subtle font-body-md text-on-background focus:ring-2 focus:ring-primary outline-none cursor-pointer"
            >
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  Empresa #{emp.id}: {emp.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Roles & Permissions Editor Interface */}
        <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[500px]">
          
          {/* Sidebar Roles */}
          <div className="w-1/3 glass-panel border border-border-subtle rounded-2xl flex flex-col overflow-hidden industrial-shadow">
            <div className="p-4 border-b border-border-subtle bg-surface-muted flex items-center justify-between">
              <h3 className="font-label-caps text-[13px] uppercase tracking-wider text-on-surface-variant font-bold">Roles Registrados</h3>
              <span className="text-xs font-data-mono bg-surface border border-border-subtle px-2.5 py-0.5 rounded-full text-outline">
                {rolesList.length} roles
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {rolesList.length === 0 ? (
                <p className="text-center text-on-surface-variant text-[13px] py-8">No hay roles creados en esta empresa.</p>
              ) : (
                rolesList.map(r => (
                  <div 
                    key={r.id} 
                    className={`w-full rounded-xl font-bold text-[14px] transition-all flex items-center justify-between group cursor-pointer ${selectedRoleId === r.id ? 'bg-primary text-white shadow-sm' : 'bg-surface text-on-surface-variant hover:bg-surface-muted hover:text-on-surface'}`} 
                    onClick={() => setSelectedRoleId(r.id)}
                  >
                    <div className="flex-1 px-4 py-3 truncate">
                      {r.nombre_rol}
                    </div>
                    
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditRoleName(r);
                        }}
                        className={`px-2 py-3 opacity-0 group-hover:opacity-100 transition-opacity ${selectedRoleId === r.id ? 'text-white/80 hover:text-white' : 'text-on-surface-variant hover:text-primary'}`}
                        title="Editar nombre del rol"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(r);
                        }}
                        className={`px-2 py-3 opacity-0 group-hover:opacity-100 transition-opacity ${selectedRoleId === r.id ? 'text-white/80 hover:text-white' : 'text-on-surface-variant hover:text-red-500'}`}
                        title="Eliminar rol"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                    <span className={`material-symbols-outlined text-[18px] pr-4 opacity-0 group-hover:opacity-100 transition-opacity ${selectedRoleId === r.id ? 'text-white/80 opacity-100' : 'text-on-surface-variant'}`}>
                      chevron_right
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Permissions Area */}
          <div className="w-2/3 glass-panel border border-border-subtle rounded-2xl flex flex-col overflow-hidden industrial-shadow">
            {!selectedRoleId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant p-8 text-center">
                <span className="material-symbols-outlined text-[56px] mb-4 opacity-40 text-primary">shield_person</span>
                <p className="font-headline-sm mb-2 text-on-background">Ningún Rol Seleccionado</p>
                <p className="text-sm max-w-sm text-outline">Selecciona un rol de la lista para gestionar su árbol de permisos o crea uno nuevo.</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-surface-container-low">
                  <div>
                    <h3 className="font-headline-sm text-on-surface mb-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
                      Permisos del Rol: <span className="text-primary font-bold">{rolesList.find(r => r.id === selectedRoleId)?.nombre_rol}</span>
                    </h3>
                    <p className="text-on-surface-variant text-xs">Modifica el árbol de permisos para los usuarios asignados a este rol.</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-surface">
                  {isLoadingPermisos ? (
                    <div className="flex items-center justify-center h-full gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                      <span>Cargando matriz de permisos...</span>
                    </div>
                  ) : rolePermisos.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-on-surface-variant text-sm">
                      No hay matriz de permisos disponible para este rol.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.values(buildTree(rolePermisos).children).map(child => (
                        <PermissionNode key={child.name} node={child} rolePermisos={rolePermisos} setRolePermisos={setRolePermisos} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5 border-t border-border-subtle bg-surface-muted flex justify-end gap-3">
                  <Button 
                    onClick={handleSavePermisos} 
                    disabled={isLoadingPermisos || rolePermisos.length === 0}
                    className="gap-2 px-6 py-2.5 shadow-md"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Guardar Permisos
                  </Button>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default RolesSA;
