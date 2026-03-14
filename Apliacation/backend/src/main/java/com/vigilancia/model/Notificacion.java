package com.vigilancia.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
public class Notificacion {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "turno_id")
    private Turno turno;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "incidente_id")
    private Incidente incidente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.TipoNotificacion tipo;

    @Column(length = 500)
    private String mensaje;

    @Column(nullable = false)
    private Boolean leida = false;

    private LocalDateTime timestamp = LocalDateTime.now();

    public Notificacion() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private Usuario usuario; private Turno turno;
        private Incidente incidente; private Enums.TipoNotificacion tipo;
        private String mensaje; private Boolean leida = false;
        private LocalDateTime timestamp = LocalDateTime.now();
        public Builder id(Long id) { this.id = id; return this; }
        public Builder usuario(Usuario u) { this.usuario = u; return this; }
        public Builder turno(Turno turno) { this.turno = turno; return this; }
        public Builder incidente(Incidente i) { this.incidente = i; return this; }
        public Builder tipo(Enums.TipoNotificacion tipo) { this.tipo = tipo; return this; }
        public Builder mensaje(String mensaje) { this.mensaje = mensaje; return this; }
        public Builder leida(Boolean leida) { this.leida = leida; return this; }
        public Builder timestamp(LocalDateTime t) { this.timestamp = t; return this; }
        public Notificacion build() {
            Notificacion n = new Notificacion(); n.id = id; n.usuario = usuario;
            n.turno = turno; n.incidente = incidente; n.tipo = tipo;
            n.mensaje = mensaje; n.leida = leida; n.timestamp = timestamp; return n;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Turno getTurno() { return turno; }
    public void setTurno(Turno turno) { this.turno = turno; }
    public Incidente getIncidente() { return incidente; }
    public void setIncidente(Incidente incidente) { this.incidente = incidente; }
    public Enums.TipoNotificacion getTipo() { return tipo; }
    public void setTipo(Enums.TipoNotificacion tipo) { this.tipo = tipo; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public Boolean getLeida() { return leida; }
    public void setLeida(Boolean leida) { this.leida = leida; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}