package pe.uni.software.medical_appointments.application.dtos.persona.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GetPersonResponse {
  private String dni;
  private String nombres;
  private String apellidos;
  private String telefono;
  private boolean tieneUsuario;
}
