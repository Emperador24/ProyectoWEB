package com.vigilancia.controller;

import com.vigilancia.exception.ResourceNotFoundException;
import com.vigilancia.model.Checkpoint;
import com.vigilancia.repository.CheckpointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Alias requerido por la especificación: /api/puntos-recorrido.
 * Envuelve la misma entidad Checkpoint que ya expone /api/checkpoints.
 */
@RestController
@RequestMapping("/api/puntos-recorrido")
@RequiredArgsConstructor
public class PuntoRecorridoAliasController {

    private final CheckpointRepository repo;

    @GetMapping
    public List<Checkpoint> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Checkpoint getById(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Punto de recorrido no encontrado: " + id));
    }

    @GetMapping("/zona/{zonaId}")
    public List<Checkpoint> getByZona(@PathVariable Long zonaId) {
        return repo.findByZonaId(zonaId);
    }

    @PostMapping
    public ResponseEntity<Checkpoint> create(@RequestBody Checkpoint c) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(c));
    }

    @PutMapping("/{id}")
    public Checkpoint update(@PathVariable Long id, @RequestBody Checkpoint c) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Punto de recorrido no encontrado: " + id);
        c.setId(id);
        return repo.save(c);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Punto de recorrido no encontrado: " + id);
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
