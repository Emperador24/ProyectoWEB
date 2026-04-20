import { useContext, useEffect, useState } from 'react'
import { SessionContext } from '../App'
import { notificacionesApi } from '../services/api'
import { haceTiempo } from '../utils/tiempo'

const ICONO_POR_TIPO = {
  RECORDATORIO: '⏰',
  ALERTA: '🚨',
  REASIGNACION: '🔄',
  INCIDENTE: '⚠️',
}

const COLOR_POR_TIPO = {
  RECORDATORIO: { bg: '#dbeafe', color: '#2563eb' },
  ALERTA: { bg: '#fee2e2', color: '#dc2626' },
  REASIGNACION: { bg: '#fef9c3', color: '#ca8a04' },
  INCIDENTE: { bg: '#ffedd5', color: '#ea580c' },
}

export default function Notificaciones() {
  const { activeUser } = useContext(SessionContext)
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('TODAS')

  const cargar = () => {
    if (!activeUser?.id) return
    setLoading(true); setError(null)
    notificacionesApi.getByUsuario(activeUser.id)
      .then(r => setNotifs((r.data || []).sort((a, b) =>
        new Date(b.timestamp || b.fechaEnvio || 0) - new Date(a.timestamp || a.fechaEnvio || 0)
      )))
      .catch(() => setError('No se pudieron cargar las notificaciones'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [activeUser?.id])

  const marcarLeida = async (id) => {
    try {
      await notificacionesApi.marcarLeida(id)
      setNotifs(n => n.map(x => x.id === id ? { ...x, leida: true } : x))
    } catch {
      setError('Error al marcar como leída')
    }
  }

  const marcarTodas = async () => {
    const noLeidas = notifs.filter(n => !n.leida)
    if (noLeidas.length === 0) return
    try {
      await Promise.all(noLeidas.map(n => notificacionesApi.marcarLeida(n.id)))
      setNotifs(n => n.map(x => ({ ...x, leida: true })))
    } catch {
      setError('Error al marcar todas como leídas')
    }
  }

  const filtradas = filtro === 'NO_LEIDAS' ? notifs.filter(n => !n.leida) : notifs
  const totalNoLeidas = notifs.filter(n => !n.leida).length

  return (
    <div>
      <div className="gradient-banner purple-blue">
        <div className="banner-icon">🔔</div>
        <div className="banner-text">
          <div className="title">Notificaciones</div>
          <div className="subtitle">
            {totalNoLeidas > 0 ? `${totalNoLeidas} sin leer · ${notifs.length} totales` : 'Todas tus notificaciones al día'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { k: 'TODAS', label: `Todas (${notifs.length})` },
            { k: 'NO_LEIDAS', label: `Sin leer (${totalNoLeidas})` },
          ].map(f => (
            <button
              key={f.k}
              onClick={() => setFiltro(f.k)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid',
                borderColor: filtro === f.k ? '#8b5cf6' : '#e5e7eb',
                background: filtro === f.k ? '#f3e8ff' : 'white',
                color: filtro === f.k ? '#7c3aed' : '#6b7280',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={marcarTodas}
          disabled={totalNoLeidas === 0}
          className="save-btn"
          style={{ background: totalNoLeidas === 0 ? '#d1d5db' : '#8b5cf6', cursor: totalNoLeidas === 0 ? 'not-allowed' : 'pointer' }}
        >
          ✓ Marcar todas como leídas
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#dc2626', marginBottom: 16 }}>
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 50, color: '#9ca3af' }}>
          Cargando notificaciones...
        </div>
      ) : filtradas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🔕</div>
          <div style={{ fontWeight: 600 }}>Sin notificaciones</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>
            {filtro === 'NO_LEIDAS' ? 'Todas las notificaciones están leídas' : 'No tienes notificaciones aún'}
          </div>
        </div>
      ) : (
        <div>
          {filtradas.map(n => {
            const style = COLOR_POR_TIPO[n.tipo] || { bg: '#f3f4f6', color: '#6b7280' }
            const ts = n.timestamp || n.fechaEnvio
            return (
              <div
                key={n.id}
                onClick={() => !n.leida && marcarLeida(n.id)}
                style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  padding: '16px 18px', marginBottom: 10,
                  background: n.leida ? 'white' : '#f0f9ff',
                  borderRadius: 14,
                  border: '1.5px solid',
                  borderColor: n.leida ? '#f3f4f6' : '#bae6fd',
                  cursor: n.leida ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: style.bg, color: style.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {ICONO_POR_TIPO[n.tipo] || '📢'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                      background: style.bg, color: style.color, textTransform: 'uppercase',
                      letterSpacing: 0.4,
                    }}>
                      {n.tipo}
                    </span>
                    {!n.leida && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#1a1a2e', fontWeight: n.leida ? 400 : 600, lineHeight: 1.5 }}>
                    {n.mensaje || n.titulo || '(sin contenido)'}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
                    🕐 {haceTiempo(ts)}
                  </div>
                </div>
                {!n.leida && (
                  <button
                    onClick={(e) => { e.stopPropagation(); marcarLeida(n.id) }}
                    style={{
                      padding: '6px 12px', fontSize: 12, fontWeight: 600,
                      border: '1px solid #e5e7eb', borderRadius: 8,
                      background: 'white', cursor: 'pointer', color: '#6b7280',
                    }}
                  >
                    Marcar leída
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
