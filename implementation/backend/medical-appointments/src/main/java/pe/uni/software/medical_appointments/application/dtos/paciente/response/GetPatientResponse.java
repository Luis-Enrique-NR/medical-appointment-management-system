package pe.uni.software.medical_appointments.application.dtos.paciente.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class GetPatientResponse {
  private UUID idPaciente;
  private String dni;
  private String nombres;
  private String apellidos;
  private String telefono;
}
