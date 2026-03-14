package com.vigilancia.controller;

import com.vigilancia.model.MetricaDocente;
import com.vigilancia.repository.MetricaDocenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/metricas")
@RequiredArgsConstructor
public class MetricaDocenteController {

    private final MetricaDocenteRepository repo;

    @GetMapping
    public List<MetricaDocente> getAll() { return repo.findAll(); }

    @GetMapping("/usuario/{uid}")
    public List<MetricaDocente> getByUsuario(@PathVariable Long uid) {
        return repo.findByUsuarioId(uid);
    }

    @GetMapping("/reconocidos")
    public List<MetricaDocente> getReconocidos() {
        return repo.findByReconocimientoTrue();
    }

    @PostMapping
    public MetricaDocente create(@RequestBody MetricaDocente m) { return repo.save(m); }

    @PutMapping("/{id}")
    public ResponseEntity<MetricaDocente> update(@PathVariable Long id, @RequestBody MetricaDocente m) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        m.setId(id);
        return ResponseEntity.ok(repo.save(m));
    }
}