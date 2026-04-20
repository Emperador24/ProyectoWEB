package com.vigilancia.controller;

import com.vigilancia.model.CheckIn;
import com.vigilancia.repository.CheckInRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Alias requerido por el spec: /api/registros-recorrido.
 * Representa registros de patrullaje (esRecorrido = true).
 */
@RestController
@RequestMapping("/api/registros-recorrido")
@RequiredArgsConstructor
public class RegistroRecorridoAliasController {

    private final CheckInRepository repo;

    @GetMapping("/turno/{turnoId}")
    public List<CheckIn> getByTurno(@PathVariable Long turnoId) {
        return repo.findByTurnoIdAndEsRecorrido(turnoId, true);
    }

    @PostMapping
    public CheckIn create(@RequestBody CheckIn c) {
        if (c.getTimestamp() == null) c.setTimestamp(LocalDateTime.now());
        c.setEsRecorrido(true);
        return repo.save(c);
    }
}
