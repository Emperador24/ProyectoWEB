import { NavLink } from 'react-router-dom'

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        🏫 Vigilancia<br />Docente
      </div>
      <nav>
        <div className="section-title">General</div>
        <NavLink to="/" end>🏠 Dashboard</NavLink>

        <div className="section-title">Gestión</div>
        <NavLink to="/usuarios">👤 Usuarios</NavLink>
        <NavLink to="/zonas">🗺️ Zonas</NavLink>
        <NavLink to="/checkpoints">📍 Checkpoints</NavLink>
        <NavLink to="/turnos">📅 Turnos</NavLink>

        <div className="section-title">Operación</div>
        <NavLink to="/checkins">✅ Check-ins</NavLink>
        <NavLink to="/incidentes">⚠️ Incidentes</NavLink>
        <NavLink to="/reasignaciones">🔄 Reasignaciones</NavLink>
        <NavLink to="/limpieza">🧹 Limpieza</NavLink>

        <div className="section-title">Analítica</div>
        <NavLink to="/mapa-calor">🌡️ Mapa de Calor</NavLink>
        <NavLink to="/metricas">🏆 Métricas</NavLink>
        <NavLink to="/notificaciones">🔔 Notificaciones</NavLink>
      </nav>
    </aside>
  )
}

export function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  )
}
