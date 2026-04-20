import { useEffect, useMemo, useState } from 'react'
import { incidentesApi, turnosApi, zonasApi } from '../../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts'
import { TIPO_INCIDENTE_LABELS, SEVERIDAD_COLORS, tipoLabel } from '../../utils/labels'

const SEV_COLOR = { S1: '#f59e0b', S2: '#f97316', S3: '#ef4444' }
const SEV_BG    = { S1: '#fef9c3', S2: '#ffedd5', S3: '#fee2e2' }
const TIPO_COLORS = {
  SEGURIDAD_FISICA: '#ef4444',
  CONVIVENCIA: '#f97316',
  USO_ESPACIO: '#f59e0b',
  OBSERVACION_SOCIAL: '#3b82f6',
  FISICO: '#ef4444',
  ESPACIO: '#f59e0b',
  SOCIAL: '#3b82f6',
}

const RANGOS = [
  { k: '7', label: 'Últimos 7 días' },
  { k: '30', label: 'Últimos 30 días' },
  { k: 'all', label: 'Todo' },
]

function enRango(fechaIso, rango) {
  if (!fechaIso) return false
  if (rango === 'all') return true
  const dias = parseInt(rango, 10)
  const hace = new Date()
  hace.setDate(hace.getDate() - dias)
  return new Date(fechaIso) >= hace
}

function colorHeatmap(pct) {
  // blanco → rojo con intensidad por % del total
  const alpha = Math.min(pct / 40, 1)
  return `rgba(239, 68, 68, ${alpha.toFixed(2)})`
}

