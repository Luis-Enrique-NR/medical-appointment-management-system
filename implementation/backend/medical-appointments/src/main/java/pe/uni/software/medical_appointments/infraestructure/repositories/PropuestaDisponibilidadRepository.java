package pe.uni.software.medical_appointments.infraestructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.domain.entities.PropuestaDisponibilidad;

import java.util.List;

@Repository
public interface PropuestaDisponibilidadRepository extends JpaRepository<PropuestaDisponibilidad, Integer> {

  @Query("SELECT DISTINCT pd FROM PropuestaDisponibilidad pd " +
          "JOIN FETCH pd.medico m " +
          "JOIN FETCH pd.asignaciones a " +
          "JOIN FETCH a.bloqueHorario bh " +
          "JOIN FETCH m.persona p " +
          "WHERE pd.estado = :estado")
  List<PropuestaDisponibilidad> findByEstadoWithDetails(@Param("estado") String estado);

  @Query("SELECT DISTINCT pd FROM PropuestaDisponibilidad pd " +
          "JOIN FETCH pd.medico m " +
          "JOIN FETCH pd.asignaciones a " +
          "JOIN FETCH a.bloqueHorario bh " +
          "JOIN FETCH m.persona p " +
          "WHERE pd.estado = :estado AND m.especialidad.id = :idEspecialidad")
  List<PropuestaDisponibilidad> findByEstadoAndEspecialidadWithDetails(
          @Param("estado") String estado,
          @Param("idEspecialidad") Integer idEspecialidad);
}
