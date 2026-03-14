package com.vigilancia.repository;
import com.vigilancia.model.Checkpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CheckpointRepository extends JpaRepository<Checkpoint, Long> {
    List<Checkpoint> findByZonaId(Long zonaId);
    List<Checkpoint> findByActivo(Boolean activo);
}