package com.vigilancia.dto;

import lombok.Data;

@Data
public class CodigoValidacionRequest {
    private String codigoQR;
    private String codigoPin;
    private Long turnoId;
}
