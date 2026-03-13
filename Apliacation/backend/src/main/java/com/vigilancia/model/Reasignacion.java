package com.vigilancia.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reasignaciones")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Reasignacion {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turno_id", nullable = false)
    private Turno turno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "docente_original_id", nullable = false)
    private Usuario docenteOriginal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "docente_reemplazo_id")
    private Usuario docenteReemplazo;

    @Column(length = 500)
    private String motivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.EstadoReasignacion estado = Enums.EstadoReasignacion.PROPUESTA;

    private LocalDateTime timestampPropuesta = LocalDateTime.now();
    private LocalDateTime timestampRespuesta;
}
