package com.vigilancia;

import com.vigilancia.model.*;
import com.vigilancia.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Batch DataLoader – carga datos iniciales al arrancar la aplicación.
 * Equivale al programa Batch solicitado en el entregable.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepo;
    private final ZonaRepository zonaRepo;
    private final TurnoRepository turnoRepo;
    private final CheckpointRepository checkpointRepo;
    private final IncidenteRepository incidenteRepo;
    private final CheckInRepository checkInRepo;
    private final ReasignacionRepository reasignacionRepo;
    private final RegistroLimpiezaRepository limpiezaRepo;
    private final NotificacionRepository notifRepo;
    private final MapaCalorRepository mapaCalorRepo;
    private final MetricaDocenteRepository metricaRepo;

    @Override
    public void run(String... args) {
        log.info("=== Iniciando carga batch de datos ===");

        // ---- USUARIOS ----
        Usuario admin = usuarioRepo.save(Usuario.builder()
                .nombre("Carlos Administrador").email("admin@colegio.edu")
                .password("admin123").rol(Enums.RolUsuario.ADMIN).activo(true).build());

        Usuario coord1 = usuarioRepo.save(Usuario.builder()
                .nombre("Lucía Coordinadora").email("lucia@colegio.edu")
                .password("coord123").rol(Enums.RolUsuario.COORDINADOR).activo(true).build());

        Usuario doc1 = usuarioRepo.save(Usuario.builder()
                .nombre("Andrés Pérez").email("aperez@colegio.edu")
                .password("doc123").rol(Enums.RolUsuario.DOCENTE).activo(true).build());

        Usuario doc2 = usuarioRepo.save(Usuario.builder()
                .nombre("María González").email("mgonzalez@colegio.edu")
                .password("doc123").rol(Enums.RolUsuario.DOCENTE).activo(true).build());

        Usuario doc3 = usuarioRepo.save(Usuario.builder()
                .nombre("Felipe Torres").email("ftorres@colegio.edu")
                .password("doc123").rol(Enums.RolUsuario.DOCENTE).activo(true).build());

        log.info("Usuarios cargados: {}", usuarioRepo.count());

        // ---- ZONAS ----
        Zona zonaPatio = zonaRepo.save(Zona.builder()
                .nombre("Patio Principal").descripcion("Zona central de recreo")
                .capacidad(200).codigoQR("QR-PATIO-01").pinRotativo("1234").activa(true).build());

        Zona zonaCafeteria = zonaRepo.save(Zona.builder()
                .nombre("Cafetería").descripcion("Zona de almuerzo estudiantil")
                .capacidad(150).codigoQR("QR-CAFE-01").pinRotativo("5678").activa(true).build());

        Zona zonaCanchas = zonaRepo.save(Zona.builder()
                .nombre("Canchas Deportivas").descripcion("Zona de actividad física")
                .capacidad(100).codigoQR("QR-CANCHA-01").pinRotativo("9012").activa(true).build());

        Zona zonaCorredores = zonaRepo.save(Zona.builder()
                .nombre("Corredores Bloque A").descripcion("Pasillos del bloque principal")
                .capacidad(80).codigoQR("QR-CORR-01").pinRotativo("3456").activa(true).build());

        log.info("Zonas cargadas: {}", zonaRepo.count());

        // ---- CHECKPOINTS ----
        checkpointRepo.save(Checkpoint.builder().zona(zonaPatio).nombre("Entrada Principal")
                .codigoQR("QR-CP-PATIO-A").descripcion("Acceso patio norte").activo(true).build());
        checkpointRepo.save(Checkpoint.builder().zona(zonaPatio).nombre("Zona Juegos")
                .codigoQR("QR-CP-PATIO-B").descripcion("Área de juegos infantiles").activo(true).build());
        checkpointRepo.save(Checkpoint.builder().zona(zonaCafeteria).nombre("Entrada Cafetería")
                .codigoQR("QR-CP-CAFE-A").descripcion("Puerta de entrada").activo(true).build());
        checkpointRepo.save(Checkpoint.builder().zona(zonaCanchas).nombre("Cancha Fútbol")
                .codigoQR("QR-CP-CANCHA-A").descripcion("Esquina noreste").activo(true).build());

        log.info("Checkpoints cargados: {}", checkpointRepo.count());

        // ---- TURNOS ----
        LocalDateTime hoy = LocalDateTime.now().withHour(10).withMinute(0).withSecond(0);

        Turno turno1 = turnoRepo.save(Turno.builder()
                .usuario(doc1).zona(zonaPatio)
                .fechaHoraInicio(hoy).fechaHoraFin(hoy.plusMinutes(30))
                .franja(Enums.FranjaHoraria.RECREO).estado(Enums.EstadoTurno.EN_CURSO).build());

        Turno turno2 = turnoRepo.save(Turno.builder()
                .usuario(doc2).zona(zonaCafeteria)
                .fechaHoraInicio(hoy.withHour(12)).fechaHoraFin(hoy.withHour(13))
                .franja(Enums.FranjaHoraria.ALMUERZO).estado(Enums.EstadoTurno.PENDIENTE).build());

        Turno turno3 = turnoRepo.save(Turno.builder()
                .usuario(doc3).zona(zonaCanchas)
                .fechaHoraInicio(hoy).fechaHoraFin(hoy.plusMinutes(30))
                .franja(Enums.FranjaHoraria.RECREO).estado(Enums.EstadoTurno.CERRADO).build());

        Turno turno4 = turnoRepo.save(Turno.builder()
                .usuario(doc1).zona(zonaCorredores)
                .fechaHoraInicio(hoy.plusDays(1)).fechaHoraFin(hoy.plusDays(1).plusMinutes(30))
                .franja(Enums.FranjaHoraria.RECREO).estado(Enums.EstadoTurno.PENDIENTE).build());

        log.info("Turnos cargados: {}", turnoRepo.count());

        // ---- INCIDENTES ----
        incidenteRepo.save(Incidente.builder()
                .turno(turno1).zona(zonaPatio).reportadoPor(doc1)
                .tipo(Enums.TipoIncidente.FISICO).severidad(Enums.SeveridadIncidente.S1)
                .descripcion("Caída leve durante juego, sin lesión visible")
                .timestamp(LocalDateTime.now().minusMinutes(20)).build());

        incidenteRepo.save(Incidente.builder()
                .turno(turno1).zona(zonaPatio).reportadoPor(doc1)
                .tipo(Enums.TipoIncidente.CONVIVENCIA).severidad(Enums.SeveridadIncidente.S2)
                .descripcion("Discusión entre estudiantes, fue mediada por el docente")
                .timestamp(LocalDateTime.now().minusMinutes(10)).build());

        incidenteRepo.save(Incidente.builder()
                .turno(turno3).zona(zonaCanchas).reportadoPor(doc3)
                .tipo(Enums.TipoIncidente.ESPACIO).severidad(Enums.SeveridadIncidente.S1)
                .descripcion("Uso inadecuado del mobiliario deportivo")
                .timestamp(LocalDateTime.now().minusHours(1)).build());

        incidenteRepo.save(Incidente.builder()
                .turno(turno2).zona(zonaCafeteria).reportadoPor(doc2)
                .tipo(Enums.TipoIncidente.SOCIAL).severidad(Enums.SeveridadIncidente.S3)
                .descripcion("Posible situación de exclusión social")
                .cursoEstudiante("Grado 7B")
                .timestamp(LocalDateTime.now().minusMinutes(5)).build());

        log.info("Incidentes cargados: {}", incidenteRepo.count());

        // ---- CHECK-INS ----
        List<Checkpoint> cps = checkpointRepo.findByZonaId(zonaPatio.getId());
        if (!cps.isEmpty()) {
            checkInRepo.save(CheckIn.builder().turno(turno1).checkpoint(cps.get(0))
                    .metodo(Enums.MetodoCheckIn.QR).esRecorrido(false)
                    .timestamp(hoy.plusMinutes(1)).build());
            if (cps.size() > 1) {
                checkInRepo.save(CheckIn.builder().turno(turno1).checkpoint(cps.get(1))
                        .metodo(Enums.MetodoCheckIn.QR).esRecorrido(true)
                        .timestamp(hoy.plusMinutes(10)).build());
            }
        }

        log.info("CheckIns cargados: {}", checkInRepo.count());

        // ---- REASIGNACIONES ----
        reasignacionRepo.save(Reasignacion.builder()
                .turno(turno4).docenteOriginal(doc1).docenteReemplazo(doc2)
                .motivo("Incapacidad médica")
                .estado(Enums.EstadoReasignacion.ACEPTADA)
                .timestampPropuesta(LocalDateTime.now().minusHours(2))
                .timestampRespuesta(LocalDateTime.now().minusHours(1)).build());

        log.info("Reasignaciones cargadas: {}", reasignacionRepo.count());

        // ---- REGISTRO LIMPIEZA ----
        limpiezaRepo.save(RegistroLimpieza.builder()
                .turno(turno3).escala(Enums.EscalaLimpieza.ALGO_BASURA)
                .observacion("Hay algunos residuos cerca de las gradas")
                .registradoPor(doc3).timestamp(LocalDateTime.now().minusMinutes(45)).build());

        log.info("Registros de limpieza cargados: {}", limpiezaRepo.count());

        // ---- NOTIFICACIONES ----
        notifRepo.save(Notificacion.builder().usuario(doc1).turno(turno1)
                .tipo(Enums.TipoNotificacion.RECORDATORIO)
                .mensaje("Tu turno en Patio Principal inicia en 10 minutos").leida(true)
                .timestamp(hoy.minusMinutes(10)).build());

        notifRepo.save(Notificacion.builder().usuario(coord1).turno(turno2)
                .tipo(Enums.TipoNotificacion.ALERTA)
                .mensaje("⚠️ Zona Cafetería sin cobertura hace 3 minutos").leida(false)
                .timestamp(LocalDateTime.now().minusMinutes(3)).build());

        notifRepo.save(Notificacion.builder().usuario(doc2)
                .tipo(Enums.TipoNotificacion.REASIGNACION)
                .mensaje("Tienes una solicitud de reemplazo pendiente").leida(false)
                .timestamp(LocalDateTime.now().minusMinutes(5)).build());

        log.info("Notificaciones cargadas: {}", notifRepo.count());

        // ---- MAPA DE CALOR ----
        String semanaActual = "2026-W10";
        mapaCalorRepo.save(MapaCalor.builder().zona(zonaPatio).franja(Enums.FranjaHoraria.RECREO)
                .tipoIncidente(Enums.TipoIncidente.FISICO).totalIncidentes(5).porcentaje(41.7).semana(semanaActual).build());
        mapaCalorRepo.save(MapaCalor.builder().zona(zonaPatio).franja(Enums.FranjaHoraria.RECREO)
                .tipoIncidente(Enums.TipoIncidente.CONVIVENCIA).totalIncidentes(4).porcentaje(33.3).semana(semanaActual).build());
        mapaCalorRepo.save(MapaCalor.builder().zona(zonaCanchas).franja(Enums.FranjaHoraria.RECREO)
                .tipoIncidente(Enums.TipoIncidente.FISICO).totalIncidentes(3).porcentaje(25.0).semana(semanaActual).build());
        mapaCalorRepo.save(MapaCalor.builder().zona(zonaCafeteria).franja(Enums.FranjaHoraria.ALMUERZO)
                .tipoIncidente(Enums.TipoIncidente.CONVIVENCIA).totalIncidentes(2).porcentaje(16.7).semana(semanaActual).build());
        mapaCalorRepo.save(MapaCalor.builder().zona(zonaCorredores).franja(Enums.FranjaHoraria.RECREO)
                .tipoIncidente(Enums.TipoIncidente.ESPACIO).totalIncidentes(1).porcentaje(8.3).semana(semanaActual).build());

        log.info("Registros mapa de calor cargados: {}", mapaCalorRepo.count());

        // ---- METRICAS DOCENTES ----
        metricaRepo.save(MetricaDocente.builder().usuario(doc1).trimestre("2026-Q1")
                .puntualidad(95.0).totalRecorridos(18).calidadRegistro(88.0)
                .contribucionPreventiva(90.0).reconocimiento(true).puntajeTotal(92.5).build());

        metricaRepo.save(MetricaDocente.builder().usuario(doc2).trimestre("2026-Q1")
                .puntualidad(80.0).totalRecorridos(12).calidadRegistro(75.0)
                .contribucionPreventiva(78.0).reconocimiento(false).puntajeTotal(78.0).build());

        metricaRepo.save(MetricaDocente.builder().usuario(doc3).trimestre("2026-Q1")
                .puntualidad(70.0).totalRecorridos(8).calidadRegistro(65.0)
                .contribucionPreventiva(72.0).reconocimiento(false).puntajeTotal(69.5).build());

        log.info("Métricas docentes cargadas: {}", metricaRepo.count());

        log.info("=== Carga batch completada exitosamente ===");
    }
}
