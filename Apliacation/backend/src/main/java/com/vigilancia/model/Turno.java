package com.vigilancia.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "turnos")
public class Turno {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zona_id", nullable = false)
    private Zona zona;

    @Column(nullable = false)
    private LocalDateTime fechaHoraInicio;

    @Column(nullable = false)
    private LocalDateTime fechaHoraFin;

    @Enumerated(EnumType.STRING)
    private Enums.FranjaHoraria franja;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.EstadoTurno estado = Enums.EstadoTurno.PENDIENTE;

    public Turno() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private Usuario usuario; private Zona zona;
        private LocalDateTime fechaHoraInicio; private LocalDateTime fechaHoraFin;
        private Enums.FranjaHoraria franja; private Enums.EstadoTurno estado = Enums.EstadoTurno.PENDIENTE;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder usuario(Usuario usuario) { this.usuario = usuario; return this; }
        public Builder zona(Zona zona) { this.zona = zona; return this; }
        public Builder fechaHoraInicio(LocalDateTime t) { this.fechaHoraInicio = t; return this; }
        public Builder fechaHoraFin(LocalDateTime t) { this.fechaHoraFin = t; return this; }
        public Builder franja(Enums.FranjaHoraria franja) { this.franja = franja; return this; }
        public Builder estado(Enums.EstadoTurno estado) { this.estado = estado; return this; }
        public Turno build() {
            Turno t = new Turno(); t.id = id; t.usuario = usuario; t.zona = zona;
            t.fechaHoraInicio = fechaHoraInicio; t.fechaHoraFin = fechaHoraFin;
            t.franja = franja; t.estado = estado; return t;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Zona getZona() { return zona; }
    public void setZona(Zona zona) { this.zona = zona; }
    public LocalDateTime getFechaHoraInicio() { return fechaHoraInicio; }
    public void setFechaHoraInicio(LocalDateTime fechaHoraInicio) { this.fechaHoraInicio = fechaHoraInicio; }
    public LocalDateTime getFechaHoraFin() { return fechaHoraFin; }
    public void setFechaHoraFin(LocalDateTime fechaHoraFin) { this.fechaHoraFin = fechaHoraFin; }
    public Enums.FranjaHoraria getFranja() { return franja; }
    public void setFranja(Enums.FranjaHoraria franja) { this.franja = franja; }
    public Enums.EstadoTurno getEstado() { return estado; }
    public void setEstado(Enums.EstadoTurno estado) { this.estado = estado; }
}