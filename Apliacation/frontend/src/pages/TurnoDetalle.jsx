import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  turnosApi, checkinsApi, incidentesApi, limpiezaApi,
} from '../services/api'
import { ESTADO_TURNO_COLORS, estadoTurnoLabel, franjaHoras, franjaLabel, sevLabel, tipoLabel, SEVERIDAD_COLORS } from '../utils/labels'
import { fechaCorta, horaCorta } from '../utils/tiempo'

export default function TurnoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [turno, setTurno] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [recorridos, setRecorridos] = useState([])
  const [incidentes, setIncidentes] = useState([])
  const [limpieza, setLimpieza] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true); setError(null)
    Promise.all([
      turnosApi.getById(id),
      checkinsApi.getByTurno(id).catch(() => ({ data: [] })),
      checkinsApi.getRecorridos(id).catch(() => ({ data: [] })),
      incidentesApi.getAll().catch(() => ({ data: [] })),
      limpiezaApi.getByTurno(id).catch(() => ({ data: [] })),
    ]).then(([t, c, r, i, l]) => {
      setTurno(t.data)
      setCheckins(c.data || [])
      setRecorridos(r.data || [])
      setIncidentes((i.data || []).filter(x => x.turno?.id === Number(id) || x.zona?.id === t.data?.zona?.id))
      setLimpieza(l.data || [])
    }).catch(() => setError('No se pudo cargar el turno'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Cargando turno...</div>
  if (error || !turno) return <div className="card" style={{ textAlign: 'center', padding: 40, color: '#dc2626' }}>{error || 'Turno no encontrado'}</div>

  const color = ESTADO_TURNO_COLORS[turno.estado] || '#6b7280'
  const llegada = checkins.find(c => !c.esRecorrido) || checkins[0]

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14, marginBottom: 12 }}
      >
        ← Volver
      </button>

      <div className="gradient-banner green">
        <div className="banner-icon">📋</div>
        <div className="banner-text">
          <div className="title">Turno #{turno.id} — {turno.zona?.nombre}</div>
          <div className="subtitle">{fechaCorta(turno.fecha)} · {franjaLabel(turno.franja)} {franjaHoras(turno.franja) && `(${franjaHoras(turno.franja)})`}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          <div>
            <div className="config-label">Docente</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              👤 {turno.usuario ? `${turno.usuario.nombre} ${turno.usuario.apellido || ''}` : 'Sin asignar'}
            </div>
          </div>
          <div>
            <div className="config-label">Zona</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>📍 {turno.zona?.nombre || '—'}</div>
          </div>
          <div>
            <div className="config-label">Estado</div>
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, background: color + '22', color }}>
              {estadoTurnoLabel(turno.estado)}
            </span>
          </div>
          <div>
            <div className="config-label">Hora de llegada</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              🕐 {llegada?.timestamp ? horaCorta(llegada.timestamp) : '—'}
            </div>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title-row"><span>✅</span><h3 className="card-title">Registros de check-in ({checkins.length})</h3></div>
          {checkins.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: '#9ca3af' }}>Sin check-ins aún</div>
          ) : checkins.map(c => (
            <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid #f9fafb', fontSize: 14 }}>
              <div>🕐 <strong>{horaCorta(c.timestamp)}</strong> · {c.metodo || 'MANUAL'}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                {c.checkpoint?.nombre ? `📍 ${c.checkpoint.nombre}` : 'Check-in inicial'}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title-row"><span>🚶</span><h3 className="card-title">Recorridos ({recorridos.length})</h3></div>
          {recorridos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: '#9ca3af' }}>Sin recorridos registrados</div>
          ) : recorridos.map(c => (
            <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid #f9fafb', fontSize: 14 }}>
              <div>📍 <strong>{c.checkpoint?.nombre || 'Punto de control'}</strong></div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>🕐 {horaCorta(c.timestamp)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title-row"><span>⚠️</span><h3 className="card-title">Incidentes relacionados ({incidentes.length})</h3></div>
        {incidentes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: '#9ca3af' }}>Sin incidentes reportados en este turno</div>
        ) : incidentes.map(i => {
          const sev = SEVERIDAD_COLORS[i.severidad] || { color: '#6b7280', bg: '#f3f4f6' }
          return (
            <div key={i.id} style={{ padding: '12px 0', borderBottom: '1px solid #f9fafb' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: sev.bg, color: sev.color }}>
                  {sevLabel(i.severidad)}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{tipoLabel(i.tipo)}</span>
              </div>
              {i.descripcion && <div style={{ fontSize: 13, color: '#6b7280' }}>{i.descripcion}</div>}
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="card-title-row"><span>🧹</span><h3 className="card-title">Reporte de limpieza</h3></div>
        {limpieza.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: '#9ca3af' }}>Sin reportes de limpieza para este turno</div>
        ) : limpieza.map(l => (
          <div key={l.id} style={{ padding: '12px 0', borderBottom: '1px solid #f9fafb', fontSize: 14 }}>
            <div>⭐ Escala: <strong>{l.escala || l.calificacion || '—'}</strong></div>
            {l.observaciones && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{l.observaciones}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
