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
    public Turno create(@RequestBody Turno turno) { return repo.save(turno); }

    @PutMapping("/{id}")
    public ResponseEntity<Turno> update(@PathVariable Long id, @RequestBody Turno data) {
        return repo.findById(id).map(t -> {
            t.setFechaHoraInicio(data.getFechaHoraInicio());
            t.setFechaHoraFin(data.getFechaHoraFin());
            t.setFranja(data.getFranja());
            t.setEstado(data.getEstado());
            return ResponseEntity.ok(repo.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }

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