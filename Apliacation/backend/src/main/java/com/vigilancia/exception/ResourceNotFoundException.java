package com.vigilancia.exception;

/**
 * Excepción personalizada para recursos no encontrados (404).
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String mensaje) {
        super(mensaje);
    }
}