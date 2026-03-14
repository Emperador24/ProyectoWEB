package com.vigilancia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "checkpoints")
public class Checkpoint {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "zona_id", nullable = false)
    private Zona zona;

    private String nombre;

    @Column(unique = true)
    private String codigoQR;

    private String descripcion;

    @Column(nullable = false)
    private Boolean activo = true;

    public Checkpoint() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private Zona zona; private String nombre;
        private String codigoQR; private String descripcion; private Boolean activo = true;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder zona(Zona zona) { this.zona = zona; return this; }
        public Builder nombre(String nombre) { this.nombre = nombre; return this; }
        public Builder codigoQR(String codigoQR) { this.codigoQR = codigoQR; return this; }
        public Builder descripcion(String descripcion) { this.descripcion = descripcion; return this; }
        public Builder activo(Boolean activo) { this.activo = activo; return this; }
        public Checkpoint build() {
            Checkpoint c = new Checkpoint(); c.id = id; c.zona = zona; c.nombre = nombre;
            c.codigoQR = codigoQR; c.descripcion = descripcion; c.activo = activo; return c;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Zona getZona() { return zona; }
    public void setZona(Zona zona) { this.zona = zona; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getCodigoQR() { return codigoQR; }
    public void setCodigoQR(String codigoQR) { this.codigoQR = codigoQR; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}