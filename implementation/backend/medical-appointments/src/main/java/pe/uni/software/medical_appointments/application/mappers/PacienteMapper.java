package pe.uni.software.medical_appointments.application.mappers;

import pe.uni.software.medical_appointments.application.dtos.paciente.response.GetPatientResponse;
import pe.uni.software.medical_appointments.domain.entities.Paciente;
import pe.uni.software.medical_appointments.domain.entities.Persona;

import java.time.LocalDateTime;

public class PacienteMapper {

  public static Paciente buildPaciente(Persona persona, String codigo) {
    return Paciente.builder()
            .persona(persona)
            .codigo(codigo)
            .fechaRegistro(LocalDateTime.now())
            .build();
  }

  public static GetPatientResponse mapPatient(Persona persona) {
    return GetPatientResponse.builder()
            .dni(persona.getDni())
            .telefono(persona.getTelefono())
            .nombres(persona.getNombres())
            .apellidos(persona.getApellidos())
            .build();
  }
}
