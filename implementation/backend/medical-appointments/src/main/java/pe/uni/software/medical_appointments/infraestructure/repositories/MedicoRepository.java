package pe.uni.software.medical_appointments.infraestructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.domain.entities.Medico;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, UUID> {

  @Query("SELECT m FROM Medico m " +
          "JOIN FETCH m.persona p " +
          "JOIN FETCH p.usuario u " +
          "WHERE u.correo = :correo")
  Optional<Medico> getByCorreo(@Param("correo") String correo);
}
