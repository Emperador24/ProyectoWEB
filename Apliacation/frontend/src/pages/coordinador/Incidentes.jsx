import { useState } from 'react'

const MOCK_INCIDENTES = [
  { id: 1, sev: 'S2', estado: 'Resuelto', titulo: 'Conflicto entre estudiantes', zona: 'Patio Principal', reportado: 'Carlos Rodríguez', hora: '10:25 AM' },
  { id: 2, sev: 'S1', estado: 'Pendiente', titulo: 'Accidente menor', zona: 'Zona Deportiva', reportado: 'María López', hora: '13:15 PM' },
  { id: 3, sev: 'S2', estado: 'Resuelto', titulo: 'Comportamiento inapropiado', zona: 'Cafetería', reportado: 'Ana Martínez', hora: '11:40 AM' },
  { id: 4, sev: 'S3', estado: 'Pendiente', titulo: 'Pelea entre alumnos', zona: 'Patio Principal', reportado: 'Roberto Silva', hora: '14:05 PM' },
]

const TIPOS = ['Físico', 'Convivencia', 'Uso del espacio', 'Observación social']
const ZONAS = ['Patio Principal', 'Cafetería', 'Zona Deportiva', 'Biblioteca', 'Patio Secundaria', 'Pasillos Norte']

export default function CoordIncidentes() {
  const [tipo, setTipo] = useState('')
  const [zona, setZona] = useState('')
  const [sev, setSev] = useState('')
  const [desc, setDesc] = useState('')
  const [incidentes] = useState(MOCK_INCIDENTES)

  return (
    <div>
      <div className="gradient-banner orange">
        <div className="banner-icon">⚠</div>
        <div className="banner-text">
          <div className="title">Registro de Incidentes</div>
          <div className="subtitle">Reporta cualquier situación que requiera atención inmediata para garantizar la seguridad escolar</div>
        </div>
      </div>

      <div className="two-col">
        {/* Formulario */}
        <div className="card">
          <div className="card-title-row">
            <span>📤</span>
            <h3 className="card-title">Nuevo Reporte</h3>
          </div>
          <p className="card-subtitle">Completa el formulario para reportar un incidente</p>

          <div className="form-field">
            <div className="form-label">🏷 Tipo de incidente</div>
            <select className="form-select" value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="">Selecciona el tipo</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-field">
            <div className="form-label">📍 Zona</div>
            <select className="form-select" value={zona} onChange={e => setZona(e.target.value)}>
              <option value="">Selecciona la zona</option>
              {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          <div className="form-field">
            <div className="form-label">🔴 Nivel de severidad</div>
            <div className="severity-grid">
              {['S1', 'S2', 'S3'].map(s => (
                <button key={s} className={`sev-btn ${sev === s ? 'active' : ''}`} onClick={() => setSev(s)}>
                  <div className="sev-code">{s}</div>
                  <div className="sev-label">{s === 'S1' ? 'Leve' : s === 'S2' ? 'Moderado' : 'Grave'}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <div className="form-label">💬 Descripción del incidente</div>
            <textarea
              className="form-textarea"
              placeholder="Describe lo que ocurrió con el mayor detalle posible..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          <button className="submit-btn">
            📤 Enviar reporte
          </button>
        </div>

        {/* Lista */}
        <div className="card">
          <div className="card-title-row">
            <span>📋</span>
            <h3 className="card-title">Incidentes Recientes</h3>
          </div>
          <p className="card-subtitle">Últimos reportes del sistema</p>

          {incidentes.map(inc => (
            <div key={inc.id} className="incident-card">
              <div className="incident-tags">
                <span className={`tag ${inc.sev.toLowerCase()}`}>{inc.sev}</span>
                <span className={`tag ${inc.estado === 'Resuelto' ? 'resolved' : 'pending'}`}>
                  {inc.estado === 'Resuelto' ? '✓ Resuelto' : '⏱ Pendiente'}
                </span>
              </div>
              <div className="incident-title">{inc.titulo}</div>
              <div className="incident-zone">📍 {inc.zona}</div>
              <div className="incident-meta">
                <span>👤 Reportado por: <strong>{inc.reportado}</strong></span>
                <span>🕐 {inc.hora}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}