import { useContext, useEffect, useState } from 'react'
import { SessionContext } from '../App'
import { reasignacionesApi, turnosApi, usuariosApi } from '../services/api'
import { franjaHoras, franjaLabel } from '../utils/labels'

/**
 * Diálogo reutilizable para proponer una reasignación de turno.
 * El endpoint "sugerir" no existe en el backend — se deriva en el cliente
 * (docentes cuyo ID no está asignado a un turno EN_CURSO en ese mismo día).
 */
export default function ReassignDialog({ open, turno, onClose, onSuccess }) {
  const { activeUser } = useContext(SessionContext)
  const [sugerencias, setSugerencias] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(null)

  useEffect(() => {
    if (!open) {
      setSugerencias([]); setSeleccionado(null); setMotivo(''); setError(null); setExito(null)
      return
    }
    if (!turno) return
    setCargando(true); setError(null)
    Promise.all([
      usuariosApi.getByRol('DOCENTE').catch(() => ({ data: [] })),
      turnosApi.getAll().catch(() => ({ data: [] })),
    ]).then(([u, t]) => {
      const docentes = (u.data || []).filter(x => x.activo !== false)
      const turnos = t.data || []
      const misma = turnos.filter(x => x.fecha?.slice(0, 10) === turno.fecha?.slice(0, 10) && x.franja === turno.franja)
      const conteo = new Map()
      docentes.forEach(d => conteo.set(d.id, 0))
      turnos.forEach(x => {
        if (x.usuario?.id) conteo.set(x.usuario.id, (conteo.get(x.usuario.id) || 0) + 1)
      })
      const ocupados = new Set(misma.filter(x => x.usuario?.id).map(x => x.usuario.id))
      const originalId = turno.usuario?.id
      const disponibles = docentes
        .filter(d => d.id !== originalId && !ocupados.has(d.id))
        .map(d => ({ ...d, turnosAsignados: conteo.get(d.id) || 0 }))
        .sort((a, b) => a.turnosAsignados - b.turnosAsignados)
      setSugerencias(disponibles)
    }).finally(() => setCargando(false))
  }, [open, turno?.id])

  if (!open) return null

  const submit = async () => {
    if (!seleccionado) { setError('Selecciona un docente sugerido'); return }
    if (!motivo.trim()) { setError('Indica el motivo de la reasignación'); return }
    setEnviando(true); setError(null)
    try {
      await reasignacionesApi.create({
        turnoOriginal: { id: turno.id },
        docenteOriginal: turno.usuario?.id ? { id: turno.usuario.id } : (activeUser?.id ? { id: activeUser.id } : null),
        docentePropuesto: { id: seleccionado.id },
        motivo,
        estado: 'PROPUESTA',
      })
      setExito('Propuesta enviada correctamente')
      onSuccess?.()
      setTimeout(() => onClose?.(), 1200)
    } catch (e) {
      setError('Error al crear la propuesta: ' + (e.response?.data?.error || e.message))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
      }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>🔄 Proponer reasignación</h3>
        <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 18 }}>
          Selecciona un docente sugerido para cubrir este turno
        </div>

        {turno && (
          <div style={{ background: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>
              📍 {turno.zona?.nombre || 'Zona'} — {franjaLabel(turno.franja)}
              {franjaHoras(turno.franja) && <span style={{ color: '#9ca3af', fontWeight: 500 }}> · {franjaHoras(turno.franja)}</span>}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
              📅 {turno.fecha?.slice(0, 10)} · 👤 {turno.usuario?.nombre || 'Sin asignar'} {turno.usuario?.apellido || ''}
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 14, marginBottom: 12 }}>
            {error}
          </div>
        )}
        {exito && (
          <div style={{ background: '#dcfce7', borderRadius: 8, padding: '10px 14px', color: '#166534', fontSize: 14, marginBottom: 12 }}>
            ✅ {exito}
          </div>
        )}

        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
          Docentes sugeridos {cargando ? '(cargando...)' : `(${sugerencias.length})`}
        </div>
        <div style={{ maxHeight: 260, overflow: 'auto', border: '1px solid #f3f4f6', borderRadius: 12, marginBottom: 16 }}>
          {cargando ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>Buscando sugerencias...</div>
          ) : sugerencias.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🫥</div>
              Sin docentes disponibles ahora mismo
            </div>
          ) : sugerencias.map(d => {
            const activo = seleccionado?.id === d.id
            return (
              <div
                key={d.id}
                onClick={() => setSeleccionado(d)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', cursor: 'pointer',
                  background: activo ? '#dcfce7' : 'white',
                  borderBottom: '1px solid #f9fafb',
                  borderLeft: activo ? '4px solid #22c55e' : '4px solid transparent',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#3b82f6',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>
                  {(d.nombre?.[0] || '') + (d.apellido?.[0] || '')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>
                    {d.nombre} {d.apellido || ''}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    {d.turnosAsignados} turnos asignados
                  </div>
                </div>
                {activo && <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>}
              </div>
            )
          })}
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Motivo *</div>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Ej: Enfermedad, reunión urgente..."
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
          <button className="back-btn" onClick={onClose} disabled={enviando}>Cancelar</button>
          <button className="login-btn" onClick={submit} disabled={enviando || !seleccionado}>
            {enviando ? 'Enviando...' : 'Proponer reasignación'}
          </button>
        </div>
      </div>
    </div>
  )
}
