package com.vigilancia.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Entity
@Table(name = "zonas")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Zona {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de la zona es obligatorio")
    @Column(nullable = false)
    private String nombre;

    private String descripcion;

    @Positive(message = "La capacidad debe ser un número positivo")
    private Integer capacidad;

    private String codigoQR;
    private String pinRotativo;

    @Builder.Default
    private Boolean activa = true;
}