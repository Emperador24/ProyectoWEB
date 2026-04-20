import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { zonasApi, checkpointsApi } from '../services/api'

export default function ZonaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [zona, setZona] = useState(null)
  const [checkpoints, setCheckpoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoCodigo, setNuevoCodigo] = useState('')

  const cargar = async () => {
    setLoading(true); setError(null)
    try {
      const [z, cps] = await Promise.all([
        zonasApi.getById(id),
        checkpointsApi.getByZona(id).catch(() => ({ data: [] })),
      ])
      setZona(z.data)
      setCheckpoints(cps.data || [])
    } catch {
      setError('No se pudo cargar la zona')
    } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [id])

  const agregarCheckpoint = async () => {
    if (!nuevoNombre.trim()) return
    try {
      await checkpointsApi.create({
        nombre: nuevoNombre,
        codigoQR: nuevoCodigo || `CP-${Date.now()}`,
        zona: { id: Number(id) },
      })
      setNuevoNombre(''); setNuevoCodigo('')
      cargar()
    } catch { setError('Error al crear checkpoint') }
  }

  const eliminarCheckpoint = async (cpId) => {
    if (!confirm('¿Eliminar este checkpoint?')) return
    try { await checkpointsApi.delete(cpId); cargar() }
    catch { setError('Error al eliminar checkpoint') }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Cargando...</div>
  if (!zona) return <div className="card" style={{ textAlign: 'center', padding: 40 }}>Zona no encontrada</div>

  return (
    <div>
      <button
        onClick={() => navigate('/zonas')}
        style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14, marginBottom: 12 }}
      >
        ← Volver a zonas
      </button>

      <div className="gradient-banner green">
        <div className="banner-icon">📍</div>
        <div className="banner-text">
          <div className="title">{zona.nombre}</div>
          <div className="subtitle">{zona.descripcion || 'Zona de supervisión'}</div>
        </div>
      </div>

      {error && <div style={{ background: '#fee2e2', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#dc2626', marginBottom: 16 }}>❌ {error}</div>}

      <div className="card">
        <div className="card-title-row"><span>ℹ️</span><h3 className="card-title">Información</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 6 }}>
          <div>
            <div className="config-label">Capacidad</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{zona.capacidad || 0}</div>
          </div>
          <div>
            <div className="config-label">Estado</div>
            <div style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              background: zona.activa !== false ? '#dcfce7' : '#fee2e2',
              color: zona.activa !== false ? '#16a34a' : '#dc2626',
            }}>
              {zona.activa !== false ? '✓ Activa' : '× Inactiva'}
            </div>
          </div>
          <div>
            <div className="config-label">Checkpoints</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{checkpoints.length}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title-row"><span>📌</span><h3 className="card-title">Puntos de control</h3></div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 10, marginBottom: 18 }}>
          <input className="form-input" placeholder="Nombre del checkpoint" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} />
          <input className="form-input" placeholder="Código QR (opcional)" value={nuevoCodigo} onChange={e => setNuevoCodigo(e.target.value)} />
          <button className="save-btn" onClick={agregarCheckpoint} disabled={!nuevoNombre.trim()}>+ Agregar</button>
        </div>

        {checkpoints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: '#9ca3af', fontSize: 14 }}>
            Sin checkpoints registrados para esta zona
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {checkpoints.map(cp => (
              <div key={cp.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', border: '1px solid #f3f4f6', borderRadius: 10,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>📍 {cp.nombre}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>Código: {cp.codigoQR || '—'}</div>
                </div>
                <button
                  onClick={() => eliminarCheckpoint(cp.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14 }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
