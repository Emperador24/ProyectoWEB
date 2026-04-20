package com.vigilancia.dto;

import com.vigilancia.model.Enums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class MapaCalorItemDto {
    private Long zonaId;
    private String zona;
    private Enums.TipoIncidente tipo;
    private Long cantidad;
    private Double porcentaje;
}
