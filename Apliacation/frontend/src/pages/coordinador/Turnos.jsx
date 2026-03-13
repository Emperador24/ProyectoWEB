import { useEffect, useState } from 'react'
import { turnosApi, zonasApi, usuariosApi } from '../../services/api'

const FRANJAS = ['RECREO_MANANA', 'ALMUERZO', 'RECREO_TARDE']
const FRANJA_LABEL = {
  RECREO_MANANA: 'Recreo Mañana (10:15-10:45)',
  ALMUERZO: 'Almuerzo (13:00-13:30)',
  RECREO_TARDE: 'Recreo Tarde (15:15-15:45)',
}
const ESTADOS = ['PENDIENTE', 'EN_CURSO', 'COMPLETADO', 'CANCELADO']
const ESTADO_COLOR = { PENDIENTE: '#f59e0b', EN_CURSO: '#22c55e', COMPLETADO: '#3b82f6', CANCELADO: '#9ca3af' }
const FRANJA_COLOR = { RECREO_MANANA: 'green', ALMUERZO: 'blue', RECREO_TARDE: 'yellow' }
const DIA_LABEL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const EMPTY = { zona: { id: '' }, usuario: { id: '' }, franja: 'RECREO_MANANA', fecha: '', estado: 'PENDIENTE' }

