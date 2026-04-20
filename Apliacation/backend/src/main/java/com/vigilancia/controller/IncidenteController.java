package com.vigilancia.controller;

import com.vigilancia.dto.MapaCalorItemDto;
import com.vigilancia.dto.ResumenIncidentesDto;
import com.vigilancia.exception.ResourceNotFoundException;
import com.vigilancia.model.Enums;
import com.vigilancia.model.Incidente;
import com.vigilancia.model.Notificacion;
import com.vigilancia.model.Usuario;
import com.vigilancia.repository.IncidenteRepository;
import com.vigilancia.repository.NotificacionRepository;
import com.vigilancia.repository.TurnoRepository;
import com.vigilancia.repository.UsuarioRepository;
import com.vigilancia.repository.ZonaRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/incidentes")
@RequiredArgsConstructor
public class IncidenteController {

    private final IncidenteRepository repo;
    private final TurnoRepository turnoRepo;
    private final UsuarioRepository usuarioRepo;
    private final ZonaRepository zonaRepo;
    private final NotificacionRepository notifRepo;

    @GetMapping
    public List<Incidente> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Incidente getById(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente no encontrado con id: " + id));
    }

    @GetMapping("/zona/{zonaId}")
    public List<Incidente> getByZona(@PathVariable Long zonaId) { return repo.findByZonaId(zonaId); }

    @GetMapping("/tipo/{tipo}")
    public List<Incidente> getByTipo(@PathVariable Enums.TipoIncidente tipo) { return repo.findByTipo(tipo); }

    @GetMapping("/severidad/{sev}")
    public List<Incidente> getBySeveridad(@PathVariable Enums.SeveridadIncidente sev) {
        return repo.findBySeveridad(sev);
    }

    @PostMapping
    public ResponseEntity<Incidente> create(@Valid @RequestBody Incidente incidente) {
        if (incidente.getFechaHora() == null) incidente.setFechaHora(LocalDateTime.now());
        if (incidente.getEstado() == null)    incidente.setEstado("PENDIENTE");

        if (incidente.getZona() != null && incidente.getZona().getId() != null) {
            zonaRepo.findById(incidente.getZona().getId()).ifPresent(incidente::setZona);
        }
        if (incidente.getTurno() != null && incidente.getTurno().getId() != null) {
            turnoRepo.findById(incidente.getTurno().getId()).ifPresent(incidente::setTurno);
        }
        if (incidente.getReportadoPor() != null && incidente.getReportadoPor().getId() != null) {
            usuarioRepo.findById(incidente.getReportadoPor().getId()).ifPresent(incidente::setReportadoPor);
        } else if (incidente.getTurno() != null && incidente.getTurno().getUsuario() != null) {
            incidente.setReportadoPor(incidente.getTurno().getUsuario());
        } else {
            usuarioRepo.findByRol(Enums.RolUsuario.DOCENTE).stream()
                    .findFirst().ifPresent(incidente::setReportadoPor);
        }

        Incidente saved = repo.save(incidente);

        if (esSeveridad3(saved.getSeveridad())) notificarCoordinadores(saved);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
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

    @PatchMapping("/{id}/resolver")
    public Incidente resolver(@PathVariable Long id) {
        Incidente i = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente no encontrado con id: " + id));
        i.setEstado("RESUELTO");
        return repo.save(i);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Incidente no encontrado con id: " + id);
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---------------------- Analytics ----------------------

    @GetMapping("/analytics/mapa-calor")
    public List<MapaCalorItemDto> mapaCalor() {
        List<Incidente> all = repo.findAll();
        long total = all.size();
        if (total == 0) return List.of();

        Map<String, MapaCalorItemDto> acc = new HashMap<>();
        for (Incidente i : all) {
            if (i.getZona() == null || i.getTipo() == null) continue;
            String key = i.getZona().getId() + "::" + i.getTipo().name();
            MapaCalorItemDto cur = acc.get(key);
            if (cur == null) {
                cur = MapaCalorItemDto.builder()
                        .zonaId(i.getZona().getId())
                        .zona(i.getZona().getNombre())
                        .tipo(i.getTipo())
                        .cantidad(0L)
                        .porcentaje(0.0)
                        .build();
                acc.put(key, cur);
            }
            cur.setCantidad(cur.getCantidad() + 1);
        }
        for (MapaCalorItemDto d : acc.values()) {
            d.setPorcentaje(Math.round((d.getCantidad() * 10000.0) / total) / 100.0);
        }
        return acc.values().stream()
                .sorted((a, b) -> Long.compare(b.getCantidad(), a.getCantidad()))
                .toList();
    }

    @GetMapping("/analytics/resumen")
    public ResumenIncidentesDto resumen() {
        List<Incidente> all = repo.findAll();

        Map<String, Long> porTipo = all.stream()
                .filter(i -> i.getTipo() != null)
                .collect(Collectors.groupingBy(i -> i.getTipo().name(), Collectors.counting()));

        Map<String, Long> porSeveridad = all.stream()
                .filter(i -> i.getSeveridad() != null)
                .collect(Collectors.groupingBy(i -> i.getSeveridad().name(), Collectors.counting()));

        Map<String, Long> porZona = all.stream()
                .filter(i -> i.getZona() != null)
                .collect(Collectors.groupingBy(i -> i.getZona().getNombre(), Collectors.counting()));

        return ResumenIncidentesDto.builder()
                .total(all.size())
                .porTipo(porTipo)
                .porSeveridad(porSeveridad)
                .porZona(porZona)
                .build();
    }

    // ---------------------- helpers ----------------------

    private boolean esSeveridad3(Enums.SeveridadIncidente s) {
        if (s == null) return false;
        // S3 en este proyecto representa la severidad más alta (S3_ATENCION_INMEDIATA del spec)
        return s == Enums.SeveridadIncidente.S3;
    }

    private void notificarCoordinadores(Incidente incidente) {
        List<Usuario> coords = usuarioRepo.findByRol(Enums.RolUsuario.COORDINADOR);
        String msg = "Incidente S3 en " + incidente.getZona().getNombre()
                + ": " + incidente.getDescripcion();
        for (Usuario c : coords) {
            notifRepo.save(Notificacion.builder()
                    .usuario(c)
                    .turno(incidente.getTurno())
                    .incidente(incidente)
                    .tipo(Enums.TipoNotificacion.ALERTA)
                    .mensaje(msg)
                    .leida(false)
                    .timestamp(LocalDateTime.now())
                    .build());
        }
    }
}
