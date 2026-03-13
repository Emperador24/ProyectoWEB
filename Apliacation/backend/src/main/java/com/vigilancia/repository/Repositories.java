package com.vigilancia.repository;

import com.vigilancia.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ZonaRepository extends JpaRepository<Zona, Long> {
    List<Zona> findByActivaTrue();
}

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Long> {
    List<Turno> findByUsuarioId(Long usuarioId);
    List<Turno> findByZonaId(Long zonaId);
    List<Turno> findByEstado(Enums.EstadoTurno estado);
    List<Turno> findByFechaHoraInicioBetween(LocalDateTime desde, LocalDateTime hasta);

    @Query("SELECT t FROM Turno t WHERE t.usuario.id = :usuarioId AND t.fechaHoraInicio BETWEEN :desde AND :hasta")
    List<Turno> findByUsuarioAndFecha(Long usuarioId, LocalDateTime desde, LocalDateTime hasta);
}

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, Long> {
    List<CheckIn> findByTurnoId(Long turnoId);
    List<CheckIn> findByTurnoIdAndEsRecorridoTrue(Long turnoId);
}

@Repository
public interface IncidenteRepository extends JpaRepository<Incidente, Long> {
    List<Incidente> findByZonaId(Long zonaId);
    List<Incidente> findByTurnoId(Long turnoId);
    List<Incidente> findByTipo(Enums.TipoIncidente tipo);
    List<Incidente> findBySeveridad(Enums.SeveridadIncidente severidad);
    List<Incidente> findByReportadoPorId(Long usuarioId);

    @Query("SELECT COUNT(i) FROM Incidente i WHERE i.zona.id = :zonaId AND i.tipo = :tipo")
    Long countByZonaAndTipo(Long zonaId, Enums.TipoIncidente tipo);
}

@Repository
public interface ReasignacionRepository extends JpaRepository<Reasignacion, Long> {
    List<Reasignacion> findByTurnoId(Long turnoId);
    List<Reasignacion> findByDocenteOriginalId(Long usuarioId);
    List<Reasignacion> findByDocenteReemplazoId(Long usuarioId);
    List<Reasignacion> findByEstado(Enums.EstadoReasignacion estado);
}

@Repository
public interface RegistroLimpiezaRepository extends JpaRepository<RegistroLimpieza, Long> {
    Optional<RegistroLimpieza> findByTurnoId(Long turnoId);
}

@Repository
public interface CheckpointRepository extends JpaRepository<Checkpoint, Long> {
    List<Checkpoint> findByZonaId(Long zonaId);
    Optional<Checkpoint> findByCodigoQR(String codigoQR);
}

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByUsuarioId(Long usuarioId);
    List<Notificacion> findByUsuarioIdAndLeidaFalse(Long usuarioId);
}

@Repository
public interface MapaCalorRepository extends JpaRepository<MapaCalor, Long> {
    List<MapaCalor> findByZonaId(Long zonaId);
    List<MapaCalor> findBySemana(String semana);

    @Query("SELECT m FROM MapaCalor m WHERE m.zona.id = :zonaId AND m.semana = :semana")
    List<MapaCalor> findByZonaAndSemana(Long zonaId, String semana);
}

@Repository
public interface MetricaDocenteRepository extends JpaRepository<MetricaDocente, Long> {
    Optional<MetricaDocente> findByUsuarioId(Long usuarioId);
    List<MetricaDocente> findByReconocimientoTrue();
}