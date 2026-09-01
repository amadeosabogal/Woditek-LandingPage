import { apiFetch } from './api';

export interface Oportunidad {
  id?: number;
  proyecto_id: number;
  organizacion_id: number;
  etapa_id: number;
  nombre?: string;
  contacto_data: any;
  ingreso_esperado?: number;
  probabilidad?: number;
  fecha_cierre_esperado?: string;
  prioridad_estrellas?: number;
  etiquetas?: any[];
  informacion_adicional?: any;
  organizacion_perfil?: any;
  usuario_asignado_id?: number;
  responsable_nombre?: string;
  responsable_apellido?: string;
  responsable_email?: string;
  organizacion_contactos?: any[];
  unread_emails?: number;
  colaboradores?: any[];
  mercado_potencial?: string;
  value?: string;
}

export interface Seguimiento {
  id?: number;
  oportunidad_id: number;
  usuario_id?: number;
  tipo_seguimiento: string;
  contenido: string;
  created_at?: string;
  usuario_nombre?: string;
  usuario_apellido?: string;
}

const oportunidadesService = {
  getPorProyecto: async (proyecto_id: number): Promise<Oportunidad[]> => {
    return apiFetch(`/api/oportunidades/proyecto/${proyecto_id}`);
  },
  create: async (data: any): Promise<{id: number}> => {
    return apiFetch('/api/oportunidades', { method: 'POST', body: JSON.stringify(data) });
  },
  mover: async (id: number, etapa_id: number): Promise<any> => {
    return apiFetch(`/api/oportunidades/${id}/mover`, { method: 'PUT', body: JSON.stringify({ etapa_id }) });
  },
  getSeguimientos: async (oportunidad_id: number): Promise<Seguimiento[]> => {
    return apiFetch(`/api/oportunidades/${oportunidad_id}/seguimientos`);
  },
  getOportunidadDetailData: async (id: number) => {
    return apiFetch(`/api/oportunidades/${id}/detail-oportunidades`);
  },
  createSeguimiento: async (oportunidad_id: number, data: Partial<Seguimiento> | FormData): Promise<{id: number}> => {
    // Robust check for FormData
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    if (isFormData || (data && typeof (data as any).append === 'function')) {
      return apiFetch(`/api/oportunidades/${oportunidad_id}/seguimientos`, { method: 'POST', body: data as any });
    }
    return apiFetch(`/api/oportunidades/${oportunidad_id}/seguimientos`, { method: 'POST', body: JSON.stringify(data) });
  },
  reassign: async (id: number, usuario_asignado_id: number): Promise<any> => {
    return apiFetch(`/api/oportunidades/${id}/reassign`, { method: 'PUT', body: JSON.stringify({ usuario_asignado_id }) });
  },
  updatePrioridad: async (id: number, estrellas: number): Promise<any> => {
    return apiFetch(`/api/oportunidades/${id}/prioridad`, { method: 'PUT', body: JSON.stringify({ estrellas }) });
  },
  updateDetalles: async (id: number, data: any): Promise<any> => {
    return apiFetch(`/api/oportunidades/${id}/detalles`, { method: 'PUT', body: JSON.stringify(data) });
  },
  updateContacto: async (id: number, data: any): Promise<any> => {
    return apiFetch(`/api/oportunidades/${id}/contacto`, { method: 'PUT', body: JSON.stringify({ contacto_data: data }) });
  },
  updateNombre: async (id: number, nombre: string): Promise<any> => {
    return apiFetch(`/api/oportunidades/${id}/nombre`, { method: 'PUT', body: JSON.stringify({ nombre }) });
  },
  updateSeguimiento: async (id: number, contenido: any): Promise<any> => {
    return apiFetch(`/api/oportunidades/seguimientos/${id}`, { method: 'PUT', body: JSON.stringify({ contenido }) });
  },
  deleteSeguimiento: async (id: number): Promise<any> => {
    return apiFetch(`/api/oportunidades/seguimientos/${id}`, { method: 'DELETE' });
  },
  getPresupuestoPdfBlob: async (id: number): Promise<Blob> => {
    const baseUrl = import.meta.env.VITE_URL_BASE || 'http://localhost:3007';
    const token = localStorage.getItem('token') || '';
    const response = await fetch(`${baseUrl}/api/oportunidades/seguimientos/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al generar PDF');
    return response.blob();
  },
  markSeguimientoAsRead: async (id: number): Promise<any> => {
    return apiFetch(`/api/oportunidades/seguimientos/${id}/read`, { method: 'PUT' });
  },
  updateColaboradores: async (id: number, colaboradores: any[]): Promise<any> => {
    return apiFetch(`/api/oportunidades/${id}/colaboradores`, { method: 'PUT', body: JSON.stringify({ colaboradores }) });
  },
  deleteOportunidad: async (id: number): Promise<any> => {
    return apiFetch(`/api/oportunidades/${id}`, { method: 'DELETE' });
  }
};

export default oportunidadesService;
