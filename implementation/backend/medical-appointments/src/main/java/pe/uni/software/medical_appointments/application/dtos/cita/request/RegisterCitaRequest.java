package pe.uni.software.medical_appointments.application.dtos.cita.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class RegisterCitaRequest {
  private UUID idPaciente;
  @NotNull(message = "El ID del bloque horario es obligatorio")
  private Integer idAsignacionBloque;
}
