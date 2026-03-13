const ZONAS_SIN = [
  { prioridad: 'Alta Prioridad', nombre: 'Biblioteca', franja: 'Recreo Mañana', horario: '10:15-10:45', profe: 'María González', motivo: 'Ausencia no planificada' },
  { prioridad: 'Media Prioridad', nombre: 'Pasillos Sur', franja: 'Almuerzo', horario: '13:00-13:30', profe: 'Luis Ramírez', motivo: 'Permiso médico' },
]

const PROFES_DISP = [
  { nombre: 'Ana Martínez', initials: 'AM', color: '#3b82f6', tiempo: '10:15-10:45', zonas: ['Biblioteca', 'Pasillos Sur'] },
  { nombre: 'Luis Torres', initials: 'LT', color: '#22c55e', tiempo: '10:15-10:45', zonas: ['Cafetería', 'Zona Deportiva'] },
]

export default function CoordReasignaciones() {
  return (
    <div>
      <div className="gradient-banner orange">
        <div className="banner-icon">⚠</div>
        <div className="banner-text">
          <div className="title">Reasignaciones de Turno</div>
          <div className="subtitle">Gestiona zonas sin cobertura y asigna profesores disponibles rápidamente</div>
        </div>
      </div>

      <div className="stats-grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-big red">
          <div className="big-icon">⚠</div>
          <div className="big-val">2</div>
          <div className="big-label">Zonas sin cubrir</div>
        </div>
        <div className="stat-big green">
          <div className="big-icon">👥</div>
          <div className="big-val">4</div>
          <div className="big-label">Profesores disponibles</div>
        </div>
        <div className="stat-big blue">
          <div className="big-icon">🕐</div>
          <div className="big-val">5 min</div>
          <div className="big-label">Tiempo promedio</div>
        </div>
      </div>

      <div className="two-col-asym">
        {/* Zonas sin cobertura */}
        <div>
          <div className="section-title-row" style={{ marginBottom: 16 }}>
            <h3>⚠ Zonas Sin Cobertura</h3>
          </div>
          {ZONAS_SIN.map((z, i) => (
            <div key={i} className="reasig-zone-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className={`prioridad-tag ${z.prioridad.includes('Alta') ? 'alta' : 'media'}`}>
                    {z.prioridad.includes('Alta') ? '⚠' : '📋'} {z.prioridad}
                  </span>
                  <div className="reasig-zone-name">{z.nombre}</div>
                  <div className="reasig-zone-franja">{z.franja}</div>
                </div>
                <div className="reasig-alert-icon">⚠</div>
              </div>
              <div className="reasig-info-row">
                <span>🕐 Horario:</span>
                <strong>{z.horario}</strong>
              </div>
              <div className="reasig-info-row">
                <span>👤 Profesor original:</span>
                <strong>{z.profe}</strong>
              </div>
              <div className="reasig-info-row">
                <span>📝 Motivo:</span>
                <strong>{z.motivo}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* Profesores disponibles */}
        <div>
          <div className="section-title-row" style={{ marginBottom: 16 }}>
            <h3>👥 Profesores Disponibles</h3>
          </div>
          {PROFES_DISP.map((p, i) => (
            <div key={i} className="profe-card">
              <div className="profe-header">
                <div className="profe-avatar" style={{ background: p.color }}>{p.initials}</div>
                <div>
                  <div className="profe-name">{p.nombre}</div>
                  <div className="disponible-badge">✓ Disponible</div>
                </div>
              </div>
              <div className="profe-time-row">
                <span>🕐 Espacio libre:</span>
                <strong>{p.tiempo}</strong>
              </div>
              <div className="assign-btns">
                {p.zonas.map((z, j) => (
                  <button key={j} className={`assign-btn ${j === 0 ? 'green' : 'blue'}`}>
                    📍 {z}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}