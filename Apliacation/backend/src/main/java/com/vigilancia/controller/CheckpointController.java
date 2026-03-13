package com.vigilancia.controller;

import com.vigilancia.model.Checkpoint;
import com.vigilancia.repository.CheckpointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/checkpoints")
@RequiredArgsConstructor
public class CheckpointController {

    private final CheckpointRepository repo;

    @GetMapping
    public List<Checkpoint> getAll() { return repo.findAll(); }

    @GetMapping("/zona/{zonaId}")
    public List<Checkpoint> getByZona(@PathVariable Long zonaId) {
        return repo.findByZonaId(zonaId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Checkpoint> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Checkpoint create(@RequestBody Checkpoint cp) { return repo.save(cp); }

    @PutMapping("/{id}")
    public ResponseEntity<Checkpoint> update(@PathVariable Long id, @RequestBody Checkpoint data) {
        return repo.findById(id).map(cp -> {
            cp.setNombre(data.getNombre());
            cp.setCodigoQR(data.getCodigoQR());
            cp.setDescripcion(data.getDescripcion());
            cp.setActivo(data.getActivo());
            return ResponseEntity.ok(repo.save(cp));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}