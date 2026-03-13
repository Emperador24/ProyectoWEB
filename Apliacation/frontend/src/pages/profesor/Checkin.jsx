import { useContext, useEffect, useState } from 'react'
import { SessionContext } from '../../App'
import { checkinsApi, turnosApi, checkpointsApi } from '../../services/api'

export default function ProfCheckin() {
  const { session } = useContext(SessionContext)
  const [pin, setPin] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [turnoActivo, setTurnoActivo] = useState(null)
  const [checkpoints, setCheckpoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const hoy = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    Promise.all([
      turnosApi.getAll().catch(() => ({ data: [] })),
      checkpointsApi.getAll().catch(() => ({ data: [] })),
    ]).then(([t, cp]) => {
      const turnos = t.data || []
      const miTurno = turnos.find(t =>
        t.fecha?.slice(0, 10) === hoy && (t.estado === 'PENDIENTE' || t.estado === 'EN_CURSO')
      )
      setTurnoActivo(miTurno || null)
      setCheckpoints(cp.data || [])
      setLoading(false)
    })
  }, [])

  const registrarCheckin = async (metodo, checkpointId = null, esRecorrido = false) => {
    if (!turnoActivo) { setError('No tienes un turno activo en este momento'); return }
    setProcesando(true); setError(null)
    try {
      await checkinsApi.create({
        turno: { id: turnoActivo.id },
        checkpoint: checkpointId ? { id: checkpointId } : null,
        metodo,
        esRecorrido,
      })
      if (!esRecorrido && turnoActivo.estado === 'PENDIENTE') {
        await turnosApi.cambiarEstado(turnoActivo.id, 'EN_CURSO')
        setTurnoActivo({ ...turnoActivo, estado: 'EN_CURSO' })
      }
      setConfirmed(true)
      setPin('')
      setTimeout(() => setConfirmed(false), 5000)
    } catch {
      setError('Error al registrar. Verifica que el backend está activo.')
    }
    setProcesando(false)
  }

  const handlePin = async () => {
    if (pin.length < 4) { setError('El PIN debe tener al menos 4 caracteres'); return }
    const cp = checkpoints.find(c => c.codigoQR === pin)
    await registrarCheckin('PIN', cp?.id)
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Cargando...</div>

  return (
    <div>
      <div className="gradient-banner green">
        <div className="banner-icon">✓</div>
        <div className="banner-text">
          <div className="title">Check-in de Turno</div>
          <div className="subtitle">👋 ¡Hola, {session?.nombre}! Registra tu llegada al punto de supervisión</div>
        </div>
      </div>

      {confirmed && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 14, padding: '16px 20px', fontSize: 15, color: '#166534', marginBottom: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
          ✅ Check-in confirmado — el tablero del coordinador refleja tu zona como cubierta (verde)
        </div>
      )}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 14, padding: '16px 20px', fontSize: 14, color: '#dc2626', marginBottom: 20 }}>
          ❌ {error}
        </div>
      )}

      {/* Turno activo */}
      {turnoActivo ? (
        <div className="card" style={{ marginBottom: 20, border: '2px solid #22c55e', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>📋 Turno activo</div>
              <div style={{ fontSize: 15, marginTop: 6 }}>📍 Zona: <strong>{turnoActivo.zona?.nombre}</strong></div>
              <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                Franja: {turnoActivo.franja?.replace(/_/g, ' ')}
              </div>
            </div>
            <span style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, background: turnoActivo.estado === 'EN_CURSO' ? '#dcfce7' : '#fef9c3', color: turnoActivo.estado === 'EN_CURSO' ? '#16a34a' : '#a16207' }}>
              {turnoActivo.estado}
            </span>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 40, marginBottom: 20, color: '#9ca3af' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>ℹ️</div>
          <div style={{ fontWeight: 600 }}>No tienes turno pendiente o en curso para hoy</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>Consulta el calendario de turnos con el coordinador</div>
        </div>
      )}

      <div className="checkin-options">
        {/* Opción QR */}
        <div className="checkin-option">
          <div className="checkin-icon-wrap blue">📱</div>
          <div className="checkin-opt-title">Opción 1 — Escanear QR</div>
          <div className="checkin-opt-desc">Usa la cámara para escanear el código QR fijo en la zona asignada</div>
          <div className="qr-box">
            <div style={{ fontSize: 60, marginBottom: 10 }}>⬛</div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>📷 Cámara de escaneo</div>
          </div>
          <button className="submit-btn blue-btn" style={{ marginTop: 0 }}
            disabled={!turnoActivo || procesando}
            onClick={() => registrarCheckin('QR')}>
            {procesando ? 'Registrando...' : '📱 Confirmar check-in por QR'}
          </button>
          <div className="help-box" style={{ marginTop: 12 }}>
            💡 El código QR está ubicado físicamente en cada punto de supervisión
          </div>
        </div>

        {/* Opción PIN */}
        <div className="checkin-option">
          <div className="checkin-icon-wrap green">🔑</div>
          <div className="checkin-opt-title">Opción 2 — PIN de zona</div>
          <div className="checkin-opt-desc">Ingresa el PIN rotativo si el QR no está disponible</div>

          <div style={{ textAlign: 'left' }}>
            <div className="form-label" style={{ marginBottom: 10 }}>📋 Ingresa el PIN</div>
            <input className="pin-input" type="tel" placeholder="Ej: 4821" maxLength={6}
              value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} />
            <button className="submit-btn green-btn"
              disabled={!turnoActivo || procesando || pin.length < 4}
              onClick={handlePin}>
              {procesando ? 'Verificando...' : '✓ Confirmar con PIN'}
            </button>
            <div className="help-box">💡 El PIN rotativo lo suministra el coordinador. Cambia cada turno.</div>
          </div>

          {/* Checkpoints de recorrido */}
          {checkpoints.length > 0 && turnoActivo && (
            <div style={{ marginTop: 24 }}>
              <div className="form-label" style={{ marginBottom: 10 }}>📍 Registrar recorrido activo</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {checkpoints
                  .filter(cp => !cp.zona?.id || cp.zona?.id === turnoActivo?.zona?.id)
                  .map(cp => (
                    <button key={cp.id}
                      style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 500 }}
                      disabled={procesando}
                      onClick={() => registrarCheckin('QR', cp.id, true)}>
                      📍 {cp.nombre}
                    </button>
                  ))}
              </div>
              <div className="help-box" style={{ marginTop: 10 }}>
                💡 Registra tu recorrido en cada checkpoint para validar vigilancia activa
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}