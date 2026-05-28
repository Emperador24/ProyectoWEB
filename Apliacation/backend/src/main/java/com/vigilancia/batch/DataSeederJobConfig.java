package com.vigilancia.batch;

import com.vigilancia.model.*;
import com.vigilancia.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.transaction.PlatformTransactionManager;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Spring Batch job that seeds the database on startup when empty.
 * Idempotent: checks usuarioRepo.count() == 0 before inserting.
 */
@Configuration
@Profile("!test")
public class DataSeederJobConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSeederJobConfig.class);

    @Bean
    public Job dataSeederJob(JobRepository jobRepository, Step dataSeederStep) {
        return new JobBuilder("dataSeederJob", jobRepository)
                .start(dataSeederStep)
                .build();
    }

    @Bean
    public Step dataSeederStep(JobRepository jobRepository,
                               PlatformTransactionManager txManager,
                               DataSeederTasklet tasklet) {
        return new StepBuilder("dataSeederStep", jobRepository)
                .tasklet(tasklet, txManager)
                .build();
    }

    @org.springframework.stereotype.Component
    public static class DataSeederTasklet implements Tasklet {

        private final UsuarioRepository usuarioRepo;
        private final ZonaRepository zonaRepo;
        private final CheckpointRepository checkpointRepo;
        private final TurnoRepository turnoRepo;
        private final CheckInRepository checkInRepo;
        private final IncidenteRepository incidenteRepo;
        private final RegistroLimpiezaRepository limpiezaRepo;
        private final ReasignacionRepository reasignacionRepo;
        private final NotificacionRepository notifRepo;
        private final MapaCalorRepository mapaCalorRepo;
        private final MetricaDocenteRepository metricaRepo;

        private final Random rnd = new Random(42L);

        public DataSeederTasklet(UsuarioRepository usuarioRepo, ZonaRepository zonaRepo,
                                 CheckpointRepository checkpointRepo, TurnoRepository turnoRepo,
                                 CheckInRepository checkInRepo, IncidenteRepository incidenteRepo,
                                 RegistroLimpiezaRepository limpiezaRepo,
                                 ReasignacionRepository reasignacionRepo,
                                 NotificacionRepository notifRepo, MapaCalorRepository mapaCalorRepo,
                                 MetricaDocenteRepository metricaRepo) {
            this.usuarioRepo = usuarioRepo; this.zonaRepo = zonaRepo;
            this.checkpointRepo = checkpointRepo; this.turnoRepo = turnoRepo;
            this.checkInRepo = checkInRepo; this.incidenteRepo = incidenteRepo;
            this.limpiezaRepo = limpiezaRepo; this.reasignacionRepo = reasignacionRepo;
            this.notifRepo = notifRepo; this.mapaCalorRepo = mapaCalorRepo;
            this.metricaRepo = metricaRepo;
        }

        @Override
        public RepeatStatus execute(org.springframework.batch.core.StepContribution contribution,
                                    org.springframework.batch.core.scope.context.ChunkContext ctx) {
            if (usuarioRepo.count() > 0) {
                log.info("[Seeder] Base de datos ya tiene {} usuarios — omitiendo seed", usuarioRepo.count());
                return RepeatStatus.FINISHED;
            }
            log.info("[Seeder] Iniciando carga masiva de datos de VigíaEscolar");

            List<Usuario> docentes = seedUsuarios();
            List<Zona> zonas = seedZonas();
            List<Checkpoint> checkpoints = seedCheckpoints(zonas);
            List<Turno> turnos = seedTurnos(docentes, zonas);
            List<Turno> turnosConCheckIn = seedRegistrosPresenciaYRecorrido(turnos, checkpoints);
            seedIncidentes(turnos, zonas, docentes);
            seedReportesLimpieza(turnosConCheckIn, docentes);
            seedReasignaciones(turnos, docentes);
            seedMapaCalor(zonas);
            seedMetricas(docentes);
            seedNotificacionesIniciales(docentes);

            log.info("[Seeder] Finalizado: usuarios={} zonas={} checkpoints={} turnos={} checkins={} incidentes={} limpieza={} reasignaciones={} notifs={}",
                    usuarioRepo.count(), zonaRepo.count(), checkpointRepo.count(), turnoRepo.count(),
                    checkInRepo.count(), incidenteRepo.count(), limpiezaRepo.count(),
                    reasignacionRepo.count(), notifRepo.count());
            return RepeatStatus.FINISHED;
        }

        private List<Usuario> seedUsuarios() {
            // 2 admins
            usuarioRepo.save(Usuario.builder().nombre("Carlos Administrador")
                    .email("admin@colegio.edu").password("admin123")
                    .rol(Enums.RolUsuario.ADMIN).activo(true).build());
            usuarioRepo.save(Usuario.builder().nombre("Roberto Martínez Díaz")
                    .email("roberto.martinez@colegio.edu").password("dir123")
                    .rol(Enums.RolUsuario.ADMIN).activo(true).build());

            // 3 coordinadores
            usuarioRepo.save(Usuario.builder().nombre("Ana García Ruiz")
                    .email("ana.garcia@colegio.edu").password("coord123")
                    .rol(Enums.RolUsuario.COORDINADOR).activo(true).build());
            usuarioRepo.save(Usuario.builder().nombre("Lucía Hernández Paz")
                    .email("lucia.hernandez@colegio.edu").password("coord123")
                    .rol(Enums.RolUsuario.COORDINADOR).activo(true).build());
            usuarioRepo.save(Usuario.builder().nombre("Jorge Ramírez Soto")
                    .email("jorge.ramirez@colegio.edu").password("coord123")
                    .rol(Enums.RolUsuario.COORDINADOR).activo(true).build());

            // 15 docentes
            String[][] docentesData = {
                {"Carlos Rodríguez Díaz",   "carlos.rodriguez@colegio.edu"},
                {"María González Pérez",    "maria.gonzalez@colegio.edu"},
                {"Felipe Torres Navarro",   "felipe.torres@colegio.edu"},
                {"Sofía Morales Ortiz",     "sofia.morales@colegio.edu"},
                {"Diego Castro Villa",      "diego.castro@colegio.edu"},
                {"Valentina Ruiz Acosta",   "valentina.ruiz@colegio.edu"},
                {"Andrés Vargas Pinto",     "andres.vargas@colegio.edu"},
                {"Camila Jiménez Mora",     "camila.jimenez@colegio.edu"},
                {"Juan Pablo Gómez León",   "juanpablo.gomez@colegio.edu"},
                {"Laura Restrepo Ayala",    "laura.restrepo@colegio.edu"},
                {"Sebastián Arias Muñoz",   "sebastian.arias@colegio.edu"},
                {"Isabella Cortés Reyes",   "isabella.cortes@colegio.edu"},
                {"Mateo Quintero Bravo",    "mateo.quintero@colegio.edu"},
                {"Gabriela Silva Cárdenas", "gabriela.silva@colegio.edu"},
                {"Nicolás Ospina Duarte",   "nicolas.ospina@colegio.edu"}
            };
            List<Usuario> docentes = new ArrayList<>();
            for (String[] d : docentesData) {
                docentes.add(usuarioRepo.save(Usuario.builder()
                        .nombre(d[0]).email(d[1]).password("doc123")
                        .rol(Enums.RolUsuario.DOCENTE).activo(true).build()));
            }
            return docentes;
        }

        private List<Zona> seedZonas() {
            String[][] zonasData = {
                {"Patio Principal",     "Zona central de recreo",           "200", "QR-ZONA-PATIO",   "1234"},
                {"Cafetería",           "Zona de almuerzo estudiantil",     "150", "QR-ZONA-CAFE",    "5678"},
                {"Cancha Deportiva",    "Zona de actividad física",         "100", "QR-ZONA-CANCHA",  "9012"},
                {"Biblioteca",          "Sala de lectura y estudio",         "60", "QR-ZONA-BIBLIO",  "2468"},
                {"Corredor Norte",      "Pasillo ala norte del bloque A",   "80",  "QR-ZONA-CORR-N",  "1357"},
                {"Corredor Sur",        "Pasillo ala sur del bloque B",     "80",  "QR-ZONA-CORR-S",  "2469"},
                {"Zona de Juegos",      "Parque infantil para primaria",    "90",  "QR-ZONA-JUEGOS",  "3698"},
                {"Entrada Principal",   "Acceso y salida del plantel",      "120", "QR-ZONA-ENTRADA", "7410"}
            };
            List<Zona> zonas = new ArrayList<>();
            for (String[] z : zonasData) {
                zonas.add(zonaRepo.save(Zona.builder()
                        .nombre(z[0]).descripcion(z[1])
                        .capacidad(Integer.parseInt(z[2]))
                        .codigoQR(z[3]).pinRotativo(z[4]).activa(true).build()));
            }
            return zonas;
        }

        private List<Checkpoint> seedCheckpoints(List<Zona> zonas) {
            List<Checkpoint> result = new ArrayList<>();
            for (Zona z : zonas) {
                String base = z.getCodigoQR().replace("QR-ZONA-", "");
                int count = 2 + rnd.nextInt(2); // 2 or 3
                for (int i = 0; i < count; i++) {
                    char letra = (char) ('A' + i);
                    result.add(checkpointRepo.save(Checkpoint.builder()
                            .zona(z)
                            .nombre(z.getNombre() + " - Punto " + letra)
                            .codigoQR("QR-" + base + "-" + letra)
                            .codigoPin(String.format("%04d", 1000 + rnd.nextInt(9000)))
                            .descripcion("Punto de patrullaje " + letra + " de " + z.getNombre())
                            .activo(true).build()));
                }
            }
            return result;
        }

        /**
         * Creates shifts for 30 days in the past through 15 days in the future.
         * 3 shifts/day/zone: 07:00-07:30, 12:00-12:45, 15:00-15:30.
         */
        private List<Turno> seedTurnos(List<Usuario> docentes, List<Zona> zonas) {
            LocalDate today = LocalDate.now();
            LocalDate start = today.minusDays(30);
            LocalDate end   = today.plusDays(15);
            List<Turno> turnos = new ArrayList<>();

            int[][] horarios = {{7, 0, 7, 30}, {12, 0, 12, 45}, {15, 0, 15, 30}};
            Enums.FranjaHoraria[] franjas = {
                Enums.FranjaHoraria.RECREO_MANANA,
                Enums.FranjaHoraria.ALMUERZO,
                Enums.FranjaHoraria.RECREO_TARDE
            };

            int rrCursor = 0;
            for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
                if (d.getDayOfWeek().getValue() > 5) continue; // lun-vie solo
                for (Zona z : zonas) {
                    for (int i = 0; i < horarios.length; i++) {
                        int[] h = horarios[i];
                        Usuario docente = docentes.get(rrCursor % docentes.size());
                        rrCursor++;
                        LocalDateTime inicio = d.atTime(h[0], h[1]);
                        LocalDateTime fin    = d.atTime(h[2], h[3]);
                        Enums.EstadoTurno estado;
                        if (d.isBefore(today)) {
                            estado = Enums.EstadoTurno.COMPLETADO;
                        } else if (d.isEqual(today)) {
                            LocalDateTime now = LocalDateTime.now();
                            if (now.isAfter(fin))         estado = Enums.EstadoTurno.COMPLETADO;
                            else if (now.isAfter(inicio)) estado = Enums.EstadoTurno.EN_CURSO;
                            else                          estado = Enums.EstadoTurno.PENDIENTE;
                        } else {
                            estado = Enums.EstadoTurno.PENDIENTE;
                        }
                        turnos.add(turnoRepo.save(Turno.builder()
                                .usuario(docente).zona(z).fecha(d)
                                .fechaHoraInicio(inicio).fechaHoraFin(fin)
                                .franja(franjas[i]).estado(estado).build()));
                    }
                }
            }
            return turnos;
        }

        /**
         * 85% of past shifts get a check-in + 2-4 patrol records.
         * Returns the list of shifts that got a check-in (used for cleaning reports).
         */
        private List<Turno> seedRegistrosPresenciaYRecorrido(List<Turno> turnos, List<Checkpoint> checkpoints) {
            LocalDate today = LocalDate.now();
            List<Turno> conCheckIn = new ArrayList<>();
            for (Turno t : turnos) {
                if (!t.getFecha().isBefore(today) && t.getEstado() != Enums.EstadoTurno.COMPLETADO) continue;
                if (rnd.nextDouble() > 0.85) continue;

                List<Checkpoint> cpsZona = checkpoints.stream()
                        .filter(c -> c.getZona().getId().equals(t.getZona().getId()))
                        .toList();
                Checkpoint cpEntrada = cpsZona.isEmpty() ? null : cpsZona.get(rnd.nextInt(cpsZona.size()));
                LocalDateTime checkInTime = t.getFechaHoraInicio().plusMinutes(rnd.nextInt(5));

                Enums.MetodoCheckIn[] metodos = Enums.MetodoCheckIn.values();
                checkInRepo.save(CheckIn.builder()
                        .turno(t).checkpoint(cpEntrada)
                        .metodo(metodos[rnd.nextInt(metodos.length)])
                        .esRecorrido(false).timestamp(checkInTime).build());

                int recorridos = 2 + rnd.nextInt(3); // 2-4
                long minutos = ChronoUnit.MINUTES.between(t.getFechaHoraInicio(), t.getFechaHoraFin());
                for (int i = 0; i < recorridos && !cpsZona.isEmpty(); i++) {
                    Checkpoint cp = cpsZona.get(rnd.nextInt(cpsZona.size()));
                    long offset = Math.max(1, (minutos * (i + 1)) / (recorridos + 1));
                    checkInRepo.save(CheckIn.builder()
                            .turno(t).checkpoint(cp)
                            .metodo(Enums.MetodoCheckIn.QR)
                            .esRecorrido(true)
                            .timestamp(t.getFechaHoraInicio().plusMinutes(offset)).build());
                }
                conCheckIn.add(t);
            }
            return conCheckIn;
        }

        private void seedIncidentes(List<Turno> turnos, List<Zona> zonas, List<Usuario> docentes) {
            String[] descripciones = {
                "Caída leve durante juego, sin lesión visible",
                "Discusión entre estudiantes, mediada por docente",
                "Uso inadecuado de mobiliario deportivo",
                "Estudiante sentado solo durante todo el recreo",
                "Empujones en fila de cafetería",
                "Grafiti detectado en pared del corredor",
                "Derrame de bebida en piso resbaloso",
                "Ausencia de material didáctico en biblioteca",
                "Tránsito peligroso cerca de la reja",
                "Juego brusco con balón prohibido",
                "Observación de conducta de aislamiento",
                "Basura acumulada junto a canchas",
                "Lámpara dañada en corredor norte",
                "Puerta de emergencia bloqueada",
                "Estudiante con malestar reportado por compañera"
            };

            Enums.TipoIncidente[] tipos = Enums.TipoIncidente.values();
            Enums.SeveridadIncidente[] severidades = Enums.SeveridadIncidente.values();
            LocalDate today = LocalDate.now();

            int total = 90;
            for (int i = 0; i < total; i++) {
                Enums.TipoIncidente tipo;
                double tr = rnd.nextDouble();
                if (tr < 0.40)      tipo = Enums.TipoIncidente.CONVIVENCIA;
                else if (tr < 0.70) tipo = Enums.TipoIncidente.SEGURIDAD_FISICA;
                else if (tr < 0.90) tipo = Enums.TipoIncidente.USO_ESPACIO;
                else                tipo = Enums.TipoIncidente.OBSERVACION_SOCIAL;

                Enums.SeveridadIncidente sev;
                double sr = rnd.nextDouble();
                if (sr < 0.60)      sev = Enums.SeveridadIncidente.S1;
                else if (sr < 0.90) sev = Enums.SeveridadIncidente.S2;
                else                sev = Enums.SeveridadIncidente.S3;

                int daysBack = rnd.nextInt(45);
                LocalDateTime when = today.minusDays(daysBack)
                        .atTime(8 + rnd.nextInt(10), rnd.nextInt(60));

                Zona z = zonas.get(rnd.nextInt(zonas.size()));
                // Try to pick a shift that happened on that day+zone, else null
                Turno linkedTurno = turnos.stream()
                        .filter(t -> t.getZona().getId().equals(z.getId())
                                  && t.getFecha().equals(when.toLocalDate()))
                        .findFirst().orElse(null);

                Usuario reportadoPor = linkedTurno != null
                        ? linkedTurno.getUsuario()
                        : docentes.get(rnd.nextInt(docentes.size()));

                String estado = (daysBack > 7 || rnd.nextDouble() < 0.7) ? "RESUELTO" : "PENDIENTE";

                incidenteRepo.save(Incidente.builder()
                        .turno(linkedTurno).zona(z).reportadoPor(reportadoPor)
                        .tipo(tipo).severidad(sev)
                        .descripcion(descripciones[rnd.nextInt(descripciones.length)])
                        .cursoEstudiante(sev == Enums.SeveridadIncidente.S3
                                ? "Grado " + (6 + rnd.nextInt(6)) + (char) ('A' + rnd.nextInt(3)) : null)
                        .fechaHora(when).estado(estado).build());
            }
        }

        private void seedReportesLimpieza(List<Turno> turnosConCheckIn, List<Usuario> docentes) {
            Enums.EscalaLimpieza[] escalas = Enums.EscalaLimpieza.values();
            String[] obs = {
                "Zona en buen estado general",
                "Algunos residuos cerca de bancas",
                "Basura acumulada en papeleras",
                "Requiere limpieza inmediata",
                null
            };
            for (Turno t : turnosConCheckIn) {
                if (rnd.nextDouble() > 0.9) continue; // 90% de cobertura
                Enums.EscalaLimpieza e;
                double r = rnd.nextDouble();
                if (r < 0.55)      e = Enums.EscalaLimpieza.LIMPIO;
                else if (r < 0.85) e = Enums.EscalaLimpieza.ALGO_BASURA;
                else if (r < 0.97) e = Enums.EscalaLimpieza.MUCHA_BASURA;
                else               e = Enums.EscalaLimpieza.CRITICO;
                try {
                    limpiezaRepo.save(RegistroLimpieza.builder()
                            .turno(t).escala(e)
                            .observacion(obs[rnd.nextInt(obs.length)])
                            .registradoPor(t.getUsuario())
                            .timestamp(t.getFechaHoraFin().minusMinutes(1 + rnd.nextInt(5)))
                            .build());
                } catch (Exception ignored) { /* @OneToOne duplicate — skip */ }
            }
        }

        private void seedReasignaciones(List<Turno> turnos, List<Usuario> docentes) {
            Enums.EstadoReasignacion[] estados = Enums.EstadoReasignacion.values();
            String[] motivos = {
                "Incapacidad médica",
                "Cita médica previamente programada",
                "Capacitación institucional",
                "Reunión de padres de familia",
                "Emergencia familiar"
            };
            int created = 0;
            int attempts = 0;
            while (created < 15 && attempts < 200) {
                attempts++;
                Turno t = turnos.get(rnd.nextInt(turnos.size()));
                Usuario original = t.getUsuario();
                Usuario reemplazo = docentes.get(rnd.nextInt(docentes.size()));
                if (original.getId().equals(reemplazo.getId())) continue;
                Enums.EstadoReasignacion estado = estados[rnd.nextInt(estados.length)];
                LocalDateTime propuesta = LocalDateTime.now().minusDays(rnd.nextInt(30));
                reasignacionRepo.save(Reasignacion.builder()
                        .turnoOriginal(t).docenteOriginal(original).docenteReemplazo(reemplazo)
                        .motivo(motivos[rnd.nextInt(motivos.length)])
                        .estado(estado)
                        .timestampPropuesta(propuesta)
                        .timestampRespuesta(estado == Enums.EstadoReasignacion.PROPUESTA
                                ? null : propuesta.plusHours(1 + rnd.nextInt(6)))
                        .build());
                created++;
            }
        }

        private void seedMapaCalor(List<Zona> zonas) {
            String semana = "2026-W16";
            Enums.TipoIncidente[] tipos = {
                Enums.TipoIncidente.CONVIVENCIA,
                Enums.TipoIncidente.SEGURIDAD_FISICA,
                Enums.TipoIncidente.USO_ESPACIO,
                Enums.TipoIncidente.OBSERVACION_SOCIAL
            };
            int total = 0;
            int[][] counts = new int[zonas.size()][tipos.length];
            for (int zi = 0; zi < zonas.size(); zi++) {
                for (int ti = 0; ti < tipos.length; ti++) {
                    counts[zi][ti] = rnd.nextInt(6);
                    total += counts[zi][ti];
                }
            }
            if (total == 0) total = 1;
            for (int zi = 0; zi < zonas.size(); zi++) {
                for (int ti = 0; ti < tipos.length; ti++) {
                    if (counts[zi][ti] == 0) continue;
                    mapaCalorRepo.save(MapaCalor.builder()
                            .zona(zonas.get(zi)).franja(Enums.FranjaHoraria.RECREO_MANANA)
                            .tipoIncidente(tipos[ti])
                            .totalIncidentes(counts[zi][ti])
                            .porcentaje(Math.round((counts[zi][ti] * 10000.0) / total) / 100.0)
                            .semana(semana).build());
                }
            }
        }

        private void seedMetricas(List<Usuario> docentes) {
            String trimestre = "2026-Q2";
            for (Usuario d : docentes) {
                double pu = 65 + rnd.nextInt(35);
                double cr = 60 + rnd.nextInt(40);
                double cp = 60 + rnd.nextInt(40);
                double total = Math.round(((pu + cr + cp) / 3) * 10.0) / 10.0;
                metricaRepo.save(MetricaDocente.builder()
                        .usuario(d).trimestre(trimestre)
                        .puntualidad(pu).totalRecorridos(6 + rnd.nextInt(15))
                        .calidadRegistro(cr).contribucionPreventiva(cp)
                        .reconocimiento(total >= 85).puntajeTotal(total).build());
            }
        }

        private void seedNotificacionesIniciales(List<Usuario> usuarios) {
            for (Usuario u : usuarios) {
                if (u.getRol() != Enums.RolUsuario.DOCENTE) continue;
                if (rnd.nextDouble() > 0.5) continue;
                notifRepo.save(Notificacion.builder()
                        .usuario(u).tipo(Enums.TipoNotificacion.RECORDATORIO)
                        .mensaje("Bienvenido al sistema VigíaEscolar")
                        .leida(rnd.nextBoolean())
                        .timestamp(LocalDateTime.now().minusHours(rnd.nextInt(48)))
                        .build());
            }
        }
    }
}
