package pe.uni.software.medical_appointments.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.entity.Rol;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {
  Optional<Rol> findByNombre(String nombre);
}
