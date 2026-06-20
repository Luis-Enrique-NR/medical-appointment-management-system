package pe.uni.software.medical_appointments.dto.mapper;

import pe.uni.software.medical_appointments.dto.response.NewUserResponse;
import pe.uni.software.medical_appointments.entity.Rol;
import pe.uni.software.medical_appointments.entity.Usuario;

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