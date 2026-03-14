package com.vigilancia.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidentes")
public class Incidente {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "turno_id")
    private Turno turno;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "zona_id", nullable = false)
    private Zona zona;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reportado_por_id", nullable = true)
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

    // El frontend usa 'fechaHora' para filtrar y mostrar
    @Column(nullable = false)
    private LocalDateTime fechaHora = LocalDateTime.now();

    // Estado del incidente (frontend usa PENDIENTE, EN_PROCESO, RESUELTO)
    private String estado = "PENDIENTE";

    public Incidente() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private Turno turno; private Zona zona;
        private Usuario reportadoPor; private Enums.TipoIncidente tipo;
        private Enums.SeveridadIncidente severidad; private String descripcion;
        private String cursoEstudiante;
        private LocalDateTime fechaHora = LocalDateTime.now();
        private String estado = "PENDIENTE";

        public Builder id(Long id) { this.id = id; return this; }
        public Builder turno(Turno turno) { this.turno = turno; return this; }
        public Builder zona(Zona zona) { this.zona = zona; return this; }
        public Builder reportadoPor(Usuario u) { this.reportadoPor = u; return this; }
        public Builder tipo(Enums.TipoIncidente tipo) { this.tipo = tipo; return this; }
        public Builder severidad(Enums.SeveridadIncidente s) { this.severidad = s; return this; }
        public Builder descripcion(String descripcion) { this.descripcion = descripcion; return this; }
        public Builder cursoEstudiante(String c) { this.cursoEstudiante = c; return this; }
        public Builder fechaHora(LocalDateTime t) { this.fechaHora = t; return this; }
        // Alias para compatibilidad con DataLoader que usa timestamp
        public Builder timestamp(LocalDateTime t) { this.fechaHora = t; return this; }
        public Builder estado(String estado) { this.estado = estado; return this; }
        public Incidente build() {
            Incidente i = new Incidente(); i.id = id; i.turno = turno; i.zona = zona;
            i.reportadoPor = reportadoPor; i.tipo = tipo; i.severidad = severidad;
            i.descripcion = descripcion; i.cursoEstudiante = cursoEstudiante;
            i.fechaHora = fechaHora; i.estado = estado; return i;
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
    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}