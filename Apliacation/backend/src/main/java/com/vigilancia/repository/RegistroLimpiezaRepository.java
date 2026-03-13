package com.vigilancia.repository;

import com.vigilancia.model.RegistroLimpieza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RegistroLimpiezaRepository extends JpaRepository<RegistroLimpieza, Long> {
    Optional<RegistroLimpieza> findByTurnoId(Long turnoId);
}