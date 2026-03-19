import React, { createContext, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RoleSelector from './pages/RoleSelector'
import AppLayout from './components/AppLayout'
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

export const SessionContext = createContext(null)

// Usuarios predefinidos por rol (sin login — acceso directo)
const USUARIOS_POR_ROL = {
  COORDINADOR: { nombre: 'Ana García',        rol: 'COORDINADOR', color: '#22c55e' },
  PROFESOR:    { nombre: 'Carlos Rodríguez',  rol: 'PROFESOR',    color: '#3b82f6' },
  DIRECTOR:    { nombre: 'Roberto Martínez',  rol: 'DIRECTOR',    color: '#8b5cf6' },
}

export default function App() {
  const [session, setSession] = useState(null)

  // Al seleccionar rol entra directo, sin contraseña
  const login  = (rol) => setSession(USUARIOS_POR_ROL[rol])
  const logout = () => setSession(null)

  return (
    <SessionContext.Provider value={{ session, login, logout }}>
      <BrowserRouter>
        <Routes>
          {!session ? (
            <>
              <Route path="/" element={<RoleSelector onSelect={login} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : session.rol === 'COORDINADOR' ? (
            <Route path="/*" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard"      element={<CoordDashboard />} />
              <Route path="turnos"         element={<CoordTurnos />} />
              <Route path="incidentes"     element={<CoordIncidentes />} />
              <Route path="reasignaciones" element={<CoordReasignaciones />} />
              <Route path="analitica"      element={<CoordAnalitica />} />
              <Route path="metricas"       element={<CoordMetricas />} />
              <Route path="configuracion"  element={<Configuracion />} />
              <Route path="*"              element={<Navigate to="/dashboard" />} />
            </Route>
          ) : session.rol === 'PROFESOR' ? (
            <Route path="/*" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard"     element={<ProfDashboard />} />
              <Route path="turnos"        element={<ProfTurnos />} />
              <Route path="checkin"       element={<ProfCheckin />} />
              <Route path="incidentes"    element={<ProfIncidentes />} />
              <Route path="configuracion" element={<Configuracion />} />
              <Route path="*"             element={<Navigate to="/dashboard" />} />
            </Route>
          ) : (
            <Route path="/*" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard"     element={<DirDashboard />} />
              <Route path="analitica"     element={<DirAnalitica />} />
              <Route path="metricas"      element={<DirMetricas />} />
              <Route path="configuracion" element={<Configuracion />} />
              <Route path="*"             element={<Navigate to="/dashboard" />} />
            </Route>
          )}
        </Routes>s
      </BrowserRouter>
    </SessionContext.Provider>
  )
}