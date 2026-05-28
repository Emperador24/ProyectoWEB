import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'

import CoordDashboard from './pages/coordinador/Dashboard'
import CoordTurnos from './pages/coordinador/Turnos'
import CoordIncidentes from './pages/coordinador/Incidentes'
import CoordReasignaciones from './pages/coordinador/Reasignaciones'
import CoordAnalitica from './pages/coordinador/Analitica'
import CoordMetricas from './pages/coordinador/Metricas'
import ProfDashboard from './pages/profesor/Dashboard'
import ProfTurnos from './pages/profesor/Turnos'
import ProfCheckin from './pages/profesor/Checkin'
import ProfIncidentes from './pages/profesor/Incidentes'
import DirDashboard from './pages/director/Dashboard'
import DirAnalitica from './pages/director/Analitica'
import DirMetricas from './pages/director/Metricas'
import Configuracion from './pages/Configuracion'
import TurnoActivo from './pages/TurnoActivo'
import TurnoDetalle from './pages/TurnoDetalle'
import IncidenteNuevo from './pages/IncidenteNuevo'
import Notificaciones from './pages/Notificaciones'
import Zonas from './pages/Zonas'
import ZonaDetalle from './pages/ZonaDetalle'
import Usuarios from './pages/Usuarios'

export const SessionContext = createContext(null)

function rolFrontend(backendRol) {
  if (backendRol === 'DOCENTE') return 'PROFESOR'
  if (backendRol === 'ADMIN' || backendRol === 'ADMINISTRADOR') return 'DIRECTOR'
  return 'COORDINADOR'
}

export default function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [cargando, setCargando] = useState(false)

  const login = useCallback((token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const value = useMemo(() => {
    if (!user) return { session: null, login, logout, user: null, activeUser: null }
    const session = {
      ...user,
      id: user.id,
      rol: rolFrontend(user.rol),
      rolBackend: user.rol,
      nombre: user.nombre,
    }
    return {
      session,
      activeUser: user,
      activeRole: session.rol,
      login,
      logout,
      user,
    }
  }, [user, login, logout])

  const isAuth = !!user

  if (cargando) {
    return <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af', fontSize: 16 }}>Cargando...</div>
  }

  if (!isAuth) {
    return (
      <SessionContext.Provider value={value}>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </SessionContext.Provider>
    )
  }

  const rol = value.session.rol

  return (
    <SessionContext.Provider value={value}>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" />} />

            <Route path="configuracion"   element={<Configuracion />} />
            <Route path="notificaciones"  element={<Notificaciones />} />
            <Route path="turnos/:id"      element={<TurnoDetalle />} />
            <Route path="incidentes/nuevo" element={<IncidenteNuevo />} />

            {rol === 'COORDINADOR' && (
              <>
                <Route path="zonas"       element={<Zonas />} />
                <Route path="zonas/:id"   element={<ZonaDetalle />} />
              </>
            )}

            {rol === 'DIRECTOR' && (
              <>
                <Route path="zonas"       element={<Zonas />} />
                <Route path="zonas/:id"   element={<ZonaDetalle />} />
                <Route path="usuarios"    element={<Usuarios />} />
              </>
            )}

            {rol === 'COORDINADOR' && (
              <>
                <Route path="dashboard"      element={<CoordDashboard />} />
                <Route path="turnos"         element={<CoordTurnos />} />
                <Route path="incidentes"     element={<CoordIncidentes />} />
                <Route path="reasignaciones" element={<CoordReasignaciones />} />
                <Route path="analitica"      element={<CoordAnalitica />} />
                <Route path="metricas"       element={<CoordMetricas />} />
              </>
            )}

            {rol === 'PROFESOR' && (
              <>
                <Route path="dashboard"     element={<ProfDashboard />} />
                <Route path="turnos"        element={<ProfTurnos />} />
                <Route path="turno-activo"  element={<TurnoActivo />} />
                <Route path="checkin"       element={<ProfCheckin />} />
                <Route path="incidentes"    element={<ProfIncidentes />} />
              </>
            )}

            {rol === 'DIRECTOR' && (
              <>
                <Route path="dashboard"  element={<DirDashboard />} />
                <Route path="turnos"     element={<CoordTurnos />} />
                <Route path="analitica"  element={<DirAnalitica />} />
                <Route path="metricas"   element={<DirMetricas />} />
              </>
            )}

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionContext.Provider>
  )
}
