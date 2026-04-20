import React, { createContext, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { usuariosApi } from './services/api'

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

// Normaliza el rol que viene del backend (DOCENTE/COORDINADOR/ADMIN)
// al rol que usa el frontend existente (PROFESOR/COORDINADOR/DIRECTOR).
function rolFrontend(backendRol) {
  if (backendRol === 'DOCENTE') return 'PROFESOR'
  if (backendRol === 'ADMIN' || backendRol === 'ADMINISTRADOR') return 'DIRECTOR'
  return 'COORDINADOR'
}

export default function App() {
  const [usuarios, setUsuarios] = useState([])
  const [activeUser, setActiveUser] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    usuariosApi.getAll()
      .then(r => {
        const list = r.data || []
        setUsuarios(list)
        if (list.length > 0) setActiveUser(list[0])
      })
      .catch(() => setUsuarios([]))
      .finally(() => setCargando(false))
  }, [])

  const value = useMemo(() => {
    const session = activeUser ? {
      ...activeUser,
      // Alias para que las páginas existentes sigan leyendo session.rol/nombre
      rol: rolFrontend(activeUser.rol),
      rolBackend: activeUser.rol,
      nombre: `${activeUser.nombre || ''} ${activeUser.apellido || ''}`.trim() || activeUser.nombre,
    } : null
    return {
      session,
      activeUser,
      setActiveUser,
      usuarios,
      activeRole: session?.rol || null,
    }
  }, [activeUser, usuarios])

  if (cargando) {
    return <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af', fontSize: 16 }}>Cargando usuarios...</div>
  }

  if (!activeUser) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#dc2626' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>No hay usuarios disponibles en el backend</div>
        <div style={{ fontSize: 14, marginTop: 8, color: '#6b7280' }}>
          Verifica que el backend esté corriendo en http://localhost:8080 y que existan usuarios en /api/usuarios
        </div>
      </div>
    )
  }

  const rol = value.session.rol

  return (
    <SessionContext.Provider value={value}>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" />} />

            {/* Rutas compartidas */}
            <Route path="configuracion"   element={<Configuracion />} />
            <Route path="notificaciones"  element={<Notificaciones />} />
            <Route path="turnos/:id"      element={<TurnoDetalle />} />
            <Route path="incidentes/nuevo" element={<IncidenteNuevo />} />
            <Route path="zonas"           element={<Zonas />} />
            <Route path="zonas/:id"       element={<ZonaDetalle />} />
            <Route path="usuarios"        element={<Usuarios />} />

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
