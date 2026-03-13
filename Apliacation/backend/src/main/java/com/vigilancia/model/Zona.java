package com.vigilancia.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "zonas")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
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
}
