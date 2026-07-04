package pe.uni.software.medical_appointments.application.dtos.disponibilidad.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class BloqueDisponibilidadResponse {
  private Integer idBloque;
  private LocalDate fecha;
  private LocalTime horaInicio;
  private LocalTime horaFin;
}
