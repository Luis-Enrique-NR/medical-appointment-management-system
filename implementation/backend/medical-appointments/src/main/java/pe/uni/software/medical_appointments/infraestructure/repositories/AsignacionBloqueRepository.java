package pe.uni.software.medical_appointments.infraestructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.domain.entities.AsignacionBloque;

import java.util.List;

@Repository
public interface AsignacionBloqueRepository extends JpaRepository<AsignacionBloque, Integer> {

  @Query("SELECT a FROM AsignacionBloque a " +
          "JOIN FETCH a.bloqueHorario " +
          "JOIN FETCH a.propuestaDisponibilidad p " +
          "JOIN FETCH p.medico m " +
          "JOIN FETCH m.especialidad " +
          "WHERE a.id IN :ids")
  List<AsignacionBloque> findByIdsWithDetails(@Param("ids") List<Integer> ids);
}
