package com.vigilancia.repository;

import com.vigilancia.model.Enums;
import com.vigilancia.model.Reasignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReasignacionRepository extends JpaRepository<Reasignacion, Long> {
    List<Reasignacion> findByTurnoOriginalId(Long turnoId);
    List<Reasignacion> findByDocenteOriginalId(Long usuarioId);
    List<Reasignacion> findByDocenteReemplazoId(Long usuarioId);
    List<Reasignacion> findByEstado(Enums.EstadoReasignacion estado);
}