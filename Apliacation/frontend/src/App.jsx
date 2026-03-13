import React, { createContext, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RoleSelector from './pages/RoleSelector'
import Login from './pages/Login'
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

export default function App() {
  const [session, setSession] = useState(null)
  const [selectedRol, setSelectedRol] = useState(null)

  const login = (userData) => setSession(userData)
  const logout = () => { setSession(null); setSelectedRol(null) }

  return (
    <SessionContext.Provider value={{ session, login, logout }}>
      <BrowserRouter>
        <Routes>
          {!session ? (
            <>
              <Route path="/" element={
                !selectedRol
                  ? <RoleSelector onSelect={setSelectedRol} />
                  : <Login rol={selectedRol} onBack={() => setSelectedRol(null)} />
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : session.rol === 'COORDINADOR' ? (
            <Route path="/*" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<CoordDashboard />} />
              <Route path="turnos" element={<CoordTurnos />} />
              <Route path="incidentes" element={<CoordIncidentes />} />
              <Route path="reasignaciones" element={<CoordReasignaciones />} />
              <Route path="analitica" element={<CoordAnalitica />} />
              <Route path="metricas" element={<CoordMetricas />} />
              <Route path="configuracion" element={<Configuracion />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Route>
          ) : session.rol === 'PROFESOR' ? (
            <Route path="/*" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<ProfDashboard />} />
              <Route path="turnos" element={<ProfTurnos />} />
              <Route path="checkin" element={<ProfCheckin />} />
              <Route path="incidentes" element={<ProfIncidentes />} />
              <Route path="configuracion" element={<Configuracion />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Route>
          ) : (
            <Route path="/*" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<DirDashboard />} />
              <Route path="analitica" element={<DirAnalitica />} />
              <Route path="metricas" element={<DirMetricas />} />
              <Route path="configuracion" element={<Configuracion />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Route>
          )}
        </Routes>
      </BrowserRouter>
    </SessionContext.Provider>
  )
}