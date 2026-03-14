package com.vigilancia.controller;

import com.vigilancia.model.Enums;
import com.vigilancia.model.Incidente;
import com.vigilancia.repository.IncidenteRepository;
import com.vigilancia.repository.TurnoRepository;
import com.vigilancia.repository.UsuarioRepository;
import com.vigilancia.repository.ZonaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/incidentes")
@RequiredArgsConstructor
public class IncidenteController {

    private final IncidenteRepository repo;
    private final TurnoRepository turnoRepo;
    private final UsuarioRepository usuarioRepo;
    private final ZonaRepository zonaRepo;

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
    public ResponseEntity<?> create(@RequestBody Incidente incidente) {
        // Auto-set fechaHora si no viene
        if (incidente.getFechaHora() == null) {
            incidente.setFechaHora(java.time.LocalDateTime.now());
        }
        // Auto-set estado si no viene
        if (incidente.getEstado() == null) {
            incidente.setEstado("PENDIENTE");
        }
        // Si zona viene sólo con id, recargarla completamente
        if (incidente.getZona() != null && incidente.getZona().getId() != null) {
            zonaRepo.findById(incidente.getZona().getId())
                    .ifPresent(incidente::setZona);
        }
        // Si turno viene sólo con id, recargarlo
        if (incidente.getTurno() != null && incidente.getTurno().getId() != null) {
            turnoRepo.findById(incidente.getTurno().getId())
                    .ifPresent(incidente::setTurno);
        }
        // Auto-asignar reportadoPor:
        // 1) Si viene como objeto con id, recargarlo
        // 2) Si no viene pero hay turno, usar el usuario del turno
        // 3) Si tampoco hay turno, usar el primer usuario disponible (fallback)
        if (incidente.getReportadoPor() != null && incidente.getReportadoPor().getId() != null) {
            usuarioRepo.findById(incidente.getReportadoPor().getId())
                    .ifPresent(incidente::setReportadoPor);
        } else if (incidente.getTurno() != null && incidente.getTurno().getUsuario() != null) {
            incidente.setReportadoPor(incidente.getTurno().getUsuario());
        } else {
            // Fallback: primer docente disponible
            usuarioRepo.findByRol(Enums.RolUsuario.DOCENTE).stream()
                    .findFirst().ifPresent(incidente::setReportadoPor);
        }
        return ResponseEntity.ok(repo.save(incidente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Incidente> update(@PathVariable Long id, @RequestBody Incidente data) {
        return repo.findById(id).map(i -> {
            if (data.getTipo() != null) i.setTipo(data.getTipo());
            if (data.getSeveridad() != null) i.setSeveridad(data.getSeveridad());
            if (data.getDescripcion() != null) i.setDescripcion(data.getDescripcion());
            if (data.getCursoEstudiante() != null) i.setCursoEstudiante(data.getCursoEstudiante());
            if (data.getEstado() != null) i.setEstado(data.getEstado());
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