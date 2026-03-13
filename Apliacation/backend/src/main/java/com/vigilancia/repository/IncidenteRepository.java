package com.vigilancia.repository;

import com.vigilancia.model.Enums;
import com.vigilancia.model.Incidente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidenteRepository extends JpaRepository<Incidente, Long> {
    List<Incidente> findByZonaId(Long zonaId);
    List<Incidente> findByTurnoId(Long turnoId);
    List<Incidente> findByTipo(Enums.TipoIncidente tipo);
    List<Incidente> findBySeveridad(Enums.SeveridadIncidente severidad);
    List<Incidente> findByReportadoPorId(Long usuarioId);

    @Query("SELECT COUNT(i) FROM Incidente i WHERE i.zona.id = :zonaId AND i.tipo = :tipo")
    Long countByZonaAndTipo(Long zonaId, Enums.TipoIncidente tipo);
}