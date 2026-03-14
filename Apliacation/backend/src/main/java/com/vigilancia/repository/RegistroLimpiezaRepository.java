package com.vigilancia.repository;
import com.vigilancia.model.RegistroLimpieza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RegistroLimpiezaRepository extends JpaRepository<RegistroLimpieza, Long> {
    List<RegistroLimpieza> findByTurnoId(Long turnoId);
    List<RegistroLimpieza> findByRegistradoPorId(Long usuarioId);
}