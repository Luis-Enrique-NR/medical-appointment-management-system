package pe.uni.software.medical_appointments.application.dtos.disponibilidad.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdatePropuestaRequest {
  @NotNull(message = "ID del bloque obligatorio")
  private Integer idAsignacion;
  @NotNull(message = "Resultado de evaluación obligatoria")
  private Boolean aprobado;
}
