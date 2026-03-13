package com.vigilancia.repository;

import com.vigilancia.model.MetricaDocente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetricaDocenteRepository extends JpaRepository<MetricaDocente, Long> {
    Optional<MetricaDocente> findByUsuarioId(Long usuarioId);
    List<MetricaDocente> findByReconocimientoTrue();
}