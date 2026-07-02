package pe.uni.software.medical_appointments.infraestructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.domain.entities.BloqueHorario;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface BloqueHorarioRepository extends JpaRepository<BloqueHorario, Integer> {

  @Query("SELECT b FROM BloqueHorario b WHERE b.horaInicio >= :hora_inicio AND b.horaFin <= :hora_fin")
  List<BloqueHorario> getByRange(@Param("hora_inicio") LocalTime horaInicio, @Param("hora_fin") LocalTime horaFin);
}
