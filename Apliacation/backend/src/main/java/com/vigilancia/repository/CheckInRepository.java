package com.vigilancia.repository;
import com.vigilancia.model.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, Long> {
    List<CheckIn> findByTurnoId(Long turnoId);
    List<CheckIn> findByTurnoIdAndEsRecorrido(Long turnoId, Boolean esRecorrido);
}