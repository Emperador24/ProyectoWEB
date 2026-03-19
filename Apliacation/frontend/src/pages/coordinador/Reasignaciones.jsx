import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { reasignacionesApi, turnosApi, usuariosApi } from '../../services/api'

export default function CoordReasignaciones() {
  const [reasignaciones, setReasignaciones] = useState([])
  const [turnos, setTurnos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ turnoOriginalId: '', motivo: '' })
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  // Lee ?turnoId=X de la URL (viene del Dashboard al hacer clic en Reasignar)
  const [searchParams] = useSearchParams()

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

  useEffect(() => {
    load().then(() => {
      // Si viene un turnoId en la URL, abre el formulario con ese turno preseleccionado
      const turnoId = searchParams.get('turnoId')
      if (turnoId) {
        setForm({ turnoOriginalId: turnoId, motivo: '' })
        setShowForm(true)
      }
    })
  }, [])

  const ocupados    = new Set(turnos.filter(t => t.estado === 'EN_CURSO').map(t => t.usuario?.id).filter(Boolean))
  const disponibles = usuarios.filter(u => !ocupados.has(u.id))
  const sinCubrir   = turnos.filter(t => t.estado === 'PENDIENTE')
  const pendientes  = reasignaciones.filter(r => r.estado === 'PENDIENTE' || r.estado === 'PROPUESTA')
  const historial   = reasignaciones.filter(r => r.estado !== 'PENDIENTE' && r.estado !== 'PROPUESTA')

  const handleCreate = async () => {
    if (!form.turnoOriginalId || !form.motivo.trim()) {
      setError('Turno y motivo son obligatorios')
      return
    }
    setError(null)

    // Busca el turno seleccionado para obtener el docente original
    const turnoSeleccionado = turnos.find(t => String(t.id) === String(form.turnoOriginalId))

    const payload = {
      turnoOriginal:   { id: Number(form.turnoOriginalId) },
      docenteOriginal: turnoSeleccionado?.usuario ? { id: turnoSeleccionado.usuario.id } : null,
      motivo:          form.motivo,
      estado:          'PROPUESTA',
    }

    try {
      await reasignacionesApi.create(payload)
      setSuccess('Reasignación creada y enviada a los docentes disponibles')
      setShowForm(false)
      setForm({ turnoOriginalId: '', motivo: '' })
      load()
      setTimeout(() => setSuccess(null), 4000)
    } catch (e) {
      setError('Error al crear reasignación: ' + (e.response?.data?.error || e.message))
    }
  }

  const handleResponder = async (id, estado) => {
    try {
      await reasignacionesApi.responder(id, estado)
      load()
    } catch {
      alert('Error al responder la reasignación')
    }
  }

  const ESTADO_COLOR = { PENDIENTE: '#f59e0b', PROPUESTA: '#f59e0b', ACEPTADA: '#22c55e', RECHAZADA: '#ef4444' }
  const AVATARS      = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

  return (
    <div>
      <div className="gradient-banner orange">
        <div className="banner-icon">🔄</div>
        <div className="banner-text">
          <div className="title">Reasignaciones de Turno</div>
          <div className="subtitle">Gestión de zonas sin cobertura y propuesta automática de reemplazos</div>
        </div>
      </div>

      {success && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#166534', marginBottom: 16 }}>
          ✅ {success}
        </div>
      )}

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: '⚠',  val: sinCubrir.length,   label: 'Turnos sin cubrir',           color: '#ef4444', bg: '#fee2e2' },
          { icon: '👥', val: disponibles.length,  label: 'Docentes disponibles',         color: '#22c55e', bg: '#dcfce7' },
          { icon: '🔄', val: pendientes.length,   label: 'Reasignaciones pendientes',    color: '#f59e0b', bg: '#fef9c3' },
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
        <button className="login-btn" onClick={() => { setForm({ turnoOriginalId: '', motivo: '' }); setShowForm(true) }}>
          + Nueva reasignación
        </button>
      </div>

      <div className="two-col-asym">
        {/* Izquierda: turnos sin cobertura + pendientes */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 14 }}>⚠ Turnos Sin Cobertura</div>
          {loading ? (
            <div style={{ color: '#9ca3af', padding: 20 }}>Cargando...</div>
          ) : sinCubrir.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 30, color: '#22c55e' }}>
              ✅ Todos los turnos están cubiertos
            </div>
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
                <strong>{t.usuario?.nombre || 'Sin asignar'}</strong>
              </div>
              <div className="reasig-info-row">
                <span>📅 Fecha:</span>
                <strong>{t.fecha?.slice(0, 10) || '—'}</strong>
              </div>
              <button
                className="login-btn"
                style={{ marginTop: 12, width: '100%', fontSize: 13 }}
                onClick={() => {
                  setForm({ turnoOriginalId: String(t.id), motivo: '' })
                  setShowForm(true)
                }}
              >
                🔄 Reasignar este turno
              </button>
            </div>
          ))}

          {pendientes.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 14 }}>🔄 Pendientes de Respuesta</div>
              {pendientes.map(r => (
                <div key={r.id} className="reasig-zone-card">
                  <div className="reasig-zone-name">
                    Turno #{r.turnoOriginal?.id} — {r.turnoOriginal?.zona?.nombre || ''}
                  </div>
                  <div className="reasig-info-row"><span>📝 Motivo:</span><strong>{r.motivo}</strong></div>
                  <div className="reasig-info-row">
                    <span>👤 Docente original:</span>
                    <strong>{r.docenteOriginal?.nombre || '—'}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      style={{ flex: 1, padding: 8, borderRadius: 8, border: 'none', background: '#22c55e', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => handleResponder(r.id, 'ACEPTADA')}
                    >
                      ✅ Aceptar
                    </button>
                    <button
                      style={{ flex: 1, padding: 8, borderRadius: 8, border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => handleResponder(r.id, 'RECHAZADA')}
                    >
                      ❌ Rechazar
                    </button>
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
            <div className="card" style={{ textAlign: 'center', padding: 30, color: '#9ca3af' }}>
              Sin docentes disponibles ahora
            </div>
          ) : disponibles.map((u, i) => (
            <div key={u.id} className="profe-card">
              <div className="profe-header">
                <div className="profe-avatar" style={{ background: AVATARS[i % AVATARS.length] }}>
                  {u.nombre?.[0]}{u.apellido?.[0] || u.nombre?.[1] || ''}
                </div>
                <div>
                  <div className="profe-name">{u.nombre}</div>
                  <div className="disponible-badge">✓ Disponible para turno</div>
                </div>
              </div>
              <div className="profe-time-row"><span>📧</span><strong>{u.email}</strong></div>
            </div>
          ))}

          {historial.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>📋 Historial</div>
              {historial.slice(0, 6).map(r => (
                <div key={r.id} style={{ padding: '12px 16px', background: 'white', borderRadius: 12, marginBottom: 8, border: '1.5px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      Turno #{r.turnoOriginal?.id} — {r.turnoOriginal?.zona?.nombre || ''}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{r.motivo}</div>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: (ESTADO_COLOR[r.estado] || '#9ca3af') + '22', color: ESTADO_COLOR[r.estado] || '#9ca3af' }}>
                    {r.estado}
                  </span>
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

            {error && (
              <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 14, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <div className="config-label">Turno a reasignar *</div>
                <select
                  className="form-select"
                  value={form.turnoOriginalId}
                  onChange={e => setForm({ ...form, turnoOriginalId: e.target.value })}
                >
                  <option value="">Seleccionar turno...</option>
                  {turnos.map(t => (
                    <option key={t.id} value={t.id}>
                      #{t.id} — {t.zona?.nombre} · {t.usuario?.nombre || 'Sin docente'} ({t.fecha?.slice(0, 10)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Muestra el docente actual del turno seleccionado */}
              {form.turnoOriginalId && (() => {
                const t = turnos.find(t => String(t.id) === String(form.turnoOriginalId))
                return t?.usuario ? (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#166534' }}>
                    👤 Docente actual: <strong>{t.usuario.nombre}</strong>
                  </div>
                ) : null
              })()}

              <div>
                <div className="config-label">Motivo de reasignación *</div>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Ej: Enfermedad, reunión urgente, permiso médico..."
                  value={form.motivo}
                  onChange={e => setForm({ ...form, motivo: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
              <button className="back-btn" onClick={() => { setShowForm(false); setError(null) }}>
                Cancelar
              </button>
              <button className="login-btn" onClick={handleCreate}>
                Crear reasignación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}