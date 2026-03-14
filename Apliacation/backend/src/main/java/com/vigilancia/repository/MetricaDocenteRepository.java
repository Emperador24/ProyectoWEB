package com.vigilancia.repository;

import com.vigilancia.model.MetricaDocente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MetricaDocenteRepository extends JpaRepository<MetricaDocente, Long> {
    List<MetricaDocente> findByUsuarioId(Long usuarioId);
    List<MetricaDocente> findByReconocimientoTrue();
    List<MetricaDocente> findByTrimestre(String trimestre);
}