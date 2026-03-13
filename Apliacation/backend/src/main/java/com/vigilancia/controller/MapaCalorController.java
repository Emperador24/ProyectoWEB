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
    public MapaCalor create(@RequestBody MapaCalor mc) { return repo.save(mc); }

    @PutMapping("/{id}")
    public ResponseEntity<MapaCalor> update(@PathVariable Long id, @RequestBody MapaCalor data) {
        return repo.findById(id).map(mc -> {
            mc.setTotalIncidentes(data.getTotalIncidentes());
            mc.setPorcentaje(data.getPorcentaje());
            return ResponseEntity.ok(repo.save(mc));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}