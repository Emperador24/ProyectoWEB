import { useEffect, useState } from 'react'
import { zonasApi } from '../services/api'
import { Modal, ConfirmDialog, Alert, useCrud } from '../components/shared'

const EMPTY = { nombre: '', descripcion: '', capacidad: 50, codigoQR: '', pinRotativo: '', activa: true }

export default function Zonas() {
  const { items, loading, error, success, setError, setSuccess, load, create, update, remove } = useCrud(zonasApi)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditing(null); setShowForm(true) }
  const openEdit = (z) => { setForm({ ...z }); setEditing(z.id); setShowForm(true) }

  const handleSubmit = async () => {
    const ok = editing ? await update(editing, form) : await create(form)
    if (ok) { setShowForm(false) }
  }

  return (
    <div>
      <h1 className="page-title">🗺️ Zonas</h1>
      <p className="page-subtitle">Definición de zonas de vigilancia con códigos QR y PIN</p>

      <Alert type="success" message={success} onClose={() => setSuccess(null)} />
      <Alert type="error" message={error} onClose={() => setError(null)} />

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="card-title" style={{ margin: 0 }}>Zonas registradas ({items.length})</span>
          <button className="btn btn-primary" onClick={openCreate}>+ Nueva zona</button>
        </div>

        {loading ? <div className="loading">Cargando…</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Nombre</th><th>Descripción</th><th>Capacidad</th><th>Código QR</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {items.map(z => (
                  <tr key={z.id}>
                    <td>{z.id}</td>
                    <td><strong>{z.nombre}</strong></td>
                    <td>{z.descripcion || '—'}</td>
                    <td>{z.capacidad}</td>
                    <td><code style={{ fontSize: 11, background: '#f5f5f5', padding: '2px 5px', borderRadius: 4 }}>{z.codigoQR}</code></td>
                    <td><span className={`badge badge-${z.activa ? 'green' : 'gray'}`}>{z.activa ? 'Activa' : 'Inactiva'}</span></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(z)}>✏️ Editar</button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(z.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <p className="empty-state">No hay zonas registradas</p>}
          </div>
        )}
      </div>

      {showForm && (
        <Modal title={editing ? 'Editar zona' : 'Nueva zona'} onClose={() => setShowForm(false)}>
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre de la zona</label>
              <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Patio Principal" />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción breve" />
            </div>
            <div className="form-group">
              <label>Capacidad (estudiantes)</label>
              <input type="number" value={form.capacidad} onChange={e => setForm({ ...form, capacidad: parseInt(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Código QR</label>
              <input value={form.codigoQR} onChange={e => setForm({ ...form, codigoQR: e.target.value })} placeholder="QR-ZONA-01" />
            </div>
            <div className="form-group">
              <label>PIN rotativo</label>
              <input value={form.pinRotativo} onChange={e => setForm({ ...form, pinRotativo: e.target.value })} placeholder="1234" />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select value={form.activa} onChange={e => setForm({ ...form, activa: e.target.value === 'true' })}>
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Guardar' : 'Crear zona'}</button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          message="¿Eliminar esta zona?"
          onConfirm={async () => { await remove(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
