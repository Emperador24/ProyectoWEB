import { useState, useContext } from 'react'
import { SessionContext } from '../App'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'

const ROLES = [
  { key: 'DOCENTE', label: 'Docente', icon: '🎓', iconClass: 'blue', placeholder: 'tu.correo@colegio.edu' },
  { key: 'COORDINADOR', label: 'Coordinador', icon: '🏫', iconClass: 'green', placeholder: 'coordinador@colegio.edu' },
  { key: 'ADMIN', label: 'Administrador', icon: '👤', iconClass: 'purple', placeholder: 'admin@colegio.edu' },
]

export default function Login() {
  const { login } = useContext(SessionContext)
  const navigate = useNavigate()
  const [step, setStep] = useState('rol')
  const [selectedRol, setSelectedRol] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSelectRol = rol => {
    setSelectedRol(rol)
    setStep('login')
    setError('')
    const defaults = {
      DOCENTE: { email: 'carlos.rodriguez@colegio.edu', password: 'doc123' },
      COORDINADOR: { email: 'ana.garcia@colegio.edu', password: 'coord123' },
      ADMIN: { email: 'admin@colegio.edu', password: 'admin123' },
    }
    setEmail(defaults[rol.key]?.email || '')
    setPassword(defaults[rol.key]?.password || '')
  }

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      const { token, usuario } = res.data
      login(token, usuario)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'rol') {
    return (
      <div className="login-page">
        <div className="login-top">
          <div className="login-top-icon">🏫</div>
          <h1>Sistema de Vigilancia Docente</h1>
          <p>Colegio San José - Gestión de Supervisión Escolar</p>
        </div>
        <div className="role-selector">
          <h2>Selecciona tu rol</h2>
          <p className="login-sub">Elige el perfil con el que deseas ingresar</p>
          <div className="role-cards">
            {ROLES.map(rol => (
              <div
                key={rol.key}
                className={`role-card ${rol.iconClass}`}
                onClick={() => handleSelectRol(rol)}
              >
                <div className="role-icon">{rol.icon}</div>
                <div className="role-name">{rol.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const cfg = ROLES.find(r => r.key === selectedRol.key)

  return (
    <div className="login-page">
      <div className="login-top">
        <div className="login-top-icon">🏫</div>
        <h1>Sistema de Vigilancia Docente</h1>
        <p>Colegio San José - Gestión de Supervisión Escolar</p>
      </div>

      <div className="login-card">
        <div className={`login-role-icon ${cfg.iconClass}`} style={{ textAlign: 'center' }}>
          {cfg.icon}
        </div>

        <h2>Iniciar como {cfg.label}</h2>
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
            onKeyDown={e => e.key === 'Enter' && !loading && handleLogin()}
          />
        </div>

        <div className="login-btns">
          <button className="back-btn" onClick={() => setStep('rol')}>Cambiar rol</button>
          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </div>
    </div>
  )
}
