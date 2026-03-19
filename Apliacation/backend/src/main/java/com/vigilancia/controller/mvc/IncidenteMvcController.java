package com.vigilancia.controller.mvc;

import com.vigilancia.exception.ResourceNotFoundException;
import com.vigilancia.model.Enums;
import com.vigilancia.model.Incidente;
import com.vigilancia.repository.IncidenteRepository;
import com.vigilancia.repository.TurnoRepository;
import com.vigilancia.repository.ZonaRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.time.LocalDateTime;

/**
 * Controlador MVC Thymeleaf para Incidentes.
 */
@Controller
@RequestMapping("/incidentes")
@RequiredArgsConstructor
public class IncidenteMvcController {

    private final IncidenteRepository incidenteRepo;
    private final TurnoRepository turnoRepo;
    private final ZonaRepository zonaRepo;

    // GET /incidentes — listar todos
    @GetMapping
    public String listar(Model model) {
        model.addAttribute("incidentes", incidenteRepo.findAll());
        model.addAttribute("titulo", "Registro de Incidentes");
        return "incidentes/lista";
    }

    // GET /incidentes/{id} — detalle
    @GetMapping("/{id}")
    public String detalle(@PathVariable Long id, Model model) {
        Incidente incidente = incidenteRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente no encontrado: " + id));
        model.addAttribute("incidente", incidente);
        return "incidentes/detalle";
    }

    // GET /incidentes/nuevo — formulario
    @GetMapping("/nuevo")
    public String mostrarFormulario(Model model) {
        model.addAttribute("incidente", new Incidente());
        model.addAttribute("zonas", zonaRepo.findByActiva(true));
        model.addAttribute("turnos", turnoRepo.findAll());
        model.addAttribute("tipos", Enums.TipoIncidente.values());
        model.addAttribute("severidades", Enums.SeveridadIncidente.values());
        return "incidentes/formulario";
    }

    // POST /incidentes — guardar
    @PostMapping
    public String guardar(@Valid @ModelAttribute("incidente") Incidente incidente,
                          BindingResult resultado,
                          Model model,
                          RedirectAttributes flash) {
        if (resultado.hasErrors()) {
            model.addAttribute("zonas", zonaRepo.findByActiva(true));
            model.addAttribute("turnos", turnoRepo.findAll());
            model.addAttribute("tipos", Enums.TipoIncidente.values());
            model.addAttribute("severidades", Enums.SeveridadIncidente.values());
            return "incidentes/formulario";
        }
        if (incidente.getFechaHora() == null) incidente.setFechaHora(LocalDateTime.now());
        if (incidente.getEstado()    == null) incidente.setEstado("PENDIENTE");
        incidenteRepo.save(incidente);
        flash.addFlashAttribute("mensaje", "Incidente registrado correctamente");
        return "redirect:/incidentes";
    }

    // POST /incidentes/{id}/eliminar
    @PostMapping("/{id}/eliminar")
    public String eliminar(@PathVariable Long id, RedirectAttributes flash) {
        if (!incidenteRepo.existsById(id))
            throw new ResourceNotFoundException("Incidente no encontrado: " + id);
        incidenteRepo.deleteById(id);
        flash.addFlashAttribute("mensaje", "Incidente eliminado");
        return "redirect:/incidentes";
    }
}