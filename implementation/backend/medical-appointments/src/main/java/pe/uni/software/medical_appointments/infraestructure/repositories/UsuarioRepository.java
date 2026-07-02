package pe.uni.software.medical_appointments.infraestructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.domain.entities.Usuario;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

  // El JOIN FETCH trae al usuario y su rol en un solo SELECT
  @Query("SELECT u FROM Usuario u JOIN FETCH u.rol WHERE u.correo = :correo")
  Optional<Usuario> findByCorreoWithRoles(@Param("correo") String correo);

  Boolean existsByCorreo(String email);

  Optional<Usuario> findByCorreo(String correo);
}