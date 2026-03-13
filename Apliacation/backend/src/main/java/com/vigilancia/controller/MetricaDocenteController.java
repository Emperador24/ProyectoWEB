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
    public ResponseEntity<MetricaDocente> getByUsuario(@PathVariable Long uid) {
        return repo.findByUsuarioId(uid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/reconocidos")
    public List<MetricaDocente> getReconocidos() { return repo.findByReconocimientoTrue(); }

    @PostMapping
    public MetricaDocente create(@RequestBody MetricaDocente md) { return repo.save(md); }

    @PutMapping("/{id}")
    public ResponseEntity<MetricaDocente> update(@PathVariable Long id,
                                                  @RequestBody MetricaDocente data) {
        return repo.findById(id).map(md -> {
            md.setPuntualidad(data.getPuntualidad());
            md.setTotalRecorridos(data.getTotalRecorridos());
            md.setCalidadRegistro(data.getCalidadRegistro());
            md.setContribucionPreventiva(data.getContribucionPreventiva());
            md.setReconocimiento(data.getReconocimiento());
            md.setPuntajeTotal(data.getPuntajeTotal());
            return ResponseEntity.ok(repo.save(md));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}