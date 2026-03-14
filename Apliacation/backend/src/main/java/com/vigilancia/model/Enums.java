package com.vigilancia.model;

public class Enums {

    public enum RolUsuario { DOCENTE, COORDINADOR, ADMIN }

    // Frontend usa: RECREO_MANANA, ALMUERZO, RECREO_TARDE
    public enum FranjaHoraria { RECREO, ALMUERZO, RECREO_MANANA, RECREO_TARDE }

    // Frontend usa: PENDIENTE, EN_CURSO, COMPLETADO, CANCELADO
    public enum EstadoTurno { PENDIENTE, EN_CURSO, CERRADO, COMPLETADO, CANCELADO }

    public enum MetodoCheckIn { QR, PIN, NFC, MANUAL }

    // Frontend usa: FISICO, CONVIVENCIA, ESPACIO, SOCIAL, SEGURIDAD_FISICA, USO_ESPACIO, OBSERVACION_SOCIAL
    public enum TipoIncidente { FISICO, CONVIVENCIA, ESPACIO, SOCIAL,
                                SEGURIDAD_FISICA, USO_ESPACIO, OBSERVACION_SOCIAL }

    public enum SeveridadIncidente { S1, S2, S3 }

    public enum EstadoReasignacion { PROPUESTA, ACEPTADA, RECHAZADA, PENDIENTE }

    public enum EscalaLimpieza { LIMPIO, ALGO_BASURA, MUCHA_BASURA, CRITICO }

    public enum TipoNotificacion { RECORDATORIO, ALERTA, REASIGNACION, INCIDENTE }
}