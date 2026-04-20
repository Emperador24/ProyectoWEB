package com.vigilancia.controller;

import com.vigilancia.dto.SugerenciaDocenteDto;
import com.vigilancia.exception.ResourceNotFoundException;
import com.vigilancia.model.Enums;
import com.vigilancia.model.Reasignacion;
import com.vigilancia.model.Turno;
import com.vigilancia.model.Usuario;
import com.vigilancia.repository.ReasignacionRepository;
import com.vigilancia.repository.TurnoRepository;
import com.vigilancia.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/reasignaciones")
@RequiredArgsConstructor
public class ReasignacionController {

    private final ReasignacionRepository repo;
    private final TurnoRepository turnoRepo;
    private final UsuarioRepository usuarioRepo;

    @GetMapping
    public List<Reasignacion> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Reasignacion> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/turno/{turnoId}")
    public List<Reasignacion> getByTurno(@PathVariable Long turnoId) {
        return repo.findByTurnoOriginalId(turnoId);
    }

    @PostMapping
    public Reasignacion create(@RequestBody Reasignacion r) {
        if (r.getEstado() == null) r.setEstado(Enums.EstadoReasignacion.PROPUESTA);
        if (r.getTimestampPropuesta() == null) r.setTimestampPropuesta(LocalDateTime.now());
        return repo.save(r);
    }

    @PatchMapping("/{id}/aceptar")
    public Reasignacion aceptar(@PathVariable Long id) {
        Reasignacion r = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reasignación no encontrada con id: " + id));
        r.setEstado(Enums.EstadoReasignacion.ACEPTADA);
        r.setTimestampRespuesta(LocalDateTime.now());

        if (r.getTurnoOriginal() != null && r.getDocenteReemplazo() != null) {
            Turno t = r.getTurnoOriginal();
            t.setUsuario(r.getDocenteReemplazo());
            turnoRepo.save(t);
        }
        return repo.save(r);
    }

    @PatchMapping("/{id}/rechazar")
    public Reasignacion rechazar(@PathVariable Long id) {
        Reasignacion r = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reasignación no encontrada con id: " + id));
        r.setEstado(Enums.EstadoReasignacion.RECHAZADA);
        r.setTimestampRespuesta(LocalDateTime.now());
        return repo.save(r);
    }

    /**
     * Retrocompat: el frontend actual usa PATCH /{id}/responder?estado=ACEPTADA.
     */
    @PatchMapping("/{id}/responder")
    public ResponseEntity<Reasignacion> responder(@PathVariable Long id,
                                                   @RequestParam Enums.EstadoReasignacion estado) {
        if (estado == Enums.EstadoReasignacion.ACEPTADA) return ResponseEntity.ok(aceptar(id));
        if (estado == Enums.EstadoReasignacion.RECHAZADA) return ResponseEntity.ok(rechazar(id));
        Reasignacion r = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reasignación no encontrada con id: " + id));
        r.setEstado(estado);
        r.setTimestampRespuesta(LocalDateTime.now());
        return ResponseEntity.ok(repo.save(r));
    }

    /**
     * Sugerir docentes disponibles para reemplazar a quien está asignado al turno,
     * ordenados por menor cantidad de turnos en la semana actual.
     */
    @GetMapping("/sugerir/{turnoId}")
    public List<SugerenciaDocenteDto> sugerir(@PathVariable Long turnoId) {
        Turno turno = turnoRepo.findById(turnoId)
                .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado con id: " + turnoId));

        LocalDate fecha = turno.getFecha();
        LocalDate inicioSemana = fecha.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate finSemana    = fecha.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        List<Usuario> docentes = usuarioRepo.findByRol(Enums.RolUsuario.DOCENTE).stream()
                .filter(u -> Boolean.TRUE.equals(u.getActivo()))
                .filter(u -> turno.getUsuario() == null || !u.getId().equals(turno.getUsuario().getId()))
                .filter(u -> !tieneSolapeMismoDia(u.getId(), turno))
                .toList();

        return docentes.stream()
                .map(u -> SugerenciaDocenteDto.builder()
                        .id(u.getId())
                        .nombre(u.getNombre())
                        .email(u.getEmail())
                        .turnosEstaSemana(turnoRepo.countByUsuarioIdAndFechaBetween(
                                u.getId(), inicioSemana, finSemana))
                        .build())
                .sorted(Comparator.comparingLong(SugerenciaDocenteDto::getTurnosEstaSemana))
                .toList();
    }

    private boolean tieneSolapeMismoDia(Long usuarioId, Turno turno) {
        List<Turno> turnosDia = turnoRepo.findByUsuarioAndFecha(usuarioId, turno.getFecha());
        if (turno.getFechaHoraInicio() == null || turno.getFechaHoraFin() == null) return !turnosDia.isEmpty();
        return turnosDia.stream().anyMatch(t ->
                t.getFechaHoraInicio() != null && t.getFechaHoraFin() != null
                        && t.getFechaHoraInicio().isBefore(turno.getFechaHoraFin())
                        && t.getFechaHoraFin().isAfter(turno.getFechaHoraInicio())
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
