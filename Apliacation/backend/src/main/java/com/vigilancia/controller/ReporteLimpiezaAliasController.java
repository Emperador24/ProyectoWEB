package com.vigilancia.controller;

import com.vigilancia.exception.ResourceNotFoundException;
import com.vigilancia.model.RegistroLimpieza;
import com.vigilancia.repository.RegistroLimpiezaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Alias requerido por el spec: /api/reportes-limpieza.
 * Envuelve la misma entidad RegistroLimpieza expuesta en /api/registros-limpieza.
 */
@RestController
@RequestMapping("/api/reportes-limpieza")
@RequiredArgsConstructor
public class ReporteLimpiezaAliasController {

    private final RegistroLimpiezaRepository repo;

    @GetMapping
    public List<RegistroLimpieza> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public RegistroLimpieza getById(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reporte de limpieza no encontrado: " + id));
    }

    @GetMapping("/turno/{turnoId}")
    public List<RegistroLimpieza> getByTurno(@PathVariable Long turnoId) {
        return repo.findByTurnoId(turnoId);
    }

    @GetMapping("/zona/{zonaId}")
    public List<RegistroLimpieza> getByZona(@PathVariable Long zonaId) {
        return repo.findByTurnoZonaId(zonaId);
    }

    @PostMapping
    public ResponseEntity<RegistroLimpieza> create(@RequestBody RegistroLimpieza r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(r));
    }

    @PutMapping("/{id}")
    public RegistroLimpieza update(@PathVariable Long id, @RequestBody RegistroLimpieza r) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Reporte de limpieza no encontrado: " + id);
        r.setId(id);
        return repo.save(r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Reporte de limpieza no encontrado: " + id);
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
