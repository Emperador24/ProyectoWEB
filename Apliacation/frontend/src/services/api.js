import axios from 'axios'

// El proxy de Vite redirige /api → http://localhost:8080
// Así que todas las rutas van como /api/...
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor: loguea errores para facilitar debugging
api.interceptors.response.use(
  res => res,
  err => {
    console.error('[API Error]', err.config?.url, err.response?.status, err.response?.data)
    return Promise.reject(err)
  }
)

export const usuariosApi = {
  getAll: () => api.get('/usuarios'),
  getById: (id) => api.get(`/usuarios/${id}`),
  getByRol: (rol) => api.get(`/usuarios/rol/${rol}`),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
}

export const zonasApi = {
  getAll: () => api.get('/zonas'),
  getActivas: () => api.get('/zonas/activas'),
  getById: (id) => api.get(`/zonas/${id}`),
  create: (data) => api.post('/zonas', data),
  update: (id, data) => api.put(`/zonas/${id}`, data),
  delete: (id) => api.delete(`/zonas/${id}`),
}

export const turnosApi = {
  getAll: () => api.get('/turnos'),
  getById: (id) => api.get(`/turnos/${id}`),
  getByUsuario: (uid) => api.get(`/turnos/usuario/${uid}`),
  getByZona: (zid) => api.get(`/turnos/zona/${zid}`),
  getByEstado: (estado) => api.get(`/turnos/estado/${estado}`),
  create: (data) => api.post('/turnos', data),
  update: (id, data) => api.put(`/turnos/${id}`, data),
  // PATCH /api/turnos/{id}/estado?estado=EN_CURSO
  cambiarEstado: (id, estado) => api.patch(`/turnos/${id}/estado?estado=${estado}`),
  delete: (id) => api.delete(`/turnos/${id}`),
}

export const incidentesApi = {
  getAll: () => api.get('/incidentes'),
  getById: (id) => api.get(`/incidentes/${id}`),
  getByZona: (zid) => api.get(`/incidentes/zona/${zid}`),
  getByTipo: (tipo) => api.get(`/incidentes/tipo/${tipo}`),
  getBySeveridad: (sev) => api.get(`/incidentes/severidad/${sev}`),
  create: (data) => api.post('/incidentes', data),
  update: (id, data) => api.put(`/incidentes/${id}`, data),
  delete: (id) => api.delete(`/incidentes/${id}`),
}

export const checkinsApi = {
  getAll: () => api.get('/checkins'),
  getByTurno: (tid) => api.get(`/checkins/turno/${tid}`),
  getRecorridos: (tid) => api.get(`/checkins/turno/${tid}/recorridos`),
  create: (data) => api.post('/checkins', data),
  delete: (id) => api.delete(`/checkins/${id}`),
}

export const reasignacionesApi = {
  getAll: () => api.get('/reasignaciones'),
  getById: (id) => api.get(`/reasignaciones/${id}`),
  getByTurno: (tid) => api.get(`/reasignaciones/turno/${tid}`),
  create: (data) => api.post('/reasignaciones', data),
  // PATCH /api/reasignaciones/{id}/responder?estado=ACEPTADA
  responder: (id, estado) => api.patch(`/reasignaciones/${id}/responder?estado=${estado}`),
  delete: (id) => api.delete(`/reasignaciones/${id}`),
}

export const limpiezaApi = {
  getAll: () => api.get('/registros-limpieza'),
  getByTurno: (tid) => api.get(`/registros-limpieza/turno/${tid}`),
  create: (data) => api.post('/registros-limpieza', data),
  update: (id, data) => api.put(`/registros-limpieza/${id}`, data),
  delete: (id) => api.delete(`/registros-limpieza/${id}`),
}

export const notificacionesApi = {
  getAll: () => api.get('/notificaciones'),
  getByUsuario: (uid) => api.get(`/notificaciones/usuario/${uid}`),
  getNoLeidas: (uid) => api.get(`/notificaciones/usuario/${uid}/no-leidas`),
  create: (data) => api.post('/notificaciones', data),
  marcarLeida: (id) => api.patch(`/notificaciones/${id}/leer`),
}

export const mapaCalorApi = {
  getAll: () => api.get('/mapa-calor'),
  getByZona: (zid) => api.get(`/mapa-calor/zona/${zid}`),
  getBySemana: (semana) => api.get(`/mapa-calor/semana/${semana}`),
  create: (data) => api.post('/mapa-calor', data),
  update: (id, data) => api.put(`/mapa-calor/${id}`, data),
}

export const metricasApi = {
  getAll: () => api.get('/metricas'),
  getByUsuario: (uid) => api.get(`/metricas/usuario/${uid}`),
  getReconocidos: () => api.get('/metricas/reconocidos'),
  create: (data) => api.post('/metricas', data),
  update: (id, data) => api.put(`/metricas/${id}`, data),
}

export const checkpointsApi = {
  getAll: () => api.get('/checkpoints'),
  getByZona: (zid) => api.get(`/checkpoints/zona/${zid}`),
  getById: (id) => api.get(`/checkpoints/${id}`),
  create: (data) => api.post('/checkpoints', data),
  update: (id, data) => api.put(`/checkpoints/${id}`, data),
  delete: (id) => api.delete(`/checkpoints/${id}`),
}