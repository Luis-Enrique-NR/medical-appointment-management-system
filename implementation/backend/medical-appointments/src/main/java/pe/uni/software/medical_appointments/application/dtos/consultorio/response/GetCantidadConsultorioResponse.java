package pe.uni.software.medical_appointments.application.dtos.consultorio.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GetCantidadConsultorioResponse {
    private Integer idEspecialidad;
    private Long cantidad;
}
