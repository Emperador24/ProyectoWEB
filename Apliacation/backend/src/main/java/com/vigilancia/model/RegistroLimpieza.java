package com.vigilancia.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "registros_limpieza")
public class RegistroLimpieza {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turno_id", nullable = false, unique = true)
    private Turno turno;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.EscalaLimpieza escala;

    @Column(length = 500)
    private String observacion;

    private LocalDateTime timestamp = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrado_por_id")
    private Usuario registradoPor;

    public RegistroLimpieza() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private Turno turno; private Enums.EscalaLimpieza escala;
        private String observacion; private LocalDateTime timestamp = LocalDateTime.now();
        private Usuario registradoPor;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder turno(Turno turno) { this.turno = turno; return this; }
        public Builder escala(Enums.EscalaLimpieza escala) { this.escala = escala; return this; }
        public Builder observacion(String observacion) { this.observacion = observacion; return this; }
        public Builder timestamp(LocalDateTime t) { this.timestamp = t; return this; }
        public Builder registradoPor(Usuario u) { this.registradoPor = u; return this; }
        public RegistroLimpieza build() {
            RegistroLimpieza r = new RegistroLimpieza(); r.id = id; r.turno = turno;
            r.escala = escala; r.observacion = observacion; r.timestamp = timestamp;
            r.registradoPor = registradoPor; return r;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Turno getTurno() { return turno; }
    public void setTurno(Turno turno) { this.turno = turno; }
    public Enums.EscalaLimpieza getEscala() { return escala; }
    public void setEscala(Enums.EscalaLimpieza escala) { this.escala = escala; }
    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public Usuario getRegistradoPor() { return registradoPor; }
    public void setRegistradoPor(Usuario registradoPor) { this.registradoPor = registradoPor; }
}