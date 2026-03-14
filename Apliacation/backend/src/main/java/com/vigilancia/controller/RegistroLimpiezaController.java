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
    public List<RegistroLimpieza> getByTurno(@PathVariable Long turnoId) {
        return repo.findByTurnoId(turnoId);
    }

    @PostMapping
    public RegistroLimpieza create(@RequestBody RegistroLimpieza r) { return repo.save(r); }

    @PutMapping("/{id}")
    public ResponseEntity<RegistroLimpieza> update(@PathVariable Long id, @RequestBody RegistroLimpieza r) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        r.setId(id);
        return ResponseEntity.ok(repo.save(r));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}