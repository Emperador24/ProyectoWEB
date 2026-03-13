import { useEffect, useState } from 'react'
import { mapaCalorApi, zonasApi, incidentesApi } from '../services/api'

export default function MapaCalor() {
  const [data, setData] = useState([])
  const [zonas, setZonas] = useState([])
  const [tabla, setTabla] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([mapaCalorApi.getAll(), zonasApi.getAll(), incidentesApi.getAll()])
      .then(([mc, z, inc]) => {
        setData(mc.data); setZonas(z.data)

        // Calcular tabla de incidentes por zona
        const tipos = ['FISICO', 'CONVIVENCIA', 'ESPACIO', 'SOCIAL']
        const rows = z.data.map(zona => {
          const row = { zona: zona.nombre, total: 0 }
          tipos.forEach(t => {
            const count = inc.data.filter(i => i.zona?.id === zona.id && i.tipo === t).length
            row[t] = count
            row.total += count
          })
          return row
        })
        const total = rows.reduce((s, r) => s + r.total, 0)
        rows.forEach(r => { r.porcentaje = total > 0 ? ((r.total / total) * 100).toFixed(1) : '0.0' })
        setTabla(rows)
        setLoading(false)
      })
  }, [])

  const heatClass = (val) => {
    if (val === 0) return 'heat-0'
    if (val <= 1) return 'heat-1'
    if (val <= 3) return 'heat-2'
    return 'heat-3'
  }

  return (
    <div>
      <h1 className="page-title">🌡️ Mapa de Calor</h1>
      <p className="page-subtitle">Distribución de incidentes por zona y tipo</p>

      {loading ? <div className="loading">Cargando…</div> : (
        <>
          <div className="card">
            <div className="card-title">Incidentes por zona y tipo</div>
            <div className="table-wrap">
              <table className="heatmap-table">
                <thead>
                  <tr>
                    <th>Zona</th>
                    <th>🩹 Físico</th>
                    <th>🤝 Convivencia</th>
                    <th>🪑 Espacio</th>
                    <th>👥 Social</th>
                    <th>Total</th>
                    <th>% del total</th>
                  </tr>
                </thead>
                <tbody>
                  {tabla.map(r => (
                    <tr key={r.zona}>
                      <td style={{ textAlign: 'left', fontWeight: 600 }}>{r.zona}</td>
                      <td className={heatClass(r.FISICO)}>{r.FISICO}</td>
                      <td className={heatClass(r.CONVIVENCIA)}>{r.CONVIVENCIA}</td>
                      <td className={heatClass(r.ESPACIO)}>{r.ESPACIO}</td>
                      <td className={heatClass(r.SOCIAL)}>{r.SOCIAL}</td>
                      <td style={{ fontWeight: 700 }}>{r.total}</td>
                      <td>{r.porcentaje}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Leyenda</div>
            <div style={{ display: 'flex', gap: 20 }}>
              {[['heat-0', 'Sin incidentes'], ['heat-1', '1 incidente'], ['heat-2', '2–3 incidentes'], ['heat-3', '4+ incidentes']].map(([cls, lbl]) => (
                <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <div className={`badge ${cls}`} style={{ width: 24, height: 24, borderRadius: 4, display: 'inline-block' }}></div>
                  {lbl}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Registros analíticos por semana</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Zona</th><th>Franja</th><th>Tipo</th><th>Total</th><th>Porcentaje</th><th>Semana</th></tr></thead>
                <tbody>
                  {data.map(mc => (
                    <tr key={mc.id}>
                      <td>{mc.zona?.nombre || '—'}</td>
                      <td><span className={`badge badge-${mc.franja === 'RECREO' ? 'blue' : 'purple'}`}>{mc.franja}</span></td>
                      <td>{mc.tipoIncidente}</td>
                      <td>{mc.totalIncidentes}</td>
                      <td>{mc.porcentaje}%</td>
                      <td>{mc.semana}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
