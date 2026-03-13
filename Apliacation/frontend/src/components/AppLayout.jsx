import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { SessionContext } from '../App'

const NAV_COORDINADOR = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/turnos', label: 'Turnos', icon: '📅' },
  { to: '/incidentes', label: 'Incidentes', icon: '⚠' },
  { to: '/reasignaciones', label: 'Reasignaciones', icon: '↻' },
  { to: '/analitica', label: 'Analítica', icon: '📊' },
  { to: '/metricas', label: 'Métricas', icon: '🏆' },
  { to: '/configuracion', label: 'Configuración', icon: '⚙' },
]

const NAV_PROFESOR = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/turnos', label: 'Turnos', icon: '📅' },
  { to: '/checkin', label: 'Check-in', icon: '✓' },
  { to: '/incidentes', label: 'Incidentes', icon: '⚠' },
  { to: '/configuracion', label: 'Configuración', icon: '⚙' },
]

const NAV_DIRECTOR = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/analitica', label: 'Analítica', icon: '📊' },
  { to: '/metricas', label: 'Métricas', icon: '🏆' },
  { to: '/configuracion', label: 'Configuración', icon: '⚙' },
]

const ROL_COLORS = {
  COORDINADOR: '#22c55e',
  PROFESOR: '#3b82f6',
  DIRECTOR: '#8b5cf6',
}

const ROL_ACTIVE_CLASS = {
  COORDINADOR: 'active',
  PROFESOR: 'active blue',
  DIRECTOR: 'active purple',
}

function getInitials(nombre) {
  return nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

export default function AppLayout() {
  const { session, logout } = useContext(SessionContext)
  const navigate = useNavigate()

  const nav = session.rol === 'COORDINADOR' ? NAV_COORDINADOR
    : session.rol === 'PROFESOR' ? NAV_PROFESOR
    : NAV_DIRECTOR

  const activeClass = ROL_ACTIVE_CLASS[session.rol]
  const avatarColor = ROL_COLORS[session.rol]
  const rolLabel = session.rol.charAt(0) + session.rol.slice(1).toLowerCase()
  const rolClass = session.rol.toLowerCase()

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const pageLabels = {
    '/dashboard': 'Dashboard',
    '/turnos': 'Turnos',
    '/checkin': 'Check-in',
    '/incidentes': 'Incidentes',
    '/reasignaciones': 'Reasignaciones',
    '/analitica': 'Analítica',
    '/metricas': 'Métricas',
    '/configuracion': 'Configuración',
  }

  const currentPath = window.location.pathname
  const pageTitle = pageLabels[currentPath] || 'Dashboard'

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">🏫</div>
          <div className="sidebar-header-text">
            <div className="title">Sistema de<br />Vigilancia</div>
            <div className="subtitle">Colegio San José</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? activeClass : ''}`
              }
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar" style={{ background: avatarColor }}>
              {getInitials(session.nombre)}
            </div>
            <div className="user-details">
              <div className="name">{session.nombre}</div>
              <div className={`role-badge ${rolClass}`}>{rolLabel}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={() => { logout(); navigate('/') }}>
            <span>↩</span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <div className="page-title">{pageTitle}</div>
            <div className="page-date">📅 {today}</div>
          </div>
          <button className="notif-btn">
            🔔
            <span className="notif-badge">3</span>
          </button>
        </div>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}