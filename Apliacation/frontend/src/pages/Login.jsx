import { useState, useContext } from 'react'
import { SessionContext } from '../App'
import { useNavigate } from 'react-router-dom'

const CREDS = {
  COORDINADOR: { email: 'ana.garcia@escuela.edu', password: 'coord123', nombre: 'Ana García', color: '#22c55e' },
  PROFESOR:    { email: 'carlos.rodriguez@escuela.edu', password: 'doc123', nombre: 'Carlos Rodríguez', color: '#3b82f6' },
  DIRECTOR:    { email: 'roberto.martinez@escuela.edu', password: 'dir123', nombre: 'Roberto Martínez', color: '#8b5cf6' },
}

const ROL_CONFIG = {
  COORDINADOR: { icon: '🏫', iconClass: 'green', placeholder: 'ana.garcia@escuela.edu' },
  PROFESOR:    { icon: '🎓', iconClass: 'blue',  placeholder: 'carlos.rodriguez@escuela.edu' },
  DIRECTOR:    { icon: '👤', iconClass: 'purple', placeholder: 'roberto.martinez@escuela.edu' },
}

const ROL_LABEL = { COORDINADOR: 'Coordinador', PROFESOR: 'Profesor', DIRECTOR: 'Director' }

export default function Login({ rol, onBack }) {
  const { login } = useContext(SessionContext)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const cfg = ROL_CONFIG[rol]
  const cred = CREDS[rol]

  const handleLogin = () => {
    if (email === cred.email && password === cred.password) {
      login({ rol, nombre: cred.nombre, color: cred.color })
      navigate('/dashboard')
    } else {
      setError('Credenciales incorrectas. Intenta de nuevo.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-top">
        <div className="login-top-icon">🏫</div>
        <h1>Sistema de Vigilancia Docente</h1>
        <p>🏫 Colegio San José - Gestión de Supervisión Escolar</p>
      </div>

      <div className="login-card">
        <div className={`login-role-icon ${cfg.iconClass}`} style={{ textAlign: 'center' }}>
          {cfg.icon}
        </div>

        <h2>Iniciar como {ROL_LABEL[rol]}</h2>
        <p className="login-sub">Ingresa tus credenciales para continuar</p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#374151' }}>
          Correo electrónico
        </div>
        <div className="input-wrap">
          <span className="input-icon">👤</span>
          <input
            className="login-input"
            type="email"
            placeholder={cfg.placeholder}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 6, marginTop: 8, fontSize: 13, fontWeight: 500, color: '#374151' }}>
          Contraseña
        </div>
        <div className="input-wrap">
          <span className="input-icon">🔒</span>
          <input
            className="login-input"
            type="password"
            placeholder="••••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#166534', marginTop: 12 }}>
          💡 <strong>Credenciales de demo:</strong> {cred.email} / {cred.password}
        </div>

        <div className="login-btns">
          <button className="back-btn" onClick={onBack}>Cambiar rol</button>
          <button className="login-btn" onClick={handleLogin}>Ingresar</button>
        </div>
      </div>
    </div>
  )
}