export default function CoordTurnos() {
  const [turnos, setTurnos] = useState([])
  const [zonas, setZonas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [semana, setSemana] = useState(0)
  const [vista, setVista] = useState('calendario')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    const [t, z, u] = await Promise.all([
      turnosApi.getAll().catch(() => ({ data: [] })),
      zonasApi.getAll().catch(() => ({ data: [] })),
      usuariosApi.getAll().catch(() => ({ data: [] })),
    ])
    setTurnos(t.data || [])
    setZonas(z.data || [])
    setUsuarios((u.data || []).filter(u => u.rol === 'DOCENTE' || u.rol === 'COORDINADOR'))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const getDias = () => {
    const hoy = new Date()
    const lunes = new Date(hoy)
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7) + semana * 7)
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(lunes)
      d.setDate(lunes.getDate() + i)
      return d
    })
  }

  const dias = getDias()
  const semanaLabel = `${dias[0].getDate()} – ${dias[4].getDate()} de ${dias[4].toLocaleDateString('es', { month: 'long', year: 'numeric' })}`
  const turnosPorDia = (d) => turnos.filter(t => t.fecha?.slice(0, 10) === d.toISOString().slice(0, 10))

  const handleSubmit = async () => {
    if (!form.fecha || !form.zona?.id) { setError('Fecha y zona son obligatorios'); return }
    setError(null)
    try {
      if (editing) await turnosApi.update(editing, form)
      else await turnosApi.create(form)
      setSuccess(editing ? 'Turno actualizado correctamente' : 'Turno creado correctamente')
      setShowForm(false); setEditing(null); setForm(EMPTY)
      load()
      setTimeout(() => setSuccess(null), 3000)
    } catch { setError('Error al guardar. Verifica que el backend está corriendo.') }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este turno?')) return
    try { await turnosApi.delete(id); load() } catch { alert('Error al eliminar') }
  }

  const handleEdit = (t) => {
    setForm({ zona: { id: t.zona?.id || '' }, usuario: { id: t.usuario?.id || '' }, franja: t.franja, fecha: t.fecha?.slice(0, 10) || '', estado: t.estado })
    setEditing(t.id); setShowForm(true)
  }

  return (
    <div>
      {/* Header banner */}
      <div className="gradient-banner green" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="banner-icon">📅</div>
          <div className="banner-text">
            <div className="title">Calendario de Turnos</div>
            <div className="subtitle">📅 Semana del {semanaLabel}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="nav-arrow" onClick={() => setSemana(s => s - 1)}>‹</button>
          <button className="nav-arrow" onClick={() => setSemana(0)}>Hoy</button>
          <button className="nav-arrow" onClick={() => setSemana(s => s + 1)}>›</button>
          <button className="export-btn" onClick={() => setVista(v => v === 'calendario' ? 'lista' : 'calendario')}>
            {vista === 'calendario' ? '☰ Lista' : '📅 Calendario'}
          </button>
          <button className="export-btn" style={{ background: '#22c55e', color: 'white', borderColor: '#22c55e' }}
            onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(true) }}>
            + Nuevo turno
          </button>
        </div>
      </div>

      {success && <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#166534', marginBottom: 16 }}>✅ {success}</div>}
      {error && <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#dc2626', marginBottom: 16 }}>❌ {error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Cargando turnos...</div>
      ) : vista === 'calendario' ? (
        <div className="week-grid">
          {dias.map((dia, i) => {
            const dt = turnosPorDia(dia)
            return (
              <div key={i} className="day-col">
                <div className="day-name">{DIA_LABEL[i]}</div>
                <div className="day-date">📅 {dia.getDate()} {dia.toLocaleDateString('es', { month: 'short' })}</div>
                {dt.length === 0 && <div style={{ fontSize: 12, color: '#d1d5db', textAlign: 'center', padding: '20px 0' }}>Sin turnos</div>}
                {dt.map(t => (
                  <div key={t.id} className={`turno-chip ${FRANJA_COLOR[t.franja] || 'green'}`}>
                    <span className={`chip-time ${FRANJA_COLOR[t.franja] || 'green'}`}>
                      🕐 {FRANJA_LABEL[t.franja]?.match(/\((.+)\)/)?.[1] || t.franja}
                    </span>
                    <div className="chip-name">👤 {t.usuario ? `${t.usuario.nombre} ${t.usuario.apellido || ''}`.trim() : 'Sin asignar'}</div>
                    <div className="chip-zone">📍 {t.zona?.nombre || 'Sin zona'}</div>
                    <div style={{ marginTop: 6 }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: ESTADO_COLOR[t.estado] + '22', color: ESTADO_COLOR[t.estado], fontWeight: 700 }}>{t.estado}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                      <button style={{ flex: 1, padding: 4, fontSize: 11, borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }} onClick={() => handleEdit(t)}>✏️</button>
                      <button style={{ flex: 1, padding: 4, fontSize: 11, borderRadius: 6, border: '1px solid #fee2e2', background: '#fff5f5', color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(t.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                {['ID', 'Fecha', 'Franja', 'Zona', 'Docente', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {turnos.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No hay turnos registrados</td></tr>
              )}
              {turnos.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#9ca3af' }}>#{t.id}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.fecha?.slice(0, 10)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{FRANJA_LABEL[t.franja] || t.franja}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.zona?.nombre || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.usuario ? `${t.usuario.nombre} ${t.usuario.apellido || ''}`.trim() : '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: ESTADO_COLOR[t.estado] + '22', color: ESTADO_COLOR[t.estado] }}>{t.estado}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="reassign-btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleEdit(t)}>✏️ Editar</button>
                      <button className="reassign-btn" style={{ padding: '4px 10px', fontSize: 12, color: '#ef4444', borderColor: '#fecaca' }} onClick={() => handleDelete(t.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Leyenda */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="legend-row">
          {[{ color: '#22c55e', label: 'Recreo Mañana (10:15–10:45)' }, { color: '#3b82f6', label: 'Almuerzo (13:00–13:30)' }, { color: '#f59e0b', label: 'Recreo Tarde (15:15–15:45)' }].map((l, i) => (
            <div key={i} className="legend-item"><div className="legend-dot" style={{ background: l.color }}></div>{l.label}</div>
          ))}
        </div>
      </div>

      {/* Modal crear/editar */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 500, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 22 }}>{editing ? '✏️ Editar turno' : '+ Nuevo turno'}</h3>
            {error && <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 14, marginBottom: 16 }}>{error}</div>}
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <div className="config-label">Fecha *</div>
                <input className="form-input" type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
              </div>
              <div>
                <div className="config-label">Franja horaria</div>
                <select className="form-select" value={form.franja} onChange={e => setForm({ ...form, franja: e.target.value })}>
                  {FRANJAS.map(f => <option key={f} value={f}>{FRANJA_LABEL[f]}</option>)}
                </select>
              </div>
              <div>
                <div className="config-label">Zona *</div>
                <select className="form-select" value={form.zona?.id} onChange={e => setForm({ ...form, zona: { id: e.target.value } })}>
                  <option value="">Seleccionar zona...</option>
                  {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                </select>
              </div>
              <div>
                <div className="config-label">Docente asignado</div>
                <select className="form-select" value={form.usuario?.id} onChange={e => setForm({ ...form, usuario: { id: e.target.value } })}>
                  <option value="">Sin asignar</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>)}
                </select>
              </div>
              <div>
                <div className="config-label">Estado</div>
                <select className="form-select" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                  {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
              <button className="back-btn" onClick={() => { setShowForm(false); setEditing(null); setError(null) }}>Cancelar</button>
              <button className="login-btn" onClick={handleSubmit}>{editing ? 'Actualizar' : 'Crear turno'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}