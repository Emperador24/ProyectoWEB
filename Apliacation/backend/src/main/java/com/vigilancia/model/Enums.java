package com.vigilancia.model;

public class Enums {

    public enum RolUsuario { DOCENTE, COORDINADOR, ADMIN }

    public enum FranjaHoraria { RECREO, ALMUERZO }

    public enum EstadoTurno { PENDIENTE, EN_CURSO, CERRADO }

    public enum MetodoCheckIn { QR, PIN, NFC, MANUAL }

    public enum TipoIncidente { FISICO, CONVIVENCIA, ESPACIO, SOCIAL }

    public enum SeveridadIncidente { S1, S2, S3 }

    public enum EstadoReasignacion { PROPUESTA, ACEPTADA, RECHAZADA }

    public enum EscalaLimpieza { LIMPIO, ALGO_BASURA, MUCHA_BASURA, CRITICO }

    public enum TipoNotificacion { RECORDATORIO, ALERTA, REASIGNACION, INCIDENTE }
}
