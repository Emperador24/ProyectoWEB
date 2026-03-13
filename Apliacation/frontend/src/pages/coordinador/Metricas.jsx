const RANKING = [
  {
    pos: 1, medal: '🥇', nombre: 'Carlos Rodríguez', initials: 'CR', color: '#3b82f6',
    badges: ['⭐ Puntualidad Perfecta', '🏆 Patrullero del Mes'],
    score: 950, puntualidad: 98, patrullas: 45, incidentes: 2,
    pctP: 98, pctPa: 90, pctI: 40,
  },
  {
    pos: 2, medal: '🥈', nombre: 'María López', initials: 'ML', color: '#22c55e',
    badges: ['⭐ Gran Colaborador', '🔴 Compromiso Total'],
    score: 920, puntualidad: 96, patrullas: 42, incidentes: 3,
    pctP: 96, pctPa: 84, pctI: 60,
  },
  {
    pos: 3, medal: '🥉', nombre: 'Ana Martínez', initials: 'AM', color: '#f59e0b',
    badges: ['⭐ Zona Segura'],
    score: 880, puntualidad: 92, patrullas: 38, incidentes: 1,
    pctP: 92, pctPa: 76, pctI: 20,
  },
]

export default function Metricas() {
  return (
    <div>
      <div className="gradient-banner yellow-red">
        <div className="banner-icon">🏆</div>
        <div className="banner-text">
          <div className="title">Gamificación y Métricas</div>
          <div className="subtitle">🏆 Reconocimiento y desempeño de los profesores</div>
        </div>
      </div>

      <div className="ranking-section-header">
        <div className="title">🏆 Tabla de Líderes - Este Mes</div>
        <div className="subtitle">Los profesores mejor valorados según su desempeño</div>
      </div>

      {RANKING.map((r, i) => (
        <div key={i} className={`ranking-card ${r.pos === 1 ? 'gold' : ''}`}>
          <div className="ranking-header">
            <div className="rank-medal">{r.medal}</div>
            <div className="rank-avatar" style={{ background: r.color }}>{r.initials}</div>
            <div>
              <div className="rank-name">{r.nombre}</div>
              <div className="rank-badges">
                {r.badges.map((b, j) => (
                  <span key={j} className="rank-badge">{b}</span>
                ))}
              </div>
            </div>
            <div className="rank-score">
              <div className="score">{r.score}</div>
              <div className="pts">puntos</div>
            </div>
          </div>

          <div className="rank-stats">
            <div className="rank-stat">
              <div className="rval">{r.puntualidad}%</div>
              <div className="rlabel">Puntualidad</div>
              <div className="rbar"><div className="rbar-fill" style={{ width: `${r.pctP}%` }}></div></div>
            </div>
            <div className="rank-stat">
              <div className="rval blue">{r.patrullas}</div>
              <div className="rlabel">Patrullas</div>
              <div className="rbar"><div className="rbar-fill" style={{ width: `${r.pctPa}%` }}></div></div>
            </div>
            <div className="rank-stat">
              <div className="rval yellow">{r.incidentes}</div>
              <div className="rlabel">Incidentes</div>
              <div className="rbar"><div className="rbar-fill" style={{ width: `${r.pctI}%` }}></div></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}