import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminService } from '../../../services/superAdminService';
import type { Empresa } from '../../../services/superAdminService';
import Button from '../../../components/CRM/ui/Button';

interface UserGlobal {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  rol_id?: number;
  empresa_id: number;
  status: boolean | number;
  create_at?: string;
}

const UsuariosSA: React.FC = () => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresaFilter, setSelectedEmpresaFilter] = useState<string>('all');
  const [usuarios, setUsuarios] = useState<UserGlobal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State para Crear / Editar Usuario
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserGlobal | null>(null);

  // Form Fields
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [empresaId, setEmpresaId] = useState<number>(1);
  const [rol, setRol] = useState<string>('Administrador');
  const [userStatus, setUserStatus] = useState<boolean>(true);

  const [availableRoles, setAvailableRoles] = useState<{ id: number; nombre_rol: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Cargar lista de empresas
  const fetchEmpresas = async () => {
    try {
      const data = await superAdminService.getEmpresas();
      setEmpresas(data);
      if (data.length > 0 && !editingUser) {
        setEmpresaId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching empresas:', err);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  // Cargar usuarios cada vez que cambie la empresa seleccionada en el filtro
  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const data = await superAdminService.getUsuariosGlobales(selectedEmpresaFilter);
      setUsuarios(data);
    } catch (err) {
      console.error('Error fetching global users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [selectedEmpresaFilter]);

  // Cargar roles disponibles de la empresa seleccionada en el formulario
  useEffect(() => {
    if (!empresaId) return;
    superAdminService.getRolesEmpresa(empresaId).then(data => {
      setAvailableRoles(data);
      if (data.length > 0 && !editingUser) {
        setRol(data[0].nombre_rol);
      }
    }).catch(console.error);
  }, [empresaId]);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setNombre('');
    setApellido('');
    setEmail('');
    setPassword('');
    setEmpresaId(empresas.length > 0 ? empresas[0].id : 1);
    setRol('Administrador');
    setUserStatus(true);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (u: UserGlobal) => {
    setEditingUser(u);
    setNombre(u.nombre);
    setApellido(u.apellido);
    setEmail(u.email);
    setPassword(''); // Opcional al editar
    setEmpresaId(u.empresa_id);
    setRol(u.rol);
    setUserStatus(u.status === 1 || u.status === true);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSaving(true);

    try {
      if (editingUser) {
        // Actualizar usuario existente
        await superAdminService.updateUserGlobal(editingUser.id, {
          nombre,
          apellido,
          email,
          rol,
          status: userStatus,
          password: password.trim() !== '' ? password : undefined,
          empresa_id: empresaId
        });
      } else {
        // Crear nuevo usuario
        if (!password) {
          setErrorMsg('La contraseña es requerida para nuevos usuarios.');
          setIsSaving(false);
          return;
        }
        await superAdminService.createUserGlobal({
          nombre,
          apellido,
          email,
          password,
          rol,
          empresa_id: empresaId
        });
      }

      setShowModal(false);
      fetchUsuarios();
    } catch (err: any) {
      console.error('Error saving user:', err);
      setErrorMsg(err.message || 'Error al guardar la información del usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsuarios = usuarios.filter(u => 
    `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmpresaNombre = (empId: number) => {
    const match = empresas.find(e => e.id === empId);
    return match ? match.nombre : `Empresa #${empId}`;
  };

  return (
    <div className="min-h-screen bg-background p-8 industrial-pattern">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/super-admin')}
              className="p-3 bg-surface rounded-xl border border-border-subtle hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <h1 className="font-display-lg text-on-background">Gestión Global de Usuarios</h1>
              <p className="font-body-md text-outline">Supervisión, edición de datos y roles de usuarios en todas las empresas</p>
            </div>
          </div>

          <Button 
            variant="primary" 
            onClick={handleOpenCreateModal}
            className="gap-2 py-3 px-6 rounded-xl shadow-md"
          >
            <span className="material-symbols-outlined text-xl">person_add</span>
            Crear Usuario
          </Button>
        </div>

        {/* Filters Panel: Company Selector & Search */}
        <div className="glass-panel p-6 rounded-2xl border border-border-subtle industrial-shadow flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Empresa Selector Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="material-symbols-outlined text-primary text-2xl">domain</span>
            <div className="flex-1 md:w-72">
              <label className="block font-label-caps text-xs text-outline uppercase mb-1">Filtrar por Empresa</label>
              <select 
                value={selectedEmpresaFilter}
                onChange={(e) => setSelectedEmpresaFilter(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface border border-border-subtle font-body-md text-on-background focus:ring-2 focus:ring-primary outline-none cursor-pointer"
              >
                <option value="all">🏢 Todas las Empresas</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    Empresa #{emp.id}: {emp.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-3.5 text-outline">search</span>
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border-subtle rounded-xl font-body-md focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

        </div>

        {/* Content Table */}
        <div className="glass-panel rounded-2xl border border-border-subtle industrial-shadow overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-outline flex justify-center items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
              Cargando usuarios...
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="p-12 text-center text-outline">
              <span className="material-symbols-outlined text-5xl mb-2 text-slate-300">group_off</span>
              <p className="font-headline-sm">No se encontraron usuarios.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-border-subtle font-label-caps text-outline uppercase">
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Usuario</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Empresa</th>
                    <th className="py-4 px-6">Rol</th>
                    <th className="py-4 px-6 text-center">Estado</th>
                    <th className="py-4 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle font-body-md text-on-surface">
                  {filteredUsuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="py-4 px-6 font-data-mono text-outline">#{u.id}</td>
                      <td className="py-4 px-6 font-semibold">{u.nombre} {u.apellido}</td>
                      <td className="py-4 px-6 text-outline">{u.email}</td>
                      <td className="py-4 px-6 font-medium text-primary">
                        {getEmpresaNombre(u.empresa_id)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {u.rol}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          u.status === 1 || u.status === true 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${u.status === 1 || u.status === true ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                          {u.status === 1 || u.status === true ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button 
                          variant="ghost" 
                          onClick={() => handleOpenEditModal(u)}
                          className="!py-1.5 !px-3 gap-1"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Modal Crear / Editar Usuario */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-2xl border border-border-subtle p-6 w-full max-w-xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">
                  {editingUser ? 'manage_accounts' : 'person_add'}
                </span>
                <h2 className="font-headline-sm text-on-background">
                  {editingUser ? `Editar Usuario: ${editingUser.nombre} ${editingUser.apellido}` : 'Nuevo Usuario Global'}
                </h2>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-outline hover:text-on-background p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-outline uppercase mb-1">Nombre *</label>
                  <input 
                    type="text" 
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full p-3 rounded-xl bg-background border border-border-subtle focus:ring-2 focus:ring-primary outline-none font-body-md"
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-outline uppercase mb-1">Apellido *</label>
                  <input 
                    type="text" 
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className="w-full p-3 rounded-xl bg-background border border-border-subtle focus:ring-2 focus:ring-primary outline-none font-body-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-outline uppercase mb-1">Correo Electrónico *</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-background border border-border-subtle focus:ring-2 focus:ring-primary outline-none font-body-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-outline uppercase mb-1">Empresa *</label>
                  <select 
                    value={empresaId}
                    onChange={(e) => setEmpresaId(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-background border border-border-subtle focus:ring-2 focus:ring-primary outline-none font-body-md cursor-pointer"
                  >
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        Empresa #{emp.id}: {emp.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-label-caps text-outline uppercase mb-1">Rol Asignado *</label>
                  <select 
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    className="w-full p-3 rounded-xl bg-background border border-border-subtle focus:ring-2 focus:ring-primary outline-none font-body-md cursor-pointer"
                  >
                    {availableRoles.length === 0 ? (
                      <option value="Administrador">Administrador</option>
                    ) : (
                      availableRoles.map((r) => (
                        <option key={r.id} value={r.nombre_rol}>
                          {r.nombre_rol}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-outline uppercase mb-1">
                    {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña *'}
                  </label>
                  <input 
                    type="password" 
                    placeholder={editingUser ? 'Dejar en blanco para conservar' : '••••••••'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded-xl bg-background border border-border-subtle focus:ring-2 focus:ring-primary outline-none font-body-md"
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-outline uppercase mb-1">Estado de la Cuenta</label>
                  <select 
                    value={userStatus ? 'true' : 'false'}
                    onChange={(e) => setUserStatus(e.target.value === 'true')}
                    className="w-full p-3 rounded-xl bg-background border border-border-subtle focus:ring-2 focus:ring-primary outline-none font-body-md cursor-pointer"
                  >
                    <option value="true">🟢 Activo</option>
                    <option value="false">🟡 Inactivo / Pendiente</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                <Button 
                  variant="ghost" 
                  type="button" 
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  isLoading={isSaving}
                  loadingText="Guardando..."
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosSA;
