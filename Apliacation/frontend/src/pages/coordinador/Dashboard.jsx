import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { turnosApi, incidentesApi, zonasApi, usuariosApi, checkinsApi } from '../../services/api'
import ReassignDialog from '../../components/ReassignDialog'
import { franjaLabel, franjaHoras } from '../../utils/labels'
import { horaCorta } from '../../utils/tiempo'

export default function CoordDashboard() {
  const [zonas, setZonas] = useState([])
  const [turnos, setTurnos] = useState([])
  const [incidentes, setIncidentes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [checkinsPorTurno, setCheckinsPorTurno] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroFranja, setFiltroFranja] = useState('TODOS')
  const [filtroZona, setFiltroZona] = useState('TODAS')
  const [turnoReasignar, setTurnoReasignar] = useState(null)
  const navigate = useNavigate()

  const hoy = new Date().toISOString().slice(0, 10)

  const cargar = async (esRefresh = false) => {
    if (!esRefresh) setLoading(true)
    setError(null)
    try {
      const [z, t, i, u] = await Promise.all([
        zonasApi.getAll().catch(() => ({ data: [] })),
        turnosApi.getAll().catch(() => ({ data: [] })),
        incidentesApi.getAll().catch(() => ({ data: [] })),
        usuariosApi.getAll().catch(() => ({ data: [] })),
      ])
      setZonas(z.data || [])
      setTurnos(t.data || [])
      setIncidentes(i.data || [])
      setUsuarios(u.data || [])

      // Carga check-ins de turnos de hoy en paralelo (para mostrar hora de llegada real)
      const turnosHoy = (t.data || []).filter(x => x.fecha?.slice(0, 10) === hoy)
      const pares = await Promise.all(turnosHoy.map(x =>
        checkinsApi.getByTurno(x.id).catch(() => ({ data: [] })).then(r => [x.id, r.data || []])
      ))
      setCheckinsPorTurno(Object.fromEntries(pares))
    } catch { setError('Error al cargar el tablero') }
    finally { if (!esRefresh) setLoading(false) }
  }

  useEffect(() => {
    cargar()
    const iv = setInterval(() => cargar(true), 30000)
    return () => clearInterval(iv)
  }, [])

  const turnosHoy = useMemo(() => turnos.filter(t => t.fecha?.slice(0, 10) === hoy), [turnos, hoy])
  const turnosFiltrados = useMemo(() => turnosHoy
    .filter(t => filtroFranja === 'TODOS' || t.franja === filtroFranja)
    .filter(t => filtroZona === 'TODAS' || String(t.zona?.id) === String(filtroZona))
  , [turnosHoy, filtroFranja, filtroZona])

  const cubiertos = turnosHoy.filter(t => t.estado === 'EN_CURSO' || t.estado === 'COMPLETADO').length
  const pendientes = turnosHoy.filter(t => t.estado === 'PENDIENTE').length
  const sinCubrir = zonas.length - new Set(turnosHoy.map(t => t.zona?.id).filter(Boolean)).size
  const incHoy = incidentes.filter(i => (i.fechaHora || '').slice(0, 10) === hoy)
  const profActivos = [...new Set(turnosHoy.filter(t => t.estado === 'EN_CURSO').map(t => t.usuario?.id).filter(Boolean))].length

  // Estado por zona (una tarjeta por zona visible según filtros de zona)
  const zonasVisibles = filtroZona === 'TODAS' ? zonas : zonas.filter(z => String(z.id) === String(filtroZona))
  const zonasConEstado = zonasVisibles.map(zona => {
    const turno = turnosFiltrados.find(t => t.zona?.id === zona.id)
    if (!turno) return { zona, turno: null, estado: 'SIN_TURNO' }
    return { zona, turno, estado: turno.estado || 'PENDIENTE' }
  })

  const statusDe = (estado) => {
    if (estado === 'EN_CURSO' || estado === 'COMPLETADO') return { cls: 'covered', label: '✓ Cubierta', tag: 'VERDE' }
    if (estado === 'PENDIENTE') return { cls: 'warning', label: '⏱ Por iniciar', tag: 'AMARILLO' }
    return { cls: 'danger', label: '⚠ Sin cubrir', tag: 'ROJO' }
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af', fontSize: 16 }}>Cargando tablero...</div>

  return (
    <div>
      {/* Stats cards */}
      <div className="stats-grid">
        {[
          { label: 'ZONAS TOTALES', val: zonas.length, icon: '🏫', cls: 'blue' },
          { label: 'CUBIERTAS', val: cubiertos, icon: '✅', cls: 'green' },
          { label: 'PENDIENTES', val: pendientes, icon: '⏱', cls: 'yellow' },
          { label: 'SIN CUBRIR', val: Math.max(0, sinCubrir), icon: '⚠', cls: 'red' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-left">
              <div className="label">{s.label}</div>
              <div className="value">{s.val}</div>
              <div className="trend">↗ Hoy {hoy}</div>
            </div>
            <div className={`stat-card-icon ${s.cls}`}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Sección filtros */}
      <div className="section-header">
        <div className="title">🖊 Tablero en Tiempo Real</div>
        <div className="subtitle">Se actualiza automáticamente cada 30 segundos</div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 600, marginRight: 4 }}>Franja:</span>
          {['TODOS', 'RECREO_MANANA', 'ALMUERZO', 'RECREO_TARDE'].map(f => (
            <button key={f} onClick={() => setFiltroFranja(f)} style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
              borderColor: filtroFranja === f ? 'white' : 'rgba(255,255,255,0.35)',
              background: filtroFranja === f ? 'white' : 'transparent',
              color: filtroFranja === f ? '#16a34a' : 'white',
            }}>
              {f === 'TODOS' ? 'Todas' : franjaLabel(f)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 600, marginRight: 4 }}>Zona:</span>
          <select
            value={filtroZona}
            onChange={e => setFiltroZona(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1.5px solid white', background: 'transparent', color: 'white' }}
          >
            <option value="TODAS" style={{ color: '#1a1a2e' }}>Todas las zonas</option>
            {zonas.map(z => <option key={z.id} value={z.id} style={{ color: '#1a1a2e' }}>{z.nombre}</option>)}
          </select>
        </div>
      </div>

      {error && <div style={{ background: '#fee2e2', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#dc2626', marginBottom: 16 }}>❌ {error}</div>}

      {zonasConEstado.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 50, color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏫</div>
          <div style={{ fontWeight: 600 }}>No hay zonas para mostrar</div>
        </div>
      ) : (
        <div className="zones-grid">
          {zonasConEstado.map(({ zona, turno, estado }) => {
            const st = statusDe(estado)
            const cks = turno ? (checkinsPorTurno[turno.id] || []) : []
            const llegada = cks.find(c => !c.esRecorrido) || cks[0]
            const recorridos = cks.filter(c => c.esRecorrido).length
            return (
              <div key={zona.id} className={`zone-card ${st.cls}`}>
                <div className="zone-card-header">
                  <div className="zone-card-name">{zona.nombre}</div>
                  <div className={`zone-status ${st.cls}`}>{st.label}</div>
                </div>
                <div className="zone-card-franja">{turno ? franjaLabel(turno.franja) : 'Sin turno asignado'}</div>
                <div className="zone-info-row">
                  <span>👤</span>
                  <span>{turno?.usuario ? `${turno.usuario.nombre} ${turno.usuario.apellido || ''}`.trim() : 'Sin asignar'}</span>
                </div>
                <div className="zone-info-row">
                  <span>🕐</span>
                  <span>Check-in: <strong>{llegada?.timestamp ? horaCorta(llegada.timestamp) : 'Sin registro'}</strong></span>
                </div>
                <div className="zone-info-row">
                  <span>🚶</span>
                  <span>Recorridos: <strong>{recorridos}</strong></span>
                </div>

                {st.tag === 'ROJO' && turno && (
                  <button className="reassign-btn" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}
                    onClick={() => setTurnoReasignar(turno)}
                  >
                    🔄 Reasignar
                  </button>
                )}
                {turno && (
                  <button className="reassign-btn" onClick={() => navigate(`/turnos/${turno.id}`)}>
                    📋 Ver detalle
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {incHoy.filter(i => i.severidad === 'S3').length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 12, color: '#dc2626' }}>
            🚨 Incidentes Graves (S3) — {incHoy.filter(i => i.severidad === 'S3').length}
          </div>
          {incHoy.filter(i => i.severidad === 'S3').map(inc => (
            <div key={inc.id} className="incident-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div className="incident-tags">
                <span className="tag s3">S3 — Grave</span>
              </div>
              <div className="incident-title">{(inc.tipo || '').replace(/_/g, ' ')}</div>
              <div className="incident-zone">📍 {inc.zona?.nombre}</div>
              {inc.descripcion && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>{inc.descripcion}</div>}
            </div>
          ))}
        </div>
      )}

      <ReassignDialog
        open={!!turnoReasignar}
        turno={turnoReasignar}
        onClose={() => setTurnoReasignar(null)}
        onSuccess={() => cargar(true)}
      />
    </div>
  )
}
