import { useState } from 'react'

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  )
}

export function Badge({ text, variant = 'gray' }) {
  return <span className={`badge badge-${variant}`}>{text}</span>
}

export function estadoBadge(estado) {
  const map = {
    PENDIENTE: ['Pendiente', 'yellow'],
    EN_CURSO: ['En curso', 'green'],
    CERRADO: ['Cerrado', 'gray'],
    PROPUESTA: ['Propuesta', 'blue'],
    ACEPTADA: ['Aceptada', 'green'],
    RECHAZADA: ['Rechazada', 'red'],
  }
  const [label, variant] = map[estado] || [estado, 'gray']
  return <Badge text={label} variant={variant} />
}

export function tipoBadge(tipo) {
  const map = {
    FISICO: ['Físico', 'red'],
    CONVIVENCIA: ['Convivencia', 'yellow'],
    ESPACIO: ['Espacio', 'blue'],
    SOCIAL: ['Social', 'purple'],
  }
  const [label, variant] = map[tipo] || [tipo, 'gray']
  return <Badge text={label} variant={variant} />
}

export function severidadBadge(sev) {
  const map = { S1: ['S1 Leve', 'green'], S2: ['S2 Seguimiento', 'yellow'], S3: ['S3 Urgente', 'red'] }
  const [label, variant] = map[sev] || [sev, 'gray']
  return <Badge text={label} variant={variant} />
}

export function rolBadge(rol) {
  const map = { DOCENTE: ['Docente', 'blue'], COORDINADOR: ['Coordinador', 'purple'], ADMIN: ['Admin', 'red'] }
  const [label, variant] = map[rol] || [rol, 'gray']
  return <Badge text={label} variant={variant} />
}

export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 340 }}>
        <p style={{ marginBottom: 20 }}>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}

export function Alert({ type = 'info', message, onClose }) {
  if (!message) return null
  return (
    <div className={`alert alert-${type}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>}
    </div>
  )
}

export function useCrud(apiFns) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await apiFns.getAll()
      setItems(res.data)
    } catch (e) {
      setError('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const create = async (data) => {
    try {
      await apiFns.create(data)
      setSuccess('Creado exitosamente')
      await load()
      return true
    } catch (e) {
      setError('Error al crear')
      return false
    }
  }

  const update = async (id, data) => {
    try {
      await apiFns.update(id, data)
      setSuccess('Actualizado exitosamente')
      await load()
      return true
    } catch (e) {
      setError('Error al actualizar')
      return false
    }
  }

  const remove = async (id) => {
    try {
      await apiFns.delete(id)
      setSuccess('Eliminado exitosamente')
      await load()
    } catch (e) {
      setError('Error al eliminar')
    }
  }

  return { items, loading, error, success, setError, setSuccess, load, create, update, remove }
}
