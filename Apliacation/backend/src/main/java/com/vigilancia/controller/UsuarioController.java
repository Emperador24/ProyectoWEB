package com.vigilancia.controller;

import com.vigilancia.model.Enums;
import com.vigilancia.model.Usuario;
import com.vigilancia.repository.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository repo;

    @GetMapping
    public List<Usuario> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/rol/{rol}")
    public List<Usuario> getByRol(@PathVariable Enums.RolUsuario rol) {
        return repo.findByRol(rol);
    }

    @PostMapping
    public Usuario create(@Valid @RequestBody Usuario usuario) {
        return repo.save(usuario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> update(@PathVariable Long id, @Valid @RequestBody Usuario data) {
        return repo.findById(id).map(u -> {
            u.setNombre(data.getNombre());
            u.setEmail(data.getEmail());
            u.setRol(data.getRol());
            u.setActivo(data.getActivo());
            return ResponseEntity.ok(repo.save(u));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
