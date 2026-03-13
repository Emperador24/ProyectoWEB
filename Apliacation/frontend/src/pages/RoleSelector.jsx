export default function RoleSelector({ onSelect }) {
  return (
    <div className="role-selector-page">
      <div className="role-header">
        <div className="role-logo-icon">🏫</div>
        <h1>Sistema de Vigilancia Docente</h1>
        <p>🏫 Colegio San José - Gestión de Supervisión Escolar</p>
      </div>

      <div className="role-card-wrap">
        <h2>Selecciona tu rol</h2>
        <p>Elige cómo quieres acceder al sistema</p>

        <div className="role-options">
          <div className="role-option" onClick={() => onSelect('COORDINADOR')}>
            <div className="role-option-icon green">🏫</div>
            <h3>Coordinador</h3>
            <p>Gestión completa del sistema</p>
          </div>

          <div className="role-option" onClick={() => onSelect('PROFESOR')}>
            <div className="role-option-icon blue">🎓</div>
            <h3>Profesor</h3>
            <p>Check-in y reportes</p>
          </div>

          <div className="role-option" onClick={() => onSelect('DIRECTOR')}>
            <div className="role-option-icon purple">👤</div>
            <h3>Director</h3>
            <p>Vista ejecutiva y análisis</p>
          </div>
        </div>
      </div>
    </div>
  )
}