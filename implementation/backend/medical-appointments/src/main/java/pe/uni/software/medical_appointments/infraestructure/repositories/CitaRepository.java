package pe.uni.software.medical_appointments.infraestructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.domain.entities.Cita;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CitaRepository extends JpaRepository<Cita, UUID> {
  Boolean existsByCodigo(String codigo);

  Optional<Cita> findByAsignacionBloqueId(Integer idAsignacionBloque);
}
