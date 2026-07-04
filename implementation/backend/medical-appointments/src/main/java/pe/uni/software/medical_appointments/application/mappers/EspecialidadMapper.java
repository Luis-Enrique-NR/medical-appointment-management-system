package pe.uni.software.medical_appointments.application.mappers;

import pe.uni.software.medical_appointments.application.dtos.especialidad.response.GetEspecialidadResponse;
import pe.uni.software.medical_appointments.domain.entities.Especialidad;

public class EspecialidadMapper {

    public static GetEspecialidadResponse toDto(Especialidad especialidad) {
        return GetEspecialidadResponse.builder()
                .idEspecialidad(especialidad.getId())
                .nombre(especialidad.getNombres())
                .descripcion(especialidad.getDescripcion())
                .build();
    }
}
