package com.vigilancia.controller;

import com.vigilancia.exception.ResourceNotFoundException;
import com.vigilancia.model.Enums;
import com.vigilancia.model.Incidente;
import com.vigilancia.repository.IncidenteRepository;
import com.vigilancia.repository.TurnoRepository;
import com.vigilancia.repository.UsuarioRepository;
import com.vigilancia.repository.ZonaRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
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
    public Incidente getById(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente no encontrado con id: " + id));
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
    public ResponseEntity<Incidente> create(@Valid @RequestBody Incidente incidente) {
        if (incidente.getFechaHora() == null) incidente.setFechaHora(LocalDateTime.now());
        if (incidente.getEstado() == null)    incidente.setEstado("PENDIENTE");

        // Recargar zona desde BD si viene solo con id
        if (incidente.getZona() != null && incidente.getZona().getId() != null) {
            zonaRepo.findById(incidente.getZona().getId()).ifPresent(incidente::setZona);
        }
        // Recargar turno desde BD si viene solo con id
        if (incidente.getTurno() != null && incidente.getTurno().getId() != null) {
            turnoRepo.findById(incidente.getTurno().getId()).ifPresent(incidente::setTurno);
        }
        // Auto-asignar reportadoPor
        if (incidente.getReportadoPor() != null && incidente.getReportadoPor().getId() != null) {
            usuarioRepo.findById(incidente.getReportadoPor().getId()).ifPresent(incidente::setReportadoPor);
        } else if (incidente.getTurno() != null && incidente.getTurno().getUsuario() != null) {
            incidente.setReportadoPor(incidente.getTurno().getUsuario());
        } else {
            usuarioRepo.findByRol(Enums.RolUsuario.DOCENTE).stream()
                    .findFirst().ifPresent(incidente::setReportadoPor);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(incidente));
    }

    @PutMapping("/{id}")
    public Incidente update(@PathVariable Long id, @RequestBody Incidente data) {
        Incidente i = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente no encontrado con id: " + id));
        if (data.getTipo()            != null) i.setTipo(data.getTipo());
        if (data.getSeveridad()       != null) i.setSeveridad(data.getSeveridad());
        if (data.getDescripcion()     != null) i.setDescripcion(data.getDescripcion());
        if (data.getCursoEstudiante() != null) i.setCursoEstudiante(data.getCursoEstudiante());
        if (data.getEstado()          != null) i.setEstado(data.getEstado());
        return repo.save(i);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Incidente no encontrado con id: " + id);
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}