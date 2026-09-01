import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { userService } from '../../services/userService';
import proyectosService from '../../services/proyectosService';
import Button from '../../components/CRM/ui/Button';
import { useAuth } from '../../context/CRM/AuthContext';
import { useDialog } from '../../context/CRM/DialogContext';


interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  rol_id?: number;
  status: boolean;
  create_at: string;
  proyectos_acceso?: string;
}

const Usuarios: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  // Form state
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');
  const [availableRoles, setAvailableRoles] = useState<{id: number, nombre_rol: string}[]>([]);
  const [togglingStatusIds, setTogglingStatusIds] = useState<Record<number, 'loading' | 'success'>>({});
  
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [openOrgPopover, setOpenOrgPopover] = useState<number | null>(null);
  const [savingOrgIds, setSavingOrgIds] = useState<Record<number, boolean>>({});

  const [status, setStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const dialog = useDialog();
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalNode(document.getElementById('topnav-content-left'));
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      const parsedData = data.map((u: any) => ({
        ...u,
        status: u.status === true || u.status === 1 || u.status === '1' || (u.status && u.status.type === 'Buffer' && u.status.data && u.status.data[0] === 1)
      }));
      setUsers(parsedData);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();

    const fetchRoles = async () => {
      try {
        const rolesData = await userService.getRoles();
        if (Array.isArray(rolesData) && rolesData.length > 0) {
          setAvailableRoles(rolesData);
          setRol(rolesData[0].nombre_rol);
        } else {
          const fallback = [{id: 1, nombre_rol: 'Administrador'}];
          setAvailableRoles(fallback);
          setRol(fallback[0].nombre_rol);
        }
      } catch (err) {
        console.error('Error fetching roles:', err);
        const fallback = [{id: 1, nombre_rol: 'Administrador'}];
        setAvailableRoles(fallback);
        setRol(fallback[0].nombre_rol);
      }
    };
    
    fetchRoles();

    const fetchProjects = async () => {
      try {
        const data = await proyectosService.getProyectos();
        setProjectsList(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    fetchProjects();
    
    // Removed inline permission loading since we have RolesConfig tab now
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setIsLoading(true);

    try {
      if (editUserId) {
        const updateData: any = { nombre, apellido, email, rol, proyectos_acceso: selectedProjectIds };
        if (password.trim() !== '') {
          updateData.password = password;
        }
        await userService.updateUser(editUserId, updateData);
        setStatus({ type: 'success', message: 'Usuario actualizado exitosamente.' });
      } else {
        await userService.createUser({ nombre, apellido, email, password, rol, proyectos_acceso: selectedProjectIds });
        setStatus({ type: 'success', message: 'Usuario registrado exitosamente.' });
      }

      // Clear form
      setNombre('');
      setApellido('');
      setEmail('');
      setPassword('');
      setSelectedProjectIds([]);
      if (availableRoles.length > 0) setRol(availableRoles[0].nombre_rol);

      // Refresh user list and close modal after a short delay
      fetchUsers();
      setTimeout(() => {
        setIsModalOpen(false);
        setStatus({ type: '', message: '' });
        setEditUserId(null);
      }, 1500);

    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      setTogglingStatusIds(prev => ({ ...prev, [userId]: 'loading' }));
      const newStatus = !currentStatus;
      await userService.updateUserStatus(userId, newStatus);
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      
      setTogglingStatusIds(prev => ({ ...prev, [userId]: 'success' }));
      setTimeout(() => {
        setTogglingStatusIds(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
      }, 1500);
    } catch (err: any) {
      setTogglingStatusIds(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      dialog.alert({ 
        title: 'Error al cambiar estado', 
        message: err.message || 'Error desconocido' 
      });
    }
  };

  const handleRoleChange = async (userId: number, newRolId: string) => {
    try {
      const roleObj = availableRoles.find(r => r.id.toString() === newRolId);
      if (!roleObj) return;
      await userService.updateUserRole(userId, roleObj.id, roleObj.nombre_rol);
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, rol: roleObj.nombre_rol, rol_id: roleObj.id } : u));
    } catch (err: any) {
      dialog.alert({ 
        title: 'Error al cambiar rol', 
        message: err.message || 'Error desconocido' 
      });
    }
  };

  const handleOrgAccesoChange = async (userId: number, projId: number, currentAcceso: string | undefined) => {
    let pIds: number[] = [];
    if (currentAcceso) {
      try { pIds = JSON.parse(currentAcceso); if (!Array.isArray(pIds)) pIds = []; } catch { pIds = []; }
    }
    const newIds = pIds.includes(projId) ? pIds.filter(id => id !== projId) : [...pIds, projId];
    setSavingOrgIds(prev => ({ ...prev, [userId]: true }));
    try {
      await userService.updateUserOrganizaciones(userId, newIds);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, proyectos_acceso: JSON.stringify(newIds) } : u));
    } catch (err: any) {
      dialog.alert({ title: 'Error', message: err.message || 'No se pudo actualizar el acceso.' });
    } finally {
      setSavingOrgIds(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handlePasswordReset = async (userObj: User) => {
    const confirmed = await dialog.confirm({
      title: 'Restablecer Contraseña',
      message: `¿Estás seguro que deseas enviar un correo de recuperación a ${userObj.nombre}? El enlace expirará en 2 horas.`,
      confirmText: 'Sí, Enviar',
      cancelText: 'Cancelar'
    });
    
    if (confirmed) {
      try {
        await userService.requestPasswordReset(userObj.id);
        dialog.alert({
          title: 'Correo Enviado',
          message: 'Se ha enviado un correo con las instrucciones para recuperar la contraseña.'
        });
      } catch (err: any) {
        dialog.alert({
          title: 'Error al solicitar recuperación',
          message: err.message || 'Error desconocido'
        });
      }
    }
  };

  const handleDeleteUser = async (userObj: User) => {
    if (userObj.id === user?.id) {
      dialog.alert({
        title: 'Acción inválida',
        message: 'No puedes eliminar tu propio usuario.'
      });
      return;
    }

    const confirmed = await dialog.confirm({
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de que deseas eliminar permanentemente al usuario "${userObj.nombre} ${userObj.apellido}"? Esta acción no se puede deshacer.`,
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      try {
        await userService.deleteUser(userObj.id);
        setUsers(prev => prev.filter(u => u.id !== userObj.id));
        dialog.alert({
          title: 'Usuario Eliminado',
          message: `El usuario "${userObj.nombre} ${userObj.apellido}" ha sido eliminado exitosamente.`
        });
      } catch (err: any) {
        dialog.alert({
          title: 'Error al eliminar',
          message: err.message || 'Ocurrió un error al intentar eliminar al usuario. Es posible que tenga registros asociados (como oportunidades o proyectos). Considere desactivar su cuenta en su lugar.'
        });
      }
    }
  };

  const openModal = (userObj?: User) => {
    if (userObj && userObj.id) {
      setEditUserId(userObj.id);
      setNombre(userObj.nombre);
      setApellido(userObj.apellido);
      setEmail(userObj.email);
      setRol(userObj.rol);
      setPassword('');
      let pIds: number[] = [];
      if (userObj.proyectos_acceso) {
        try {
          pIds = JSON.parse(userObj.proyectos_acceso);
          if (!Array.isArray(pIds)) pIds = [];
        } catch (e) {
          console.error('Error parsing proyectos_acceso:', e);
        }
      }
      setSelectedProjectIds(pIds);
    } else {
      setEditUserId(null);
      setNombre('');
      setApellido('');
      setEmail('');
      setPassword('');
      setSelectedProjectIds([]);
      if (availableRoles.length > 0) setRol(availableRoles[0].nombre_rol);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStatus({ type: '', message: '' });
    setEditUserId(null);
    setSelectedProjectIds([]);
  };

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-64px)] relative pt-8">
      {portalNode && createPortal(
        <div className="flex items-center pl-2">
          <Button onClick={() => openModal()} className="!py-1.5 !px-3 !text-[12px]">
            <span className="material-symbols-outlined text-[16px] mr-1.5">person_add</span>
            Añadir Nuevo Usuario
          </Button>
        </div>,
        portalNode
      )}

          {/* Users Table */}
          <div className="bg-surface industrial-shadow border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border-subtle text-on-surface-variant font-label-caps text-[11px] uppercase tracking-wider">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Nombre</th>
                <th className="p-4 font-semibold">Correo Electrónico</th>
                <th className="p-4 font-semibold">Rol</th>
                <th className="p-4 font-semibold">Organizaciones</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold">Fecha de Creación</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                    No hay usuarios registrados o cargando...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-bright transition-colors">
                    <td className="p-4 font-data-mono text-outline text-[12px]">#{u.id}</td>
                    <td className="p-4 font-body-md font-medium text-on-surface">{u.nombre} {u.apellido}</td>
                    <td className="p-4 text-on-surface-variant font-body-sm">{u.email}</td>
                    <td className="p-4">
                      {user?.rol_id === 1 ? (
                        <select 
                           value={u.rol_id || availableRoles.find(r => r.nombre_rol === u.rol)?.id || ''} 
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-surface-muted text-on-surface-variant border border-border-subtle font-bold text-[11px] rounded shadow-sm px-2 py-1 outline-none focus:border-primary"
                        >
                          {availableRoles.map((r) => (
                            <option key={r.id} value={r.id}>{r.nombre_rol}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 bg-surface-muted text-on-surface-variant border border-border-subtle font-bold text-[11px] rounded-full shadow-sm whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>
                          {u.rol}
                        </span>
                      )}
                    </td>
                    <td className="p-4 relative">
                      {user?.rol_id === 1 ? (
                        <div className="relative">
                          {/* Trigger button */}
                          <button
                            onClick={() => setOpenOrgPopover(openOrgPopover === u.id ? null : u.id)}
                            className="flex flex-wrap gap-1 max-w-[180px] text-left group"
                          >
                            {(() => {
                              let pIds: number[] = [];
                              if (u.proyectos_acceso) {
                                try { pIds = JSON.parse(u.proyectos_acceso); } catch { pIds = []; }
                              }
                              if (!Array.isArray(pIds) || pIds.length === 0) {
                                return (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-outline italic group-hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[13px]">add_circle</span>
                                    Asignar
                                  </span>
                                );
                              }
                              return pIds.map(pid => {
                                const proj = projectsList.find(p => p.id === pid);
                                return proj ? (
                                  <span key={pid} className="inline-flex items-center px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 font-medium text-[11px] rounded">
                                    {proj.nombre}
                                  </span>
                                ) : null;
                              });
                            })()}
                            {savingOrgIds[u.id] && <span className="material-symbols-outlined text-[13px] text-primary animate-spin">refresh</span>}
                          </button>

                          {/* Popover */}
                          {openOrgPopover === u.id && (
                            <>
                              {/* backdrop */}
                              <div className="fixed inset-0 z-40" onClick={() => setOpenOrgPopover(null)} />
                              <div className="absolute left-0 top-full mt-1 z-50 bg-surface border border-border-subtle rounded-lg industrial-shadow-lg w-52 py-1 animate-in fade-in zoom-in-95 duration-150">
                                <p className="px-3 py-1.5 text-[10px] font-semibold text-outline uppercase tracking-wider border-b border-border-subtle">Acceso a Organizaciones</p>
                                {projectsList.length === 0 ? (
                                  <p className="px-3 py-2 text-[12px] text-outline italic">Sin organizaciones creadas</p>
                                ) : (
                                  <div className="max-h-48 overflow-y-auto">
                                    {projectsList.map((proj: any) => {
                                      let pIds: number[] = [];
                                      if (u.proyectos_acceso) {
                                        try { pIds = JSON.parse(u.proyectos_acceso); } catch { pIds = []; }
                                      }
                                      const checked = Array.isArray(pIds) && pIds.includes(proj.id);
                                      return (
                                        <label
                                          key={proj.id}
                                          className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors text-[12px] ${checked ? 'bg-primary/8 text-primary font-medium' : 'text-on-surface hover:bg-surface-muted'}`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => handleOrgAccesoChange(u.id, proj.id, u.proyectos_acceso)}
                                            className="rounded border-border-subtle text-primary"
                                          />
                                          <span className="material-symbols-outlined text-[14px] text-outline">corporate_fare</span>
                                          {proj.nombre}
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        /* Read-only for non-admin */
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {(() => {
                            let pIds: number[] = [];
                            if (u.proyectos_acceso) {
                              try { pIds = JSON.parse(u.proyectos_acceso); } catch { pIds = []; }
                            }
                            if (!Array.isArray(pIds) || pIds.length === 0) return <span className="text-[11px] text-outline italic">Ninguno</span>;
                            return pIds.map(pid => {
                              const proj = projectsList.find(p => p.id === pid);
                              return proj ? <span key={pid} className="inline-flex items-center px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 font-medium text-[11px] rounded">{proj.nombre}</span> : null;
                            });
                          })()}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusToggle(u.id, u.status)}
                          disabled={user?.rol_id !== 1 || togglingStatusIds[u.id] === 'loading'}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${u.status ? 'bg-status-ip' : 'bg-on-surface-variant/30'} ${user?.rol_id !== 1 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                        >
                          <span className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${u.status ? 'translate-x-5' : 'translate-x-0'}`}>
                            {togglingStatusIds[u.id] === 'loading' && <span className="material-symbols-outlined text-[14px] animate-spin text-status-ip">refresh</span>}
                            {togglingStatusIds[u.id] === 'success' && <span className="material-symbols-outlined text-[14px] text-status-pp">check</span>}
                          </span>
                        </button>
                        <span className={`text-[12px] font-medium ${u.status ? 'text-status-ip' : 'text-on-surface-variant'}`}>
                          {u.status ? 'Activo' : 'Pendiente'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant font-data-mono text-[12px]">
                      {new Date(u.create_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={() => handlePasswordReset(u)}
                        disabled={user?.rol_id !== 1}
                        className={`p-1 rounded transition-colors ${user?.rol_id !== 1 ? 'text-on-surface-variant/50 cursor-not-allowed' : 'text-on-surface-variant hover:text-white hover:bg-primary'}`}
                        title="Restablecer Contraseña"
                      >
                        <span className="material-symbols-outlined text-[18px]">key</span>
                      </button>
                      <button
                        onClick={() => openModal(u)}
                        className="text-on-surface-variant hover:text-white transition-colors p-1 rounded hover:bg-primary"
                        title="Editar Usuario"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        disabled={user?.rol_id !== 1 || u.id === user?.id}
                        className={`p-1 rounded transition-colors ${user?.rol_id !== 1 || u.id === user?.id ? 'text-on-surface-variant/50 cursor-not-allowed' : 'text-on-surface-variant hover:text-white hover:bg-status-na'}`}
                        title="Eliminar Usuario"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* Modal Container */}
          <div className="bg-surface border border-border-subtle rounded-lg w-full max-w-2xl industrial-shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border-subtle">
              <h3 className="font-headline-sm text-headline-sm flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary">{editUserId ? 'manage_accounts' : 'person_add'}</span>
                {editUserId ? 'Editar Usuario' : 'Alta de Nuevo Usuario'}
              </h3>
              <button
                onClick={closeModal}
                className="text-on-surface-variant hover:text-status-na transition-colors p-1 rounded-full hover:bg-status-na/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6">
              {status.message && (
                <div className={`mb-6 px-4 py-3 rounded relative flex items-center gap-2 ${status.type === 'error' ? 'bg-status-na/10 border border-status-na text-status-na' : 'bg-status-ip/10 border border-status-ip text-status-ip'}`} role="alert">
                  <span className="material-symbols-outlined text-[20px]">
                    {status.type === 'error' ? 'error' : 'check_circle'}
                  </span>
                  <span className="block sm:inline font-body-md">{status.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase" htmlFor="nombre">Nombre</label>
                    <input
                      id="nombre"
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="block w-full px-3 py-2 bg-surface-bright border border-border-subtle rounded text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none"
                      placeholder="Ej. Juan"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase" htmlFor="apellido">Apellido</label>
                    <input
                      id="apellido"
                      type="text"
                      required
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      className="block w-full px-3 py-2 bg-surface-bright border border-border-subtle rounded text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none"
                      placeholder="Ej. Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase" htmlFor="email">Correo Corporativo</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-3 py-2 bg-surface-bright border border-border-subtle rounded text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none"
                    placeholder="nombre.apellido@wimprove.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase" htmlFor="password">
                      {editUserId ? 'Nueva Contraseña (Opcional)' : 'Contraseña Temporal'}
                    </label>
                    <input
                      id="password"
                      type="password"
                      required={!editUserId}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-3 py-2 bg-surface-bright border border-border-subtle rounded text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none"
                      placeholder="••••••••••••"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase" htmlFor="rol">Rol</label>
                    <select
                      id="rol"
                      value={rol}
                      onChange={(e) => setRol(e.target.value)}
                      className="block w-full px-3 py-2 bg-surface-bright border border-border-subtle rounded text-body-md focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none"
                    >
                      {availableRoles.map(r => (
                        <option key={r.id} value={r.nombre_rol}>{r.nombre_rol}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Acceso a Organizaciones */}
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface mb-2 uppercase">
                    Acceso a Organizaciones
                  </label>
                  {projectsList.length === 0 ? (
                    <p className="text-[12px] text-outline italic">No hay organizaciones creadas aún.</p>
                  ) : (
                    <div className="border border-border-subtle rounded bg-surface-bright max-h-40 overflow-y-auto p-2 space-y-1">
                      {projectsList.map((proj: any) => {
                        const checked = selectedProjectIds.includes(proj.id);
                        return (
                          <label
                            key={proj.id}
                            className={`flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer transition-colors ${checked ? 'bg-primary/10' : 'hover:bg-surface-muted'}`}
                          >
                            <input
                              type="checkbox"
                              className="rounded border-border-subtle text-primary focus:ring-primary-container"
                              checked={checked}
                              onChange={() => {
                                setSelectedProjectIds(prev =>
                                  prev.includes(proj.id)
                                    ? prev.filter(id => id !== proj.id)
                                    : [...prev, proj.id]
                                );
                              }}
                            />
                            <span className="flex items-center gap-1.5 text-[13px] font-medium text-on-surface">
                              <span className="material-symbols-outlined text-[16px] text-primary">corporate_fare</span>
                              {proj.nombre}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {selectedProjectIds.length > 0 && (
                    <p className="mt-1 text-[11px] text-primary font-medium">
                      {selectedProjectIds.length} organización{selectedProjectIds.length !== 1 ? 'es' : ''} seleccionada{selectedProjectIds.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-border-subtle flex justify-end gap-3">
                  <Button
                    type="button"
                    onClick={closeModal}
                    disabled={isLoading}
                    variant="ghost"
                    className="!text-on-surface border border-border-subtle"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    isLoading={isLoading}
                    loadingText="Guardando..."
                  >
                    <span className="material-symbols-outlined text-[18px] mr-1">save</span>
                    {editUserId ? 'Actualizar Usuario' : 'Crear Usuario'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
