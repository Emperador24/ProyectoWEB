package com.vigilancia.dto;

public class LoginResponse {

    private String token;
    private String tipo;
    private UsuarioDto usuario;

    public LoginResponse() {}

    public LoginResponse(String token, String tipo, UsuarioDto usuario) {
        this.token = token;
        this.tipo = tipo;
        this.usuario = usuario;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public UsuarioDto getUsuario() { return usuario; }
    public void setUsuario(UsuarioDto usuario) { this.usuario = usuario; }

    public static class UsuarioDto {
        private Long id;
        private String nombre;
        private String email;
        private String rol;

        public UsuarioDto() {}

        public UsuarioDto(Long id, String nombre, String email, String rol) {
            this.id = id;
            this.nombre = nombre;
            this.email = email;
            this.rol = rol;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRol() { return rol; }
        public void setRol(String rol) { this.rol = rol; }
    }
}
