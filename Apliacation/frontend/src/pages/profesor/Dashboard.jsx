import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SessionContext } from '../../App'
import { turnosApi, incidentesApi } from '../../services/api'

const FRANJA_HORA = { RECREO_MANANA: '10:15–10:45', ALMUERZO: '13:00–13:30', RECREO_TARDE: '15:15–15:45' }
const FRANJA_COLOR = { RECREO_MANANA: '#22c55e', ALMUERZO: '#3b82f6', RECREO_TARDE: '#f59e0b' }

export default function ProfDashboard() {
  const { session } = useContext(SessionContext)
  const navigate = useNavigate()
  const [turnos, setTurnos] = useState([])
  const [incidentes, setIncidentes] = useState([])
  const [loading, setLoading] = useState(true)

  const hoy = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    Promise.all([
      turnosApi.getAll().catch(() => ({ data: [] })),
      incidentesApi.getAll().catch(() => ({ data: [] })),
    ]).then(([t, i]) => {
      const todos = t.data || []
      // Turnos del día filtrados por usuario si hay sesión
      const misTurnos = todos.filter(t =>
        t.fecha?.slice(0, 10) === hoy &&
        (!session?.id || t.usuario?.id === session.id || t.usuario?.id === Number(session.id))
      )
      // Fallback: mostrar todos los turnos de hoy si no hay match por ID
      setTurnos(misTurnos.length > 0 ? misTurnos : todos.filter(t => t.fecha?.slice(0, 10) === hoy))
      setIncidentes(i.data || [])
      setLoading(false)
    })
  }, [])

  const proximo = turnos.find(t => t.estado === 'PENDIENTE')
  const enCurso = turnos.find(t => t.estado === 'EN_CURSO')
  const completados = turnos.filter(t => t.estado === 'COMPLETADO').length
  const puntualidad = turnos.length > 0 ? Math.round((completados / turnos.length) * 100) : 100

  return (
    <div>
      {/* Bienvenida */}
      <div className="welcome-banner">
        <div className="welcome-title">¡Bienvenido, {session?.nombre || 'Docente'}! 👋</div>
        <div className="welcome-sub">Resumen de tus turnos para hoy — {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#dcfce7', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 32 }}>✅</div>
          <div><div style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', textTransform: 'uppercase' }}>Turnos hoy</div><div style={{ fontSize: 28, fontWeight: 800, color: '#166534' }}>{turnos.length}</div></div>
        </div>
        <div style={{ background: '#dbeafe', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 32 }}>🕐</div>
          <div><div style={{ fontSize: 12, fontWeight: 600, color: '#1d4ed8', textTransform: 'uppercase' }}>Próximo turno</div><div style={{ fontSize: 22, fontWeight: 800, color: '#1e40af' }}>{proximo || enCurso ? FRANJA_HORA[(proximo || enCurso)?.franja] : '—'}</div></div>
        </div>
        <div style={{ background: '#fef9c3', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 32 }}>📈</div>
          <div><div style={{ fontSize: 12, fontWeight: 600, color: '#a16207', textTransform: 'uppercase' }}>Puntualidad</div><div style={{ fontSize: 28, fontWeight: 800, color: '#92400e' }}>{puntualidad}%</div></div>
        </div>
      </div>

      {/* Turnos del día */}
      <div className="section-header">
        <div className="title">📋 Mis Turnos de Hoy</div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Cargando tus turnos...</div>
      ) : turnos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 50, color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <div style={{ fontWeight: 600 }}>No tienes turnos asignados para hoy</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>Consulta el calendario de turnos para ver tu semana</div>
        </div>
      ) : turnos.map(t => {
        const esActivo = t.estado === 'PENDIENTE' || t.estado === 'EN_CURSO'
        const color = FRANJA_COLOR[t.franja] || '#6b7280'
        return (
          <div key={t.id} className="turno-today-card" style={{ borderLeft: `4px solid ${color}`, marginBottom: 14 }}>
            <div className="turno-today-header">
              <div>
                <div className="turno-today-name">{t.zona?.nombre}</div>
                <div className="turno-franja" style={{ color }}>🕐 {FRANJA_HORA[t.franja] || t.franja}</div>
              </div>
              <span style={{
                padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: t.estado === 'EN_CURSO' ? '#dcfce7' : t.estado === 'COMPLETADO' ? '#dbeafe' : '#fef9c3',
                color: t.estado === 'EN_CURSO' ? '#16a34a' : t.estado === 'COMPLETADO' ? '#1d4ed8' : '#a16207',
              }}>{t.estado}</span>
            </div>
            <div className="turno-time-row" style={{ marginTop: 8, fontSize: 14, color: '#6b7280' }}>
              👤 {t.usuario ? `${t.usuario.nombre} ${t.usuario.apellido || ''}`.trim() : session?.nombre}
            </div>
            {esActivo && (
              <button className="checkin-now-btn" onClick={() => navigate('/checkin')} style={{ marginTop: 14 }}>
                ✓ Hacer Check-in ahora
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}