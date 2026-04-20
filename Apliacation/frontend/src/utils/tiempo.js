import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function haceTiempo(fecha) {
  if (!fecha) return '—'
  try {
    return formatDistanceToNow(new Date(fecha), { addSuffix: true, locale: es })
  } catch {
    return '—'
  }
}

export function fechaCorta(fecha) {
  if (!fecha) return '—'
  try { return new Date(fecha).toLocaleDateString('es-ES') } catch { return '—' }
}

export function horaCorta(fecha) {
  if (!fecha) return '—'
  try {
    return new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  } catch { return '—' }
}
