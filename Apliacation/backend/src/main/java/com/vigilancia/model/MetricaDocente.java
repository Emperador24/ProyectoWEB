package com.vigilancia.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "metricas_docente")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
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
}
