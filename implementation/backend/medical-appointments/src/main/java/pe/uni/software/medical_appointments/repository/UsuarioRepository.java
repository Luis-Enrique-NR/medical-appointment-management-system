package pe.uni.software.medical_appointments.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.entity.Usuario;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

  // El JOIN FETCH trae al usuario y sus roles en un solo SELECT
  @Query("SELECT u FROM Usuario u WHERE u.correo = :correo")
  Optional<Usuario> findByCorreoWithRoles(@Param("correo") String correo);

  Boolean existsByCorreo(String email);
}