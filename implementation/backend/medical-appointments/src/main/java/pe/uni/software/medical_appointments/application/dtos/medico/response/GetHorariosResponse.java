package pe.uni.software.medical_appointments.application.dtos.medico.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetHorariosResponse {
    private Integer idAsignacionBloque;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
}