function descargarCSV(mapa) {
  const filas = [['Zona', 'Tipo', 'Cantidad', 'Porcentaje']]
  mapa.forEach(r => {
    r.tipos.forEach(t => {
      filas.push([r.zona, t.tipo, String(t.cnt), `${t.pct}%`])
    })
  })
  const csv = filas.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mapa-calor-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Analitica() {
  const [incidentes, setIncidentes] = useState([])
  const [turnos, setTurnos] = useState([])
  const [zonas, setZonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [rango, setRango] = useState('30')

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

  const incFiltrados = useMemo(
    () => incidentes.filter(i => enRango(i.fechaHora || i.timestamp, rango)),
    [incidentes, rango]
  )

  const total = incFiltrados.length
  const tiposUnicos = Array.from(new Set(Object.keys(TIPO_INCIDENTE_LABELS).filter(t => !['FISICO', 'ESPACIO', 'SOCIAL'].includes(t))))

  const mapa = useMemo(() => {
    return zonas.map(zona => {
      const incZona = incFiltrados.filter(i => i.zona?.id === zona.id)
      const tipos = tiposUnicos.map(t => {
        const cnt = incZona.filter(i => i.tipo === t).length
        return { tipo: t, cnt, pct: total > 0 ? Math.round((cnt / total) * 100) : 0 }
      })
      return { zona: zona.nombre, total: incZona.length, tipos }
    }).sort((a, b) => b.total - a.total)
  }, [zonas, incFiltrados, total])

  const zonasCriticas = mapa.filter(r => r.total > 10).length
  const s3Urgentes = incFiltrados.filter(i => i.severidad === 'S3' && i.estado !== 'RESUELTO').length
  const diasPeriodo = rango === 'all' ? Math.max(1, Math.ceil((Date.now() - new Date(incidentes[0]?.fechaHora || Date.now()).getTime()) / 86400000) || 30) : parseInt(rango, 10)
  const promedioDiario = total > 0 ? (total / diasPeriodo).toFixed(1) : 0

  // Datos para Recharts
  const dataBar = mapa.filter(r => r.total > 0).map(r => ({ zona: r.zona, incidentes: r.total }))
  const dataPie = tiposUnicos.map(t => ({
    name: tipoLabel(t),
    value: incFiltrados.filter(i => i.tipo === t).length,
    tipo: t,
  })).filter(d => d.value > 0)

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Cargando analítica...</div>

  return (
    <div>
      <div className="gradient-banner blue-pink" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="banner-icon">📈</div>
          <div className="banner-text">
            <div className="title">Analítica Preventiva</div>
            <div className="subtitle">Mapa de calor de incidentes por zona y tipo</div>
          </div>
        </div>
        <button className="export-btn" style={{ background: 'white', color: '#8b5cf6' }} onClick={() => descargarCSV(mapa)}>
          📥 Exportar CSV
        </button>
      </div>

      {/* Filtros de rango */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {RANGOS.map(r => {
          const activo = rango === r.k
          return (
            <button
              key={r.k}
              onClick={() => setRango(r.k)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid',
                borderColor: activo ? '#8b5cf6' : '#e5e7eb',
                background: activo ? '#f3e8ff' : 'white',
                color: activo ? '#7c3aed' : '#6b7280',
              }}
            >
              {r.label}
            </button>
          )
        })}
      </div>

      {/* KPIs */}
      <div className="analitica-stats">
        <div className="analitica-stat blue">
          <div className="alabel">TOTAL INCIDENTES</div>
          <div className="aval">{total}</div>
          <div className="atrend">{turnos.length} turnos en el sistema</div>
        </div>
        <div className="analitica-stat red">
          <div className="alabel">ZONAS CRÍTICAS</div>
          <div className="aval">{zonasCriticas}</div>
          <div className="atrend">Con más de 10 incidentes</div>
        </div>
        <div className="analitica-stat yellow">
          <div className="alabel">S3 URGENTES</div>
          <div className="aval">{s3Urgentes}</div>
          <div className="atrend">Incidentes S3 pendientes</div>
        </div>
        <div className="analitica-stat green">
          <div className="alabel">PROMEDIO DIARIO</div>
          <div className="aval">{promedioDiario}</div>
          <div className="atrend">Incidentes por día</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card">
        <div className="card-title-row"><span>🔴</span><h3 className="card-title">Mapa de Calor — Zonas × Tipos</h3></div>
        <p className="card-subtitle">Intensidad por % del total. Haz clic en "Exportar CSV" para descargar los datos.</p>

        {mapa.length === 0 || total === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, color: '#9ca3af' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div style={{ fontWeight: 600 }}>Sin datos para este rango</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="heatmap-table">
              <thead>
                <tr>
                  <th>Zona</th>
                  {tiposUnicos.map(t => <th key={t}>{tipoLabel(t)}</th>)}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {mapa.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{row.zona}</td>
                    {row.tipos.map(t => (
                      <td key={t.tipo} style={{ background: colorHeatmap(t.pct), color: t.pct > 25 ? 'white' : '#1a1a2e', fontWeight: t.cnt > 0 ? 600 : 400 }}>
                        {t.cnt > 0 ? `${t.cnt} (${t.pct}%)` : '—'}
                      </td>
                    ))}
                    <td style={{ fontWeight: 800, color: '#1a1a2e' }}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Gráficos */}
      <div className="two-col">
        <div className="card">
          <div className="card-title-row"><span>📊</span><h3 className="card-title">Incidentes por zona</h3></div>
          {dataBar.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dataBar}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="zona" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="incidentes" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-title-row"><span>🥧</span><h3 className="card-title">Distribución por tipo</h3></div>
          {dataPie.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={dataPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {dataPie.map((d, i) => (
                    <Cell key={i} fill={TIPO_COLORS[d.tipo] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Incidentes S3 */}
      {incFiltrados.filter(i => i.severidad === 'S3').length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="card-title-row"><span>🚨</span><h3 className="card-title">Incidentes S3 en el periodo</h3></div>
          {incFiltrados.filter(i => i.severidad === 'S3').map(inc => {
            const c = SEVERIDAD_COLORS[inc.severidad]
            return (
              <div key={inc.id} style={{ padding: '12px 0', borderBottom: '1px solid #f9fafb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{tipoLabel(inc.tipo)}</span>
                    <span style={{ margin: '0 10px', color: '#9ca3af' }}>·</span>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>📍 {inc.zona?.nombre}</span>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: c.bg, color: c.color }}>S3</span>
                </div>
                {inc.descripcion && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>{inc.descripcion}</div>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
