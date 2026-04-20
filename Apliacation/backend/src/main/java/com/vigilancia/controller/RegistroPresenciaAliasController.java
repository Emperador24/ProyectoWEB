package com.vigilancia.controller;

import com.vigilancia.dto.CodigoValidacionRequest;
import com.vigilancia.model.CheckIn;
import com.vigilancia.repository.CheckInRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Alias requerido por el spec: /api/registros-presencia.
 * Representa check-ins de presencia (esRecorrido = false).
 */
@RestController
@RequestMapping("/api/registros-presencia")
@RequiredArgsConstructor
public class RegistroPresenciaAliasController {

    private final CheckInRepository repo;
    private final CheckInController checkInController;

    @GetMapping("/turno/{turnoId}")
    public List<CheckIn> getByTurno(@PathVariable Long turnoId) {
        return repo.findByTurnoIdAndEsRecorrido(turnoId, false);
    }

    @PostMapping
    public CheckIn create(@RequestBody CheckIn c) {
        if (c.getEsRecorrido() == null) c.setEsRecorrido(false);
        return checkInController.create(c);
    }

    @PostMapping("/qr")
    public CheckIn validarQR(@RequestBody CodigoValidacionRequest req) {
        return checkInController.validarQR(req);
    }

    @PostMapping("/pin")
    public CheckIn validarPIN(@RequestBody CodigoValidacionRequest req) {
        return checkInController.validarPIN(req);
    }
}
