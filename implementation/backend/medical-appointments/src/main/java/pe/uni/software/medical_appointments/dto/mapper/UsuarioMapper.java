package pe.uni.software.medical_appointments.dto.mapper;

import pe.uni.software.medical_appointments.dto.request.RegisterUserPatientRequest;
import pe.uni.software.medical_appointments.dto.response.NewUserResponse;
import pe.uni.software.medical_appointments.entity.Usuario;
import pe.uni.software.medical_appointments.entity.enums.Rol;

public class UsuarioMapper {

  public static Usuario buildUsuario(String correo, String hashPsw, Rol rol) {
    return Usuario.builder()
            .correo(correo)
            .rol(String.valueOf(rol))
            .password(hashPsw)
            .habilitado(Boolean.TRUE)
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