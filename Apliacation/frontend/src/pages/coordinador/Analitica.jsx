import { useEffect, useState } from 'react'
import { incidentesApi, turnosApi, zonasApi } from '../../services/api'

const TIPO_LABEL = {
  SEGURIDAD_FISICA: '🩹 Seguridad física',
  CONVIVENCIA: '🤝 Convivencia',
  USO_ESPACIO: '🏫 Uso del espacio',
  OBSERVACION_SOCIAL: '👁 Observación social',
}
const SEV_COLOR = { S1: '#f59e0b', S2: '#f97316', S3: '#ef4444' }
const SEV_BG = { S1: '#fef9c3', S2: '#ffedd5', S3: '#fee2e2' }

export default function Analitica() {
  const [incidentes, setIncidentes] = useState([])
  const [turnos, setTurnos] = useState([])
  const [zonas, setZonas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      incidentesApi.getAll().catch(() => ({ data: [] })),
      turnosApi.getAll().catch(() => ({ data: [] })),
      zonasApi.getAll().catch(() => ({ data: [] })),
    ]).then(([i, t, z]) => {
      setIncidentes(i.data || [])
      setTurnos(t.data || [])
      setZonas(z.data || [])
      setLoading(false)
    })
  }, [])

  const total = incidentes.length
  const turnosTotal = turnos.length
  const turnosCubiertos = turnos.filter(t => t.estado === 'COMPLETADO' || t.estado === 'EN_CURSO').length
  const puntualidad = turnosTotal > 0 ? Math.round((turnosCubiertos / turnosTotal) * 100) : 0

  // Mapa de calor por zona
  const mapaCalor = zonas.map(zona => {
    const inc = incidentes.filter(i => i.zona?.id === zona.id)
    const s1 = inc.filter(i => i.severidad === 'S1').length
    const s2 = inc.filter(i => i.severidad === 'S2').length
    const s3 = inc.filter(i => i.severidad === 'S3').length
    const tot = inc.length
    return { zona: zona.nombre, tot, s1, s2, s3, pct: total > 0 ? Math.round((tot / total) * 100) : 0 }
  }).sort((a, b) => b.tot - a.tot)

  const maxTot = Math.max(...mapaCalor.map(r => r.tot), 1)
  const heatCls = (tot) => tot >= maxTot * 0.7 ? 'red' : tot >= maxTot * 0.35 ? 'orange' : 'green'

  // Hora pico
  const horaMap = incidentes.reduce((acc, i) => {
    if (!i.fechaHora) return acc
    const h = new Date(i.fechaHora).getHours()
    acc[h] = (acc[h] || 0) + 1; return acc
  }, {})
  const horaPico = Object.entries(horaMap).sort((a, b) => b[1] - a[1])[0]

  // Zona crítica
  const zonaCritica = mapaCalor[0]

  // Distribución por tipo
  const porTipo = Object.entries(TIPO_LABEL).map(([tipo, label]) => {
    const cnt = incidentes.filter(i => i.tipo === tipo).length
    return { tipo, label, cnt, pct: total > 0 ? Math.round((cnt / total) * 100) : 0 }
  })

  const TIPO_STYLE = {
    SEGURIDAD_FISICA: { color: '#ef4444', bg: '#fee2e2' },
    CONVIVENCIA: { color: '#f97316', bg: '#ffedd5' },
    USO_ESPACIO: { color: '#f59e0b', bg: '#fef9c3' },
    OBSERVACION_SOCIAL: { color: '#3b82f6', bg: '#dbeafe' },
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Cargando analítica...</div>

  return (
    <div>
      <div className="gradient-banner blue-pink">
        <div className="banner-icon">📈</div>
        <div className="banner-text">
          <div className="title">Analítica Preventiva</div>
          <div className="subtitle">Mapa de calor de incidentes por zona — datos reales del sistema</div>
        </div>
      </div>

      {/* Indicadores globales */}
      <div className="analitica-stats">
        <div className="analitica-stat blue">
          <div className="alabel">TOTAL INCIDENTES</div>
          <div className="aval">{total}</div>
          <div className="atrend">{turnosTotal} turnos en el sistema</div>
        </div>
        <div className="analitica-stat red">
          <div className="alabel">ZONA CRÍTICA</div>
          <div className="aval" style={{ fontSize: zonaCritica?.zona?.length > 10 ? 18 : 28 }}>{zonaCritica?.zona || '—'}</div>
          <div className="atrend">{zonaCritica?.tot || 0} incidentes totales</div>
        </div>
        <div className="analitica-stat yellow">
          <div className="alabel">HORA PICO</div>
          <div className="aval">{horaPico ? `${horaPico[0]}:00` : '—'}</div>
          <div className="atrend">{horaPico ? `${horaPico[1]} incidentes` : 'Sin datos'}</div>
        </div>
        <div className="analitica-stat green">
          <div className="alabel">PUNTUALIDAD GLOBAL</div>
          <div className="aval">{puntualidad}%</div>
          <div className="atrend">{turnosCubiertos}/{turnosTotal} turnos cubiertos</div>
        </div>
      </div>

      {/* Mapa de calor — tabla requerida por el enunciado */}
      <div className="card">
        <div className="card-title-row"><span>🔴</span><h3 className="card-title">Mapa de Calor — Incidentes por Zona</h3></div>
        <p className="card-subtitle">Tabla con porcentaje de incidentes por zona (requerido primera entrega)</p>

        {mapaCalor.length === 0 || total === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, color: '#9ca3af' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div style={{ fontWeight: 600 }}>No hay incidentes registrados aún</div>
            <div style={{ fontSize: 14, marginTop: 6 }}>Los datos del mapa de calor se poblarán al reportar incidentes</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="heatmap-table">
              <thead>
                <tr>
                  <th>Zona</th>
                  <th>Total incidentes</th>
                  <th>S1 — Leve</th>
                  <th>S2 — Moderado</th>
                  <th>S3 — Grave</th>
                  <th>% del total</th>
                  <th>Indicador visual</th>
                </tr>
              </thead>
              <tbody>
                {mapaCalor.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{row.zona}</td>
                    <td>
                      <span className={`heat-badge ${heatCls(row.tot)}`}>{row.tot}</span>
                    </td>
                    <td style={{ color: SEV_COLOR.S1, fontWeight: 500 }}>{row.s1}</td>
                    <td style={{ color: SEV_COLOR.S2, fontWeight: 500 }}>{row.s2}</td>
                    <td style={{ color: SEV_COLOR.S3, fontWeight: 700 }}>{row.s3}</td>
                    <td style={{ fontWeight: 700, color: '#1a1a2e' }}>{row.pct}%</td>
                    <td>
                      <div className="heat-bar-wrap">
                        <div className={`heat-bar ${heatCls(row.tot)}`} style={{ width: `${Math.round((row.tot / maxTot) * 100)}%` }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Distribución por tipo */}
      <div className="card">
        <div className="card-title-row"><span>📊</span><h3 className="card-title">Distribución por Tipo de Incidente</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 8 }}>
          {porTipo.map(t => {
            const style = TIPO_STYLE[t.tipo] || { color: '#6b7280', bg: '#f3f4f6' }
            return (
              <div key={t.tipo} style={{ background: style.bg, borderRadius: 16, padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: style.color, marginBottom: 10 }}>{t.label}</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: style.color }}>{t.cnt}</div>
                <div style={{ fontSize: 13, color: style.color, opacity: 0.85, marginTop: 6 }}>{t.pct}% del total</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Incidentes S3 */}
      {incidentes.filter(i => i.severidad === 'S3').length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="card-title-row"><span>🚨</span><h3 className="card-title">Incidentes Graves (S3) — Atención inmediata</h3></div>
          {incidentes.filter(i => i.severidad === 'S3').map(inc => (
            <div key={inc.id} style={{ padding: '12px 0', borderBottom: '1px solid #f9fafb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{TIPO_LABEL[inc.tipo] || inc.tipo}</span>
                  <span style={{ margin: '0 10px', color: '#9ca3af' }}>·</span>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>📍 {inc.zona?.nombre}</span>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: SEV_BG[inc.severidad], color: SEV_COLOR[inc.severidad] }}>S3 Grave</span>
              </div>
              {inc.descripcion && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>{inc.descripcion}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}