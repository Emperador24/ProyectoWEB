import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { SessionContext } from '../App'
import { notificacionesApi } from '../services/api'

const NAV_COORDINADOR = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/turnos', label: 'Turnos', icon: '📅' },
  { to: '/incidentes', label: 'Incidentes', icon: '⚠' },
  { to: '/reasignaciones', label: 'Reasignaciones', icon: '↻' },
  { to: '/analitica', label: 'Analítica', icon: '📊' },
  { to: '/metricas', label: 'Métricas', icon: '🏆' },
  { to: '/notificaciones', label: 'Notificaciones', icon: '🔔' },
  { to: '/zonas', label: 'Zonas', icon: '🏫' },
  { to: '/usuarios', label: 'Usuarios', icon: '👥' },
  { to: '/configuracion', label: 'Configuración', icon: '⚙' },
]

const NAV_PROFESOR = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/turno-activo', label: 'Mi Turno', icon: '✓' },
  { to: '/turnos', label: 'Turnos', icon: '📅' },
  { to: '/incidentes', label: 'Incidentes', icon: '⚠' },
  { to: '/notificaciones', label: 'Notificaciones', icon: '🔔' },
  { to: '/configuracion', label: 'Configuración', icon: '⚙' },
]

const NAV_DIRECTOR = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/turnos', label: 'Turnos', icon: '📅' },
  { to: '/zonas', label: 'Zonas', icon: '🏫' },
  { to: '/usuarios', label: 'Usuarios', icon: '👥' },
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

const ROL_LABEL = {
  COORDINADOR: 'Coordinador',
  PROFESOR: 'Docente',
  DIRECTOR: 'Administrador',
}

function getInitials(nombre) {
  return (nombre || '').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

const PAGE_LABELS = {
  '/dashboard': 'Dashboard',
  '/turnos': 'Turnos',
  '/turno-activo': 'Mi Turno',
  '/checkin': 'Check-in',
  '/incidentes': 'Incidentes',
  '/incidentes/nuevo': 'Nuevo Incidente',
  '/reasignaciones': 'Reasignaciones',
  '/analitica': 'Analítica',
  '/metricas': 'Métricas',
  '/notificaciones': 'Notificaciones',
  '/zonas': 'Zonas',
  '/usuarios': 'Usuarios',
  '/configuracion': 'Configuración',
}

export default function AppLayout() {
  const { session, logout } = useContext(SessionContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [noLeidas, setNoLeidas] = useState(0)

  const nav = session.rol === 'COORDINADOR' ? NAV_COORDINADOR
    : session.rol === 'PROFESOR' ? NAV_PROFESOR
    : NAV_DIRECTOR

  const activeClass = ROL_ACTIVE_CLASS[session.rol]
  const avatarColor = ROL_COLORS[session.rol]
  const rolLabel = ROL_LABEL[session.rol]
  const rolClass = session.rol.toLowerCase()

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const pageTitle = (() => {
    const path = location.pathname
    if (path.startsWith('/turnos/')) return 'Detalle de turno'
    if (path.startsWith('/zonas/')) return 'Detalle de zona'
    if (path.startsWith('/incidentes/nuevo')) return 'Nuevo Incidente'
    return PAGE_LABELS[path] || 'Dashboard'
  })()

  const recargarNoLeidas = () => {
    if (!session?.id) return
    notificacionesApi.getNoLeidas(session.id)
      .then(r => setNoLeidas((r.data || []).length))
      .catch(() => setNoLeidas(0))
  }

  useEffect(() => {
    recargarNoLeidas()
    const iv = setInterval(recargarNoLeidas, 30000)
    return () => clearInterval(iv)
  }, [session?.id])

  useEffect(() => {
    if (location.pathname === '/notificaciones') recargarNoLeidas()
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">🏫</div>
          <div className="sidebar-header-text">
            <div className="title">VigíaEscolar</div>
            <div className="subtitle">Colegio San José</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? activeClass : ''}`}
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
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <div className="page-title">{pageTitle}</div>
            <div className="page-date">📅 {today}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 12px 6px 6px',
              background: '#f9fafb',
              borderRadius: 30,
            }}>
              <span style={{
                width: 30, height: 30, borderRadius: '50%',
                background: avatarColor, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
              }}>
                {getInitials(session.nombre)}
              </span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{session.nombre}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{rolLabel}</div>
              </div>
            </div>

            <button className="notif-btn" onClick={() => navigate('/notificaciones')}>
              🔔
              {noLeidas > 0 && <span className="notif-badge">{noLeidas > 99 ? '99+' : noLeidas}</span>}
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: '8px 14px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 10,
                background: 'white',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: '#dc2626',
                fontFamily: 'inherit',
              }}
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
