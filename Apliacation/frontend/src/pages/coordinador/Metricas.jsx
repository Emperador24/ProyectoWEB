import { useEffect, useState } from 'react'
import { metricasApi, turnosApi, usuariosApi } from '../../services/api'

const AVATAR_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899']
const MEDALS = ['🥇', '🥈', '🥉']

export default function Metricas() {
  const [metricas, setMetricas] = useState([])
  const [turnos, setTurnos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      metricasApi.getAll().catch(() => ({ data: [] })),
      turnosApi.getAll().catch(() => ({ data: [] })),
      usuariosApi.getAll().catch(() => ({ data: [] })),
    ]).then(([m, t, u]) => {
      setMetricas(m.data || [])
      setTurnos(t.data || [])
      setUsuarios((u.data || []).filter(x => x.rol === 'DOCENTE'))
      setLoading(false)
    })
  }, [])

  // Si hay métricas del backend, usarlas; si no, calcularlas desde turnos
  const ranking = metricas.length > 0
    ? [...metricas].sort((a, b) => b.puntajeTotal - a.puntajeTotal)
    : usuarios.map(u => {
        const turnosU = turnos.filter(t => t.usuario?.id === u.id)
        const completados = turnosU.filter(t => t.estado === 'COMPLETADO').length
        const puntualidad = turnosU.length > 0 ? Math.round((completados / turnosU.length) * 100) : 0
        const puntaje = Math.round(puntualidad * 0.5 + completados * 2)
        return {
          id: u.id,
          usuario: u,
          puntualidad,
          totalRecorridos: completados,
          calidadRegistro: Math.min(puntualidad + 5, 100),
          contribucionPreventiva: Math.min(puntualidad, 100),
          puntajeTotal: puntaje,
          reconocimiento: puntualidad >= 95,
          trimestre: 'Q1-2026',
        }
      }).sort((a, b) => b.puntajeTotal - a.puntajeTotal)

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Cargando métricas...</div>

  return (
    <div>
      <div className="gradient-banner yellow-red">
        <div className="banner-icon">🏆</div>
        <div className="banner-text">
          <div className="title">Gamificación y Métricas</div>
          <div className="subtitle">Reconocimiento institucional — métricas positivas por desempeño</div>
        </div>
      </div>

      <div className="ranking-section-header">
        <div className="title">🏆 Tabla de Líderes — {ranking[0]?.trimestre || 'Q1-2026'}</div>
        <div className="subtitle">Docentes valorados por puntualidad, recorridos, calidad y contribución preventiva</div>
      </div>

      {ranking.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 50, color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
          <div style={{ fontWeight: 600 }}>No hay datos de métricas aún</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>Las métricas se calculan a partir de los turnos completados</div>
        </div>
      ) : ranking.map((r, i) => {
        const initials = `${r.usuario?.nombre?.[0] || ''}${r.usuario?.apellido?.[0] || ''}`
        const badges = []
        if (r.puntualidad >= 95) badges.push('⭐ Puntualidad Perfecta')
        if (r.totalRecorridos >= 20) badges.push('🏆 Patrullero del Trimestre')
        if (r.reconocimiento) badges.push('🏅 Reconocido')

        return (
          <div key={r.id} className={`ranking-card ${i === 0 ? 'gold' : ''}`}>
            <div className="ranking-header">
              <div className="rank-medal">{MEDALS[i] || `${i + 1}°`}</div>
              <div className="rank-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{initials}</div>
              <div style={{ flex: 1 }}>
                <div className="rank-name">{r.usuario?.nombre} {r.usuario?.apellido}</div>
                <div className="rank-badges">
                  {badges.length > 0
                    ? badges.map((b, j) => <span key={j} className="rank-badge">{b}</span>)
                    : <span className="rank-badge">📋 {r.trimestre}</span>}
                </div>
              </div>
              <div className="rank-score">
                <div className="score">{r.puntajeTotal}</div>
                <div className="pts">puntos</div>
              </div>
            </div>

            <div className="rank-stats">
              {[
                { val: `${r.puntualidad}%`, label: 'Puntualidad', fill: r.puntualidad },
                { val: r.totalRecorridos, label: 'Turnos completados', fill: Math.min(r.totalRecorridos * 3, 100) },
                { val: `${r.calidadRegistro}%`, label: 'Calidad de registro', fill: r.calidadRegistro },
                { val: `${r.contribucionPreventiva}%`, label: 'Contribución preventiva', fill: r.contribucionPreventiva },
              ].map((s, j) => (
                <div key={j} className="rank-stat">
                  <div className="rval">{s.val}</div>
                  <div className="rlabel">{s.label}</div>
                  <div className="rbar"><div className="rbar-fill" style={{ width: `${s.fill}%` }}></div></div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}