package com.vigilancia.controller;

import com.vigilancia.model.Zona;
import com.vigilancia.repository.ZonaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/zonas")
@RequiredArgsConstructor
public class ZonaController {

    private final ZonaRepository repo;

    @GetMapping
    public List<Zona> getAll() { return repo.findAll(); }

    @GetMapping("/activas")
    public List<Zona> getActivas() { return repo.findByActiva(true); }

    @GetMapping("/{id}")
    public ResponseEntity<Zona> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Zona create(@RequestBody Zona z) { return repo.save(z); }

    @PutMapping("/{id}")
    public ResponseEntity<Zona> update(@PathVariable Long id, @RequestBody Zona z) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        z.setId(id);
        return ResponseEntity.ok(repo.save(z));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}