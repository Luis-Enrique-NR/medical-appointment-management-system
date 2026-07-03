package pe.uni.software.medical_appointments.infraestructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.domain.entities.Paciente;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, UUID> {

  Boolean existsByCodigo(String codigo);

  @Query("SELECT COUNT(p) > 0 FROM Paciente p WHERE p.idPersona = :idPersona")
  Boolean existsByPersona(@Param("idPersona") UUID idPersona);

  @Query("SELECT p FROM Paciente p JOIN p.persona per JOIN per.usuario u WHERE u.id = :usuarioId")
  Optional<Paciente> findByUsuarioId(@Param("usuarioId") UUID usuarioId);
}
