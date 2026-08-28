# 🏫 Sistema de Vigilancia Docente

**Proyecto:** Sistema híbrido para la vigilancia docente puntual, activa y trazable  
**Curso:** Desarrollo Web – Ing. Juan Camilo González Vargas

---

## 📦 Estado de las entregas

| Entrega | Estado |
|---------|--------|
| Primera entrega | ✅ Completada |
| Segunda entrega | ✅ Completada |
| Tercera entrega | ✅ Completada |

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

## ✅ Segunda entrega (20%) — Completada

### Entregables

| # | Entregable | Estado |
|---|-----------|--------|
| 1 | Diseño detallado de servicios REST y Arquitectura SPA | ✅ |
| 2 | Implementación de funcionalidades principales | ✅ |
| 3 | Video explicativo del código y funcionalidades | 👨🏻‍💻 Pendiente |

### Qué se implementó

- **SPA completa** con React Router (basada en la MPA de la E1)
- **API REST documentada** con OpenAPI / Swagger (`/swagger-ui.html`)
- **Tablero en vivo** para coordinación con estados:
  - 🟢 **Verde**: cubierta (check-in realizado)
  - 🟡 **Amarillo**: por iniciar (ventana de espera)
  - 🔴 **Rojo**: sin cobertura (umbral superado)
- **Vigilancia activa** con recordatorios de recorrido cada X minutos
- **Alertas automáticas** por ausencia de cobertura (umbral 2 min)
- **Verificación de presencia** mediante QR y PIN rotativo
- **Reasignación automática** con sugerencia de docentes disponibles
- **UX mejorada** con sidebar temática por rol, notificaciones en vivo y diseño visual refinado

---

## ✅ Tercera entrega (30%) — Completada

### Entregables

| # | Entregable | Estado |
|---|-----------|--------|
| 1 | SPA + servicios REST con autenticación y autorización | ✅ |
| 2 | Pruebas de integración automatizadas (una por método HTTP complejo) | ✅ |
| 3 | Prueba de sistema automatizada (caso de uso más complejo) | ✅ |
| 4 | Video explicativo del código y funcionalidades | 👨🏻‍💻 Pendiente |

### Qué se implementó

#### Autenticación y autorización (Spring Security + JWT)

- **Login con JWT**: endpoint `POST /api/auth/login` que retorna token Bearer
- **Spring Security** con `SecurityFilterChain` y `OncePerRequestFilter` para JWT
- **Control de acceso por roles** en endpoints:
  - `DOCENTE` — turnos, check-ins, incidentes propios
  - `COORDINADOR` — dashboard, reasignaciones, reportes, análisis
  - `ADMIN` — gestión completa de usuarios, zonas y configuración
- **Contraseñas hasheadas** con BCrypt en la base de datos
- **Frontend**: login real contra el backend, almacenamiento de JWT en localStorage, interceptor de axios con token Bearer, redirección automática al login en 401

#### Pruebas de integración (6 pruebas)

| # | Método | Endpoint | Descripción |
|---|--------|----------|-------------|
| 1 | POST | `/api/auth/login` | Inicio de sesión retorna token |
| 2 | GET | `/api/incidentes` | Listar incidentes |
| 3 | POST | `/api/incidentes` | Crear incidente |
| 4 | PUT | `/api/incidentes/{id}` | Actualizar incidente |
| 5 | PATCH | `/api/incidentes/{id}/resolver` | Resolver incidente |
| 6 | DELETE | `/api/incidentes/{id}` | Eliminar incidente |

#### Prueba de sistema (9 pasos)

Flujo completo: `Login docente → Obtener turnos → Check-in QR → Reportar incidente → Login coordinador → Ver dashboard → Crear reasignación → Aceptar reasignación → Verificar trazabilidad`

#### Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| ADMIN | `admin@colegio.edu` | `admin123` |
| COORDINADOR | `ana.garcia@colegio.edu` | `coord123` |
| DOCENTE | `carlos.rodriguez@colegio.edu` | `doc123` |
| DOCENTE | `maria.gonzalez@colegio.edu` | `doc123` |
| DOCENTE | `felipe.torres@colegio.edu` | `doc123` |

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
│       ├── VigilanciaApplication.java
│       ├── CorsConfig.java
│       ├── OpenApiConfig.java
│       ├── DataLoader.java           ← Programa Batch (carga inicial BD)
│       ├── security/                 ← Autenticación JWT + Spring Security
│       │   ├── SecurityConfig.java
│       │   ├── CustomUserDetailsService.java
│       │   └── jwt/
│       │       ├── JwtUtil.java
│       │       └── JwtAuthFilter.java
│       ├── model/                    ← 11 entidades JPA
│       ├── repository/               ← JPA Repositories
│       ├── service/                  ← Lógica de negocio (CoberturaService)
│       ├── dto/                      ← Objetos de transferencia
│       ├── controller/               ← REST Controllers (11 + alias)
│       ├── batch/                    ← Spring Batch (seeder masivo)
│       └── exception/                ← Manejo global de errores
├── frontend/                         ← React + Vite
│   └── src/
│       ├── App.jsx                   ← Auth context + React Router
│       ├── components/
│       │   ├── AppLayout.jsx         ← Sidebar + topbar + logout
│       │   └── ReassignDialog.jsx
│       ├── pages/
│       │   ├── Login.jsx             ← Login real con JWT
│       │   ├── coordinador/          ← Dashboard, Turnos, Incidentes, etc.
│       │   ├── profesor/             ← Dashboard, Turnos, Checkin, etc.
│       │   └── director/             ← Dashboard, Analítica, Métricas
│       ├── services/
│       │   └── api.js                ← Axios con interceptor JWT
│       └── utils/                    ← labels.js, tiempo.js
├── docker-compose.yml                ← PostgreSQL + Backend
└── README.md
```

## 👤 Autor

- Samuel Eduardo Emperador Contreras 📧 emperadorc.s@javeriana.edu.co
