package com.vigilancia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class SugerenciaDocenteDto {
    private Long id;
    private String nombre;
    private String email;
    private long turnosEstaSemana;
}
