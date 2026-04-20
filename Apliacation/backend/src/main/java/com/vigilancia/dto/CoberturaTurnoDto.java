package com.vigilancia.dto;

import com.vigilancia.model.Enums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class CoberturaTurnoDto {
    private Long id;
    private LocalDate fecha;
    private LocalDateTime fechaHoraInicio;
    private LocalDateTime fechaHoraFin;
    private Enums.EstadoTurno estado;
    private Enums.FranjaHoraria franja;

    private Long usuarioId;
    private String usuarioNombre;

    private Long zonaId;
    private String zonaNombre;

    private String estadoCobertura; // VERDE, AMARILLO, ROJO
    private Long minutosTranscurridos;
    private boolean tieneCheckIn;
}
