package pe.uni.software.medical_appointments.application.dtos.disponibilidad.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PropuestaDisponibilidadResponse {
  private String medico;
  private List<BloqueDisponibilidadResponse> bloquesHorario;
}
