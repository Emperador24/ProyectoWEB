package com.vigilancia.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mapa_calor")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MapaCalor {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zona_id", nullable = false)
    private Zona zona;

    @Enumerated(EnumType.STRING)
    private Enums.FranjaHoraria franja;

    @Enumerated(EnumType.STRING)
    private Enums.TipoIncidente tipoIncidente;

    private Integer totalIncidentes = 0;

    private Double porcentaje = 0.0;

    // Semana en formato ISO (e.g. "2026-W10")
    private String semana;
}
