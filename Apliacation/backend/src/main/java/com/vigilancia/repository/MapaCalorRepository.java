package com.vigilancia.repository;

import com.vigilancia.model.MapaCalor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MapaCalorRepository extends JpaRepository<MapaCalor, Long> {
    List<MapaCalor> findByZonaId(Long zonaId);
    List<MapaCalor> findBySemana(String semana);

    @Query("SELECT m FROM MapaCalor m WHERE m.zona.id = :zonaId AND m.semana = :semana")
    List<MapaCalor> findByZonaAndSemana(Long zonaId, String semana);
}