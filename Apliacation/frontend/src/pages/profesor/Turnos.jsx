import { useContext, useEffect, useState } from 'react'
import { SessionContext } from '../../App'
import { turnosApi } from '../../services/api'

const FRANJA_LABEL = {
  RECREO_MANANA: 'Recreo Mañana (10:15–10:45)',
  ALMUERZO: 'Almuerzo (13:00–13:30)',
  RECREO_TARDE: 'Recreo Tarde (15:15–15:45)',
}
const FRANJA_COLOR = { RECREO_MANANA: 'green', ALMUERZO: 'blue', RECREO_TARDE: 'yellow' }
const DIA_LABEL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const ESTADO_COLOR = { PENDIENTE: '#f59e0b', EN_CURSO: '#22c55e', COMPLETADO: '#3b82f6', CANCELADO: '#9ca3af' }

export default function ProfTurnos() {
  const { session } = useContext(SessionContext)
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [semana, setSemana] = useState(0)

  useEffect(() => {
    turnosApi.getAll().catch(() => ({ data: [] })).then(r => {
      setTurnos(r.data || [])
      setLoading(false)
    })
  }, [])

  const getDias = () => {
    const hoy = new Date()
    const lunes = new Date(hoy)
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7) + semana * 7)
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(lunes); d.setDate(lunes.getDate() + i); return d
    })
  }

  const dias = getDias()
  const semanaLabel = `${dias[0].getDate()} – ${dias[4].getDate()} de ${dias[4].toLocaleDateString('es', { month: 'long', year: 'numeric' })}`
  const turnosPorDia = (d) => turnos.filter(t => t.fecha?.slice(0, 10) === d.toISOString().slice(0, 10))
  const esMio = (t) => session?.id && (t.usuario?.id === session.id || t.usuario?.id === Number(session.id))

  return (
    <div>
      <div className="gradient-banner green" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="banner-icon">📅</div>
          <div className="banner-text">
            <div className="title">Mis Turnos</div>
            <div className="subtitle">📅 Semana del {semanaLabel}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="nav-arrow" onClick={() => setSemana(s => s - 1)}>‹</button>
          <button className="nav-arrow" onClick={() => setSemana(0)}>Hoy</button>
          <button className="nav-arrow" onClick={() => setSemana(s => s + 1)}>›</button>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Cargando...</div> : (
        <div className="week-grid">
          {dias.map((dia, i) => {
            const dt = turnosPorDia(dia)
            return (
              <div key={i} className="day-col">
                <div className="day-name">{DIA_LABEL[i]}</div>
                <div className="day-date">📅 {dia.getDate()} {dia.toLocaleDateString('es', { month: 'short' })}</div>
                {dt.length === 0 && <div style={{ fontSize: 12, color: '#d1d5db', textAlign: 'center', padding: '20px 0' }}>Sin turnos</div>}
                {dt.map(t => {
                  const mio = esMio(t)
                  return (
                    <div key={t.id} className={`turno-chip ${FRANJA_COLOR[t.franja] || 'green'}`}
                      style={mio ? { boxShadow: '0 0 0 2px #f59e0b' } : {}}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={`chip-time ${FRANJA_COLOR[t.franja] || 'green'}`}>
                          🕐 {FRANJA_LABEL[t.franja]?.match(/\((.+)\)/)?.[1] || t.franja}
                        </span>
                        {mio && <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800 }}>⭐ Tú</span>}
                      </div>
                      <div className="chip-name">👤 {t.usuario ? `${t.usuario.nombre} ${t.usuario.apellido || ''}`.trim() : 'Sin asignar'}</div>
                      <div className="chip-zone">📍 {t.zona?.nombre || 'Sin zona'}</div>
                      <div style={{ marginTop: 6 }}>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: ESTADO_COLOR[t.estado] + '22', color: ESTADO_COLOR[t.estado], fontWeight: 700 }}>{t.estado}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>⭐ Mis turnos están marcados con estrella dorada</div>
        <div className="legend-row">
          {[{ color: '#22c55e', label: 'Recreo Mañana (10:15–10:45)' }, { color: '#3b82f6', label: 'Almuerzo (13:00–13:30)' }, { color: '#f59e0b', label: 'Recreo Tarde (15:15–15:45)' }].map((l, i) => (
            <div key={i} className="legend-item"><div className="legend-dot" style={{ background: l.color }}></div>{l.label}</div>
          ))}
        </div>
      </div>
    </div>
  )
}