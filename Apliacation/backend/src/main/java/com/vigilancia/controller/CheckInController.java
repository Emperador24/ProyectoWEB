package com.vigilancia.controller;

import com.vigilancia.dto.CodigoValidacionRequest;
import com.vigilancia.exception.ResourceNotFoundException;
import com.vigilancia.model.CheckIn;
import com.vigilancia.model.Checkpoint;
import com.vigilancia.model.Enums;
import com.vigilancia.model.Turno;
import com.vigilancia.repository.CheckInRepository;
import com.vigilancia.repository.CheckpointRepository;
import com.vigilancia.repository.TurnoRepository;
import com.vigilancia.repository.ZonaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/checkins")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInRepository repo;
    private final CheckpointRepository checkpointRepo;
    private final TurnoRepository turnoRepo;
    private final ZonaRepository zonaRepo;

    @GetMapping
    public List<CheckIn> getAll() { return repo.findAll(); }

    @GetMapping("/turno/{turnoId}")
    public List<CheckIn> getByTurno(@PathVariable Long turnoId) {
        return repo.findByTurnoId(turnoId);
    }

    @GetMapping("/turno/{turnoId}/recorridos")
    public List<CheckIn> getRecorridos(@PathVariable Long turnoId) {
        return repo.findByTurnoIdAndEsRecorrido(turnoId, true);
    }

    @PostMapping
    public CheckIn create(@RequestBody CheckIn c) {
        if (c.getTimestamp() == null) c.setTimestamp(LocalDateTime.now());
        return repo.save(c);
    }

    @PostMapping("/qr")
    public CheckIn validarQR(@RequestBody CodigoValidacionRequest req) {
        Turno turno = turnoRepo.findById(req.getTurnoId())
                .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado: " + req.getTurnoId()));
        Optional<Checkpoint> cp = checkpointRepo.findByCodigoQR(req.getCodigoQR());
        if (cp.isEmpty() && (turno.getZona() == null
                || !req.getCodigoQR().equals(turno.getZona().getCodigoQR()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Código QR inválido: " + req.getCodigoQR());
        }
        if (cp.isPresent() && !cp.get().getZona().getId().equals(turno.getZona().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El QR pertenece a otra zona distinta a la del turno");
        }
        boolean esRecorrido = !repo.findByTurnoId(turno.getId()).isEmpty();
        return repo.save(CheckIn.builder()
                .turno(turno)
                .checkpoint(cp.orElse(null))
                .metodo(Enums.MetodoCheckIn.QR)
                .esRecorrido(esRecorrido)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PostMapping("/pin")
    public CheckIn validarPIN(@RequestBody CodigoValidacionRequest req) {
        Turno turno = turnoRepo.findById(req.getTurnoId())
                .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado: " + req.getTurnoId()));
        Optional<Checkpoint> cp = checkpointRepo.findByCodigoPin(req.getCodigoPin());
        boolean pinZonaValido = turno.getZona() != null
                && req.getCodigoPin() != null
                && req.getCodigoPin().equals(turno.getZona().getPinRotativo());
        if (cp.isEmpty() && !pinZonaValido) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "PIN inválido: " + req.getCodigoPin());
        }
        if (cp.isPresent() && !cp.get().getZona().getId().equals(turno.getZona().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El PIN pertenece a otra zona distinta a la del turno");
        }
        boolean esRecorrido = !repo.findByTurnoId(turno.getId()).isEmpty();
        return repo.save(CheckIn.builder()
                .turno(turno)
                .checkpoint(cp.orElse(null))
                .metodo(Enums.MetodoCheckIn.PIN)
                .esRecorrido(esRecorrido)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
