package com.vigilancia.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidentes")
public class Incidente {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turno_id")
    private Turno turno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zona_id", nullable = false)
    private Zona zona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reportado_por_id", nullable = false)
    private Usuario reportadoPor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.TipoIncidente tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.SeveridadIncidente severidad;

    @Column(length = 1000)
    private String descripcion;

    private String cursoEstudiante;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public Incidente() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private Turno turno; private Zona zona;
        private Usuario reportadoPor; private Enums.TipoIncidente tipo;
        private Enums.SeveridadIncidente severidad; private String descripcion;
        private String cursoEstudiante; private LocalDateTime timestamp = LocalDateTime.now();
        public Builder id(Long id) { this.id = id; return this; }
        public Builder turno(Turno turno) { this.turno = turno; return this; }
        public Builder zona(Zona zona) { this.zona = zona; return this; }
        public Builder reportadoPor(Usuario u) { this.reportadoPor = u; return this; }
        public Builder tipo(Enums.TipoIncidente tipo) { this.tipo = tipo; return this; }
        public Builder severidad(Enums.SeveridadIncidente s) { this.severidad = s; return this; }
        public Builder descripcion(String descripcion) { this.descripcion = descripcion; return this; }
        public Builder cursoEstudiante(String c) { this.cursoEstudiante = c; return this; }
        public Builder timestamp(LocalDateTime t) { this.timestamp = t; return this; }
        public Incidente build() {
            Incidente i = new Incidente(); i.id = id; i.turno = turno; i.zona = zona;
            i.reportadoPor = reportadoPor; i.tipo = tipo; i.severidad = severidad;
            i.descripcion = descripcion; i.cursoEstudiante = cursoEstudiante;
            i.timestamp = timestamp; return i;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Turno getTurno() { return turno; }
    public void setTurno(Turno turno) { this.turno = turno; }
    public Zona getZona() { return zona; }
    public void setZona(Zona zona) { this.zona = zona; }
    public Usuario getReportadoPor() { return reportadoPor; }
    public void setReportadoPor(Usuario reportadoPor) { this.reportadoPor = reportadoPor; }
    public Enums.TipoIncidente getTipo() { return tipo; }
    public void setTipo(Enums.TipoIncidente tipo) { this.tipo = tipo; }
    public Enums.SeveridadIncidente getSeveridad() { return severidad; }
    public void setSeveridad(Enums.SeveridadIncidente severidad) { this.severidad = severidad; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getCursoEstudiante() { return cursoEstudiante; }
    public void setCursoEstudiante(String cursoEstudiante) { this.cursoEstudiante = cursoEstudiante; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}