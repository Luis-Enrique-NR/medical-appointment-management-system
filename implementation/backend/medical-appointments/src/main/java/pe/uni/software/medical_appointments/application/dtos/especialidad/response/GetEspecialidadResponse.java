package pe.uni.software.medical_appointments.application.dtos.especialidad.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetEspecialidadResponse {
    private Integer idEspecialidad;
    private String nombre;
    private String descripcion;
}
