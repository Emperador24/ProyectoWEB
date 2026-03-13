import { useState } from 'react'

const WEEK_DAYS = [
  { name: 'Lunes', date: '10 de Marzo', turnos: [
    { time: '10:15-10:45', nombre: 'Carlos Rodríguez', zona: 'Patio Principal', color: 'green', esMio: true },
    { time: '10:15-10:45', nombre: 'María López', zona: 'Cafetería', color: 'green' },
  ]},
  { name: 'Martes', date: '11 de Marzo', turnos: [
    { time: '10:15-10:45', nombre: 'Ana Martínez', zona: 'Biblioteca', color: 'green' },
    { time: '13:00-13:30', nombre: 'Roberto Silva', zona: 'Patio Secundaria', color: 'blue' },
  ]},
  { name: 'Miércoles', date: '12 de Marzo', turnos: [
    { time: '10:15-10:45', nombre: 'Laura Torres', zona: 'Pasillos Norte', color: 'green' },
    { time: '13:00-13:30', nombre: 'Carlos Rodríguez', zona: 'Cafetería', color: 'blue', esMio: true },
  ]},
  { name: 'Jueves', date: '13 de Marzo', turnos: [
    { time: '10:15-10:45', nombre: 'María López', zona: 'Patio Principal', color: 'green' },
  ]},
  { name: 'Viernes', date: '14 de Marzo', turnos: [
    { time: '10:15-10:45', nombre: 'Juan Pérez', zona: 'Biblioteca', color: 'green' },
    { time: '13:00-13:30', nombre: 'Ana Martínez', zona: 'Zona Deportiva', color: 'blue' },
  ]},
]

const LEGEND = [
  { color: '#22c55e', label: 'Recreo Mañana (10:15-10:45)' },
  { color: '#3b82f6', label: 'Almuerzo (13:00-13:30)' },
  { color: '#f59e0b', label: 'Recreo Tarde (15:15-15:45)' },
  { color: '#ef4444', label: 'Sin asignar' },
]

export default function ProfTurnos() {
  return (
    <div>
      <div className="gradient-banner green" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="banner-icon">📅</div>
          <div className="banner-text">
            <div className="title">Calendario de Turnos</div>
            <div className="subtitle">📅 Semana del 10 - 14 de Marzo, 2026</div>
          </div>
        </div>
        <div className="week-nav">
          <button className="nav-arrow">‹</button>
          <button className="nav-arrow">›</button>
          <button className="export-btn">⬇ Exportar</button>
        </div>
      </div>

      <div className="week-grid">
        {WEEK_DAYS.map((day, i) => (
          <div key={i} className="day-col">
            <div className="day-name">{day.name}</div>
            <div className="day-date">📅 {day.date}</div>
            {day.turnos.map((t, j) => (
              <div key={j} className={`turno-chip ${t.color} ${t.esMio ? 'mine' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`chip-time ${t.color}`}>🕐 {t.time}</span>
                  {t.esMio && <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>⭐ Tú</span>}
                </div>
                <div className="chip-name">👤 {t.nombre}</div>
                <div className="chip-zone">📍 {t.zona}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>📋 Horarios de supervisión</div>
        <div className="legend-row">
          {LEGEND.map((l, i) => (
            <div key={i} className="legend-item">
              <div className="legend-dot" style={{ background: l.color }}></div>
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}