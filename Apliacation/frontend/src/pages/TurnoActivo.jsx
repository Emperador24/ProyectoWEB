import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SessionContext } from '../App'
import {
  turnosApi, checkinsApi, checkpointsApi, limpiezaApi,
} from '../services/api'
import ReassignDialog from '../components/ReassignDialog'
import { ESTADO_TURNO_COLORS, estadoTurnoLabel, franjaHoras, franjaLabel } from '../utils/labels'
import { horaCorta } from '../utils/tiempo'

const ESCALA = [
  { v: 'LIMPIO', label: '1 · Muy limpio', color: '#22c55e' },
  { v: 'ALGO_BASURA', label: '2 · Algo de basura', color: '#eab308' },
  { v: 'MUCHA_BASURA', label: '3 · Mucha basura', color: '#f97316' },
  { v: 'CRITICO', label: '4 · Crítico', color: '#ef4444' },
]

export default function TurnoActivo() {
  const { activeUser } = useContext(SessionContext)
  const navigate = useNavigate()

  const [turno, setTurno] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [checkpoints, setCheckpoints] = useState([])
  const [limpiezaPrev, setLimpiezaPrev] = useState(null)
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [ahora, setAhora] = useState(Date.now())
  const [mostrarReasignar, setMostrarReasignar] = useState(false)
  const [mostrarLimpieza, setMostrarLimpieza] = useState(false)
  const [escala, setEscala] = useState('LIMPIO')
  const [obsLimpieza, setObsLimpieza] = useState('')

  const hoy = new Date().toISOString().slice(0, 10)

  const cargar = async () => {
    if (!activeUser?.id) return
    setLoading(true); setError(null)
    try {
      const t = await turnosApi.getByUsuario(activeUser.id).catch(() => ({ data: [] }))
      const mis = (t.data || []).filter(x => x.fecha?.slice(0, 10) === hoy)
        .sort((a, b) => (a.franja || '').localeCompare(b.franja || ''))
      // Turno prioritario: EN_CURSO > PENDIENTE > COMPLETADO
      const prioridad = { EN_CURSO: 0, PENDIENTE: 1, COMPLETADO: 2 }
      const activo = mis.sort((a, b) => (prioridad[a.estado] ?? 9) - (prioridad[b.estado] ?? 9))[0]
      setTurno(activo || null)

      if (activo) {
        const [c, cp, l] = await Promise.all([
          checkinsApi.getByTurno(activo.id).catch(() => ({ data: [] })),
          checkpointsApi.getByZona(activo.zona?.id).catch(() => ({ data: [] })),
          limpiezaApi.getByTurno(activo.id).catch(() => ({ data: [] })),
        ])
        setCheckins(c.data || [])
        setCheckpoints(cp.data || [])
        setLimpiezaPrev((l.data || [])[0] || null)
      } else {
        setCheckins([]); setCheckpoints([]); setLimpiezaPrev(null)
      }
    } catch {
      setError('No se pudo cargar tu turno')
    } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [activeUser?.id])

  // Reloj para calcular tiempo desde último recorrido
  useEffect(() => {
    const iv = setInterval(() => setAhora(Date.now()), 15000)
    return () => clearInterval(iv)
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Cargando tu turno...</div>

  if (!turno) {
    return (
      <div>
        <div className="welcome-banner">
          <div className="welcome-title">Hola, {activeUser?.nombre} 👋</div>
          <div className="welcome-sub">No tienes turno asignado para hoy</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>📅</div>
          <div style={{ fontWeight: 600 }}>Sin turno hoy</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>Consulta la agenda semanal en "Turnos"</div>
          <button className="login-btn" style={{ marginTop: 18, maxWidth: 240 }} onClick={() => navigate('/turnos')}>
            Ver mis turnos
          </button>
        </div>
      </div>
    )
  }

  const color = ESTADO_TURNO_COLORS[turno.estado] || '#6b7280'
  const esPendiente = turno.estado === 'PENDIENTE'
  const enCurso = turno.estado === 'EN_CURSO'
  const completado = turno.estado === 'COMPLETADO' || turno.estado === 'CERRADO'

  const registrosRecorrido = checkins.filter(c => c.esRecorrido)
  const ultimoRecorrido = registrosRecorrido[registrosRecorrido.length - 1]
  const llegada = checkins.find(c => !c.esRecorrido)
  const referencia = ultimoRecorrido?.timestamp || llegada?.timestamp
  const minutosDesde = referencia ? Math.floor((ahora - new Date(referencia).getTime()) / 60000) : null
  const alertaRecorrido = enCurso && (minutosDesde !== null && minutosDesde >= 10)

  const registrarLlegada = async () => {
    if (procesando) return
    setProcesando(true); setError(null)
    try {
      await checkinsApi.create({
        turno: { id: turno.id },
        metodo: 'MANUAL',
        esRecorrido: false,
      })
      await turnosApi.cambiarEstado(turno.id, 'EN_CURSO')
      setSuccess('✅ Llegada registrada')
      setTimeout(() => setSuccess(null), 2500)
      cargar()
    } catch { setError('No se pudo registrar la llegada') }
    finally { setProcesando(false) }
  }

  const registrarRecorrido = async (checkpointId = null) => {
    if (procesando) return
    setProcesando(true); setError(null)
    try {
      await checkinsApi.create({
        turno: { id: turno.id },
        checkpoint: checkpointId ? { id: checkpointId } : null,
        metodo: 'MANUAL',
        esRecorrido: true,
      })
      setSuccess('✅ Recorrido registrado')
      setTimeout(() => setSuccess(null), 2500)
      cargar()
    } catch { setError('No se pudo registrar el recorrido') }
    finally { setProcesando(false) }
  }

  const cerrarTurno = async () => {
    if (!confirm('¿Cerrar el turno como completado?')) return
    try {
      await turnosApi.cambiarEstado(turno.id, 'COMPLETADO')
      setSuccess('Turno cerrado')
      cargar()
    } catch { setError('No se pudo cerrar el turno') }
  }

  const enviarLimpieza = async () => {
    setProcesando(true); setError(null)
    try {
      await limpiezaApi.create({
        turno: { id: turno.id },
        escala,
        observaciones: obsLimpieza,
      })
      setSuccess('🧹 Reporte de limpieza enviado')
      setMostrarLimpieza(false); setObsLimpieza('')
      setTimeout(() => setSuccess(null), 2500)
      cargar()
    } catch { setError('No se pudo enviar el reporte de limpieza') }
    finally { setProcesando(false) }
  }

  return (
    <div>
      <div className="welcome-banner" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd, #0284c7)` }}>
        <div className="welcome-title">Mi Turno · {turno.zona?.nombre}</div>
        <div className="welcome-sub">
          {franjaLabel(turno.franja)} {franjaHoras(turno.franja) && `(${franjaHoras(turno.franja)})`} · {estadoTurnoLabel(turno.estado)}
        </div>
      </div>

      {success && <div style={{ background: '#dcfce7', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#166534', marginBottom: 16 }}>{success}</div>}
      {error && <div style={{ background: '#fee2e2', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#dc2626', marginBottom: 16 }}>❌ {error}</div>}

      {alertaRecorrido && (
        <div style={{
          background: '#fef3c7', borderLeft: '4px solid #f59e0b',
          padding: '12px 16px', borderRadius: 10, marginBottom: 16,
          fontSize: 14, color: '#92400e', fontWeight: 600,
        }}>
          ⏰ Han pasado {minutosDesde} min desde tu último recorrido. Registra uno pronto.
        </div>
      )}

      {/* Pendiente: botón grande de llegada */}
      {esPendiente && (
        <div className="card" style={{ textAlign: 'center', padding: 30 }}>
          <div style={{ fontSize: 16, color: '#6b7280', marginBottom: 18 }}>
            Tu turno está pendiente de iniciar
          </div>
          <button
            onClick={registrarLlegada}
            disabled={procesando}
            style={{
              width: '100%', padding: '22px 20px', fontSize: 22, fontWeight: 800,
              border: 'none', borderRadius: 16,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white',
              cursor: procesando ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
            }}
          >
            ✓ REGISTRAR LLEGADA
          </button>
          <button
            onClick={() => setMostrarReasignar(true)}
            style={{
              width: '100%', marginTop: 12, padding: '14px', fontSize: 15, fontWeight: 600,
              border: '1.5px solid #fecaca', borderRadius: 12,
              background: 'white', color: '#dc2626', cursor: 'pointer',
            }}
          >
            🚫 No puedo llegar — pedir reasignación
          </button>
        </div>
      )}

      {/* En curso: acciones principales */}
      {enCurso && (
        <>
          <div className="card" style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', padding: 20 }}>
            <div style={{ fontSize: 14, color: '#166534', fontWeight: 600, marginBottom: 6 }}>
              ✅ Llegada registrada a las {horaCorta(llegada?.timestamp)}
            </div>
            <div style={{ fontSize: 13, color: '#16a34a' }}>
              {registrosRecorrido.length === 0
                ? 'Registra tu primer recorrido'
                : `${registrosRecorrido.length} recorridos · último: ${horaCorta(ultimoRecorrido?.timestamp)} (hace ${minutosDesde} min)`}
            </div>
          </div>

          <button
            onClick={() => registrarRecorrido()}
            disabled={procesando}
            style={{
              width: '100%', padding: '22px 20px', fontSize: 22, fontWeight: 800,
              border: 'none', borderRadius: 16, marginBottom: 12,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
              cursor: procesando ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
            }}
          >
            🚶 REGISTRAR RECORRIDO
          </button>

          {checkpoints.length > 0 && (
            <div className="card">
              <div className="card-title-row"><span>📍</span><h3 className="card-title">Checkpoints específicos</h3></div>
              <div style={{ display: 'grid', gap: 8 }}>
                {checkpoints.map(cp => (
                  <button
                    key={cp.id}
                    onClick={() => registrarRecorrido(cp.id)}
                    disabled={procesando}
                    style={{
                      padding: '14px 16px', borderRadius: 10, border: '1.5px solid #e5e7eb',
                      background: 'white', cursor: 'pointer', textAlign: 'left', fontSize: 15, fontWeight: 500,
                    }}
                  >
                    📍 {cp.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/incidentes/nuevo')}
            style={{
              width: '100%', padding: '18px', fontSize: 18, fontWeight: 700,
              border: 'none', borderRadius: 14, marginBottom: 12,
              background: 'linear-gradient(135deg, #f97316, #ef4444)', color: 'white',
              cursor: 'pointer',
            }}
          >
            ⚠️ REPORTAR SITUACIÓN
          </button>

          <button
            onClick={() => setMostrarLimpieza(true)}
            style={{
              width: '100%', padding: '14px', fontSize: 15, fontWeight: 600,
              border: '1.5px solid #e5e7eb', borderRadius: 12, marginBottom: 12,
              background: 'white', cursor: 'pointer',
            }}
          >
            🧹 CALIFICAR LIMPIEZA
          </button>

          <button
            onClick={cerrarTurno}
            style={{
              width: '100%', padding: '14px', fontSize: 14, fontWeight: 600,
              border: '1.5px solid #d1d5db', borderRadius: 12,
              background: '#f9fafb', color: '#6b7280', cursor: 'pointer',
            }}
          >
            ✓ Cerrar turno como completado
          </button>
        </>
      )}

      {/* Completado: resumen */}
      {completado && (
        <div className="card">
          <div className="card-title-row"><span>📊</span><h3 className="card-title">Resumen del turno</h3></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div>
              <div className="config-label">Hora de llegada</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>🕐 {llegada?.timestamp ? horaCorta(llegada.timestamp) : '—'}</div>
            </div>
            <div>
              <div className="config-label">Recorridos realizados</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>🚶 {registrosRecorrido.length}</div>
            </div>
            <div>
              <div className="config-label">Limpieza</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>🧹 {limpiezaPrev?.escala || '—'}</div>
            </div>
            <div>
              <div className="config-label">Estado</div>
              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, background: color + '22', color }}>
                {estadoTurnoLabel(turno.estado)}
              </span>
            </div>
          </div>
          <button
            className="login-btn"
            style={{ marginTop: 18 }}
            onClick={() => navigate(`/turnos/${turno.id}`)}
          >
            Ver detalle completo
          </button>
        </div>
      )}

      <ReassignDialog
        open={mostrarReasignar}
        turno={turno}
        onClose={() => setMostrarReasignar(false)}
        onSuccess={() => { setSuccess('Reasignación propuesta'); cargar() }}
      />

      {mostrarLimpieza && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 440 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>🧹 Calificar limpieza</h3>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>Escala 1 (muy limpio) a 4 (crítico)</div>
            <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
              {ESCALA.map(e => (
                <button
                  key={e.v}
                  onClick={() => setEscala(e.v)}
                  style={{
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    border: `2px solid ${escala === e.v ? e.color : '#e5e7eb'}`,
                    background: escala === e.v ? e.color + '22' : 'white',
                    textAlign: 'left', fontSize: 15, fontWeight: 600,
                    color: escala === e.v ? e.color : '#1a1a2e',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
            <div>
              <div className="config-label">Observaciones (opcional)</div>
              <textarea className="form-textarea" rows={3} value={obsLimpieza} onChange={e => setObsLimpieza(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
              <button className="back-btn" onClick={() => setMostrarLimpieza(false)}>Cancelar</button>
              <button className="login-btn" onClick={enviarLimpieza} disabled={procesando}>Enviar reporte</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          .page-content { padding: 18px 14px !important; }
          .card { padding: 16px !important; }
        }
      `}</style>
    </div>
  )
}
