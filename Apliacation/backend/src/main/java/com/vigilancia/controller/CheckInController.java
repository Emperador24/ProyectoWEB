package com.vigilancia.controller;

import com.vigilancia.model.CheckIn;
import com.vigilancia.repository.CheckInRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/checkins")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInRepository repo;

    @GetMapping
    public List<CheckIn> getAll() { return repo.findAll(); }

    @GetMapping("/turno/{turnoId}")
    public List<CheckIn> getByTurno(@PathVariable Long turnoId) {
        return repo.findByTurnoId(turnoId);
    }

    @GetMapping("/turno/{turnoId}/recorridos")
    public List<CheckIn> getRecorridos(@PathVariable Long turnoId) {
        return repo.findByTurnoIdAndEsRecorridoTrue(turnoId);
    }

    @PostMapping
    public CheckIn create(@RequestBody CheckIn checkIn) { return repo.save(checkIn); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}