package com.vigilancia.controller;

import com.vigilancia.dto.LoginRequest;
import com.vigilancia.dto.LoginResponse;
import com.vigilancia.model.Usuario;
import com.vigilancia.repository.UsuarioRepository;
import com.vigilancia.security.jwt.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        var opt = usuarioRepository.findByEmail(request.getEmail());
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciales inválidas"));
        }

        Usuario usuario = opt.get();
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciales inválidas"));
        }

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Usuario inactivo"));
        }

        String token = jwtUtil.generateToken(
                usuario.getId(), usuario.getEmail(), usuario.getRol().name());

        LoginResponse.UsuarioDto userDto = new LoginResponse.UsuarioDto(
                usuario.getId(), usuario.getNombre(), usuario.getEmail(), usuario.getRol().name());

        return ResponseEntity.ok(new LoginResponse(token, "Bearer", userDto));
    }
}
