package com.vigilancia.controller;

import com.vigilancia.model.Notificacion;
import com.vigilancia.repository.NotificacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionRepository repo;

    @GetMapping
    public List<Notificacion> getAll() { return repo.findAll(); }

    @GetMapping("/usuario/{uid}")
    public List<Notificacion> getByUsuario(@PathVariable Long uid) {
        return repo.findByUsuarioId(uid);
    }

    @GetMapping("/usuario/{uid}/no-leidas")
    public List<Notificacion> getNoLeidas(@PathVariable Long uid) {
        return repo.findByUsuarioIdAndLeidaFalse(uid);
    }

    @PostMapping
    public Notificacion create(@RequestBody Notificacion n) { return repo.save(n); }

    @PatchMapping("/{id}/leer")
    public ResponseEntity<Notificacion> marcarLeida(@PathVariable Long id) {
        return repo.findById(id).map(n -> {
            n.setLeida(true);
            return ResponseEntity.ok(repo.save(n));
        }).orElse(ResponseEntity.notFound().build());
    }
}