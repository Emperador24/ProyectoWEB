import { useEffect, useState } from 'react'
import { turnosApi, usuariosApi, zonasApi } from '../services/api'
import { Modal, ConfirmDialog, Alert, estadoBadge } from '../components/shared'

const ESTADOS = ['PENDIENTE', 'EN_CURSO', 'CERRADO']
const FRANJAS = ['RECREO', 'ALMUERZO']
const EMPTY = { usuario: { id: '' }, zona: { id: '' }, fechaHoraInicio: '', fechaHoraFin: '', franja: 'RECREO', estado: 'PENDIENTE' }

export default function Turnos() {
  const [items, setItems] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [zonas, setZonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [deleteId, setDeleteId] = useState(null)

  const load = async () => {
    setLoading(true)
    const [t, u, z] = await Promise.all([turnosApi.getAll(), usuariosApi.getAll(), zonasApi.getAll()])
    setItems(t.data); setUsuarios(u.data); setZonas(z.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditing(null); setShowForm(true) }
  const openEdit = (t) => {
    setForm({
      ...t,
      usuario: { id: t.usuario?.id || '' },
      zona: { id: t.zona?.id || '' },
      fechaHoraInicio: t.fechaHoraInicio?.slice(0, 16) || '',
      fechaHoraFin: t.fechaHoraFin?.slice(0, 16) || '',
    })
    setEditing(t.id); setShowForm(true)
  }

  const handleSubmit = async () => {
    try {
      if (editing) { await turnosApi.update(editing, form); setSuccess('Turno actualizado') }
      else { await turnosApi.create(form); setSuccess('Turno creado') }
      setShowForm(false); load()
    } catch { setError('Error al guardar') }
  }

  const handleDelete = async () => {
    await turnosApi.delete(deleteId)
    setDeleteId(null); setSuccess('Turno eliminado'); load()
  }

  return (
    <div>
      <h1 className="page-title">📅 Turnos</h1>
      <p className="page-subtitle">Calendario y asignación de turnos de vigilancia</p>

      {success && <div className="alert alert-success">{success} <button onClick={() => setSuccess(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button></div>}
      {error && <div className="alert alert-error">{error} <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button></div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="card-title" style={{ margin: 0 }}>Turnos ({items.length})</span>
          <button className="btn btn-primary" onClick={openCreate}>+ Asignar turno</button>
        </div>

        {loading ? <div className="loading">Cargando…</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Docente</th><th>Zona</th><th>Franja</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {items.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.usuario?.nombre || '—'}</td>
                    <td>{t.zona?.nombre || '—'}</td>
                    <td><span className={`badge badge-${t.franja === 'RECREO' ? 'blue' : 'purple'}`}>{t.franja}</span></td>
                    <td>{t.fechaHoraInicio ? new Date(t.fechaHoraInicio).toLocaleString('es') : '—'}</td>
                    <td>{t.fechaHoraFin ? new Date(t.fechaHoraFin).toLocaleString('es') : '—'}</td>
                    <td>{estadoBadge(t.estado)}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)}>✏️</button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(t.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <p className="empty-state">No hay turnos</p>}
          </div>
        )}
      </div>

      {showForm && (
        <Modal title={editing ? 'Editar turno' : 'Nuevo turno'} onClose={() => setShowForm(false)}>
          <div className="form-grid">
            <div className="form-group">
              <label>Docente</label>
              <select value={form.usuario?.id} onChange={e => setForm({ ...form, usuario: { id: e.target.value } })}>
                <option value="">Seleccionar…</option>
                {usuarios.filter(u => u.rol === 'DOCENTE').map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Zona</label>
              <select value={form.zona?.id} onChange={e => setForm({ ...form, zona: { id: e.target.value } })}>
                <option value="">Seleccionar…</option>
                {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Franja</label>
              <select value={form.franja} onChange={e => setForm({ ...form, franja: e.target.value })}>
                {FRANJAS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Inicio</label>
              <input type="datetime-local" value={form.fechaHoraInicio} onChange={e => setForm({ ...form, fechaHoraInicio: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Fin</label>
              <input type="datetime-local" value={form.fechaHoraFin} onChange={e => setForm({ ...form, fechaHoraFin: e.target.value })} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Guardar' : 'Crear turno'}</button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog message="¿Eliminar este turno?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  )
}
