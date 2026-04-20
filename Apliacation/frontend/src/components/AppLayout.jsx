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
  const { session, usuarios, activeUser, setActiveUser } = useContext(SessionContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [noLeidas, setNoLeidas] = useState(0)
  const [mostrarSelector, setMostrarSelector] = useState(false)

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
    if (!activeUser?.id) return
    notificacionesApi.getNoLeidas(activeUser.id)
      .then(r => setNoLeidas((r.data || []).length))
      .catch(() => setNoLeidas(0))
  }

  useEffect(() => {
    recargarNoLeidas()
    const iv = setInterval(recargarNoLeidas, 30000)
    return () => clearInterval(iv)
  }, [activeUser?.id])

  // Refrescar al volver a la topbar desde la página de notificaciones
  useEffect(() => {
    if (location.pathname === '/notificaciones') recargarNoLeidas()
  }, [location.pathname])

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

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Selector de usuario (simulación de sesión) */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMostrarSelector(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 12px 6px 6px',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 30,
                  background: 'white',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
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
                <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 4 }}>▼</span>
              </button>

              {mostrarSelector && (
                <>
                  <div
                    onClick={() => setMostrarSelector(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                  />
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'white', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                    minWidth: 280, maxHeight: 420, overflow: 'auto',
                    border: '1px solid #f3f4f6', zIndex: 100,
                  }}>
                    <div style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      Simular usuario
                    </div>
                    {usuarios.map(u => {
                      const rolFe = u.rol === 'DOCENTE' ? 'PROFESOR'
                        : u.rol === 'ADMIN' || u.rol === 'ADMINISTRADOR' ? 'DIRECTOR'
                        : 'COORDINADOR'
                      const colorRol = ROL_COLORS[rolFe]
                      const seleccionado = u.id === activeUser.id
                      const nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.trim() || u.nombre
                      return (
                        <div
                          key={u.id}
                          onClick={() => { setActiveUser(u); setMostrarSelector(false); navigate('/dashboard') }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 16px', cursor: 'pointer',
                            background: seleccionado ? '#f9fafb' : 'white',
                            borderTop: '1px solid #f9fafb',
                          }}
                          onMouseEnter={e => { if (!seleccionado) e.currentTarget.style.background = '#f9fafb' }}
                          onMouseLeave={e => { if (!seleccionado) e.currentTarget.style.background = 'white' }}
                        >
                          <span style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: colorRol, color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, flexShrink: 0,
                          }}>
                            {getInitials(nombreCompleto)}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {nombreCompleto}
                            </div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>
                              {ROL_LABEL[rolFe]} {u.email ? `· ${u.email}` : ''}
                            </div>
                          </div>
                          {seleccionado && <span style={{ color: '#22c55e', fontSize: 14 }}>✓</span>}
                        </div>
                      )
                    })}
                    {usuarios.length === 0 && (
                      <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                        Sin usuarios
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <button className="notif-btn" onClick={() => navigate('/notificaciones')}>
              🔔
              {noLeidas > 0 && <span className="notif-badge">{noLeidas > 99 ? '99+' : noLeidas}</span>}
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
