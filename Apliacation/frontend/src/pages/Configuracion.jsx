import { useContext, useState } from 'react'
import { SessionContext } from '../App'

export default function Configuracion() {
  const { session } = useContext(SessionContext)
  const [nombre, setNombre] = useState(session?.nombre?.split(' ')[0] || '')
  const [apellido, setApellido] = useState(session?.nombre?.split(' ').slice(1).join(' ') || '')
  const [email, setEmail] = useState(session?.rol === 'COORDINADOR' ? 'ana.garcia@escuela.edu'
    : session?.rol === 'PROFESOR' ? 'carlos.rodriguez@escuela.edu'
    : 'roberto.martinez@escuela.edu')
  const [telefono, setTelefono] = useState('+34 612 345 678')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <div className="gradient-banner purple-blue">
        <div className="banner-icon">⚙</div>
        <div className="banner-text">
          <div className="title">Configuración del Sistema</div>
          <div className="subtitle">⚙ Personaliza tu experiencia y gestiona tus preferencias</div>
        </div>
      </div>

      {saved && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#166534', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          ✅ Cambios guardados exitosamente
        </div>
      )}

      {/* Perfil */}
      <div className="card">
        <div className="card-title-row">
          <span>👤</span>
          <div>
            <h3 className="card-title">Información del Perfil</h3>
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>Actualiza tu información personal</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 20, marginTop: 4 }}>
          <div className="config-field-row">
            <div>
              <div className="config-label">Nombre</div>
              <input className="form-input" value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
            <div>
              <div className="config-label">Apellido</div>
              <input className="form-input" value={apellido} onChange={e => setApellido(e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div className="config-label">Correo electrónico</div>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div className="config-label">Teléfono</div>
            <input className="form-input" value={telefono} onChange={e => setTelefono(e.target.value)} />
          </div>
          <button className="save-btn" onClick={handleSave}>
            💾 Guardar cambios
          </button>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="card">
        <div className="card-title-row">
          <span>🔔</span>
          <div>
            <h3 className="card-title">Notificaciones</h3>
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>Configura cómo quieres recibir notificaciones</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 20, marginTop: 4 }}>
          {[
            { label: 'Alertas de zonas sin cobertura', desc: 'Recibe notificaciones cuando una zona quede sin supervisión' },
            { label: 'Recordatorios de turno', desc: 'Avisos 10 y 5 minutos antes del inicio de tu turno' },
            { label: 'Incidentes graves (S3)', desc: 'Notificación inmediata para incidentes de nivel S3' },
          ].map((n, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, marginBottom: 16, borderBottom: i < 2 ? '1px solid #f9fafb' : 'none' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{n.label}</div>
                <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>{n.desc}</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, flexShrink: 0, marginLeft: 16 }}>
                <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{
                  position: 'absolute', cursor: 'pointer', inset: 0,
                  background: '#22c55e', borderRadius: 24, transition: '0.2s'
                }}>
                  <span style={{
                    position: 'absolute', left: 22, top: 3,
                    width: 18, height: 18, background: 'white', borderRadius: '50%'
                  }}></span>
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Apariencia */}
      <div className="card">
        <div className="card-title-row">
          <span>🎨</span>
          <div>
            <h3 className="card-title">Apariencia</h3>
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>Personaliza el aspecto visual de la aplicación</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 20, marginTop: 4 }}>
          <div className="config-label" style={{ marginBottom: 12 }}>Tema de color</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'].map(c => (
              <div key={c} style={{ width: 36, height: 36, borderRadius: '50%', background: c, cursor: 'pointer', border: c === '#22c55e' ? '3px solid #1a1a2e' : '3px solid transparent', transition: 'border 0.15s' }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}