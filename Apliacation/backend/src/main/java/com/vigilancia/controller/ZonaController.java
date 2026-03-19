package com.vigilancia.controller;

import com.vigilancia.exception.ResourceNotFoundException;
import com.vigilancia.model.Zona;
import com.vigilancia.repository.ZonaRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    public Zona getById(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zona no encontrada con id: " + id));
    }

    @PostMapping
    public ResponseEntity<Zona> create(@Valid @RequestBody Zona z) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(z));
    }

    @PutMapping("/{id}")
    public Zona update(@PathVariable Long id, @Valid @RequestBody Zona z) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Zona no encontrada con id: " + id);
        z.setId(id);
        return repo.save(z);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Zona no encontrada con id: " + id);
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}