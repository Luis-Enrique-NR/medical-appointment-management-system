package pe.uni.software.medical_appointments.infraestructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.domain.entities.Consultorio;

import java.util.List;

@Repository
public interface ConsultorioRepository extends JpaRepository<Consultorio, Integer> {

  @Query("SELECT c FROM Consultorio c JOIN FETCH c.especialidad WHERE c.habilitado = true")
  List<Consultorio> findAllHabilitadosWithEspecialidad();

  Long countByEspecialidadId(Integer idEspecialidad);
}
