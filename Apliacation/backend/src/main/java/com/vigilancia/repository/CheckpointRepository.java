package com.vigilancia.repository;

import com.vigilancia.model.Checkpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CheckpointRepository extends JpaRepository<Checkpoint, Long> {
    List<Checkpoint> findByZonaId(Long zonaId);
    Optional<Checkpoint> findByCodigoQR(String codigoQR);
}