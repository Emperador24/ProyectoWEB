import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import Dashboard from './pages/Dashboard'
import Usuarios from './pages/Usuarios'
import Zonas from './pages/Zonas'
import Turnos from './pages/Turnos'
import Incidentes from './pages/Incidentes'
import MapaCalor from './pages/MapaCalor'
import Reasignaciones from './pages/Reasignaciones'
import { CheckIns, Limpieza, Checkpoints, Notificaciones, Metricas } from './pages/OtrasPages'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/zonas" element={<Zonas />} />
          <Route path="/checkpoints" element={<Checkpoints />} />
          <Route path="/turnos" element={<Turnos />} />
          <Route path="/checkins" element={<CheckIns />} />
          <Route path="/incidentes" element={<Incidentes />} />
          <Route path="/reasignaciones" element={<Reasignaciones />} />
          <Route path="/limpieza" element={<Limpieza />} />
          <Route path="/mapa-calor" element={<MapaCalor />} />
          <Route path="/metricas" element={<Metricas />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
