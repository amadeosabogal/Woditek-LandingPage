import { apiFetch } from './api';

export const userService = {
  getAllUsers: async () => {
    return apiFetch('/api/users');
  },
  createUser: async (userData: any) => {
    return apiFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  getRoles: async () => {
    return apiFetch('/api/users/roles');
  },
  updateUser: async (id: number, userData: any) => {
    return apiFetch(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  getPermisos: async (rol_id: number) => {
    return apiFetch(`/api/users/roles/${rol_id}/permisos`);
  },
  updatePermisos: async (rol_id: number, permisos: { permiso: string, valor: boolean }[]) => {
    return apiFetch(`/api/users/roles/${rol_id}/permisos`, {
      method: 'PUT',
      body: JSON.stringify({ permisos }),
    });
  },
  createRole: async (nombre_rol: string) => {
    return apiFetch(`/api/users/roles`, {
      method: 'POST',
      body: JSON.stringify({ nombre_rol }),
    });
  },
  updateRoleName: async (id: number, nombre_rol: string) => {
    return apiFetch(`/api/users/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nombre_rol }),
    });
  },
  updateUserStatus: async (id: number, status: boolean) => {
    return apiFetch(`/api/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  updateUserRole: async (id: number, rol_id: number, rol: string) => {
    return apiFetch(`/api/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ rol_id, rol }),
    });
  },
  requestPasswordReset: async (id: number) => {
    return apiFetch(`/api/users/${id}/reset-password-request`, {
      method: 'POST',
      body: JSON.stringify({ clientUrl: window.location.origin })
    });
  },
  validatePasswordResetToken: async (token: string) => {
    return apiFetch(`/api/users/reset-password/validate?token=${token}`);
  },
  confirmPasswordReset: async (token: string, newPassword: string) => {
    return apiFetch(`/api/users/reset-password/confirm`, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
  deleteUser: async (id: number) => {
    return apiFetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },
  deleteRole: async (id: number) => {
    return apiFetch(`/api/users/roles/${id}`, {
      method: 'DELETE',
    });
  },
  updateUserOrganizaciones: async (id: number, proyectos_acceso: number[]) => {
    return apiFetch(`/api/users/${id}/organizaciones`, {
      method: 'PATCH',
      body: JSON.stringify({ proyectos_acceso }),
    });
  }
};
