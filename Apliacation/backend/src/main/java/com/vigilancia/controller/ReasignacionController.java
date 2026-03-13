package com.vigilancia.controller;

import com.vigilancia.model.Enums;
import com.vigilancia.model.Reasignacion;
import com.vigilancia.repository.ReasignacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reasignaciones")
@RequiredArgsConstructor
public class ReasignacionController {

    private final ReasignacionRepository repo;

    @GetMapping
    public List<Reasignacion> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Reasignacion> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/turno/{turnoId}")
    public List<Reasignacion> getByTurno(@PathVariable Long turnoId) {
        return repo.findByTurnoId(turnoId);
    }

    @PostMapping
    public Reasignacion create(@RequestBody Reasignacion r) { return repo.save(r); }

    @PatchMapping("/{id}/responder")
    public ResponseEntity<Reasignacion> responder(@PathVariable Long id,
                                                   @RequestParam Enums.EstadoReasignacion estado) {
        return repo.findById(id).map(r -> {
            r.setEstado(estado);
            r.setTimestampRespuesta(LocalDateTime.now());
            return ResponseEntity.ok(repo.save(r));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}