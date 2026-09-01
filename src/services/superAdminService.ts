import { apiFetch } from './api';

export interface Empresa {
  id: number;
  nombre: string;
  ruc?: string;
  email_contacto?: string;
  estado: boolean | number;
  total_usuarios?: number;
  created_at?: string;
}

export const superAdminService = {
  getEmpresas: async (): Promise<Empresa[]> => {
    return apiFetch('/api/superadmin/empresas');
  },

  createEmpresa: async (data: { nombre: string; ruc?: string; email_contacto?: string }): Promise<{ empresa: Empresa; message: string }> => {
    return apiFetch('/api/superadmin/empresas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getUsuariosGlobales: async (empresa_id?: string | number): Promise<any[]> => {
    const url = empresa_id && empresa_id !== 'all' ? `/api/superadmin/usuarios?empresa_id=${empresa_id}` : '/api/superadmin/usuarios';
    return apiFetch(url);
  },

  getSettingsEmpresa: async (empresa_id: string | number): Promise<any[]> => {
    return apiFetch(`/api/superadmin/settings/${empresa_id}`);
  },

  updateSettingsEmpresa: async (empresa_id: string | number, name: string, content: string): Promise<any> => {
    return apiFetch(`/api/superadmin/settings/${empresa_id}`, {
      method: 'POST',
      body: JSON.stringify({ name, content }),
    });
  },

  getRolesEmpresa: async (empresa_id: string | number): Promise<any[]> => {
    return apiFetch(`/api/superadmin/roles/${empresa_id}`);
  },

  createRoleEmpresa: async (empresa_id: string | number, nombre_rol: string): Promise<{ id: number; message: string }> => {
    return apiFetch(`/api/superadmin/roles/${empresa_id}`, {
      method: 'POST',
      body: JSON.stringify({ nombre_rol }),
    });
  },

  updateRoleNameEmpresa: async (empresa_id: string | number, rol_id: number, nombre_rol: string): Promise<any> => {
    return apiFetch(`/api/superadmin/roles/${empresa_id}/${rol_id}`, {
      method: 'PUT',
      body: JSON.stringify({ nombre_rol }),
    });
  },

  deleteRoleEmpresa: async (empresa_id: string | number, rol_id: number): Promise<any> => {
    return apiFetch(`/api/superadmin/roles/${empresa_id}/${rol_id}`, {
      method: 'DELETE',
    });
  },

  getPermisosEmpresa: async (empresa_id: string | number, rol_id: number): Promise<any[]> => {
    return apiFetch(`/api/superadmin/roles/${empresa_id}/${rol_id}/permisos`);
  },

  updatePermisosEmpresa: async (empresa_id: string | number, rol_id: number, permisos: any[]): Promise<any> => {
    return apiFetch(`/api/superadmin/roles/${empresa_id}/${rol_id}/permisos`, {
      method: 'PUT',
      body: JSON.stringify({ permisos }),
    });
  },

  migrarEmpresa: async (data: {
    origen_empresa_id: number;
    destino_empresa_id: number;
    opciones: { settings: boolean; roles_permisos: boolean };
  }): Promise<{ message: string; resumen: string[] }> => {
    return apiFetch('/api/superadmin/migrar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createUserGlobal: async (data: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    rol?: string;
    empresa_id: number;
  }): Promise<{ message: string }> => {
    return apiFetch('/api/superadmin/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUserGlobal: async (id: number, data: {
    nombre: string;
    apellido: string;
    email: string;
    rol?: string;
    status: boolean;
    password?: string;
    empresa_id: number;
  }): Promise<{ message: string }> => {
    return apiFetch(`/api/superadmin/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
