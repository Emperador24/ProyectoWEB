package com.vigilancia.controller;

import com.vigilancia.exception.ResourceNotFoundException;
import com.vigilancia.model.Enums;
import com.vigilancia.model.Turno;
import com.vigilancia.repository.TurnoRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/turnos")
@RequiredArgsConstructor
public class TurnoController {

    private final TurnoRepository repo;

    @GetMapping
    public List<Turno> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Turno getById(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado con id: " + id));
    }

    @GetMapping("/usuario/{uid}")
    public List<Turno> getByUsuario(@PathVariable Long uid) {
        return repo.findByUsuarioId(uid);
    }

    @GetMapping("/zona/{zid}")
    public List<Turno> getByZona(@PathVariable Long zid) {
        return repo.findByZonaId(zid);
    }

    @GetMapping("/estado/{estado}")
    public List<Turno> getByEstado(@PathVariable Enums.EstadoTurno estado) {
        return repo.findByEstado(estado);
    }

    @GetMapping("/fecha/{fecha}")
    public List<Turno> getByFecha(@PathVariable String fecha) {
        return repo.findByFecha(LocalDate.parse(fecha));
    }

    @PostMapping
    public ResponseEntity<Turno> create(@Valid @RequestBody Turno t) {
        // Si viene fechaHoraInicio pero no fecha, calcula fecha automáticamente
        if (t.getFecha() == null && t.getFechaHoraInicio() != null) {
            t.setFecha(t.getFechaHoraInicio().toLocalDate());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(t));
    }

    @PutMapping("/{id}")
    public Turno update(@PathVariable Long id, @Valid @RequestBody Turno t) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Turno no encontrado con id: " + id);
        t.setId(id);
        if (t.getFecha() == null && t.getFechaHoraInicio() != null) {
            t.setFecha(t.getFechaHoraInicio().toLocalDate());
        }
        return repo.save(t);
    }

    @PatchMapping("/{id}/estado")
    public Turno cambiarEstado(@PathVariable Long id,
                               @RequestParam Enums.EstadoTurno estado) {
        Turno t = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado con id: " + id));
        t.setEstado(estado);
        return repo.save(t);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Turno no encontrado con id: " + id);
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}