package com.vigilancia.service;

import com.vigilancia.dto.CoberturaTurnoDto;
import com.vigilancia.model.Enums;
import com.vigilancia.model.Turno;
import com.vigilancia.repository.CheckInRepository;
import com.vigilancia.repository.TurnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CoberturaService {

    private final TurnoRepository turnoRepo;
    private final CheckInRepository checkInRepo;

    public List<CoberturaTurnoDto> dashboardHoy() {
        LocalDate hoy = LocalDate.now();
        LocalDateTime ahora = LocalDateTime.now();
        return turnoRepo.findByFecha(hoy).stream()
                .map(t -> toDto(t, ahora))
                .toList();
    }

    private CoberturaTurnoDto toDto(Turno t, LocalDateTime ahora) {
        boolean tieneCheckIn = !checkInRepo.findByTurnoId(t.getId()).isEmpty();
        String estadoCobertura = calcularEstado(t, ahora, tieneCheckIn);
        long minutosTranscurridos = t.getFechaHoraInicio() == null ? 0
                : Duration.between(t.getFechaHoraInicio(), ahora).toMinutes();

        return CoberturaTurnoDto.builder()
                .id(t.getId())
                .fecha(t.getFecha())
                .fechaHoraInicio(t.getFechaHoraInicio())
                .fechaHoraFin(t.getFechaHoraFin())
                .estado(t.getEstado())
                .franja(t.getFranja())
                .usuarioId(t.getUsuario() != null ? t.getUsuario().getId() : null)
                .usuarioNombre(t.getUsuario() != null ? t.getUsuario().getNombre() : null)
                .zonaId(t.getZona() != null ? t.getZona().getId() : null)
                .zonaNombre(t.getZona() != null ? t.getZona().getNombre() : null)
                .estadoCobertura(estadoCobertura)
                .minutosTranscurridos(minutosTranscurridos)
                .tieneCheckIn(tieneCheckIn)
                .build();
    }

    /**
     * VERDE   = hay al menos un RegistroPresencia para el turno
     * AMARILLO= [inicio - 10min, inicio + 2min] y aún sin check-in
     * ROJO    = más de 2 min pasados del inicio y sin check-in
     * Si el turno aún no se acerca (>10 min antes) devuelve PENDIENTE.
     */
    private String calcularEstado(Turno t, LocalDateTime ahora, boolean tieneCheckIn) {
        if (tieneCheckIn) return "VERDE";
        if (t.getFechaHoraInicio() == null) return "PENDIENTE";

        LocalDateTime ventanaAmarillaInicio = t.getFechaHoraInicio().minusMinutes(10);
        LocalDateTime ventanaAmarillaFin    = t.getFechaHoraInicio().plusMinutes(2);

        if (ahora.isBefore(ventanaAmarillaInicio)) return "PENDIENTE";
        if (!ahora.isAfter(ventanaAmarillaFin))    return "AMARILLO";
        if (t.getEstado() == Enums.EstadoTurno.COMPLETADO
                || t.getEstado() == Enums.EstadoTurno.CERRADO
                || t.getEstado() == Enums.EstadoTurno.CANCELADO) return "GRIS";
        return "ROJO";
    }
}
