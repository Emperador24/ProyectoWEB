import { useEffect, useState } from 'react'
import { reasignacionesApi, turnosApi, usuariosApi } from '../../services/api'

export default function CoordReasignaciones() {
  const [reasignaciones, setReasignaciones] = useState([])
  const [turnos, setTurnos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ turnoOriginal: { id: '' }, motivo: '' })
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    const [r, t, u] = await Promise.all([
      reasignacionesApi.getAll().catch(() => ({ data: [] })),
      turnosApi.getAll().catch(() => ({ data: [] })),
      usuariosApi.getAll().catch(() => ({ data: [] })),
    ])
    setReasignaciones(r.data || [])
    setTurnos(t.data || [])
    setUsuarios((u.data || []).filter(u => u.rol === 'DOCENTE'))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Docentes disponibles = sin turno EN_CURSO ahora
  const ocupados = new Set(turnos.filter(t => t.estado === 'EN_CURSO').map(t => t.usuario?.id).filter(Boolean))
  const disponibles = usuarios.filter(u => !ocupados.has(u.id))

  // Turnos sin cubrir
  const sinCubrir = turnos.filter(t => t.estado === 'PENDIENTE')

  const handleCreate = async () => {
    if (!form.turnoOriginal?.id || !form.motivo.trim()) { setError('Turno y motivo son obligatorios'); return }
    setError(null)
    try {
      await reasignacionesApi.create({ ...form, estado: 'PENDIENTE' })
      setSuccess('Reasignación creada y enviada a los docentes disponibles')
      setShowForm(false)
      setForm({ turnoOriginal: { id: '' }, motivo: '' })
      load()
      setTimeout(() => setSuccess(null), 4000)
    } catch { setError('Error al crear reasignación') }
  }

  const handleResponder = async (id, estado) => {
    try { await reasignacionesApi.responder(id, estado); load() }
    catch { alert('Error al responder') }
  }

  const pendientes = reasignaciones.filter(r => r.estado === 'PENDIENTE')
  const historial = reasignaciones.filter(r => r.estado !== 'PENDIENTE')

  const ESTADO_COLOR = { PENDIENTE: '#f59e0b', ACEPTADA: '#22c55e', RECHAZADA: '#ef4444' }
  const AVATARS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

  return (
    <div>
      <div className="gradient-banner orange">
        <div className="banner-icon">🔄</div>
        <div className="banner-text">
          <div className="title">Reasignaciones de Turno</div>
          <div className="subtitle">Gestión de zonas sin cobertura y propuesta automática de reemplazos</div>
        </div>
      </div>

      {success && <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#166534', marginBottom: 16 }}>✅ {success}</div>}

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: '⚠', val: sinCubrir.length, label: 'Turnos sin cubrir', color: '#ef4444', bg: '#fee2e2' },
          { icon: '👥', val: disponibles.length, label: 'Docentes disponibles', color: '#22c55e', bg: '#dcfce7' },
          { icon: '🔄', val: pendientes.length, label: 'Reasignaciones pendientes', color: '#f59e0b', bg: '#fef9c3' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 13, color: s.color, fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="login-btn" onClick={() => setShowForm(true)}>+ Nueva reasignación</button>
      </div>

      <div className="two-col-asym">
        {/* Izquierda: zonas sin cubrir + pendientes */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 14 }}>⚠ Turnos Sin Cobertura</div>
          {loading ? <div style={{ color: '#9ca3af', padding: 20 }}>Cargando...</div> :
            sinCubrir.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 30, color: '#22c55e' }}>✅ Todos los turnos están cubiertos</div>
            ) : sinCubrir.map(t => (
              <div key={t.id} className="reasig-zone-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="prioridad-tag alta">⚠ Alta Prioridad</span>
                    <div className="reasig-zone-name">{t.zona?.nombre}</div>
                    <div className="reasig-zone-franja">{t.franja?.replace(/_/g, ' ')}</div>
                  </div>
                  <div style={{ fontSize: 30 }}>⚠</div>
                </div>
                <div className="reasig-info-row">
                  <span>👤 Docente:</span>
                  <strong>{t.usuario ? `${t.usuario.nombre} ${t.usuario.apellido || ''}`.trim() : 'Sin asignar'}</strong>
                </div>
                <div className="reasig-info-row">
                  <span>📅 Fecha:</span>
                  <strong>{t.fecha?.slice(0, 10) || '—'}</strong>
                </div>
                <button className="login-btn" style={{ marginTop: 12, width: '100%', fontSize: 13 }}
                  onClick={() => { setForm({ turnoOriginal: { id: t.id }, motivo: '' }); setShowForm(true) }}>
                  🔄 Reasignar este turno
                </button>
              </div>
            ))
          }

          {pendientes.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 14 }}>🔄 Reasignaciones Pendientes de Respuesta</div>
              {pendientes.map(r => (
                <div key={r.id} className="reasig-zone-card">
                  <div className="reasig-zone-name">Turno #{r.turnoOriginal?.id}</div>
                  <div className="reasig-info-row"><span>📝 Motivo:</span><strong>{r.motivo}</strong></div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#22c55e', color: 'white', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleResponder(r.id, 'ACEPTADA')}>✅ Aceptar</button>
                    <button style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleResponder(r.id, 'RECHAZADA')}>❌ Rechazar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Derecha: docentes disponibles + historial */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 14 }}>👥 Docentes Disponibles</div>
          {disponibles.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 30, color: '#9ca3af' }}>Sin docentes disponibles ahora</div>
          ) : disponibles.map((u, i) => (
            <div key={u.id} className="profe-card">
              <div className="profe-header">
                <div className="profe-avatar" style={{ background: AVATARS[i % AVATARS.length] }}>
                  {u.nombre?.[0]}{u.apellido?.[0]}
                </div>
                <div>
                  <div className="profe-name">{u.nombre} {u.apellido}</div>
                  <div className="disponible-badge">✓ Disponible para turno</div>
                </div>
              </div>
              <div className="profe-time-row"><span>📧</span><strong>{u.email}</strong></div>
            </div>
          ))}

          {historial.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>📋 Historial de Reasignaciones</div>
              {historial.slice(0, 6).map(r => (
                <div key={r.id} style={{ padding: '12px 16px', background: 'white', borderRadius: 12, marginBottom: 8, border: '1.5px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Turno #{r.turnoOriginal?.id}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{r.motivo}</div>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: ESTADO_COLOR[r.estado] + '22', color: ESTADO_COLOR[r.estado] }}>{r.estado}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal crear reasignación */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 22 }}>🔄 Nueva Reasignación</h3>
            {error && <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 14, marginBottom: 14 }}>{error}</div>}
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <div className="config-label">Turno a reasignar *</div>
                <select className="form-select" value={form.turnoOriginal?.id} onChange={e => setForm({ ...form, turnoOriginal: { id: e.target.value } })}>
                  <option value="">Seleccionar turno...</option>
                  {turnos.map(t => <option key={t.id} value={t.id}>#{t.id} — {t.zona?.nombre} ({t.fecha?.slice(0, 10)})</option>)}
                </select>
              </div>
              <div>
                <div className="config-label">Motivo de reasignación *</div>
                <textarea className="form-textarea" rows={3}
                  placeholder="Ej: Enfermedad, reunión urgente, permiso médico..."
                  value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
              <button className="back-btn" onClick={() => { setShowForm(false); setError(null) }}>Cancelar</button>
              <button className="login-btn" onClick={handleCreate}>Crear reasignación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}