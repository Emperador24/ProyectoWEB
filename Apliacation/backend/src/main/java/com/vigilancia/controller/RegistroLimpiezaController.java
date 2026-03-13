package com.vigilancia.controller;

import com.vigilancia.model.RegistroLimpieza;
import com.vigilancia.repository.RegistroLimpiezaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/registros-limpieza")
@RequiredArgsConstructor
public class RegistroLimpiezaController {

    private final RegistroLimpiezaRepository repo;

    @GetMapping
    public List<RegistroLimpieza> getAll() { return repo.findAll(); }

    @GetMapping("/turno/{turnoId}")
    public ResponseEntity<RegistroLimpieza> getByTurno(@PathVariable Long turnoId) {
        return repo.findByTurnoId(turnoId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public RegistroLimpieza create(@RequestBody RegistroLimpieza rl) { return repo.save(rl); }

    @PutMapping("/{id}")
    public ResponseEntity<RegistroLimpieza> update(@PathVariable Long id,
                                                    @RequestBody RegistroLimpieza data) {
        return repo.findById(id).map(rl -> {
            rl.setEscala(data.getEscala());
            rl.setObservacion(data.getObservacion());
            return ResponseEntity.ok(repo.save(rl));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}