// Mapas de etiquetas canónicas para toda la app

export const TIPO_INCIDENTE_LABELS = {
  SEGURIDAD_FISICA: 'Seguridad Física',
  CONVIVENCIA: 'Convivencia',
  USO_ESPACIO: 'Uso del Espacio',
  OBSERVACION_SOCIAL: 'Observación Social',
  // Alias históricos del backend
  FISICO: 'Seguridad Física',
  ESPACIO: 'Uso del Espacio',
  SOCIAL: 'Observación Social',
}

export const TIPO_INCIDENTE_ICONS = {
  SEGURIDAD_FISICA: '🩹',
  CONVIVENCIA: '🤝',
  USO_ESPACIO: '🏫',
  OBSERVACION_SOCIAL: '👁',
  FISICO: '🩹',
  ESPACIO: '🏫',
  SOCIAL: '👁',
}

export const SEVERIDAD_LABELS = {
  S1: 'S1 Leve',
  S2: 'S2 Seguimiento',
  S3: 'S3 Atención Inmediata',
  S1_LEVE: 'S1 Leve',
  S2_SEGUIMIENTO: 'S2 Seguimiento',
  S3_ATENCION_INMEDIATA: 'S3 Atención Inmediata',
}

export const SEVERIDAD_COLORS = {
  S1: { color: '#16a34a', bg: '#dcfce7' },
  S2: { color: '#ea580c', bg: '#ffedd5' },
  S3: { color: '#dc2626', bg: '#fee2e2' },
}

export const ESTADO_TURNO_LABELS = {
  PENDIENTE: 'Pendiente',
  EN_CURSO: 'En curso',
  COMPLETADO: 'Completado',
  AUSENTE: 'Ausente',
  REASIGNADO: 'Reasignado',
  CERRADO: 'Cerrado',
  CANCELADO: 'Cancelado',
}

export const ESTADO_TURNO_COLORS = {
  PENDIENTE: '#f59e0b',
  EN_CURSO: '#22c55e',
  COMPLETADO: '#3b82f6',
  CERRADO: '#6b7280',
  CANCELADO: '#9ca3af',
  AUSENTE: '#ef4444',
  REASIGNADO: '#8b5cf6',
}

export const FRANJA_LABELS = {
  RECREO: 'Recreo',
  RECREO_MANANA: 'Recreo Mañana',
  ALMUERZO: 'Almuerzo',
  RECREO_TARDE: 'Recreo Tarde',
}

export const FRANJA_HORAS = {
  RECREO_MANANA: '10:15–10:45',
  ALMUERZO: '13:00–13:30',
  RECREO_TARDE: '15:15–15:45',
}

export const ROL_LABELS = {
  DOCENTE: 'Docente',
  PROFESOR: 'Docente',
  COORDINADOR: 'Coordinador',
  ADMIN: 'Administrador',
  ADMINISTRADOR: 'Administrador',
  DIRECTOR: 'Administrador',
}

export const ROL_COLORS = {
  DOCENTE: { color: '#2563eb', bg: '#dbeafe' },
  PROFESOR: { color: '#2563eb', bg: '#dbeafe' },
  COORDINADOR: { color: '#16a34a', bg: '#dcfce7' },
  ADMIN: { color: '#7c3aed', bg: '#f3e8ff' },
  ADMINISTRADOR: { color: '#7c3aed', bg: '#f3e8ff' },
  DIRECTOR: { color: '#7c3aed', bg: '#f3e8ff' },
}

export function tipoLabel(t) { return TIPO_INCIDENTE_LABELS[t] || (t || '').replace(/_/g, ' ') }
export function tipoIcono(t) { return TIPO_INCIDENTE_ICONS[t] || '📋' }
export function sevLabel(s) { return SEVERIDAD_LABELS[s] || s }
export function estadoTurnoLabel(e) { return ESTADO_TURNO_LABELS[e] || e }
export function franjaLabel(f) { return FRANJA_LABELS[f] || (f || '').replace(/_/g, ' ') }
export function franjaHoras(f) { return FRANJA_HORAS[f] || '' }
export function rolLabel(r) { return ROL_LABELS[r] || r }
