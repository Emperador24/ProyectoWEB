package com.vigilancia.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nombre;

    @Email @NotBlank @Column(unique = true)
    private String email;

    @NotBlank
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.RolUsuario rol;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(updatable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();

    public Usuario() {}

    public Usuario(Long id, String nombre, String email, String password,
                   Enums.RolUsuario rol, Boolean activo, LocalDateTime creadoEn) {
        this.id = id; this.nombre = nombre; this.email = email;
        this.password = password; this.rol = rol; this.activo = activo;
        this.creadoEn = creadoEn;
    }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private String nombre; private String email;
        private String password; private Enums.RolUsuario rol;
        private Boolean activo = true; private LocalDateTime creadoEn = LocalDateTime.now();
        public Builder id(Long id) { this.id = id; return this; }
        public Builder nombre(String nombre) { this.nombre = nombre; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder password(String password) { this.password = password; return this; }
        public Builder rol(Enums.RolUsuario rol) { this.rol = rol; return this; }
        public Builder activo(Boolean activo) { this.activo = activo; return this; }
        public Usuario build() {
            Usuario u = new Usuario(); u.id = id; u.nombre = nombre; u.email = email;
            u.password = password; u.rol = rol; u.activo = activo; u.creadoEn = creadoEn;
            return u;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Enums.RolUsuario getRol() { return rol; }
    public void setRol(Enums.RolUsuario rol) { this.rol = rol; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
}