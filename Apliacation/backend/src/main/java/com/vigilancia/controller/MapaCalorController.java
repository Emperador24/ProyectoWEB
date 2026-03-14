package com.vigilancia.controller;

import com.vigilancia.model.MapaCalor;
import com.vigilancia.repository.MapaCalorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/mapa-calor")
@RequiredArgsConstructor
public class MapaCalorController {

    private final MapaCalorRepository repo;

    @GetMapping
    public List<MapaCalor> getAll() { return repo.findAll(); }

    @GetMapping("/zona/{zonaId}")
    public List<MapaCalor> getByZona(@PathVariable Long zonaId) {
        return repo.findByZonaId(zonaId);
    }

    @GetMapping("/semana/{semana}")
    public List<MapaCalor> getBySemana(@PathVariable String semana) {
        return repo.findBySemana(semana);
    }

    @PostMapping
    public MapaCalor create(@RequestBody MapaCalor m) { return repo.save(m); }

    @PutMapping("/{id}")
    public ResponseEntity<MapaCalor> update(@PathVariable Long id, @RequestBody MapaCalor m) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        m.setId(id);
        return ResponseEntity.ok(repo.save(m));
    }
}