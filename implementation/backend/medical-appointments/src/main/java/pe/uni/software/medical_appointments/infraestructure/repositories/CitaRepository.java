package pe.uni.software.medical_appointments.infraestructure.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.domain.entities.Cita;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CitaRepository extends JpaRepository<Cita, UUID> {
  Boolean existsByCodigo(String codigo);

  Optional<Cita> findByAsignacionBloqueId(Integer idAsignacionBloque);

  @Query("SELECT c FROM Cita c " +
          "JOIN FETCH c.paciente p " +
          "JOIN FETCH p.persona per " +
          "JOIN FETCH c.asignacionBloque ab " +
          "JOIN FETCH ab.bloqueHorario bh " +
          "JOIN FETCH ab.consultorio con " +
          "JOIN FETCH ab.propuestaDisponibilidad pd " +
          "JOIN FETCH pd.medico m " +
          "JOIN FETCH m.persona " +
          "JOIN FETCH m.especialidad " +
          "WHERE pd.medico.id = :idMedico " +
          "AND ab.fecha = :fecha " +
          "AND c.estado = 'PROGRAMADO'")
  List<Cita> findCitasByMedicoAndFechaAndEstado(
          @Param("idMedico") UUID idMedico,
          @Param("fecha") LocalDate fecha
  );

  @Query("SELECT c FROM Cita c " +
          "JOIN FETCH c.paciente p " +
          "JOIN FETCH p.persona " +
          "JOIN FETCH c.asignacionBloque ab " +
          "JOIN FETCH ab.bloqueHorario " +
          "JOIN FETCH ab.consultorio " +
          "JOIN FETCH ab.propuestaDisponibilidad pd " +
          "JOIN FETCH pd.medico m " +
          "JOIN FETCH m.persona " +
          "JOIN FETCH m.especialidad " +
          "WHERE c.paciente.id = :idPaciente " +
          "AND ab.fecha >= :fechaActual " +
          "AND c.estado <> 'CANCELADO' " +
          "ORDER BY ab.fecha ASC, ab.bloqueHorario.horaInicio ASC")
  List<Cita> findProximasCitasByPaciente(
          @Param("idPaciente") UUID idPaciente,
          @Param("fechaActual") LocalDate fechaActual
  );

  @Query(value = "SELECT c FROM Cita c " +
          "JOIN FETCH c.paciente p " +
          "JOIN FETCH p.persona " +
          "JOIN FETCH c.asignacionBloque ab " +
          "JOIN FETCH ab.bloqueHorario " +
          "JOIN FETCH ab.consultorio " +
          "JOIN FETCH ab.propuestaDisponibilidad pd " +
          "JOIN FETCH pd.medico m " +
          "JOIN FETCH m.persona " +
          "JOIN FETCH m.especialidad " +
          "WHERE c.paciente.id = :idPaciente " +
          "AND ab.fecha < :fechaActual",
          countQuery = "SELECT count(c) FROM Cita c " +
                  "JOIN c.asignacionBloque ab " +
                  "WHERE c.paciente.id = :idPaciente " +
                  "AND ab.fecha < :fechaActual")
  Page<Cita> findHistorialCitasByPaciente(
          @Param("idPaciente") UUID idPaciente,
          @Param("fechaActual") LocalDate fechaActual,
          Pageable pageable
  );

  @Query(value = "SELECT c FROM Cita c " +
          "JOIN FETCH c.paciente pac " +
          "JOIN FETCH pac.persona pacPer " +
          "JOIN FETCH c.asignacionBloque ab " +
          "JOIN FETCH ab.bloqueHorario " +
          "JOIN FETCH ab.consultorio " +
          "JOIN FETCH ab.propuestaDisponibilidad pd " +
          "JOIN FETCH pd.medico med " +
          "JOIN FETCH med.persona medPer " +
          "JOIN FETCH med.especialidad " +
          "WHERE ((:soloHoy = true AND ab.fecha = :fechaInicio) OR (:soloHoy = false AND ab.fecha >= :fechaInicio)) AND " +
          "(CAST(:search AS string) IS NULL OR " +
          "LOWER(pacPer.dni) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +

          "LOWER(CONCAT(pacPer.nombres, ' ', pacPer.apellidos)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
          "LOWER(CONCAT(medPer.nombres, ' ', medPer.apellidos)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))",
          countQuery = "SELECT COUNT(c) FROM Cita c " +
                  "JOIN c.paciente pac JOIN pac.persona pacPer " +
                  "JOIN c.asignacionBloque ab " +
                  "JOIN ab.propuestaDisponibilidad pd JOIN pd.medico med JOIN med.persona medPer " +
                  "WHERE ((:soloHoy = true AND ab.fecha = :fechaInicio) OR (:soloHoy = false AND ab.fecha >= :fechaInicio)) AND " +
                  "(CAST(:search AS string) IS NULL OR " +
                  "LOWER(pacPer.dni) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
                  "LOWER(CONCAT(pacPer.nombres, ' ', pacPer.apellidos)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
                  "LOWER(CONCAT(medPer.nombres, ' ', medPer.apellidos)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
  Page<Cita> findCitasForSecretaria(
          @Param("fechaInicio") LocalDate fechaInicio,
          @Param("soloHoy") boolean soloHoy,
          @Param("search") String search,
          Pageable pageable
  );
}
