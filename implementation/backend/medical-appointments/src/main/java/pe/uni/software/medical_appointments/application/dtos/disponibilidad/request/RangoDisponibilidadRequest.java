package pe.uni.software.medical_appointments.application.dtos.disponibilidad.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RangoDisponibilidadRequest {
  @NotNull(message = "El día no puede estar vacío")
  private LocalDate dia;
  @NotNull(message = "La hora de inicio no puede estar vacía")
  @JsonFormat(pattern = "HH:mm")
  private LocalTime horaInicio;
  @NotNull(message = "La hora de fin no puede estar vacía")
  @JsonFormat(pattern = "HH:mm")
  private LocalTime horaFin;
}
