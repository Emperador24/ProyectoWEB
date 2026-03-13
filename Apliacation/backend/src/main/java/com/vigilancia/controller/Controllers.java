package com.vigilancia.controller;

import com.vigilancia.model.*;
import com.vigilancia.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// =================== ZONA ===================
@RestController
@RequestMapping("/api/zonas")
@RequiredArgsConstructor
class ZonaController {

    private final ZonaRepository repo;

    @GetMapping
    public List<Zona> getAll() { return repo.findAll(); }

    @GetMapping("/activas")
    public List<Zona> getActivas() { return repo.findByActivaTrue(); }

    @GetMapping("/{id}")
    public ResponseEntity<Zona> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Zona create(@Valid @RequestBody Zona zona) { return repo.save(zona); }

    @PutMapping("/{id}")
    public ResponseEntity<Zona> update(@PathVariable Long id, @RequestBody Zona data) {
        return repo.findById(id).map(z -> {
            z.setNombre(data.getNombre());
            z.setDescripcion(data.getDescripcion());
            z.setCapacidad(data.getCapacidad());
            z.setCodigoQR(data.getCodigoQR());
            z.setPinRotativo(data.getPinRotativo());
            z.setActiva(data.getActiva());
            return ResponseEntity.ok(repo.save(z));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

// =================== TURNO ===================
@RestController
@RequestMapping("/api/turnos")
@RequiredArgsConstructor
class TurnoController {

    private final TurnoRepository repo;

    @GetMapping
    public List<Turno> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Turno> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Turno> getByUsuario(@PathVariable Long usuarioId) {
        return repo.findByUsuarioId(usuarioId);
    }

    @GetMapping("/zona/{zonaId}")
    public List<Turno> getByZona(@PathVariable Long zonaId) {
        return repo.findByZonaId(zonaId);
    }

    @GetMapping("/estado/{estado}")
    public List<Turno> getByEstado(@PathVariable Enums.EstadoTurno estado) {
        return repo.findByEstado(estado);
    }

    @PostMapping
    public Turno create(@RequestBody Turno turno) { return repo.save(turno); }

    @PutMapping("/{id}")
    public ResponseEntity<Turno> update(@PathVariable Long id, @RequestBody Turno data) {
        return repo.findById(id).map(t -> {
            t.setFechaHoraInicio(data.getFechaHoraInicio());
            t.setFechaHoraFin(data.getFechaHoraFin());
            t.setFranja(data.getFranja());
            t.setEstado(data.getEstado());
            return ResponseEntity.ok(repo.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Turno> cambiarEstado(@PathVariable Long id, @RequestParam Enums.EstadoTurno estado) {
        return repo.findById(id).map(t -> {
            t.setEstado(estado);
            return ResponseEntity.ok(repo.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

// =================== INCIDENTE ===================
@RestController
@RequestMapping("/api/incidentes")
@RequiredArgsConstructor
class IncidenteController {

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

// =================== CHECKIN ===================
@RestController
@RequestMapping("/api/checkins")
@RequiredArgsConstructor
class CheckInController {

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

// =================== REASIGNACION ===================
@RestController
@RequestMapping("/api/reasignaciones")
@RequiredArgsConstructor
class ReasignacionController {

    private final ReasignacionRepository repo;

    @GetMapping
    public List<Reasignacion> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Reasignacion> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/turno/{turnoId}")
    public List<Reasignacion> getByTurno(@PathVariable Long turnoId) {
        return repo.findByTurnoId(turnoId);
    }

    @PostMapping
    public Reasignacion create(@RequestBody Reasignacion r) { return repo.save(r); }

    @PatchMapping("/{id}/responder")
    public ResponseEntity<Reasignacion> responder(@PathVariable Long id,
                                                   @RequestParam Enums.EstadoReasignacion estado) {
        return repo.findById(id).map(r -> {
            r.setEstado(estado);
            r.setTimestampRespuesta(java.time.LocalDateTime.now());
            return ResponseEntity.ok(repo.save(r));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
