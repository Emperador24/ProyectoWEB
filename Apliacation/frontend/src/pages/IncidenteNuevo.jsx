import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { incidentesApi, zonasApi } from '../services/api'
import { SEVERIDAD_COLORS } from '../utils/labels'

const TIPOS = [
  { v: 'SEGURIDAD_FISICA', icon: '🩹', label: 'Seguridad Física', desc: 'Caídas, golpes, heridas' },
  { v: 'CONVIVENCIA',       icon: '🤝', label: 'Convivencia',       desc: 'Conflictos entre estudiantes' },
  { v: 'USO_ESPACIO',       icon: '🏫', label: 'Uso del Espacio',   desc: 'Uso indebido de instalaciones' },
  { v: 'OBSERVACION_SOCIAL',icon: '👁', label: 'Observación Social', desc: 'Conductas a monitorear' },
]

const SEVS = [
  { v: 'S1', label: 'S1 Leve',              desc: 'Registro informativo' },
  { v: 'S2', label: 'S2 Seguimiento',       desc: 'Requiere atención' },
  { v: 'S3', label: 'S3 Atención Inmediata', desc: 'Notificación inmediata' },
]

export default function IncidenteNuevo() {
  const navigate = useNavigate()
  const [paso, setPaso] = useState(0)
  const [zonas, setZonas] = useState([])
  const [form, setForm] = useState({
    tipo: '', severidad: 'S1', zona: { id: '' }, descripcion: '',
    estudiante: '', curso: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    zonasApi.getAll().then(r => setZonas(r.data || [])).catch(() => setZonas([]))
  }, [])

  const siguiente = () => {
    if (paso === 0 && !form.tipo) { setError('Selecciona un tipo'); return }
    if (paso === 1) {
      if (!form.severidad || !form.descripcion.trim() || !form.zona?.id) {
        setError('Completa severidad, zona y descripción'); return
      }
    }
    setError(null); setPaso(p => p + 1)
  }

  const anterior = () => { setError(null); setPaso(p => Math.max(0, p - 1)) }

  const enviar = async () => {
    setEnviando(true); setError(null)
    try {
      const payload = {
        tipo: form.tipo,
        severidad: form.severidad,
        zona: { id: Number(form.zona.id) },
        descripcion: form.descripcion,
        estado: 'PENDIENTE',
      }
      if (form.tipo === 'OBSERVACION_SOCIAL') {
        if (form.estudiante) payload.estudiante = form.estudiante
        if (form.curso) payload.curso = form.curso
      }
      await incidentesApi.create(payload)
      setExito(true)
    } catch (e) {
      setError('Error al enviar: ' + (e.response?.data?.error || e.message))
    } finally { setEnviando(false) }
  }

  const resetear = () => {
    setForm({ tipo: '', severidad: 'S1', zona: { id: '' }, descripcion: '', estudiante: '', curso: '' })
    setPaso(0); setExito(false); setError(null)
  }

  const sevColor = SEVERIDAD_COLORS[form.severidad] || { color: '#6b7280', bg: '#f3f4f6' }

  if (exito) {
    return (
      <div>
        <div className="gradient-banner green">
          <div className="banner-icon">✓</div>
          <div className="banner-text">
            <div className="title">Incidente registrado</div>
            <div className="subtitle">El coordinador ha sido notificado</div>
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 50 }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Reporte enviado correctamente</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
            El registro queda disponible en la sección de Incidentes.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 400, margin: '0 auto' }}>
            <button className="back-btn" onClick={() => navigate('/incidentes')}>Ver incidentes</button>
            <button className="login-btn" onClick={resetear}>Registrar otro</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="gradient-banner orange">
        <div className="banner-icon">⚠</div>
        <div className="banner-text">
          <div className="title">Nuevo Incidente</div>
          <div className="subtitle">Paso {paso + 1} de 3</div>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {['Tipo', 'Detalle', 'Confirmación'].map((l, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{
              height: 6, borderRadius: 20, background: i <= paso ? '#22c55e' : '#e5e7eb', marginBottom: 6,
            }} />
            <div style={{
              fontSize: 12, fontWeight: 600, color: i <= paso ? '#16a34a' : '#9ca3af', textAlign: 'center',
            }}>
              {i + 1}. {l}
            </div>
          </div>
        ))}
      </div>

      {error && <div style={{ background: '#fee2e2', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#dc2626', marginBottom: 16 }}>❌ {error}</div>}

      {/* PASO 1 — TIPO */}
      {paso === 0 && (
        <div className="card">
          <div className="card-title-row"><span>🏷</span><h3 className="card-title">¿Qué tipo de incidente?</h3></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 12 }}>
            {TIPOS.map(t => {
              const activo = form.tipo === t.v
              return (
                <div
                  key={t.v}
                  onClick={() => setForm({ ...form, tipo: t.v })}
                  style={{
                    padding: 22, borderRadius: 16, cursor: 'pointer',
                    border: `2.5px solid ${activo ? '#22c55e' : '#e5e7eb'}`,
                    background: activo ? '#dcfce7' : 'white',
                    transition: 'all 0.15s',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 10 }}>{t.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: activo ? '#15803d' : '#1a1a2e', marginBottom: 4 }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{t.desc}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* PASO 2 — DETALLE */}
      {paso === 1 && (
        <div className="card">
          <div className="card-title-row"><span>📝</span><h3 className="card-title">Detalles del incidente</h3></div>

          <div className="form-field" style={{ marginTop: 12 }}>
            <div className="form-label">🔴 Severidad *</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {SEVS.map(s => {
                const activo = form.severidad === s.v
                const c = SEVERIDAD_COLORS[s.v]
                return (
                  <button
                    key={s.v}
                    onClick={() => setForm({ ...form, severidad: s.v })}
                    style={{
                      padding: '16px 10px', borderRadius: 12, cursor: 'pointer',
                      border: `2px solid ${activo ? c.color : '#e5e7eb'}`,
                      background: activo ? c.bg : 'white',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 800, color: activo ? c.color : '#1a1a2e' }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{s.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="form-field">
            <div className="form-label">📍 Zona *</div>
            <select
              className="form-select"
              value={form.zona.id}
              onChange={e => setForm({ ...form, zona: { id: e.target.value } })}
            >
              <option value="">Selecciona la zona...</option>
              {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
            </select>
          </div>

          <div className="form-field">
            <div className="form-label">💬 Descripción *</div>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describe lo ocurrido con detalle..."
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>

          {form.tipo === 'OBSERVACION_SOCIAL' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-field">
                <div className="form-label">👤 Estudiante (opcional)</div>
                <input className="form-input" value={form.estudiante} onChange={e => setForm({ ...form, estudiante: e.target.value })} />
              </div>
              <div className="form-field">
                <div className="form-label">📚 Curso (opcional)</div>
                <input className="form-input" value={form.curso} onChange={e => setForm({ ...form, curso: e.target.value })} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* PASO 3 — CONFIRMACIÓN */}
      {paso === 2 && (
        <div className="card">
          <div className="card-title-row"><span>✔️</span><h3 className="card-title">Confirmar envío</h3></div>
          <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: 10 }}>
              <span style={{ color: '#6b7280' }}>Tipo</span>
              <strong>{TIPOS.find(t => t.v === form.tipo)?.icon} {TIPOS.find(t => t.v === form.tipo)?.label}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: 10 }}>
              <span style={{ color: '#6b7280' }}>Severidad</span>
              <span style={{ padding: '2px 10px', borderRadius: 20, fontWeight: 700, background: sevColor.bg, color: sevColor.color }}>
                {SEVS.find(s => s.v === form.severidad)?.label}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: 10 }}>
              <span style={{ color: '#6b7280' }}>Zona</span>
              <strong>{zonas.find(z => String(z.id) === String(form.zona.id))?.nombre || '—'}</strong>
            </div>
            <div style={{ padding: '10px 14px', background: '#f9fafb', borderRadius: 10 }}>
              <div style={{ color: '#6b7280', marginBottom: 4 }}>Descripción</div>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>{form.descripcion}</div>
            </div>
            {form.tipo === 'OBSERVACION_SOCIAL' && (form.estudiante || form.curso) && (
              <div style={{ padding: '10px 14px', background: '#f9fafb', borderRadius: 10 }}>
                <div style={{ color: '#6b7280', marginBottom: 4 }}>Información adicional</div>
                <div style={{ fontSize: 14 }}>
                  {form.estudiante && <>👤 {form.estudiante}</>}
                  {form.estudiante && form.curso && ' · '}
                  {form.curso && <>📚 {form.curso}</>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navegación */}
      <div style={{ display: 'grid', gridTemplateColumns: paso === 0 ? '1fr' : '1fr 1fr', gap: 12, marginTop: 20 }}>
        {paso > 0 && <button className="back-btn" onClick={anterior}>← Atrás</button>}
        {paso < 2 ? (
          <button className="login-btn" onClick={siguiente}>Siguiente →</button>
        ) : (
          <button className="login-btn" onClick={enviar} disabled={enviando}>
            {enviando ? 'Enviando...' : '✓ Enviar reporte'}
          </button>
        )}
      </div>
    </div>
  )
}
