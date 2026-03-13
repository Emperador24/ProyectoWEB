package com.vigilancia.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "checkpoints")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Checkpoint {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zona_id", nullable = false)
    private Zona zona;

    private String nombre;

    @Column(unique = true)
    private String codigoQR;

    private String descripcion;

    @Column(nullable = false)
    private Boolean activo = true;
}
