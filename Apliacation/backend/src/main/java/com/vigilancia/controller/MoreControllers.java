package com.vigilancia.controller;

import com.vigilancia.model.*;
import com.vigilancia.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// =================== CHECKPOINT ===================
@RestController
@RequestMapping("/api/checkpoints")
@RequiredArgsConstructor
class CheckpointController {
    private final CheckpointRepository repo;

    @GetMapping public List<Checkpoint> getAll() { return repo.findAll(); }

    @GetMapping("/zona/{zonaId}")
    public List<Checkpoint> getByZona(@PathVariable Long zonaId) { return repo.findByZonaId(zonaId); }

    @GetMapping("/{id}")
    public ResponseEntity<Checkpoint> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Checkpoint create(@RequestBody Checkpoint cp) { return repo.save(cp); }

    @PutMapping("/{id}")
    public ResponseEntity<Checkpoint> update(@PathVariable Long id, @RequestBody Checkpoint data) {
        return repo.findById(id).map(cp -> {
            cp.setNombre(data.getNombre());
            cp.setCodigoQR(data.getCodigoQR());
            cp.setDescripcion(data.getDescripcion());
            cp.setActivo(data.getActivo());
            return ResponseEntity.ok(repo.save(cp));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id); return ResponseEntity.noContent().build();
    }
}

// =================== REGISTRO LIMPIEZA ===================
@RestController
@RequestMapping("/api/registros-limpieza")
@RequiredArgsConstructor
class RegistroLimpiezaController {
    private final RegistroLimpiezaRepository repo;

    @GetMapping public List<RegistroLimpieza> getAll() { return repo.findAll(); }

    @GetMapping("/turno/{turnoId}")
    public ResponseEntity<RegistroLimpieza> getByTurno(@PathVariable Long turnoId) {
        return repo.findByTurnoId(turnoId).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public RegistroLimpieza create(@RequestBody RegistroLimpieza rl) { return repo.save(rl); }

    @PutMapping("/{id}")
    public ResponseEntity<RegistroLimpieza> update(@PathVariable Long id, @RequestBody RegistroLimpieza data) {
        return repo.findById(id).map(rl -> {
            rl.setEscala(data.getEscala());
            rl.setObservacion(data.getObservacion());
            return ResponseEntity.ok(repo.save(rl));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id); return ResponseEntity.noContent().build();
    }
}

// =================== NOTIFICACION ===================
@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
class NotificacionController {
    private final NotificacionRepository repo;

    @GetMapping public List<Notificacion> getAll() { return repo.findAll(); }

    @GetMapping("/usuario/{uid}")
    public List<Notificacion> getByUsuario(@PathVariable Long uid) { return repo.findByUsuarioId(uid); }

    @GetMapping("/usuario/{uid}/no-leidas")
    public List<Notificacion> getNoLeidas(@PathVariable Long uid) { return repo.findByUsuarioIdAndLeidaFalse(uid); }

    @PostMapping
    public Notificacion create(@RequestBody Notificacion n) { return repo.save(n); }

    @PatchMapping("/{id}/leer")
    public ResponseEntity<Notificacion> marcarLeida(@PathVariable Long id) {
        return repo.findById(id).map(n -> { n.setLeida(true); return ResponseEntity.ok(repo.save(n)); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id); return ResponseEntity.noContent().build();
    }
}

// =================== MAPA CALOR ===================
@RestController
@RequestMapping("/api/mapa-calor")
@RequiredArgsConstructor
class MapaCalorController {
    private final MapaCalorRepository repo;

    @GetMapping public List<MapaCalor> getAll() { return repo.findAll(); }

    @GetMapping("/zona/{zonaId}")
    public List<MapaCalor> getByZona(@PathVariable Long zonaId) { return repo.findByZonaId(zonaId); }

    @GetMapping("/semana/{semana}")
    public List<MapaCalor> getBySemana(@PathVariable String semana) { return repo.findBySemana(semana); }

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
        repo.deleteById(id); return ResponseEntity.noContent().build();
    }
}

// =================== METRICA DOCENTE ===================
@RestController
@RequestMapping("/api/metricas")
@RequiredArgsConstructor
class MetricaDocenteController {
    private final MetricaDocenteRepository repo;

    @GetMapping public List<MetricaDocente> getAll() { return repo.findAll(); }

    @GetMapping("/usuario/{uid}")
    public ResponseEntity<MetricaDocente> getByUsuario(@PathVariable Long uid) {
        return repo.findByUsuarioId(uid).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/reconocidos")
    public List<MetricaDocente> getReconocidos() { return repo.findByReconocimientoTrue(); }

    @PostMapping
    public MetricaDocente create(@RequestBody MetricaDocente md) { return repo.save(md); }

    @PutMapping("/{id}")
    public ResponseEntity<MetricaDocente> update(@PathVariable Long id, @RequestBody MetricaDocente data) {
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
        repo.deleteById(id); return ResponseEntity.noContent().build();
    }
}
