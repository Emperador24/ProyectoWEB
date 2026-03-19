package com.vigilancia.controller.mvc;

import com.vigilancia.exception.ResourceNotFoundException;
import com.vigilancia.model.Enums;
import com.vigilancia.model.Turno;
import com.vigilancia.repository.TurnoRepository;
import com.vigilancia.repository.UsuarioRepository;
import com.vigilancia.repository.ZonaRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 * Controlador MVC con Thymeleaf — vistas multipage.
 * Cubre: Spring Web MVC, th:each, th:text, th:field,
 *        findAll, findById, paso de parámetros, GET y POST.
 */
@Controller
@RequestMapping("/turnos")
@RequiredArgsConstructor
public class TurnoMvcController {

    private final TurnoRepository turnoRepo;
    private final UsuarioRepository usuarioRepo;
    private final ZonaRepository zonaRepo;

    // GET /turnos — listar todos (th:each, th:text)
    @GetMapping
    public String listar(Model model) {
        model.addAttribute("turnos", turnoRepo.findAll());
        model.addAttribute("titulo", "Gestión de Turnos");
        return "turnos/lista";
    }

    // GET /turnos/{id} — ver detalle (findById, paso de parámetros)
    @GetMapping("/{id}")
    public String detalle(@PathVariable Long id, Model model) {
        Turno turno = turnoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado: " + id));
        model.addAttribute("turno", turno);
        return "turnos/detalle";
    }

    // GET /turnos/nuevo — mostrar formulario vacío
    @GetMapping("/nuevo")
    public String mostrarFormulario(Model model) {
        model.addAttribute("turno", new Turno());
        model.addAttribute("usuarios", usuarioRepo.findByRol(Enums.RolUsuario.DOCENTE));
        model.addAttribute("zonas", zonaRepo.findByActiva(true));
        model.addAttribute("franjas", Enums.FranjaHoraria.values());
        return "turnos/formulario";
    }

    // POST /turnos — guardar nuevo turno (formulario POST)
    @PostMapping
    public String guardar(@Valid @ModelAttribute("turno") Turno turno,
                          BindingResult resultado,
                          Model model,
                          RedirectAttributes flash) {
        if (resultado.hasErrors()) {
            // Si hay errores de validación, vuelve al formulario con los errores
            model.addAttribute("usuarios", usuarioRepo.findByRol(Enums.RolUsuario.DOCENTE));
            model.addAttribute("zonas", zonaRepo.findByActiva(true));
            model.addAttribute("franjas", Enums.FranjaHoraria.values());
            return "turnos/formulario";
        }
        if (turno.getFecha() == null && turno.getFechaHoraInicio() != null) {
            turno.setFecha(turno.getFechaHoraInicio().toLocalDate());
        }
        turnoRepo.save(turno);
        flash.addFlashAttribute("mensaje", "Turno guardado correctamente");
        return "redirect:/turnos";
    }

    // GET /turnos/{id}/editar — mostrar formulario con datos existentes
    @GetMapping("/{id}/editar")
    public String mostrarEdicion(@PathVariable Long id, Model model) {
        Turno turno = turnoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado: " + id));
        model.addAttribute("turno", turno);
        model.addAttribute("usuarios", usuarioRepo.findByRol(Enums.RolUsuario.DOCENTE));
        model.addAttribute("zonas", zonaRepo.findByActiva(true));
        model.addAttribute("franjas", Enums.FranjaHoraria.values());
        return "turnos/formulario";
    }

    // POST /turnos/{id}/editar — guardar cambios
    @PostMapping("/{id}/editar")
    public String actualizar(@PathVariable Long id,
                             @Valid @ModelAttribute("turno") Turno turno,
                             BindingResult resultado,
                             Model model,
                             RedirectAttributes flash) {
        if (resultado.hasErrors()) {
            model.addAttribute("usuarios", usuarioRepo.findByRol(Enums.RolUsuario.DOCENTE));
            model.addAttribute("zonas", zonaRepo.findByActiva(true));
            model.addAttribute("franjas", Enums.FranjaHoraria.values());
            return "turnos/formulario";
        }
        turno.setId(id);
        turnoRepo.save(turno);
        flash.addFlashAttribute("mensaje", "Turno actualizado correctamente");
        return "redirect:/turnos";
    }

    // POST /turnos/{id}/eliminar — eliminar registro
    @PostMapping("/{id}/eliminar")
    public String eliminar(@PathVariable Long id, RedirectAttributes flash) {
        if (!turnoRepo.existsById(id))
            throw new ResourceNotFoundException("Turno no encontrado: " + id);
        turnoRepo.deleteById(id);
        flash.addFlashAttribute("mensaje", "Turno eliminado");
        return "redirect:/turnos";
    }
}