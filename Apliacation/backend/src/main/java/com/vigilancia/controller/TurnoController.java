package com.vigilancia.controller;

import com.vigilancia.model.Enums;
import com.vigilancia.model.Turno;
import com.vigilancia.repository.TurnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/turnos")
@RequiredArgsConstructor
public class TurnoController {

    private final TurnoRepository repo;

    @GetMapping
    public List<Turno> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Turno> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Turno> getByUsuario(@PathVariable Long usuarioId) {
        return repo.findByUsuarioId(usuarioId);
    }

    @GetMapping("/zona/{zonaId}")
    public List<Turno> getByZona(@PathVariable Long zonaId) {
        return repo.findByZonaId(zonaId);
    }

    @GetMapping("/estado/{estado}")
    public List<Turno> getByEstado(@PathVariable Enums.EstadoTurno estado) {
        return repo.findByEstado(estado);
    }

    @PostMapping
    public Turno create(@RequestBody Turno turno) {
        // Si viene fecha pero no fechaHoraInicio, calcularlo
        if (turno.getFecha() != null && turno.getFechaHoraInicio() == null) {
            turno.setFechaHoraInicio(turno.getFecha().atTime(10, 0));
            turno.setFechaHoraFin(turno.getFecha().atTime(10, 30));
        }
        // Si viene fechaHoraInicio pero no fecha, calcularlo
        if (turno.getFecha() == null && turno.getFechaHoraInicio() != null) {
            turno.setFecha(turno.getFechaHoraInicio().toLocalDate());
        }
        return repo.save(turno);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Turno> update(@PathVariable Long id, @RequestBody Turno data) {
        return repo.findById(id).map(t -> {
            if (data.getFecha() != null) t.setFecha(data.getFecha());
            if (data.getFechaHoraInicio() != null) t.setFechaHoraInicio(data.getFechaHoraInicio());
            if (data.getFechaHoraFin() != null) t.setFechaHoraFin(data.getFechaHoraFin());
            if (data.getFranja() != null) t.setFranja(data.getFranja());
            if (data.getEstado() != null) t.setEstado(data.getEstado());
            return ResponseEntity.ok(repo.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    // El frontend llama: PATCH /api/turnos/{id}/estado?estado=EN_CURSO
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Turno> cambiarEstado(@PathVariable Long id,
                                                @RequestParam Enums.EstadoTurno estado) {
        return repo.findById(id).map(t -> {
            t.setEstado(estado);
            return ResponseEntity.ok(repo.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}