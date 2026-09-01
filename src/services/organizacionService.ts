import { apiFetch } from './api';

export interface Organizacion {
  id?: number;
  perfil?: any;
  contactos?: any[];
}

const organizacionService = {
  getOrganizaciones: async () => {
    return apiFetch('/api/organizaciones');
  },
  
  createOrganizacion: async (data: any) => {
    return apiFetch('/api/organizaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  updateOrganizacion: async (id: number | string, data: any) => {
    return apiFetch(`/api/organizaciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  deleteOrganizacion: async (id: number | string) => {
    return apiFetch(`/api/organizaciones/${id}`, {
      method: 'DELETE',
    });
  }
};

export default organizacionService;