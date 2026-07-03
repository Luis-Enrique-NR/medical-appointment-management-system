package pe.uni.software.medical_appointments.application.dtos.cita.response;

import lombok.Builder;
import lombok.Data;
import pe.uni.software.medical_appointments.domain.enums.EstadoCita;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class GetCitaResponse {
  private UUID idPaciente;
  private String dniPaciente;
  private String paciente;
  private Integer idAsignacionBloque;
  private UUID idCita;
  private String codigoCita;
  private String medico;
  private String especialidad;
  private LocalDate fecha;
  private LocalTime hora;
  private String codigoConsultorio;
  private String estadoCita;
  private LocalDateTime fechaCreacion;
}
