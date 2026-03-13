import { useContext, useState } from 'react'
import { SessionContext } from '../../App'

export default function ProfCheckin() {
  const { session } = useContext(SessionContext)
  const [pin, setPin] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const handleConfirm = () => {
    if (pin.length >= 4) {
      setConfirmed(true)
      setTimeout(() => setConfirmed(false), 3000)
      setPin('')
    }
  }

  return (
    <div>
      <div className="gradient-banner green">
        <div className="banner-icon">✓</div>
        <div className="banner-text">
          <div className="title">Check-in de Turno</div>
          <div className="subtitle">👋 ¡Hola {session.nombre}! Registra tu llegada usando el código QR o el PIN de zona</div>
        </div>
      </div>

      {confirmed && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 20px', fontSize: 15, color: '#166534', marginBottom: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          ✅ Check-in confirmado exitosamente
        </div>
      )}

      <div className="checkin-options">
        {/* QR */}
        <div className="checkin-option">
          <div className="checkin-icon-wrap blue">📱</div>
          <div className="checkin-opt-title">Opción 1: Escanear QR</div>
          <div className="checkin-opt-desc">
            Usa la cámara de tu dispositivo para escanear el código QR ubicado en la zona
          </div>
          <div className="qr-box">
            <div className="qr-placeholder">⬛</div>
            <div>📷 Cámara de escaneo se activará aquí</div>
          </div>
          <button className="submit-btn blue-btn" style={{ marginTop: 0 }}>
            📱 Escanear código QR
          </button>
          <div className="help-box" style={{ marginTop: 12 }}>
            💡 Consejo: El código QR está ubicado en cada zona de supervisión
          </div>
        </div>

        {/* PIN */}
        <div className="checkin-option">
          <div className="checkin-icon-wrap green">🔑</div>
          <div className="checkin-opt-title">Opción 2: Ingresar PIN</div>
          <div className="checkin-opt-desc">
            Si el QR no está disponible, usa el PIN rotativo de la zona
          </div>
          <div style={{ textAlign: 'left' }}>
            <div className="form-label" style={{ marginBottom: 10 }}>📋 PIN de zona</div>
            <input
              className="pin-input"
              type="password"
              placeholder="####"
              maxLength={6}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            />
            <button className="submit-btn green-btn" onClick={handleConfirm} style={{ marginTop: 0 }}>
              ✓ Confirmar check-in
            </button>
            <div className="help-box">
              💡 Ayuda: Si el QR no está disponible, usa el PIN de zona. Puedes solicitarlo al coordinador.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}