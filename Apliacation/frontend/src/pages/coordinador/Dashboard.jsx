import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { turnosApi, incidentesApi, zonasApi, usuariosApi } from '../../services/api'

export default function CoordDashboard() {
  const [zonas, setZonas] = useState([])
  const [turnos, setTurnos] = useState([])
  const [incidentes, setIncidentes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroFranja, setFiltroFranja] = useState('TODOS')
  const navigate = useNavigate()

  const hoy = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    Promise.all([
      zonasApi.getAll().catch(() => ({ data: [] })),
      turnosApi.getAll().catch(() => ({ data: [] })),
      incidentesApi.getAll().catch(() => ({ data: [] })),
      usuariosApi.getAll().catch(() => ({ data: [] })),
    ]).then(([z, t, i, u]) => {
      setZonas(z.data || [])
      setTurnos(t.data || [])
      setIncidentes(i.data || [])
      setUsuarios(u.data || [])
      setLoading(false)
    })
  }, [])

  const turnosHoy = turnos.filter(t => t.fecha?.slice(0, 10) === hoy)
  const turnosFiltrados = filtroFranja === 'TODOS' ? turnosHoy : turnosHoy.filter(t => t.franja === filtroFranja)

  const cubiertos = turnosHoy.filter(t => t.estado === 'EN_CURSO' || t.estado === 'COMPLETADO').length
  const profActivos = [...new Set(turnosHoy.filter(t => t.estado === 'EN_CURSO').map(t => t.usuario?.id).filter(Boolean))].length
  const incHoy = incidentes.filter(i => i.fechaHora?.slice(0, 10) === hoy)
  const puntualidad = turnosHoy.length ? Math.round((cubiertos / turnosHoy.length) * 100) : 0

  const zonasConEstado = zonas.map(zona => {
    const turno = turnosFiltrados.find(t => t.zona?.id === zona.id)
    if (!turno) return { ...zona, estado: 'SIN_TURNO', docente: null, hora: null, turnoId: null }
    const hora = turno.checkins?.[0]?.timestamp
      ? new Date(turno.checkins[0].timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
      : null
    return { ...zona, estado: turno.estado || 'PENDIENTE', docente: turno.usuario, hora, turnoId: turno.id }
  })

  const cardCls   = (estado) => estado === 'EN_CURSO' || estado === 'COMPLETADO' ? 'covered' : estado === 'PENDIENTE' ? 'warning' : 'danger'
  const cardLabel = (estado) => estado === 'EN_CURSO' || estado === 'COMPLETADO' ? '✓ Cubierta'  : estado === 'PENDIENTE' ? '⏱ Por iniciar' : '⚠ Sin cubrir'

  // Navega a Reasignaciones pasando el turnoId por query param
  const handleReasignar = (turnoId) => {
    if (turnoId) {
      navigate(`/reasignaciones?turnoId=${turnoId}`)
    } else {
      navigate('/reasignaciones')
    }
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af', fontSize: 16 }}>Cargando tablero...</div>

  return (
    <div>
      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-left">
            <div className="label">ZONAS CUBIERTAS</div>
            <div className="value">{cubiertos}/{turnosHoy.length || zonas.length}</div>
            <div className="trend">↗ Hoy {hoy}</div>
          </div>
          <div className="stat-card-icon green">✅</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-left">
            <div className="label">PROFESORES ACTIVOS</div>
            <div className="value">{profActivos || usuarios.filter(u => u.rol === 'DOCENTE').length}</div>
            <div className="trend">↗ En turno actual</div>
          </div>
          <div className="stat-card-icon blue">👥</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-left">
            <div className="label">INCIDENTES HOY</div>
            <div className="value">{incHoy.length}</div>
            <div className="trend">{incHoy.filter(i => i.severidad === 'S3').length > 0 ? '⚠ Hay S3 graves' : '✓ Sin graves'}</div>
          </div>
          <div className="stat-card-icon yellow">⏰</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-left">
            <div className="label">PUNTUALIDAD</div>
            <div className="value">{puntualidad}%</div>
            <div className="trend">{puntualidad >= 90 ? '↗ Excelente' : puntualidad >= 75 ? '→ Aceptable' : '↘ Requiere atención'}</div>
          </div>
          <div className="stat-card-icon purple">🕐</div>
        </div>
      </div>

      {/* Filtros franja */}
      <div className="section-header">
        <div className="title">🖊 Tablero en Tiempo Real</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {['TODOS', 'RECREO_MANANA', 'ALMUERZO', 'RECREO_TARDE'].map(f => (
            <button key={f} onClick={() => setFiltroFranja(f)} style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
              borderColor: filtroFranja === f ? '#22c55e' : '#e5e7eb',
              background: filtroFranja === f ? '#dcfce7' : 'white',
              color: filtroFranja === f ? '#16a34a' : '#6b7280',
            }}>
              {f === 'TODOS' ? 'Todas las franjas' : f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {zonasConEstado.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 50, color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏫</div>
          <div style={{ fontWeight: 600 }}>No hay zonas configuradas</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>Ve a Configuración para agregar zonas de supervisión</div>
        </div>
      ) : (
        <div className="zones-grid">
          {zonasConEstado.map(z => (
            <div key={z.id} className={`zone-card ${cardCls(z.estado)}`}>
              <div className="zone-card-header">
                <div className="zone-card-name">{z.nombre}</div>
                <div className={`zone-status ${cardCls(z.estado)}`}>{cardLabel(z.estado)}</div>
              </div>
              <div className="zone-card-franja">{z.descripcion || 'Zona de supervisión'}</div>
              <div className="zone-info-row">
                <span>👤</span>
                <span>{z.docente ? `${z.docente.nombre} ${z.docente.apellido || ''}`.trim() : 'Sin asignar'}</span>
              </div>
              <div className="zone-info-row">
                <span>🕐</span>
                <span>Check-in: <strong>{z.hora || '—'}</strong></span>
              </div>
              {/* Botón funcional que navega a Reasignaciones con el turno preseleccionado */}
              <button
                className="reassign-btn"
                onClick={() => handleReasignar(z.turnoId)}
              >
                🔄 Reasignar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Incidentes graves del día */}
      {incHoy.filter(i => i.severidad === 'S3').length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 12, color: '#dc2626' }}>🚨 Incidentes Graves (S3) — Requieren atención inmediata</div>
          {incHoy.filter(i => i.severidad === 'S3').map(inc => (
            <div key={inc.id} className="incident-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div className="incident-tags">
                <span className="tag s3">S3 — Grave</span>
                <span className={`tag ${inc.estado === 'RESUELTO' ? 'resolved' : 'pending'}`}>
                  {inc.estado === 'RESUELTO' ? '✓ Resuelto' : '⏱ Pendiente'}
                </span>
              </div>
              <div className="incident-title">{inc.tipo?.replace(/_/g, ' ')}</div>
              <div className="incident-zone">📍 {inc.zona?.nombre}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}