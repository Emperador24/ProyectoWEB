import { useEffect, useState } from 'react'
import { incidentesApi, turnosApi, zonasApi, usuariosApi } from '../services/api'
import { Modal, ConfirmDialog, Alert, tipoBadge, severidadBadge } from '../components/shared'

const TIPOS = ['FISICO', 'CONVIVENCIA', 'ESPACIO', 'SOCIAL']
const SEVERIDADES = ['S1', 'S2', 'S3']
const TIPO_LABELS = {
  FISICO: '🩹 Seguridad física (caída, golpe, accidente leve)',
  CONVIVENCIA: '🤝 Convivencia (pelea, agresión verbal, acoso)',
  ESPACIO: '🪑 Uso del espacio (mobiliario, infraestructura)',
  SOCIAL: '👥 Observación social',
}
const SEV_LABELS = { S1: 'S1 – Leve', S2: 'S2 – Requiere seguimiento', S3: 'S3 – Atención inmediata' }
const EMPTY = { turno: { id: '' }, zona: { id: '' }, reportadoPor: { id: '' }, tipo: 'FISICO', severidad: 'S1', descripcion: '', cursoEstudiante: '' }

export default function Incidentes() {
  const [items, setItems] = useState([])
  const [turnos, setTurnos] = useState([])
  const [zonas, setZonas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [deleteId, setDeleteId] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState('')

  const load = async () => {
    setLoading(true)
    const [i, t, z, u] = await Promise.all([
      incidentesApi.getAll(), turnosApi.getAll(), zonasApi.getAll(), usuariosApi.getAll()
    ])
    setItems(i.data); setTurnos(t.data); setZonas(z.data); setUsuarios(u.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditing(null); setShowForm(true) }
  const openEdit = (i) => {
    setForm({ ...i, turno: { id: i.turno?.id || '' }, zona: { id: i.zona?.id || '' }, reportadoPor: { id: i.reportadoPor?.id || '' } })
    setEditing(i.id); setShowForm(true)
  }

  const handleSubmit = async () => {
    try {
      if (editing) { await incidentesApi.update(editing, form); setSuccess('Incidente actualizado') }
      else { await incidentesApi.create(form); setSuccess('Incidente registrado') }
      setShowForm(false); load()
    } catch { setError('Error al guardar') }
  }

  const filtered = filtroTipo ? items.filter(i => i.tipo === filtroTipo) : items

  return (
    <div>
      <h1 className="page-title">⚠️ Registro de Incidentes</h1>
      <p className="page-subtitle">Registro rápido con clasificación por tipo y severidad</p>

      {success && <div className="alert alert-success">{success} <button onClick={() => setSuccess(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button></div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="card-title" style={{ margin: 0 }}>Incidentes ({filtered.length})</span>
            <select className="" style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #dde3ea', fontSize: 13 }}
              value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Registrar incidente</button>
        </div>

        {loading ? <div className="loading">Cargando…</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Tipo</th><th>Severidad</th><th>Zona</th><th>Docente</th><th>Descripción</th><th>Fecha</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {filtered.map(i => (
                  <tr key={i.id}>
                    <td>{i.id}</td>
                    <td>{tipoBadge(i.tipo)}</td>
                    <td>{severidadBadge(i.severidad)}</td>
                    <td>{i.zona?.nombre || '—'}</td>
                    <td>{i.reportadoPor?.nombre || '—'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.descripcion || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{i.timestamp ? new Date(i.timestamp).toLocaleString('es') : '—'}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(i)}>✏️</button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(i.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="empty-state">Sin incidentes registrados</p>}
          </div>
        )}
      </div>

      {showForm && (
        <Modal title={editing ? 'Editar incidente' : '⚠️ Registrar incidente'} onClose={() => setShowForm(false)}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Tipo de incidente</label>
              <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Severidad</label>
              <select value={form.severidad} onChange={e => setForm({ ...form, severidad: e.target.value })}>
                {SEVERIDADES.map(s => <option key={s} value={s}>{SEV_LABELS[s]}</option>)}
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
              <label>Docente que reporta</label>
              <select value={form.reportadoPor?.id} onChange={e => setForm({ ...form, reportadoPor: { id: e.target.value } })}>
                <option value="">Seleccionar…</option>
                {usuarios.filter(u => u.rol === 'DOCENTE').map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Turno (opcional)</label>
              <select value={form.turno?.id} onChange={e => setForm({ ...form, turno: { id: e.target.value } })}>
                <option value="">Sin turno</option>
                {turnos.map(t => <option key={t.id} value={t.id}>Turno #{t.id} – {t.zona?.nombre}</option>)}
              </select>
            </div>
            {form.tipo === 'SOCIAL' && (
              <div className="form-group">
                <label>Curso del estudiante</label>
                <input value={form.cursoEstudiante} onChange={e => setForm({ ...form, cursoEstudiante: e.target.value })} placeholder="Ej: 7B" />
              </div>
            )}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Descripción</label>
              <textarea rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Describir brevemente lo ocurrido…" />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Guardar' : 'Registrar'}</button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog message="¿Eliminar este incidente?"
          onConfirm={async () => { await incidentesApi.delete(deleteId); setDeleteId(null); setSuccess('Eliminado'); load() }}
          onCancel={() => setDeleteId(null)} />
      )}
    </div>
  )
}
