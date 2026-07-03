package pe.uni.software.medical_appointments.application.dtos.disponibilidad.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PropuestaDisponibilidadRequest {
  @NotNull(message = "La lista de rangos de disponibilidad no puede estar vacía")
  private List<RangoDisponibilidadRequest> rangosDisponibilidad;
}
