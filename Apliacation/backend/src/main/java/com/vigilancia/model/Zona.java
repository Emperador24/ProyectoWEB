package com.vigilancia.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "zonas")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Zona {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String descripcion;
    private Integer capacidad;
    private String codigoQR;
    private String pinRotativo;

    @Builder.Default
    private Boolean activa = true;
}