import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { userService } from '../../services/userService';
import Button from '../../components/CRM/ui/Button';
import { useAuth } from '../../context/CRM/AuthContext';
import { useDialog } from '../../context/CRM/DialogContext';
import { useLoader } from '../../context/CRM/LoaderContext';

type TreeNode = {
  name: string;
  fullPath?: string;
  children: Record<string, TreeNode>;
};

const buildTree = (perms: { permiso: string, valor: boolean }[]) => {
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

const PermissionNode = ({ node, rolePermisos, setRolePermisos, level = 0 }: { node: TreeNode, rolePermisos: any[], setRolePermisos: any, level?: number }) => {
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

const RolesPermisos: React.FC = () => {
  const [rolesList, setRolesList] = useState<{id: number, nombre_rol: string}[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [rolePermisos, setRolePermisos] = useState<{permiso: string, valor: boolean}[]>([]);
  const [isLoadingPermisos, setIsLoadingPermisos] = useState(false);

  const { hasPermiso } = useAuth();
  const dialog = useDialog();
  const { showLoader, hideLoader } = useLoader();

  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalNode(document.getElementById('topnav-content-left'));
  }, []);

  const fetchRoles = async () => {
    try {
      const rolesData = await userService.getRoles();
      if (Array.isArray(rolesData)) {
        setRolesList(rolesData);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      setIsLoadingPermisos(true);
      userService.getPermisos(selectedRoleId)
        .then(data => {
          if (Array.isArray(data)) setRolePermisos(data);
        })
        .catch(console.error)
        .finally(() => setIsLoadingPermisos(false));
    } else {
      setRolePermisos([]);
    }
  }, [selectedRoleId]);

  const handleSavePermisos = async () => {
    if (!selectedRoleId || rolePermisos.length === 0) return;
    showLoader('Guardando permisos...');
    try {
      await userService.updatePermisos(selectedRoleId, rolePermisos);
      dialog.alert({
        title: 'Permisos Guardados',
        message: 'Los permisos del rol han sido guardados exitosamente.'
      });
    } catch (e) {
      console.error(e);
      dialog.alert({
        title: 'Error al guardar',
        message: 'Error al intentar guardar los permisos del rol.'
      });
    } finally {
      hideLoader();
    }
  };

  const handleAddRole = async () => {
    const nombre_rol = await dialog.prompt({
      title: 'Crear Nuevo Rol',
      message: 'Ingresa un nombre descriptivo para el nuevo rol.',
      label: 'Nombre del rol:',
      placeholder: 'Ej. Supervisor',
      confirmText: 'Crear Rol'
    });

    if (nombre_rol && nombre_rol.trim() !== '') {
      showLoader(`Creando rol "${nombre_rol}"...`);
      try {
        const res = await userService.createRole(nombre_rol.trim());
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

  const handleEditRoleName = async (role: { id: number, nombre_rol: string }) => {
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
        await userService.updateRoleName(role.id, nombre_rol.trim());
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

  const handleDeleteRole = async (role: { id: number, nombre_rol: string }) => {
    if (role.id === 1) {
      dialog.alert({
        title: 'Acción inválida',
        message: 'No puedes eliminar el rol Administrador principal.'
      });
      return;
    }

    const confirmed = await dialog.confirm({
      title: 'Eliminar Rol',
      message: `¿Estás seguro de que deseas eliminar permanentemente el rol "${role.nombre_rol}"? Se eliminarán también todos sus permisos asociados. Esta acción no se puede deshacer.`,
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      showLoader(`Eliminando rol...`);
      try {
        await userService.deleteRole(role.id);
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
          message: error.message || 'Ocurrió un error al intentar eliminar el rol. Es posible que esté asignado a uno o más usuarios.'
        });
      } finally {
        hideLoader();
      }
    }
  };

  if (!hasPermiso('usuarios.editar')) {
    return (
      <div className="max-w-6xl mx-auto min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center p-8 text-on-surface-variant font-body-lg">No tienes permisos para ver esta sección.</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-64px)] relative flex flex-col pt-8">
      {portalNode && createPortal(
        <div className="flex items-center pl-2">
          <Button onClick={handleAddRole} className="!py-1.5 !px-3 !text-[12px]">
            <span className="material-symbols-outlined text-[16px] mr-1.5">add</span>
            Añadir Rol
          </Button>
        </div>,
        portalNode
      )}

      <div className="flex gap-6 flex-1 h-[calc(100vh-180px)]">
        {/* Roles List Sidebar */}
        <div className="w-1/3 bg-surface border border-border-subtle rounded-lg flex flex-col overflow-hidden industrial-shadow">
          <div className="p-4 border-b border-border-subtle bg-surface-muted">
            <h3 className="font-label-caps text-[13px] uppercase tracking-wider text-on-surface-variant font-bold">Roles Disponibles</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {rolesList.length === 0 ? (
              <p className="text-center text-on-surface-variant text-[13px] py-4">Cargando roles...</p>
            ) : (
              rolesList.map(r => (
                <div key={r.id} className={`w-full rounded-md font-bold text-[14px] transition-all flex items-center justify-between group cursor-pointer ${selectedRoleId === r.id ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-on-surface-variant hover:bg-surface-muted hover:text-on-surface'}`} onClick={() => setSelectedRoleId(r.id)}>
                  <div className="flex-1 px-4 py-3 truncate">
                    {r.nombre_rol}
                  </div>
                  {hasPermiso('usuarios.editar') && (
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
                      {r.id !== 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(r);
                          }}
                          className={`px-2 py-3 opacity-0 group-hover:opacity-100 transition-opacity ${selectedRoleId === r.id ? 'text-white/80 hover:text-white' : 'text-on-surface-variant hover:text-status-na'}`}
                          title="Eliminar rol"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  )}
                  <span className={`material-symbols-outlined text-[18px] pr-4 opacity-0 group-hover:opacity-100 transition-opacity ${selectedRoleId === r.id ? 'text-white/80 opacity-100' : 'text-on-surface-variant'}`}>
                    chevron_right
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Permissions Configuration Area */}
        <div className="w-2/3 bg-surface border border-border-subtle rounded-lg flex flex-col overflow-hidden industrial-shadow">
          {!selectedRoleId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant p-8 text-center">
              <span className="material-symbols-outlined text-[48px] mb-4 opacity-50 text-border-subtle">shield_person</span>
              <p className="font-body-lg mb-2">Ningún rol seleccionado</p>
              <p className="text-[13px] max-w-sm">Selecciona un rol de la lista izquierda para ver o editar sus permisos, o crea un nuevo rol.</p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-on-surface mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
                    Permisos: {rolesList.find(r => r.id === selectedRoleId)?.nombre_rol}
                  </h3>
                  <p className="text-on-surface-variant text-[13px]">Activa o desactiva las funcionalidades a las que tendrán acceso los usuarios con este rol.</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-surface-bright">
                {isLoadingPermisos ? (
                  <div className="flex items-center justify-center h-full gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                    <span>Cargando permisos...</span>
                  </div>
                ) : rolePermisos.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-on-surface-variant text-[13px]">
                    No se encontraron permisos configurados para este rol.
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
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Guardar Cambios
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolesPermisos;
