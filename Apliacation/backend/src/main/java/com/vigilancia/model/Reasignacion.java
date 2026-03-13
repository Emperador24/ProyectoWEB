package com.vigilancia.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reasignaciones")
public class Reasignacion {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turno_id", nullable = false)
    private Turno turno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "docente_original_id", nullable = false)
    private Usuario docenteOriginal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "docente_reemplazo_id")
    private Usuario docenteReemplazo;

    @Column(length = 500)
    private String motivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.EstadoReasignacion estado = Enums.EstadoReasignacion.PROPUESTA;

    private LocalDateTime timestampPropuesta = LocalDateTime.now();
    private LocalDateTime timestampRespuesta;

    public Reasignacion() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private Turno turno; private Usuario docenteOriginal;
        private Usuario docenteReemplazo; private String motivo;
        private Enums.EstadoReasignacion estado = Enums.EstadoReasignacion.PROPUESTA;
        private LocalDateTime timestampPropuesta = LocalDateTime.now();
        private LocalDateTime timestampRespuesta;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder turno(Turno turno) { this.turno = turno; return this; }
        public Builder docenteOriginal(Usuario u) { this.docenteOriginal = u; return this; }
        public Builder docenteReemplazo(Usuario u) { this.docenteReemplazo = u; return this; }
        public Builder motivo(String motivo) { this.motivo = motivo; return this; }
        public Builder estado(Enums.EstadoReasignacion estado) { this.estado = estado; return this; }
        public Builder timestampPropuesta(LocalDateTime t) { this.timestampPropuesta = t; return this; }
        public Builder timestampRespuesta(LocalDateTime t) { this.timestampRespuesta = t; return this; }
        public Reasignacion build() {
            Reasignacion r = new Reasignacion(); r.id = id; r.turno = turno;
            r.docenteOriginal = docenteOriginal; r.docenteReemplazo = docenteReemplazo;
            r.motivo = motivo; r.estado = estado; r.timestampPropuesta = timestampPropuesta;
            r.timestampRespuesta = timestampRespuesta; return r;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Turno getTurno() { return turno; }
    public void setTurno(Turno turno) { this.turno = turno; }
    public Usuario getDocenteOriginal() { return docenteOriginal; }
    public void setDocenteOriginal(Usuario u) { this.docenteOriginal = u; }
    public Usuario getDocenteReemplazo() { return docenteReemplazo; }
    public void setDocenteReemplazo(Usuario u) { this.docenteReemplazo = u; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public Enums.EstadoReasignacion getEstado() { return estado; }
    public void setEstado(Enums.EstadoReasignacion estado) { this.estado = estado; }
    public LocalDateTime getTimestampPropuesta() { return timestampPropuesta; }
    public void setTimestampPropuesta(LocalDateTime t) { this.timestampPropuesta = t; }
    public LocalDateTime getTimestampRespuesta() { return timestampRespuesta; }
    public void setTimestampRespuesta(LocalDateTime t) { this.timestampRespuesta = t; }
}