package com.vigilancia.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "zonas")
public class Zona {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nombre;
    private String descripcion;
    private Integer capacidad;

    @Column(unique = true)
    private String codigoQR;
    private String pinRotativo;

    @Column(nullable = false)
    private Boolean activa = true;

    public Zona() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private String nombre; private String descripcion;
        private Integer capacidad; private String codigoQR; private String pinRotativo;
        private Boolean activa = true;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder nombre(String nombre) { this.nombre = nombre; return this; }
        public Builder descripcion(String descripcion) { this.descripcion = descripcion; return this; }
        public Builder capacidad(Integer capacidad) { this.capacidad = capacidad; return this; }
        public Builder codigoQR(String codigoQR) { this.codigoQR = codigoQR; return this; }
        public Builder pinRotativo(String pinRotativo) { this.pinRotativo = pinRotativo; return this; }
        public Builder activa(Boolean activa) { this.activa = activa; return this; }
        public Zona build() {
            Zona z = new Zona(); z.id = id; z.nombre = nombre; z.descripcion = descripcion;
            z.capacidad = capacidad; z.codigoQR = codigoQR; z.pinRotativo = pinRotativo;
            z.activa = activa; return z;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }
    public String getCodigoQR() { return codigoQR; }
    public void setCodigoQR(String codigoQR) { this.codigoQR = codigoQR; }
    public String getPinRotativo() { return pinRotativo; }
    public void setPinRotativo(String pinRotativo) { this.pinRotativo = pinRotativo; }
    public Boolean getActiva() { return activa; }
    public void setActiva(Boolean activa) { this.activa = activa; }
}