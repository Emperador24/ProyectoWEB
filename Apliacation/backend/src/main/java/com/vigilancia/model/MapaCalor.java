package com.vigilancia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "mapa_calor")
public class MapaCalor {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "zona_id", nullable = false)
    private Zona zona;

    @Enumerated(EnumType.STRING)
    private Enums.FranjaHoraria franja;

    @Enumerated(EnumType.STRING)
    private Enums.TipoIncidente tipoIncidente;

    private Integer totalIncidentes = 0;
    private Double porcentaje = 0.0;
    private String semana;

    public MapaCalor() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private Zona zona; private Enums.FranjaHoraria franja;
        private Enums.TipoIncidente tipoIncidente; private Integer totalIncidentes = 0;
        private Double porcentaje = 0.0; private String semana;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder zona(Zona zona) { this.zona = zona; return this; }
        public Builder franja(Enums.FranjaHoraria franja) { this.franja = franja; return this; }
        public Builder tipoIncidente(Enums.TipoIncidente t) { this.tipoIncidente = t; return this; }
        public Builder totalIncidentes(Integer t) { this.totalIncidentes = t; return this; }
        public Builder porcentaje(Double p) { this.porcentaje = p; return this; }
        public Builder semana(String semana) { this.semana = semana; return this; }
        public MapaCalor build() {
            MapaCalor m = new MapaCalor(); m.id = id; m.zona = zona; m.franja = franja;
            m.tipoIncidente = tipoIncidente; m.totalIncidentes = totalIncidentes;
            m.porcentaje = porcentaje; m.semana = semana; return m;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Zona getZona() { return zona; }
    public void setZona(Zona zona) { this.zona = zona; }
    public Enums.FranjaHoraria getFranja() { return franja; }
    public void setFranja(Enums.FranjaHoraria franja) { this.franja = franja; }
    public Enums.TipoIncidente getTipoIncidente() { return tipoIncidente; }
    public void setTipoIncidente(Enums.TipoIncidente tipoIncidente) { this.tipoIncidente = tipoIncidente; }
    public Integer getTotalIncidentes() { return totalIncidentes; }
    public void setTotalIncidentes(Integer totalIncidentes) { this.totalIncidentes = totalIncidentes; }
    public Double getPorcentaje() { return porcentaje; }
    public void setPorcentaje(Double porcentaje) { this.porcentaje = porcentaje; }
    public String getSemana() { return semana; }
    public void setSemana(String semana) { this.semana = semana; }
}