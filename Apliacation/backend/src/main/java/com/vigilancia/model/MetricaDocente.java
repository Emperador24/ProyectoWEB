package com.vigilancia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "metricas_docente")
public class MetricaDocente {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    private String trimestre;
    private Double puntualidad = 0.0;
    private Integer totalRecorridos = 0;
    private Double calidadRegistro = 0.0;
    private Double contribucionPreventiva = 0.0;
    private Boolean reconocimiento = false;
    private Double puntajeTotal = 0.0;

    public MetricaDocente() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private Usuario usuario; private String trimestre;
        private Double puntualidad = 0.0; private Integer totalRecorridos = 0;
        private Double calidadRegistro = 0.0; private Double contribucionPreventiva = 0.0;
        private Boolean reconocimiento = false; private Double puntajeTotal = 0.0;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder usuario(Usuario u) { this.usuario = u; return this; }
        public Builder trimestre(String trimestre) { this.trimestre = trimestre; return this; }
        public Builder puntualidad(Double p) { this.puntualidad = p; return this; }
        public Builder totalRecorridos(Integer t) { this.totalRecorridos = t; return this; }
        public Builder calidadRegistro(Double c) { this.calidadRegistro = c; return this; }
        public Builder contribucionPreventiva(Double c) { this.contribucionPreventiva = c; return this; }
        public Builder reconocimiento(Boolean r) { this.reconocimiento = r; return this; }
        public Builder puntajeTotal(Double p) { this.puntajeTotal = p; return this; }
        public MetricaDocente build() {
            MetricaDocente m = new MetricaDocente(); m.id = id; m.usuario = usuario;
            m.trimestre = trimestre; m.puntualidad = puntualidad; m.totalRecorridos = totalRecorridos;
            m.calidadRegistro = calidadRegistro; m.contribucionPreventiva = contribucionPreventiva;
            m.reconocimiento = reconocimiento; m.puntajeTotal = puntajeTotal; return m;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public String getTrimestre() { return trimestre; }
    public void setTrimestre(String trimestre) { this.trimestre = trimestre; }
    public Double getPuntualidad() { return puntualidad; }
    public void setPuntualidad(Double puntualidad) { this.puntualidad = puntualidad; }
    public Integer getTotalRecorridos() { return totalRecorridos; }
    public void setTotalRecorridos(Integer totalRecorridos) { this.totalRecorridos = totalRecorridos; }
    public Double getCalidadRegistro() { return calidadRegistro; }
    public void setCalidadRegistro(Double calidadRegistro) { this.calidadRegistro = calidadRegistro; }
    public Double getContribucionPreventiva() { return contribucionPreventiva; }
    public void setContribucionPreventiva(Double contribucionPreventiva) { this.contribucionPreventiva = contribucionPreventiva; }
    public Boolean getReconocimiento() { return reconocimiento; }
    public void setReconocimiento(Boolean reconocimiento) { this.reconocimiento = reconocimiento; }
    public Double getPuntajeTotal() { return puntajeTotal; }
    public void setPuntajeTotal(Double puntajeTotal) { this.puntajeTotal = puntajeTotal; }
}