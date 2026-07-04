package pe.uni.software.medical_appointments.application.mappers;

import pe.uni.software.medical_appointments.application.dtos.paciente.request.RegisterPersonRequest;
import pe.uni.software.medical_appointments.application.dtos.persona.response.GetPersonResponse;
import pe.uni.software.medical_appointments.domain.entities.Persona;
import pe.uni.software.medical_appointments.domain.entities.Usuario;

public class PersonaMapper {

  public static Persona buildPersona(RegisterPersonRequest request, Usuario usuario) {
    return Persona.builder()
            .usuario(usuario)
            .dni(request.getDni())
            .nombres(request.getNombres())
            .apellidos(request.getApellidos())
            .telefono(request.getTelefono())
            .build();
  }

  public static GetPersonResponse mapPersonResponse(Persona persona, boolean tieneUsuario) {
    return GetPersonResponse.builder()
            .dni(persona.getDni())
            .nombres(persona.getNombres())
            .apellidos(persona.getApellidos())
            .telefono(persona.getTelefono())
            .tieneUsuario(tieneUsuario)
            .build();
  }
}
