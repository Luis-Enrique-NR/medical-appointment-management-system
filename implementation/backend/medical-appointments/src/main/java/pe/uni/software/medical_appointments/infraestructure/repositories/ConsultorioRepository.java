package pe.uni.software.medical_appointments.infraestructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.domain.entities.Consultorio;
import pe.uni.software.medical_appointments.domain.entities.Especialidad;

import java.util.List;

@Repository
public interface ConsultorioRepository extends JpaRepository<Consultorio, Integer> {

  @Query("SELECT c FROM Consultorio c WHERE c.especialidad = :especialidad AND c.habilitado = true")
  List<Consultorio> findHabilitadosPorEspecialidad(@Param("especialidad") Especialidad especialidad);

}
