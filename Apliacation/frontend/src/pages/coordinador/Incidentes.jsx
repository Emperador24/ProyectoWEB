import { useEffect, useState } from 'react'
import { incidentesApi, zonasApi } from '../../services/api'

const TIPOS = ['SEGURIDAD_FISICA', 'CONVIVENCIA', 'USO_ESPACIO', 'OBSERVACION_SOCIAL']
const TIPO_LABEL = {
  SEGURIDAD_FISICA: '🩹 Seguridad física',
  CONVIVENCIA: '🤝 Convivencia',
  USO_ESPACIO: '🏫 Uso del espacio',
  OBSERVACION_SOCIAL: '👁 Observación social',
}
const SEVS = ['S1', 'S2', 'S3']
const SEV_LABEL = { S1: 'Leve', S2: 'Moderado', S3: 'Grave' }
const SEV_COLOR = { S1: '#f59e0b', S2: '#f97316', S3: '#ef4444' }
const SEV_BG = { S1: '#fef9c3', S2: '#ffedd5', S3: '#fee2e2' }
const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'RESUELTO']

const EMPTY = { tipo: '', zona: { id: '' }, severidad: '', descripcion: '', estado: 'PENDIENTE' }

export default function CoordIncidentes() {
  const [incidentes, setIncidentes] = useState([])
  const [zonas, setZonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [filtroSev, setFiltroSev] = useState('TODOS')

  const load = async () => {
    setLoading(true)
    const [inc, z] = await Promise.all([
      incidentesApi.getAll().catch(() => ({ data: [] })),
      zonasApi.getAll().catch(() => ({ data: [] })),
    ])
    setIncidentes(inc.data || [])
    setZonas(z.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async () => {
    if (!form.tipo || !form.zona?.id || !form.severidad || !form.descripcion.trim()) {
      setError('Completa todos los campos marcados')
      return
    }
    setError(null)
    try {
      await incidentesApi.create(form)
      setSuccess('✅ Incidente reportado. El coordinador ha sido notificado.')
      setForm(EMPTY)
      load()
      setTimeout(() => setSuccess(null), 4000)
    } catch { setError('Error al enviar. Verifica la conexión con el backend.') }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este incidente?')) return
    await incidentesApi.delete(id); load()
  }

  const filtrados = incidentes
    .filter(i => filtroEstado === 'TODOS' || i.estado === filtroEstado)
    .filter(i => filtroSev === 'TODOS' || i.severidad === filtroSev)

  return (
    <div>
      <div className="gradient-banner orange">
        <div className="banner-icon">⚠</div>
        <div className="banner-text">
          <div className="title">Registro de Incidentes</div>
          <div className="subtitle">Reporta y consulta incidentes — máximo 3 pasos por acción</div>
        </div>
      </div>

      {success && <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#166534', marginBottom: 16 }}>{success}</div>}

      <div className="two-col">
        {/* Formulario de reporte */}
        <div className="card">
          <div className="card-title-row"><span>📤</span><h3 className="card-title">Nuevo Reporte de Incidente</h3></div>
          <p className="card-subtitle">Paso 1: Tipo · Paso 2: Zona y severidad · Paso 3: Descripción</p>

          {error && <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 14, marginBottom: 14 }}>{error}</div>}

          <div className="form-field">
            <div className="form-label">🏷 Tipo de incidente *</div>
            <select className="form-select" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
              <option value="">Selecciona el tipo...</option>
              {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
            </select>
          </div>

          <div className="form-field">
            <div className="form-label">📍 Zona *</div>
            <select className="form-select" value={form.zona?.id} onChange={e => setForm({ ...form, zona: { id: e.target.value } })}>
              <option value="">Selecciona la zona...</option>
              {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
            </select>
          </div>

          <div className="form-field">
            <div className="form-label">🔴 Severidad *</div>
            <div className="severity-grid">
              {SEVS.map(s => (
                <button key={s} className={`sev-btn ${form.severidad === s ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, severidad: s })}
                  style={form.severidad === s ? { borderColor: SEV_COLOR[s], background: SEV_BG[s] } : {}}>
                  <div className="sev-code" style={{ color: form.severidad === s ? SEV_COLOR[s] : '#1a1a2e', fontWeight: 800, fontSize: 18 }}>{s}</div>
                  <div className="sev-label">{SEV_LABEL[s]}</div>
                </button>
              ))}
            </div>
            {form.severidad === 'S3' && (
              <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 14px', marginTop: 10, fontSize: 13, color: '#dc2626' }}>
                ⚠ S3 activa notificación inmediata a coordinación, enfermería o seguridad
              </div>
            )}
          </div>

          <div className="form-field">
            <div className="form-label">💬 Descripción del incidente *</div>
            <textarea className="form-textarea" rows={4}
              placeholder="Describe lo ocurrido con el mayor detalle posible. No incluyas nombres de estudiantes."
              value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>

          <button className="submit-btn" onClick={handleSubmit}>📤 Enviar reporte</button>
        </div>

        {/* Lista de incidentes */}
        <div className="card">
          <div className="card-title-row"><span>📋</span><h3 className="card-title">Incidentes Registrados ({filtrados.length})</h3></div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {['TODOS', ...ESTADOS].map(e => (
              <button key={e} onClick={() => setFiltroEstado(e)} style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                borderColor: filtroEstado === e ? '#3b82f6' : '#e5e7eb',
                background: filtroEstado === e ? '#dbeafe' : 'white',
                color: filtroEstado === e ? '#1d4ed8' : '#6b7280',
              }}>{e}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {['TODOS', 'S1', 'S2', 'S3'].map(s => (
              <button key={s} onClick={() => setFiltroSev(s)} style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                borderColor: filtroSev === s ? SEV_COLOR[s] || '#e5e7eb' : '#e5e7eb',
                background: filtroSev === s ? (SEV_BG[s] || 'white') : 'white',
                color: filtroSev === s ? (SEV_COLOR[s] || '#6b7280') : '#6b7280',
              }}>{s}</button>
            ))}
          </div>

          {loading ? <div style={{ textAlign: 'center', padding: 30, color: '#9ca3af' }}>Cargando...</div> :
            filtrados.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Sin incidentes con ese filtro</div> :
              filtrados.map(inc => (
                <div key={inc.id} className="incident-card" style={{ borderLeft: `4px solid ${SEV_COLOR[inc.severidad] || '#e5e7eb'}` }}>
                  <div className="incident-tags">
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: SEV_BG[inc.severidad], color: SEV_COLOR[inc.severidad] }}>{inc.severidad}</span>
                    <span className={`tag ${inc.estado === 'RESUELTO' ? 'resolved' : 'pending'}`}>
                      {inc.estado === 'RESUELTO' ? '✓ Resuelto' : inc.estado === 'EN_PROCESO' ? '🔄 En proceso' : '⏱ Pendiente'}
                    </span>
                  </div>
                  <div className="incident-title">{TIPO_LABEL[inc.tipo] || inc.tipo}</div>
                  <div className="incident-zone">📍 {inc.zona?.nombre || '—'}</div>
                  {inc.descripcion && <div style={{ fontSize: 13, color: '#6b7280', margin: '6px 0', lineHeight: 1.5 }}>{inc.descripcion}</div>}
                  <div className="incident-meta">
                    <span>🕐 {inc.fechaHora ? new Date(inc.fechaHora).toLocaleString('es') : '—'}</span>
                    <button style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleDelete(inc.id)}>🗑️</button>
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  )
}