package com.vigilancia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
public class ResumenIncidentesDto {
    private long total;
    private Map<String, Long> porTipo;
    private Map<String, Long> porSeveridad;
    private Map<String, Long> porZona;
}
