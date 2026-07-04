package pe.uni.software.medical_appointments.application.mappers;

import pe.uni.software.medical_appointments.application.dtos.medico.response.GetHorariosResponse;
import pe.uni.software.medical_appointments.domain.entities.AsignacionBloque;
import pe.uni.software.medical_appointments.domain.entities.Cita;

public class HorarioMapper {

    public static GetHorariosResponse toDto(AsignacionBloque asignacionBloque) {
        return GetHorariosResponse.builder()
                .idAsignacionBloque(asignacionBloque.getId())
                .fecha(asignacionBloque.getFecha())
                .horaInicio(asignacionBloque.getBloqueHorario().getHoraInicio())
                .horaFin(asignacionBloque.getBloqueHorario().getHoraFin())
                .build();
    }
}
