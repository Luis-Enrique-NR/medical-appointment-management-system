package pe.uni.software.medical_appointments.application.dtos.cita.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import pe.uni.software.medical_appointments.domain.enums.AccionCita;

import java.util.UUID;

@Data
public class UpdateCitaRequest {
  private UUID idPaciente;
  @NotNull(message = "El ID del bloque horario es obligatorio")
  private Integer idAsignacionBloqueActual;

  private Integer idAsignacionBloqueNuevo;

  @NotNull(message = "Ingresar obligatoriamente el tipo de acción de actualización de la cita")
  private AccionCita accion;

  private String motivoActualizacion;
}
