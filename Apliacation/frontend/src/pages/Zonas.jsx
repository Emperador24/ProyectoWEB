import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { zonasApi, checkpointsApi } from '../services/api'

const EMPTY = { nombre: '', descripcion: '', capacidad: 0, activa: true }

export default function Zonas() {
  const [zonas, setZonas] = useState([])
  const [checkpoints, setCheckpoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const navigate = useNavigate()

  const cargar = async () => {
    setLoading(true)
    try {
      const [z, cp] = await Promise.all([
        zonasApi.getAll().catch(() => ({ data: [] })),
        checkpointsApi.getAll().catch(() => ({ data: [] })),
      ])
      setZonas(z.data || [])
      setCheckpoints(cp.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const abrirCrear = () => { setForm(EMPTY); setEditing(null); setError(null); setShowForm(true) }
  const abrirEditar = (z) => {
    setForm({ nombre: z.nombre || '', descripcion: z.descripcion || '', capacidad: z.capacidad || 0, activa: z.activa !== false })
    setEditing(z.id); setError(null); setShowForm(true)
  }

  const guardar = async () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    try {
      if (editing) await zonasApi.update(editing, form)
      else await zonasApi.create(form)
      setSuccess(editing ? 'Zona actualizada' : 'Zona creada')
      setShowForm(false); setEditing(null)
      cargar()
      setTimeout(() => setSuccess(null), 2500)
    } catch (e) { setError('Error al guardar: ' + (e.response?.data?.error || e.message)) }
  }

  const eliminar = async (z) => {
    if (!confirm(`¿Eliminar zona "${z.nombre}"?`)) return
    try {
      await zonasApi.delete(z.id)
      setSuccess('Zona eliminada')
      cargar()
      setTimeout(() => setSuccess(null), 2500)
    } catch { setError('No se pudo eliminar la zona') }
  }

  const contarCheckpoints = (zonaId) => checkpoints.filter(c => c.zona?.id === zonaId).length

  return (
    <div>
      <div className="gradient-banner green" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="banner-icon">🏫</div>
          <div className="banner-text">
            <div className="title">Gestión de Zonas</div>
            <div className="subtitle">Administra zonas de supervisión y puntos de control</div>
          </div>
        </div>
        <button className="export-btn" style={{ background: 'white', color: '#16a34a' }} onClick={abrirCrear}>
          + Nueva zona
        </button>
      </div>

      {success && <div style={{ background: '#dcfce7', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#166534', marginBottom: 16 }}>✅ {success}</div>}
      {error && !showForm && <div style={{ background: '#fee2e2', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#dc2626', marginBottom: 16 }}>❌ {error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Cargando zonas...</div>
      ) : zonas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🏫</div>
          <div style={{ fontWeight: 600 }}>No hay zonas registradas</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>Crea la primera zona para empezar</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                {['Nombre', 'Descripción', 'Capacidad', 'Checkpoints', 'Activa', 'Acciones'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '14px 18px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zonas.map(z => (
                <tr key={z.id} style={{ borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                    onClick={() => navigate(`/zonas/${z.id}`)}>
                  <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 600 }}>📍 {z.nombre}</td>
                  <td style={{ padding: '14px 18px', fontSize: 13, color: '#6b7280' }}>{z.descripcion || '—'}</td>
                  <td style={{ padding: '14px 18px', fontSize: 14 }}>{z.capacidad || 0}</td>
                  <td style={{ padding: '14px 18px', fontSize: 14 }}>{contarCheckpoints(z.id)}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: z.activa !== false ? '#dcfce7' : '#fee2e2',
                      color: z.activa !== false ? '#16a34a' : '#dc2626',
                    }}>
                      {z.activa !== false ? '✓ Activa' : '× Inactiva'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="reassign-btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => abrirEditar(z)}>✏️</button>
                      <button className="reassign-btn" style={{ padding: '4px 10px', fontSize: 12, color: '#ef4444', borderColor: '#fecaca' }} onClick={() => eliminar(z)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 30, width: '100%', maxWidth: 480 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18 }}>{editing ? '✏️ Editar zona' : '+ Nueva zona'}</h3>
            {error && <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 14, marginBottom: 14 }}>{error}</div>}
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <div className="config-label">Nombre *</div>
                <input className="form-input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <div className="config-label">Descripción</div>
                <textarea className="form-textarea" rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div>
                <div className="config-label">Capacidad</div>
                <input className="form-input" type="number" min={0} value={form.capacidad} onChange={e => setForm({ ...form, capacidad: Number(e.target.value) })} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <input type="checkbox" checked={form.activa} onChange={e => setForm({ ...form, activa: e.target.checked })} />
                Activa
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
              <button className="back-btn" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="login-btn" onClick={guardar}>{editing ? 'Actualizar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
