package com.vigilancia.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidentes")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Incidente {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turno_id")
    private Turno turno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zona_id", nullable = false)
    private Zona zona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reportado_por_id", nullable = false)
    private Usuario reportadoPor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.TipoIncidente tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.SeveridadIncidente severidad;

    @Column(length = 1000)
    private String descripcion;

    // Solo para tipo SOCIAL - nombre anonimizado o curso
    private String cursoEstudiante;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
}
