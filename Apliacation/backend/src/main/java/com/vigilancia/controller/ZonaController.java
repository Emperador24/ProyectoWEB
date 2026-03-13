package com.vigilancia.controller;

import com.vigilancia.model.Zona;
import com.vigilancia.repository.ZonaRepository;
import jakarta.validation.Valid;
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
    public List<Zona> getActivas() { return repo.findByActivaTrue(); }

    @GetMapping("/{id}")
    public ResponseEntity<Zona> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Zona create(@Valid @RequestBody Zona zona) { return repo.save(zona); }

    @PutMapping("/{id}")
    public ResponseEntity<Zona> update(@PathVariable Long id, @RequestBody Zona data) {
        return repo.findById(id).map(z -> {
            z.setNombre(data.getNombre());
            z.setDescripcion(data.getDescripcion());
            z.setCapacidad(data.getCapacidad());
            z.setCodigoQR(data.getCodigoQR());
            z.setPinRotativo(data.getPinRotativo());
            z.setActiva(data.getActiva());
            return ResponseEntity.ok(repo.save(z));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}