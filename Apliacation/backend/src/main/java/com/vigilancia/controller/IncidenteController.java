package com.vigilancia.controller;

import com.vigilancia.model.Enums;
import com.vigilancia.model.Incidente;
import com.vigilancia.repository.IncidenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/incidentes")
@RequiredArgsConstructor
public class IncidenteController {

    private final IncidenteRepository repo;

    @GetMapping
    public List<Incidente> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Incidente> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/zona/{zonaId}")
    public List<Incidente> getByZona(@PathVariable Long zonaId) {
        return repo.findByZonaId(zonaId);
    }

    @GetMapping("/tipo/{tipo}")
    public List<Incidente> getByTipo(@PathVariable Enums.TipoIncidente tipo) {
        return repo.findByTipo(tipo);
    }

    @GetMapping("/severidad/{sev}")
    public List<Incidente> getBySeveridad(@PathVariable Enums.SeveridadIncidente sev) {
        return repo.findBySeveridad(sev);
    }

    @PostMapping
    public Incidente create(@RequestBody Incidente incidente) { return repo.save(incidente); }

    @PutMapping("/{id}")
    public ResponseEntity<Incidente> update(@PathVariable Long id, @RequestBody Incidente data) {
        return repo.findById(id).map(i -> {
            i.setTipo(data.getTipo());
            i.setSeveridad(data.getSeveridad());
            i.setDescripcion(data.getDescripcion());
            i.setCursoEstudiante(data.getCursoEstudiante());
            return ResponseEntity.ok(repo.save(i));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}