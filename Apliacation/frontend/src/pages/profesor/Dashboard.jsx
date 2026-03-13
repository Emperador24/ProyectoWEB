import { useEffect, useState } from 'react'
import { turnosApi, incidentesApi, zonasApi, usuariosApi, notificacionesApi } from '../../services/api'

const MOCK_ZONES = [
  { nombre: 'Patio Principal', franja: 'Recreo Mañana', docente: 'Carlos Rodríguez', checkin: '10:15 AM', estado: 'covered' },
  { nombre: 'Cafetería', franja: 'Recreo Mañana', docente: 'María López', checkin: '10:14 AM', estado: 'covered' },
  { nombre: 'Zona Deportiva', franja: 'Recreo Mañana', docente: 'Juan Pérez', checkin: '-', estado: 'warning' },
  { nombre: 'Biblioteca', franja: 'Recreo Mañana', docente: null, checkin: '-', estado: 'danger' },
  { nombre: 'Patio Secundaria', franja: 'Recreo Mañana', docente: 'Ana Martínez', checkin: '10:16 AM', estado: 'covered' },
  { nombre: 'Pasillos Norte', franja: 'Recreo Mañana', docente: 'Roberto Silva', checkin: '-', estado: 'warning' },
]

export default function CoordDashboard() {
  const [stats, setStats] = useState({ zonas: '12/15', profesores: 18, incidentes: 3, puntualidad: '94%' })
  const [zones, setZones] = useState(MOCK_ZONES)

  const statusLabel = { covered: '✓ Cubierta', warning: '⏱ Por iniciar', danger: '⚠ Sin cubrir' }
  const statusClass = { covered: 'covered', warning: 'warning', danger: 'danger' }

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-left">
            <div className="label">ZONAS CUBIERTAS</div>
            <div className="value">{stats.zonas}</div>
            <div className="trend">↗ +2 vs ayer</div>
          </div>
          <div className="stat-card-icon green">✅</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-left">
            <div className="label">PROFESORES ACTIVOS</div>
            <div className="value">{stats.profesores}</div>
            <div className="trend">↗ En turno actual</div>
          </div>
          <div className="stat-card-icon blue">👥</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-left">
            <div className="label">INCIDENTES HOY</div>
            <div className="value">{stats.incidentes}</div>
            <div className="trend">↘ -1 vs ayer</div>
          </div>
          <div className="stat-card-icon yellow">⏰</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-left">
            <div className="label">PUNTUALIDAD</div>
            <div className="value">{stats.puntualidad}</div>
            <div className="trend">↗ +3% esta semana</div>
          </div>
          <div className="stat-card-icon purple">🕐</div>
        </div>
      </div>

      {/* Tablero */}
      <div className="section-header">
        <div className="title">🖊 Tablero de Supervisión en Tiempo Real</div>
        <div className="subtitle">Estado actual de todas las zonas de supervisión</div>
      </div>

      <div className="zones-grid">
        {zones.map((z, i) => (
          <div key={i} className={`zone-card ${statusClass[z.estado]}`}>
            <div className="zone-card-header">
              <div className="zone-card-name">{z.nombre}</div>
              <div className={`zone-status ${statusClass[z.estado]}`}>{statusLabel[z.estado]}</div>
            </div>
            <div className="zone-card-franja">{z.franja}</div>
            <div className="zone-info-row">
              <span>👥</span>
              <span>{z.docente || 'No asignado'}</span>
            </div>
            <div className="zone-info-row">
              <span>🕐</span>
              <span>Check-in: <strong>{z.checkin}</strong></span>
            </div>
            <button className="reassign-btn">
              🔄 Reasignar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}