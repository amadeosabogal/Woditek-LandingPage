import { apiFetch } from './api';

export interface Proyecto {
  id?: number;
  nombre: string;
  estado?: string;
  fijado?: boolean;
}

export interface Etapa {
  id?: number;
  proyecto_id: number;
  nombre: string;
  posicion: number;
  desplegado?: boolean;
  requerimiento?: string;
  is_ganado?: boolean;
  is_perdido?: boolean;
  color?: string;
}

const proyectosService = {
  getProyectos: async (): Promise<Proyecto[]> => {
    return apiFetch('/api/proyectos');
  },
  createProyecto: async (data: Partial<Proyecto>): Promise<{id: number}> => {
    return apiFetch('/api/proyectos', { method: 'POST', body: JSON.stringify(data) });
  },
  updateProyecto: async (id: number, data: Partial<Proyecto>): Promise<any> => {
    return apiFetch(`/api/proyectos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteProyecto: async (id: number): Promise<any> => {
    return apiFetch(`/api/proyectos/${id}`, { method: 'DELETE' });
  },
  getEtapas: async (proyecto_id: number): Promise<Etapa[]> => {
    return apiFetch(`/api/proyectos/${proyecto_id}/etapas`);
  },
  createEtapa: async (proyecto_id: number, data: Partial<Etapa>): Promise<{id: number}> => {
    return apiFetch(`/api/proyectos/${proyecto_id}/etapas`, { method: 'POST', body: JSON.stringify(data) });
  },
  updateEtapa: async (etapa_id: number, data: Partial<Etapa>): Promise<any> => {
    return apiFetch(`/api/proyectos/etapas/${etapa_id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  getProyectData: async (proyecto_id: number): Promise<any> => {
    return apiFetch(`/api/proyectos/${proyecto_id}/proyect-data`);
  }
};

export default proyectosService;
