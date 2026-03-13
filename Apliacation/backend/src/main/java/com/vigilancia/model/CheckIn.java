package com.vigilancia.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkins")
public class CheckIn {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turno_id", nullable = false)
    private Turno turno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checkpoint_id")
    private Checkpoint checkpoint;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private Enums.MetodoCheckIn metodo;

    @Column(nullable = false)
    private Boolean esRecorrido = false;

    public CheckIn() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private Turno turno; private Checkpoint checkpoint;
        private LocalDateTime timestamp = LocalDateTime.now();
        private Enums.MetodoCheckIn metodo; private Boolean esRecorrido = false;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder turno(Turno turno) { this.turno = turno; return this; }
        public Builder checkpoint(Checkpoint checkpoint) { this.checkpoint = checkpoint; return this; }
        public Builder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public Builder metodo(Enums.MetodoCheckIn metodo) { this.metodo = metodo; return this; }
        public Builder esRecorrido(Boolean esRecorrido) { this.esRecorrido = esRecorrido; return this; }
        public CheckIn build() {
            CheckIn c = new CheckIn(); c.id = id; c.turno = turno; c.checkpoint = checkpoint;
            c.timestamp = timestamp; c.metodo = metodo; c.esRecorrido = esRecorrido; return c;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Turno getTurno() { return turno; }
    public void setTurno(Turno turno) { this.turno = turno; }
    public Checkpoint getCheckpoint() { return checkpoint; }
    public void setCheckpoint(Checkpoint checkpoint) { this.checkpoint = checkpoint; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public Enums.MetodoCheckIn getMetodo() { return metodo; }
    public void setMetodo(Enums.MetodoCheckIn metodo) { this.metodo = metodo; }
    public Boolean getEsRecorrido() { return esRecorrido; }
    public void setEsRecorrido(Boolean esRecorrido) { this.esRecorrido = esRecorrido; }
}