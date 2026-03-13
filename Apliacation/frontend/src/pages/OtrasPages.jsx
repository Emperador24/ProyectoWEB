// CheckIns.jsx
import { useEffect, useState } from 'react'
import { checkinsApi, turnosApi, checkpointsApi } from '../services/api'
import { Modal, Alert } from '../components/shared'

const METODOS = ['QR', 'PIN', 'NFC', 'MANUAL']
const EMPTY = { turno: { id: '' }, checkpoint: { id: '' }, metodo: 'QR', esRecorrido: false }

export function CheckIns() {
  const [items, setItems] = useState([])
  const [turnos, setTurnos] = useState([])
  const [checkpoints, setCheckpoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const load = async () => {
    setLoading(true)
    const [c, t, cp] = await Promise.all([checkinsApi.getAll(), turnosApi.getAll(), checkpointsApi.getAll()])
    setItems(c.data); setTurnos(t.data); setCheckpoints(cp.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    try { await checkinsApi.create(form); setSuccess('Check-in registrado'); setShowForm(false); load() }
    catch { alert('Error') }
  }

  return (
    <div>
      <h1 className="page-title">✅ Check-ins</h1>
      <p className="page-subtitle">Registro de verificación de presencia por zona</p>
      {success && <div className="alert alert-success">{success}</div>}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="card-title" style={{ margin: 0 }}>Check-ins ({items.length})</span>
          <button className="btn btn-success" onClick={() => { setForm(EMPTY); setShowForm(true) }}>+ Registrar check-in</button>
        </div>
        {loading ? <div className="loading">Cargando…</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Turno</th><th>Checkpoint</th><th>Método</th><th>Es recorrido</th><th>Timestamp</th><th>Acción</th></tr></thead>
              <tbody>
                {items.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>Turno #{c.turno?.id}</td>
                    <td>{c.checkpoint?.nombre || '—'}</td>
                    <td><span className="badge badge-blue">{c.metodo}</span></td>
                    <td>{c.esRecorrido ? '✅ Sí' : '—'}</td>
                    <td>{c.timestamp ? new Date(c.timestamp).toLocaleString('es') : '—'}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={async () => { await checkinsApi.delete(c.id); load() }}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showForm && (
        <Modal title="Registrar check-in" onClose={() => setShowForm(false)}>
          <div className="form-grid">
            <div className="form-group">
              <label>Turno</label>
              <select value={form.turno?.id} onChange={e => setForm({ ...form, turno: { id: e.target.value } })}>
                <option value="">Seleccionar…</option>
                {turnos.map(t => <option key={t.id} value={t.id}>#{t.id} – {t.zona?.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Checkpoint</label>
              <select value={form.checkpoint?.id} onChange={e => setForm({ ...form, checkpoint: { id: e.target.value } })}>
                <option value="">Ninguno</option>
                {checkpoints.map(cp => <option key={cp.id} value={cp.id}>{cp.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Método</label>
              <select value={form.metodo} onChange={e => setForm({ ...form, metodo: e.target.value })}>
                {METODOS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>¿Es recorrido?</label>
              <select value={form.esRecorrido} onChange={e => setForm({ ...form, esRecorrido: e.target.value === 'true' })}>
                <option value="false">No (check-in inicial)</option>
                <option value="true">Sí (recorrido activo)</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn btn-success" onClick={handleCreate}>Registrar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// Limpieza.jsx
import { limpiezaApi, turnosApi } from '../services/api'

const ESCALAS = ['LIMPIO', 'ALGO_BASURA', 'MUCHA_BASURA', 'CRITICO']
const ESCALA_LABEL = { LIMPIO: '1 – Limpio', ALGO_BASURA: '2 – Algo de basura', MUCHA_BASURA: '3 – Mucha basura', CRITICO: '4 – Crítico' }
const ESCALA_BADGE = { LIMPIO: 'green', ALGO_BASURA: 'yellow', MUCHA_BASURA: 'warning', CRITICO: 'red' }

export function Limpieza() {
  const [items, setItems] = useState([])
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ turno: { id: '' }, escala: 'LIMPIO', observacion: '' })

  const load = async () => {
    setLoading(true)
    const [l, t] = await Promise.all([limpiezaApi.getAll(), turnosApi.getAll()])
    setItems(l.data); setTurnos(t.data); setLoading(false)
  }
  useEffect(() => { load() }, [])

  return (
    <div>
      <h1 className="page-title">🧹 Registro de Limpieza</h1>
      <p className="page-subtitle">Cierre de turno con escala de limpieza obligatoria (1–4)</p>
      {success && <div className="alert alert-success">{success}</div>}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="card-title" style={{ margin: 0 }}>Registros ({items.length})</span>
          <button className="btn btn-success" onClick={() => setShowForm(true)}>+ Registrar limpieza</button>
        </div>
        {loading ? <div className="loading">Cargando…</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Turno</th><th>Escala</th><th>Observación</th><th>Fecha</th><th>Acción</th></tr></thead>
              <tbody>
                {items.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>#{r.turno?.id}</td>
                    <td><span className={`badge badge-${ESCALA_BADGE[r.escala] || 'gray'}`}>{ESCALA_LABEL[r.escala]}</span></td>
                    <td>{r.observacion || '—'}</td>
                    <td>{r.timestamp ? new Date(r.timestamp).toLocaleString('es') : '—'}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={async () => { await limpiezaApi.delete(r.id); load() }}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showForm && (
        <Modal title="Registrar limpieza al cierre del turno" onClose={() => setShowForm(false)}>
          <div className="form-grid">
            <div className="form-group">
              <label>Turno</label>
              <select value={form.turno?.id} onChange={e => setForm({ ...form, turno: { id: e.target.value } })}>
                <option value="">Seleccionar…</option>
                {turnos.map(t => <option key={t.id} value={t.id}>#{t.id} – {t.zona?.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Escala de limpieza</label>
              <select value={form.escala} onChange={e => setForm({ ...form, escala: e.target.value })}>
                {ESCALAS.map(s => <option key={s} value={s}>{ESCALA_LABEL[s]}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Observación</label>
              <textarea rows={2} value={form.observacion} onChange={e => setForm({ ...form, observacion: e.target.value })} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn btn-success" onClick={async () => {
              await limpiezaApi.create(form); setSuccess('Registrado'); setShowForm(false); load()
            }}>Registrar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// Checkpoints.jsx
import { checkpointsApi } from '../services/api'

const EMPTY_CP = { zona: { id: '' }, nombre: '', codigoQR: '', descripcion: '', activo: true }

export function Checkpoints() {
  const [items, setItems] = useState([])
  const [zonas, setZonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_CP)

  const load = async () => {
    setLoading(true)
    const { zonasApi } = await import('../services/api')
    const [c, z] = await Promise.all([checkpointsApi.getAll(), zonasApi.getAll()])
    setItems(c.data); setZonas(z.data); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleSubmit = async () => {
    try {
      if (editing) { await checkpointsApi.update(editing, form) }
      else { await checkpointsApi.create(form) }
      setSuccess('Guardado'); setShowForm(false); load()
    } catch { alert('Error') }
  }

  return (
    <div>
      <h1 className="page-title">📍 Checkpoints</h1>
      <p className="page-subtitle">Puntos de recorrido para validar movilidad dentro de cada zona</p>
      {success && <div className="alert alert-success">{success}</div>}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="card-title" style={{ margin: 0 }}>Checkpoints ({items.length})</span>
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_CP); setEditing(null); setShowForm(true) }}>+ Nuevo checkpoint</button>
        </div>
        {loading ? <div className="loading">Cargando…</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Nombre</th><th>Zona</th><th>QR</th><th>Activo</th><th>Acción</th></tr></thead>
              <tbody>
                {items.map(cp => (
                  <tr key={cp.id}>
                    <td>{cp.id}</td>
                    <td>{cp.nombre}</td>
                    <td>{cp.zona?.nombre || '—'}</td>
                    <td><code style={{ fontSize: 11 }}>{cp.codigoQR}</code></td>
                    <td>{cp.activo ? '✅' : '❌'}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setForm({ ...cp, zona: { id: cp.zona?.id } }); setEditing(cp.id); setShowForm(true) }}>✏️</button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={async () => { await checkpointsApi.delete(cp.id); load() }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showForm && (
        <Modal title={editing ? 'Editar checkpoint' : 'Nuevo checkpoint'} onClose={() => setShowForm(false)}>
          <div className="form-grid">
            <div className="form-group">
              <label>Zona</label>
              <select value={form.zona?.id} onChange={e => setForm({ ...form, zona: { id: e.target.value } })}>
                <option value="">Seleccionar…</option>
                {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Nombre</label>
              <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Código QR</label>
              <input value={form.codigoQR} onChange={e => setForm({ ...form, codigoQR: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Guardar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// Notificaciones.jsx
import { notificacionesApi } from '../services/api'

export function Notificaciones() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const r = await notificacionesApi.getAll()
    setItems(r.data); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const marcarLeida = async (id) => { await notificacionesApi.marcarLeida(id); load() }

  const tipoBadge = (tipo) => {
    const map = { RECORDATORIO: 'blue', ALERTA: 'red', REASIGNACION: 'yellow', INCIDENTE: 'purple' }
    return <span className={`badge badge-${map[tipo] || 'gray'}`}>{tipo}</span>
  }

  return (
    <div>
      <h1 className="page-title">🔔 Notificaciones</h1>
      <p className="page-subtitle">Alertas, recordatorios y avisos del sistema</p>
      <div className="card">
        <div className="card-title">Todas las notificaciones ({items.length})</div>
        {loading ? <div className="loading">Cargando…</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Tipo</th><th>Mensaje</th><th>Usuario</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {items.map(n => (
                  <tr key={n.id} style={{ opacity: n.leida ? 0.6 : 1 }}>
                    <td>{n.id}</td>
                    <td>{tipoBadge(n.tipo)}</td>
                    <td>{n.mensaje}</td>
                    <td>{n.usuario?.nombre}</td>
                    <td>{n.leida ? <span className="badge badge-gray">Leída</span> : <span className="badge badge-green">Nueva</span>}</td>
                    <td>{!n.leida && <button className="btn btn-secondary btn-sm" onClick={() => marcarLeida(n.id)}>✓ Marcar leída</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// Metricas.jsx
import { metricasApi } from '../services/api'

export function Metricas() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    metricasApi.getAll().then(r => { setItems(r.data); setLoading(false) })
  }, [])

  return (
    <div>
      <h1 className="page-title">🏆 Métricas Docentes</h1>
      <p className="page-subtitle">Gamificación – indicadores positivos por trimestre</p>
      <div className="card">
        <div className="card-title">Ranking trimestral</div>
        {loading ? <div className="loading">Cargando…</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Docente</th><th>Trimestre</th><th>Puntualidad</th><th>Recorridos</th><th>Calidad</th><th>Contribución</th><th>Puntaje total</th><th>Reconocimiento</th></tr>
              </thead>
              <tbody>
                {items.sort((a, b) => b.puntajeTotal - a.puntajeTotal).map((m, idx) => (
                  <tr key={m.id}>
                    <td>{idx + 1}</td>
                    <td><strong>{m.usuario?.nombre}</strong></td>
                    <td>{m.trimestre}</td>
                    <td>{m.puntualidad}%</td>
                    <td>{m.totalRecorridos}</td>
                    <td>{m.calidadRegistro}%</td>
                    <td>{m.contribucionPreventiva}%</td>
                    <td><strong>{m.puntajeTotal}</strong></td>
                    <td>{m.reconocimiento ? '🏅 Reconocido' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
