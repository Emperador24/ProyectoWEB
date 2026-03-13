package com.vigilancia.repository;

import com.vigilancia.model.Enums;
import com.vigilancia.model.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Long> {
    List<Turno> findByUsuarioId(Long usuarioId);
    List<Turno> findByZonaId(Long zonaId);
    List<Turno> findByEstado(Enums.EstadoTurno estado);
    List<Turno> findByFechaHoraInicioBetween(LocalDateTime desde, LocalDateTime hasta);

    @Query("SELECT t FROM Turno t WHERE t.usuario.id = :usuarioId AND t.fechaHoraInicio BETWEEN :desde AND :hasta")
    List<Turno> findByUsuarioAndFecha(Long usuarioId, LocalDateTime desde, LocalDateTime hasta);
}