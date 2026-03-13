import { useEffect, useState } from 'react'
import { reasignacionesApi, turnosApi, usuariosApi } from '../services/api'
import { Modal, Alert, estadoBadge } from '../components/shared'

const EMPTY = { turno: { id: '' }, docenteOriginal: { id: '' }, docenteReemplazo: { id: '' }, motivo: '', estado: 'PROPUESTA' }

export default function Reasignaciones() {
  const [items, setItems] = useState([])
  const [turnos, setTurnos] = useState([])
  const [docentes, setDocentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const load = async () => {
    setLoading(true)
    const [r, t, u] = await Promise.all([reasignacionesApi.getAll(), turnosApi.getAll(), usuariosApi.getByRol('DOCENTE')])
    setItems(r.data); setTurnos(t.data); setDocentes(u.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    try { await reasignacionesApi.create(form); setSuccess('Reasignación creada'); setShowForm(false); load() }
    catch { setError('Error al crear') }
  }

  const responder = async (id, estado) => {
    try { await reasignacionesApi.responder(id, estado); setSuccess(`Reasignación ${estado.toLowerCase()}`); load() }
    catch { setError('Error al responder') }
  }

  return (
    <div>
      <h1 className="page-title">🔄 Reasignaciones</h1>
      <p className="page-subtitle">Propuestas automáticas de reemplazo por impedimento</p>

      {success && <div className="alert alert-success">{success} <button onClick={() => setSuccess(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button></div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="card-title" style={{ margin: 0 }}>Reasignaciones ({items.length})</span>
          <button className="btn btn-warning" onClick={() => { setForm(EMPTY); setShowForm(true) }}>+ Solicitar reemplazo</button>
        </div>

        {loading ? <div className="loading">Cargando…</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Turno</th><th>Docente original</th><th>Reemplazo</th><th>Motivo</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {items.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>#{r.turno?.id}</td>
                    <td>{r.docenteOriginal?.nombre}</td>
                    <td>{r.docenteReemplazo?.nombre || '—'}</td>
                    <td>{r.motivo}</td>
                    <td>{estadoBadge(r.estado)}</td>
                    <td>
                      {r.estado === 'PROPUESTA' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => responder(r.id, 'ACEPTADA')}>✓ Aceptar</button>{' '}
                          <button className="btn btn-danger btn-sm" onClick={() => responder(r.id, 'RECHAZADA')}>✕ Rechazar</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <p className="empty-state">Sin reasignaciones</p>}
          </div>
        )}
      </div>

      {showForm && (
        <Modal title="Solicitar reemplazo" onClose={() => setShowForm(false)}>
          <div className="form-grid">
            <div className="form-group">
              <label>Turno</label>
              <select value={form.turno?.id} onChange={e => setForm({ ...form, turno: { id: e.target.value } })}>
                <option value="">Seleccionar…</option>
                {turnos.map(t => <option key={t.id} value={t.id}>#{t.id} – {t.zona?.nombre} ({t.estado})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Docente que no puede</label>
              <select value={form.docenteOriginal?.id} onChange={e => setForm({ ...form, docenteOriginal: { id: e.target.value } })}>
                <option value="">Seleccionar…</option>
                {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Docente de reemplazo</label>
              <select value={form.docenteReemplazo?.id} onChange={e => setForm({ ...form, docenteReemplazo: { id: e.target.value } })}>
                <option value="">Seleccionar…</option>
                {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Motivo</label>
              <input value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} placeholder="Ej: Incapacidad médica" />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleCreate}>Crear solicitud</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
