const API_URL = import.meta.env.VITE_URL_BASE || 'http://localhost:3007';

const pendingRequests = new Map<string, Promise<any>>();

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const method = options.method || 'GET';
  
  // MOCK LOGIN
  if (endpoint.includes('/auth/login') || endpoint.includes('/auth/super-admin/login')) {
    return new Promise(resolve => setTimeout(() => resolve({
      token: 'fake-jwt-token-wimprove',
      user: { id: 1, nombre: 'Demo', apellido: 'Wimprove', email: 'demo@wimprove.com', rol: 'Administrador', permisos: '[]' }
    }), 500));
  }

  // MOCK PROYECT DATA (Kanban board full data)
  if (endpoint.match(/\/proyectos\/\d+\/proyect-data/)) {
    return new Promise(resolve => setTimeout(() => resolve({
      etapas: [
        { id: 1, proyecto_id: 1, nombre: 'Prospecto', posicion: 1, color: 'bg-gray-400' },
        { id: 2, proyecto_id: 1, nombre: 'Reunión Agendada', posicion: 2, color: 'bg-blue-500' },
        { id: 3, proyecto_id: 1, nombre: 'Propuesta Enviada', posicion: 3, color: 'bg-yellow-500' },
        { id: 4, proyecto_id: 1, nombre: 'Negociación', posicion: 4, color: 'bg-purple-500' },
        { id: 5, proyecto_id: 1, nombre: 'Cerrado Ganado', posicion: 5, is_ganado: true, color: 'bg-green-500' }
      ],
      oportunidades: [
        { id: 1, proyecto_id: 1, etapa_id: 1, titulo: 'Cotización Servidores', nombre: 'Cotización Servidores', valor: 25000, ingreso_esperado: 25000, status: 'NUEVO', vendedor_nombre: 'Ana Gómez', fecha_cierre_esperada: '2026-10-15', organizacion_perfil: { nombre: 'Metalúrgica del Sur' }, contacto_data: { name: 'Juan Perez', email: 'juan@metal.com' } },
        { id: 2, proyecto_id: 1, etapa_id: 2, titulo: 'Renovación de Software', nombre: 'Renovación de Software', valor: 12500, ingreso_esperado: 12500, status: 'EN_PROGRESO', vendedor_nombre: 'Carlos Pérez', fecha_cierre_esperada: '2026-09-20', organizacion_perfil: { nombre: 'Servicios IT Express' }, contacto_data: { name: 'Maria Silva', email: 'maria@it.com' } },
        { id: 3, proyecto_id: 1, etapa_id: 3, titulo: 'Consultoría Anual', nombre: 'Consultoría Anual', valor: 8000, ingreso_esperado: 8000, status: 'EN_PROGRESO', vendedor_nombre: 'Ana Gómez', fecha_cierre_esperada: '2026-08-01', organizacion_perfil: { nombre: 'Consultores Asociados' }, contacto_data: { name: 'Luis Gomez', email: 'luis@consultores.com' } },
        { id: 4, proyecto_id: 1, etapa_id: 5, titulo: 'Licencias BPO', nombre: 'Licencias BPO', valor: 55000, ingreso_esperado: 55000, status: 'GANADO', vendedor_nombre: 'Carlos Pérez', fecha_cierre_esperada: '2026-07-15', organizacion_perfil: { nombre: 'Fintech Global' }, contacto_data: { name: 'Sofia Ruiz', email: 'sofia@fintech.com' } }
      ],
      users: [
        { id: 1, nombre: 'Carlos', apellido: 'Pérez', email: 'carlos@wimprove.com' },
        { id: 2, nombre: 'Ana', apellido: 'Gómez', email: 'ana@wimprove.com' }
      ],
      etiquetas: [],
      metadata: {}
    }), 300));
  }

  // MOCK PROYECTOS (Organizaciones)
  if (endpoint.includes('/proyectos') && !endpoint.includes('/proyect-data') && !endpoint.includes('/etapas')) {
    return new Promise(resolve => setTimeout(() => resolve([
      { id: 1, nombre: 'Tech Solutions Global', fijado: true, status: 'ACTIVO' },
      { id: 2, nombre: 'Industrial Manufacturing SA', fijado: false, status: 'ACTIVO' },
      { id: 3, nombre: 'Constructora Horizon', fijado: false, status: 'ACTIVO' }
    ]), 300));
  }

  // MOCK USUARIOS
  if (endpoint.includes('/usuarios')) {
    return new Promise(resolve => setTimeout(() => resolve([
      { id: 1, nombre: 'Carlos', apellido: 'Pérez', email: 'carlos@wimprove.com', rol: 'Gerente', status: 'ACTIVO' },
      { id: 2, nombre: 'Ana', apellido: 'Gómez', email: 'ana@wimprove.com', rol: 'Ventas', status: 'ACTIVO' }
    ]), 300));
  }

  // MOCK ETAPAS (Individual Call if needed)

  // MOCK OPORTUNIDADES
  if (endpoint.includes('/oportunidades')) {
    return new Promise(resolve => setTimeout(() => resolve([
      { id: 1, proyecto_id: 1, etapa_id: 1, titulo: 'Cotización Servidores', nombre: 'Cotización Servidores', valor: 25000, ingreso_esperado: 25000, status: 'NUEVO', vendedor_nombre: 'Ana Gómez', fecha_cierre_esperada: '2026-10-15', empresa_cliente: 'Metalúrgica del Sur', contacto_data: { name: 'Juan Perez' } },
      { id: 2, proyecto_id: 1, etapa_id: 2, titulo: 'Renovación de Software', nombre: 'Renovación de Software', valor: 12500, ingreso_esperado: 12500, status: 'EN_PROGRESO', vendedor_nombre: 'Carlos Pérez', fecha_cierre_esperada: '2026-09-20', empresa_cliente: 'Servicios IT Express', contacto_data: { name: 'Maria Silva' } },
      { id: 3, proyecto_id: 1, etapa_id: 3, titulo: 'Consultoría Anual', nombre: 'Consultoría Anual', valor: 8000, ingreso_esperado: 8000, status: 'EN_PROGRESO', vendedor_nombre: 'Ana Gómez', fecha_cierre_esperada: '2026-08-01', empresa_cliente: 'Consultores Asociados', contacto_data: { name: 'Luis Gomez' } },
      { id: 4, proyecto_id: 1, etapa_id: 5, titulo: 'Licencias BPO', nombre: 'Licencias BPO', valor: 55000, ingreso_esperado: 55000, status: 'GANADO', vendedor_nombre: 'Carlos Pérez', fecha_cierre_esperada: '2026-07-15', empresa_cliente: 'Fintech Global', contacto_data: { name: 'Sofia Ruiz' } }
    ]), 300));
  }

  // MOCK SETTINGS
  if (endpoint.includes('/settings')) {
    return new Promise(resolve => setTimeout(() => resolve([
      { name: 'empresa_logo', content: '' }
    ]), 300));
  }

  // DEFAULT MOCK FALLBACK
  return new Promise(resolve => setTimeout(() => resolve([]), 300));
};
