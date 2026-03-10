# 🏫 Sistema de Vigilancia Docente

**Proyecto:** Sistema híbrido para la vigilancia docente puntual, activa y trazable  
**Curso:** Desarrollo Web – Ing. Juan Camilo González Vargas

---

## 📦 Estado de las entregas

| Entrega | Peso | Estado |
|---------|------|--------|
| Primera entrega | 10% | 👨🏻‍💻 Trabajando |
| Segunda entrega | 20% | 🔲 Pendiente |
| Tercera entrega | 30% | 🔲 Pendiente |

---

## ✅ Primera entrega (10%) — Completada

### Entregables

| # | Entregable |Estado |
|---|-----------|--------|
| 1 | Descripción detallada de casos de uso | ✅ |
| 2 | Mockups de pantallas + diagrama de navegación | 👨🏻‍💻 Trabajando |
| 3 | Diagrama de entidades (ER / Clases) | ✅ |
| 4 | Aplicación MPA con CRUD de todas las entidades | 👨🏻‍💻 Trabajando |
| 5 | Programa Batch en Java Spring (carga de BD) | 👨🏻‍💻 Trabajando|
| 6 | Video explicativo del diseño y código | 👨🏻‍💻 Trabajando |


### Qué se implementó

- **11 entidades JPA** completas con sus relaciones
- **CRUD REST** para todas las entidades (`/api/*`)
- **DataLoader.java** — programa Batch que carga la base de datos al iniciar
- **Frontend MPA** en React con una página por módulo
- **Diagrama ER** en HTML interactivo y en Mermaid
- **Módulos del alcance mínimo:**
  - ✅ Gestión de turnos (calendario + estados + notificaciones)
  - ✅ Registro de incidentes (formulario con desplegable por tipo y severidad)
  - ✅ Mapa de calor (tabla con % de incidentes por zona)
  - ✅ Propuesta de reasignación (según disponibilidad en calendario)

---

## 🔲 Segunda entrega (20%) — Pendiente

### Entregables

| # | Entregable | Peso | Estado |
|---|-----------|------|--------|
| 1 | Diseño detallado de servicios REST y Arquitectura SPA | 20% | 🔲 |
| 2 | Implementación de funcionalidades principales | 50% | 🔲 |
| 3 | Video explicativo del código y funcionalidades | 30% | 🔲 |

> ⚠️ **Sin autenticación** — tampoco se implementa en esta entrega.

### Qué se espera implementar

- Migrar de MPA a **SPA completa** con React Router
- Diseño y documentación formal de la **API REST** (OpenAPI / Swagger)
- Implementar las **funcionalidades principales** del sistema:
  - Tablero en vivo para coordinación (estados verde/amarillo/rojo)
  - Vigilancia activa con recordatorios de recorrido
  - Alertas automáticas por ausencia de cobertura (umbral 2 min)
  - Verificación de presencia con QR/PIN
  - Reasignación automática con ventana de aceptación (30–60 s)
- Mejorar la experiencia de usuario (UX) y diseño visual

---

## 🔲 Tercera entrega (30%) — Pendiente

### Entregables

| # | Entregable | Peso | Estado |
|---|-----------|------|--------|
| 1 | SPA + servicios REST con autenticación y autorización | 40% | 🔲 |
| 2 | Pruebas de integración automatizadas (una por método HTTP complejo) | 20% | 🔲 |
| 3 | Prueba de sistema automatizada (caso de uso más complejo) | 15% | 🔲 |
| 4 | Video explicativo del código y funcionalidades | 25% | 🔲 |

### Qué se espera implementar

- **Autenticación y autorización** con control de acceso por roles:
  - `DOCENTE` — accede a sus turnos, registra check-ins e incidentes
  - `COORDINADOR` — tablero en vivo, gestión de reasignaciones, reportes
  - `ADMIN` — configuración completa del sistema
- **Pruebas de integración** con Spring Boot Test (GET, POST, PUT, DELETE, PATCH)
- **Prueba de sistema** del flujo completo: turno → check-in → incidente → reasignación
- **Modo offline** con sincronización posterior
- **Analítica y exportación** CSV/Excel de reportes semanales
- Gamificación con reconocimientos trimestrales

---

## 🚀 Cómo ejecutar

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
# O: mvn spring-boot:run
```

- API: http://localhost:8080/api
- H2 Console: http://localhost:8080/h2-console
- **El DataLoader carga datos de prueba automáticamente al iniciar**

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173
- Proxy configurado hacia http://localhost:8080

---

## 📊 Entidades del sistema (11)

| Entidad | Descripción |
|---------|-------------|
| `Usuario` | Docentes, coordinadores y administradores |
| `Zona` | Zonas de vigilancia con QR y PIN rotativo |
| `Turno` | Asignaciones de vigilancia por franja horaria |
| `CheckIn` | Verificación de presencia (QR / PIN / NFC / Manual) |
| `Checkpoint` | Puntos de recorrido dentro de cada zona |
| `Incidente` | Registro de situaciones con tipo y severidad |
| `Reasignacion` | Reemplazos con trazabilidad completa |
| `RegistroLimpieza` | Escala obligatoria al cierre del turno (1–4) |
| `Notificacion` | Alertas, recordatorios y avisos del sistema |
| `MapaCalor` | Datos analíticos agregados por zona y semana |
| `MetricaDocente` | Gamificación con puntajes trimestrales |

---

## 🔗 Endpoints REST

| Módulo | Base URL |
|--------|----------|
| Usuarios | `/api/usuarios` |
| Zonas | `/api/zonas` |
| Turnos | `/api/turnos` |
| Check-ins | `/api/checkins` |
| Checkpoints | `/api/checkpoints` |
| Incidentes | `/api/incidentes` |
| Reasignaciones | `/api/reasignaciones` |
| Limpieza | `/api/registros-limpieza` |
| Notificaciones | `/api/notificaciones` |
| Mapa de calor | `/api/mapa-calor` |
| Métricas | `/api/metricas` |

Cada endpoint soporta: `GET` (todos / por id), `POST`, `PUT`, `DELETE` y `PATCH` donde aplica.

---

## 📁 Estructura del proyecto

```
vigilancia-docente/
├── backend/                          ← Spring Boot (Java 17)
│   ├── pom.xml
│   └── src/main/java/com/vigilancia/
│       ├── VigilanciaDocenteApplication.java
│       ├── CorsConfig.java
│       ├── DataLoader.java           ← Programa Batch
│       ├── model/                    ← 11 entidades JPA
│       ├── repository/               ← JPA Repositories
│       └── controller/               ← REST Controllers
├── frontend/                         ← React + Vite
│   └── src/
│       ├── App.jsx                   ← Routing (MPA → SPA en E2)
│       ├── components/
│       │   ├── Layout.jsx
│       │   └── shared.jsx
│       ├── pages/                    ← Una página por módulo
│       └── services/
│           └── api.js                ← Axios
├── diagrama-er.html                  ← Diagrama ER interactivo
├── diagrama-er.mermaid               ← Diagrama ER en Mermaid
└── README.md
```

## 👤 Autor

- Samuel Eduardo Emperador Contreras 📧 emperadorc.s@javeriana.edu.co
- 
- 
- 
