package com.vigilancia.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "registros_limpieza")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RegistroLimpieza {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turno_id", nullable = false, unique = true)
    private Turno turno;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.EscalaLimpieza escala;

    @Column(length = 500)
    private String observacion;

    private LocalDateTime timestamp = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrado_por_id")
    private Usuario registradoPor;
}
