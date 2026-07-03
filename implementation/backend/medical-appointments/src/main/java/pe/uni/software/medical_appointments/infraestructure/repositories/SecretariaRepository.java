package pe.uni.software.medical_appointments.infraestructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.domain.entities.Secretaria;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SecretariaRepository extends JpaRepository<Secretaria, UUID> {

  @Query("SELECT s FROM Secretaria s " +
          "JOIN FETCH s.persona p " +
          "JOIN FETCH p.usuario u " +
          "WHERE u.correo = :correo")
  Optional<Secretaria> getByCorreo(@Param("correo") String correo);

  @Query("SELECT s FROM Secretaria s JOIN s.persona per JOIN per.usuario u WHERE u.id = :usuarioId")
  Optional<Secretaria> findByUsuarioId(@Param("usuarioId") UUID usuarioId);
}
