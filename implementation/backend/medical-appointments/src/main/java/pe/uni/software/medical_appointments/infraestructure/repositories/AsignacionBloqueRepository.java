package pe.uni.software.medical_appointments.infraestructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.domain.entities.AsignacionBloque;
import pe.uni.software.medical_appointments.domain.entities.Medico;

import java.util.List;
import java.util.UUID;

@Repository
public interface AsignacionBloqueRepository extends JpaRepository<AsignacionBloque, Integer> {

  @Query("SELECT a FROM AsignacionBloque a " +
          "JOIN FETCH a.bloqueHorario " +
          "JOIN FETCH a.propuestaDisponibilidad p " +
          "JOIN FETCH p.medico m " +
          "JOIN FETCH m.especialidad " +
          "WHERE a.id IN :ids")
  List<AsignacionBloque> findByIdsWithDetails(@Param("ids") List<Integer> ids);

  @Query("SELECT DISTINCT p.medico FROM AsignacionBloque a " +
          "JOIN a.propuestaDisponibilidad p " +
          "WHERE p.medico.especialidad.id = :idEspecialidad AND a.disponible = true")
  List<Medico> findAvailableMedicosByEspecialidad(@Param("idEspecialidad") Integer idEspecialidad);

  @Query("SELECT a FROM AsignacionBloque a " +
          "WHERE a.propuestaDisponibilidad.medico.id = :idMedico AND a.disponible = true " +
          "ORDER BY a.fecha ASC, a.bloqueHorario.horaInicio ASC")
  List<AsignacionBloque> findAvailableHorariosByMedico(@Param("idMedico") UUID idMedico);
}
