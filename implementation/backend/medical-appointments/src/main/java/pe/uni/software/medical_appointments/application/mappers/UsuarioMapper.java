package pe.uni.software.medical_appointments.application.mappers;

import pe.uni.software.medical_appointments.application.dtos.auth.response.NewUserResponse;
import pe.uni.software.medical_appointments.domain.entities.Rol;
import pe.uni.software.medical_appointments.domain.entities.Usuario;

import java.time.LocalDateTime;

public class UsuarioMapper {

  public static Usuario buildUsuario(String correo, String hashPsw, Rol rol) {
    return Usuario.builder()
            .correo(correo)
            .rol(rol)
            .passwordHash(hashPsw)
            .habilitado(Boolean.TRUE)
            .fechaCreacion(LocalDateTime.now())
            .intentosFallidos(0)
            .build();
  }

  public static NewUserResponse mapNewUsuario(Usuario usuario, String token) {
    return NewUserResponse.builder()
            .correo(usuario.getCorreo())
            .habilitado(usuario.getHabilitado())
            .token(token)
            .build();
  }
}