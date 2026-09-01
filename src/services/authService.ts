import { apiFetch } from './api';

export const authService = {
  login: async (credentials: any, empresa_id: string | number) => {
    return apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ ...credentials, empresa_id }),
    });
  },
  
  loginSuperAdmin: async (credentials: { email: string; password: string }) => {
    return apiFetch('/api/auth/super-admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: any, empresa_id: string | number) => {
    return apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...userData, empresa_id }),
    });
  }
};
