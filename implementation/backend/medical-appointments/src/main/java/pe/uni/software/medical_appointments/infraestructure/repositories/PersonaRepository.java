package pe.uni.software.medical_appointments.infraestructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.domain.entities.Persona;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, UUID> {

  Boolean existsByDni(String dni);

  @Query("SELECT COUNT(p) > 0 FROM Persona p WHERE p.usuario.id = :idUsuario")
  Boolean existsByUsuario(@Param("idUsuario") UUID idUsuario);

  Optional<Persona> findByDni(String dni);
}
