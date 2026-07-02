package pe.uni.software.medical_appointments.application.dtos.paciente.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GetPatientResponse {
  private String dni;
  private String nombres;
  private String apellidos;
  private String telefono;
}
