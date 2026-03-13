import { useEffect, useState } from 'react'
import { usuariosApi } from '../services/api'
import { Modal, ConfirmDialog, Alert, rolBadge, useCrud } from '../components/shared'

const ROLES = ['DOCENTE', 'COORDINADOR', 'ADMIN']
const EMPTY = { nombre: '', email: '', password: '', rol: 'DOCENTE', activo: true }

export default function Usuarios() {
  const { items, loading, error, success, setError, setSuccess, load, create, update, remove } = useCrud(usuariosApi)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditing(null); setShowForm(true) }
  const openEdit = (u) => { setForm({ ...u, password: '' }); setEditing(u.id); setShowForm(true) }

  const handleSubmit = async () => {
    const ok = editing ? await update(editing, form) : await create(form)
    if (ok) { setShowForm(false); setForm(EMPTY) }
  }

  return (
    <div>
      <h1 className="page-title">👤 Usuarios</h1>
      <p className="page-subtitle">Gestión de docentes, coordinadores y administradores</p>

      <Alert type="success" message={success} onClose={() => setSuccess(null)} />
      <Alert type="error" message={error} onClose={() => setError(null)} />

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="card-title" style={{ margin: 0 }}>Lista de usuarios ({items.length})</span>
          <button className="btn btn-primary" onClick={openCreate}>+ Nuevo usuario</button>
        </div>

        {loading ? <div className="loading">Cargando…</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {items.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td><strong>{u.nombre}</strong></td>
                    <td>{u.email}</td>
                    <td>{rolBadge(u.rol)}</td>
                    <td><span className={`badge badge-${u.activo ? 'green' : 'gray'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>✏️ Editar</button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(u.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <p className="empty-state">No hay usuarios registrados</p>}
          </div>
        )}
      </div>

      {showForm && (
        <Modal title={editing ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setShowForm(false)}>
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre completo</label>
              <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre y apellido" />
            </div>
            <div className="form-group">
              <label>Email institucional</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@colegio.edu" />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? "Dejar vacío para no cambiar" : "Contraseña"} />
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select value={form.activo} onChange={e => setForm({ ...form, activo: e.target.value === 'true' })}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Guardar cambios' : 'Crear usuario'}</button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          message="¿Eliminar este usuario? Esta acción no se puede deshacer."
          onConfirm={async () => { await remove(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
