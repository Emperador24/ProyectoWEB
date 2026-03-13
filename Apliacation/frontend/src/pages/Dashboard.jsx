import { useEffect, useState } from 'react'
import { turnosApi, incidentesApi, zonasApi, usuariosApi, notificacionesApi } from '../services/api'
import { estadoBadge, tipoBadge, severidadBadge } from '../components/shared'

export default function Dashboard() {
  const [stats, setStats] = useState({ turnos: 0, incidentes: 0, zonas: 0, docentes: 0 })
  const [turnosActivos, setTurnosActivos] = useState([])
  const [incidentesRecientes, setIncidentesRecientes] = useState([])
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      turnosApi.getAll(),
      incidentesApi.getAll(),
      zonasApi.getActivas(),
      usuariosApi.getByRol('DOCENTE'),
      notificacionesApi.getAll(),
    ]).then(([turnos, incidentes, zonas, docentes, notifs]) => {
      setStats({
        turnos: turnos.data.length,
        incidentes: incidentes.data.length,
        zonas: zonas.data.length,
        docentes: docentes.data.length,
      })
      setTurnosActivos(turnos.data.filter(t => t.estado === 'EN_CURSO').slice(0, 5))
      setIncidentesRecientes(incidentes.data.slice(-5).reverse())
      setAlertas(notifs.data.filter(n => n.tipo === 'ALERTA' && !n.leida))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Cargando dashboard…</div>

  const statConfig = [
    { label: 'Turnos totales', val: stats.turnos, color: '#1e3a5f' },
    { label: 'Incidentes', val: stats.incidentes, color: '#922b21' },
    { label: 'Zonas activas', val: stats.zonas, color: '#0e6655' },
    { label: 'Docentes', val: stats.docentes, color: '#6c3483' },
  ]

  return (
    <div>
      <h1 className="page-title">🏠 Dashboard</h1>
      <p className="page-subtitle">Resumen general del sistema de vigilancia</p>

      {alertas.length > 0 && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          ⚠️ <strong>{alertas.length} alerta(s) sin atender:</strong>{' '}
          {alertas.map(a => a.mensaje).join(' | ')}
        </div>
      )}

      <div className="stats-grid">
        {statConfig.map(s => (
          <div className="stat-card" key={s.label} style={{ borderTopColor: s.color }}>
            <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-title">📅 Turnos en curso</div>
          {turnosActivos.length === 0 ? (
            <p className="empty-state">Sin turnos activos</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Docente</th><th>Zona</th><th>Estado</th></tr></thead>
                <tbody>
                  {turnosActivos.map(t => (
                    <tr key={t.id}>
                      <td>{t.usuario?.nombre || '—'}</td>
                      <td>{t.zona?.nombre || '—'}</td>
                      <td>{estadoBadge(t.estado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">⚠️ Incidentes recientes</div>
          {incidentesRecientes.length === 0 ? (
            <p className="empty-state">Sin incidentes registrados</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Tipo</th><th>Sev.</th><th>Zona</th></tr></thead>
                <tbody>
                  {incidentesRecientes.map(i => (
                    <tr key={i.id}>
                      <td>{tipoBadge(i.tipo)}</td>
                      <td>{severidadBadge(i.severidad)}</td>
                      <td>{i.zona?.nombre || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
