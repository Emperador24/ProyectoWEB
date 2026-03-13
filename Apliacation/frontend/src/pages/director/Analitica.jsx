const HEATMAP = [
  { zona: 'Patio Principal', total: 12, s1: 8, s2: 3, s3: 1, pct: 80 },
  { zona: 'Cafetería', total: 8, s1: 6, s2: 2, s3: 0, pct: 53 },
  { zona: 'Zona Deportiva', total: 15, s1: 10, s2: 4, s3: 1, pct: 100 },
  { zona: 'Biblioteca', total: 3, s1: 3, s2: 0, s3: 0, pct: 20 },
  { zona: 'Patio Secundaria', total: 7, s1: 5, s2: 2, s3: 0, pct: 47 },
]

function heatColor(total) {
  if (total >= 12) return 'red'
  if (total >= 7) return 'orange'
  return 'green'
}

export default function Analitica() {
  return (
    <div>
      <div className="gradient-banner blue-pink">
        <div className="banner-icon">📈</div>
        <div className="banner-text">
          <div className="title">Analítica de Incidentes</div>
          <div className="subtitle">📊 Análisis de incidentes por zona y horario - Últimos 30 días</div>
        </div>
      </div>

      <div className="analitica-stats">
        <div className="analitica-stat blue">
          <div className="alabel">TOTAL INCIDENTES</div>
          <div className="aval">63</div>
          <div className="atrend">↓ 12% vs mes anterior</div>
        </div>
        <div className="analitica-stat red">
          <div className="alabel">ZONA CRÍTICA</div>
          <div className="aval">Zona Deportiva</div>
          <div className="atrend">15 incidentes</div>
        </div>
        <div className="analitica-stat yellow">
          <div className="alabel">HORA PICO</div>
          <div className="aval">10:00-11:00 AM</div>
          <div className="atrend">18 incidentes</div>
        </div>
        <div className="analitica-stat green">
          <div className="alabel">SEVERIDAD PROMEDIO</div>
          <div className="aval">S1.4</div>
          <div className="atrend">Mayormente leves</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title-row">
          <span>🔴</span>
          <h3 className="card-title">Mapa de Calor - Incidentes por Zona</h3>
        </div>
        <p className="card-subtitle">Distribución de incidentes por severidad en cada zona de supervisión</p>

        <table className="heatmap-table">
          <thead>
            <tr>
              <th>Zona</th>
              <th>Total</th>
              <th><span className="tag s1" style={{ padding: '2px 8px' }}>S1</span></th>
              <th><span className="tag s2" style={{ padding: '2px 8px' }}>S2</span></th>
              <th><span className="tag s3" style={{ padding: '2px 8px' }}>S3</span></th>
              <th>Indicador</th>
            </tr>
          </thead>
          <tbody>
            {HEATMAP.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{row.zona}</td>
                <td>
                  <span className={`heat-badge ${heatColor(row.total)}`}>{row.total}</span>
                </td>
                <td style={{ color: '#6b7280' }}>{row.s1}</td>
                <td style={{ color: '#6b7280' }}>{row.s2}</td>
                <td style={{ color: '#6b7280' }}>{row.s3}</td>
                <td>
                  <div className="heat-bar-wrap">
                    <div className={`heat-bar ${heatColor(row.total)}`} style={{ width: `${row.pct}%` }}></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}