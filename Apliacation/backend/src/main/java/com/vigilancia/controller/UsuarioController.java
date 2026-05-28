package com.vigilancia.controller;

import com.vigilancia.exception.ResourceNotFoundException;
import com.vigilancia.model.Enums;
import com.vigilancia.model.Usuario;
import com.vigilancia.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository repo;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<Usuario> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Usuario getById(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
    }

    @GetMapping("/rol/{rol}")
    public List<Usuario> getByRol(@PathVariable Enums.RolUsuario rol) {
        return repo.findByRol(rol);
    }

    @PostMapping
    public ResponseEntity<Usuario> create(@Valid @RequestBody Usuario u) {
        u.setPassword(passwordEncoder.encode(u.getPassword()));
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(u));
    }

    @PutMapping("/{id}")
    public Usuario update(@PathVariable Long id, @Valid @RequestBody Usuario u) {
        Usuario existente = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
        u.setId(id);
        if (u.getPassword() == null || u.getPassword().isBlank()) {
            u.setPassword(existente.getPassword());
        } else {
            u.setPassword(passwordEncoder.encode(u.getPassword()));
        }
        return repo.save(u);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Usuario no encontrado con id: " + id);
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}