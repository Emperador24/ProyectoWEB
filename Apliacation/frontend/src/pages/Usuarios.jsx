import { useEffect, useState } from 'react'
import { usuariosApi } from '../services/api'
import { ROL_COLORS, ROL_LABELS } from '../utils/labels'

const ROLES = ['DOCENTE', 'COORDINADOR', 'ADMIN']
const EMPTY = { nombre: '', apellido: '', email: '', rol: 'DOCENTE', activo: true, password: '' }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroRol, setFiltroRol] = useState('TODOS')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const cargar = async () => {
    setLoading(true)
    try {
      const r = await usuariosApi.getAll()
      setUsuarios(r.data || [])
    } catch { setError('Error al cargar usuarios') }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const abrirCrear = () => { setForm(EMPTY); setEditing(null); setError(null); setShowForm(true) }
  const abrirEditar = (u) => {
    setForm({
      nombre: u.nombre || '', apellido: u.apellido || '', email: u.email || '',
      rol: u.rol || 'DOCENTE', activo: u.activo !== false, password: '',
    })
    setEditing(u.id); setError(null); setShowForm(true)
  }

  const guardar = async () => {
    if (!form.nombre.trim() || !form.email.trim()) {
      setError('Nombre y email son obligatorios'); return
    }
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (editing) await usuariosApi.update(editing, payload)
      else await usuariosApi.create(payload)
      setSuccess(editing ? 'Usuario actualizado' : 'Usuario creado')
      setShowForm(false); setEditing(null)
      cargar()
      setTimeout(() => setSuccess(null), 2500)
    } catch (e) { setError('Error: ' + (e.response?.data?.message || e.response?.data?.error || e.message)) }
  }

  const toggleActivo = async (u) => {
    try {
      await usuariosApi.update(u.id, { ...u, activo: !(u.activo !== false) })
      cargar()
    } catch { setError('Error al cambiar estado') }
  }

  const eliminar = async (u) => {
    if (!confirm(`¿Eliminar a ${u.nombre} ${u.apellido || ''}?`)) return
    try {
      await usuariosApi.delete(u.id)
      cargar()
    } catch { setError('No se pudo eliminar. Puede tener turnos asociados.') }
  }

  const filtrados = filtroRol === 'TODOS' ? usuarios : usuarios.filter(u => u.rol === filtroRol)

  return (
    <div>
      <div className="gradient-banner blue-pink" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="banner-icon">👥</div>
          <div className="banner-text">
            <div className="title">Gestión de Usuarios</div>
            <div className="subtitle">Administra docentes, coordinadores y administradores</div>
          </div>
        </div>
        <button className="export-btn" style={{ background: 'white', color: '#7c3aed' }} onClick={abrirCrear}>
          + Nuevo usuario
        </button>
      </div>

      {success && <div style={{ background: '#dcfce7', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#166534', marginBottom: 16 }}>✅ {success}</div>}
      {error && !showForm && <div style={{ background: '#fee2e2', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#dc2626', marginBottom: 16 }}>❌ {error}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['TODOS', ...ROLES].map(r => {
          const activo = filtroRol === r
          const col = r === 'TODOS' ? { color: '#6b7280', bg: '#f3f4f6' } : ROL_COLORS[r]
          return (
            <button
              key={r}
              onClick={() => setFiltroRol(r)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid',
                borderColor: activo ? col.color : '#e5e7eb',
                background: activo ? col.bg : 'white',
                color: activo ? col.color : '#6b7280',
              }}
            >
              {r === 'TODOS' ? 'Todos' : ROL_LABELS[r]}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Cargando...</div>
      ) : filtrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🧑‍🏫</div>
          <div style={{ fontWeight: 600 }}>No hay usuarios</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                {['Nombre', 'Email', 'Rol', 'Activo', 'Acciones'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '14px 18px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map(u => {
                const col = ROL_COLORS[u.rol] || { color: '#6b7280', bg: '#f3f4f6' }
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 600 }}>
                      {u.nombre} {u.apellido || ''}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#6b7280' }}>{u.email}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: col.bg, color: col.color,
                      }}>
                        {ROL_LABELS[u.rol] || u.rol}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={u.activo !== false}
                          onChange={() => toggleActivo(u)}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute', inset: 0, borderRadius: 24, transition: '0.2s',
                          background: u.activo !== false ? '#22c55e' : '#d1d5db',
                        }}>
                          <span style={{
                            position: 'absolute', top: 3,
                            left: u.activo !== false ? 22 : 3,
                            width: 18, height: 18, background: 'white', borderRadius: '50%',
                            transition: '0.2s',
                          }} />
                        </span>
                      </label>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="reassign-btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => abrirEditar(u)}>✏️</button>
                        <button className="reassign-btn" style={{ padding: '4px 10px', fontSize: 12, color: '#ef4444', borderColor: '#fecaca' }} onClick={() => eliminar(u)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 30, width: '100%', maxWidth: 480 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18 }}>{editing ? '✏️ Editar usuario' : '+ Nuevo usuario'}</h3>
            {error && <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 14, marginBottom: 14 }}>{error}</div>}
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div className="config-label">Nombre *</div>
                  <input className="form-input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div>
                  <div className="config-label">Apellido</div>
                  <input className="form-input" value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} />
                </div>
              </div>
              <div>
                <div className="config-label">Email *</div>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <div className="config-label">Rol</div>
                <select className="form-select" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                  {ROLES.map(r => <option key={r} value={r}>{ROL_LABELS[r]}</option>)}
                </select>
              </div>
              <div>
                <div className="config-label">{editing ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}</div>
                <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <input type="checkbox" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} />
                Usuario activo
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
              <button className="back-btn" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="login-btn" onClick={guardar}>{editing ? 'Actualizar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
