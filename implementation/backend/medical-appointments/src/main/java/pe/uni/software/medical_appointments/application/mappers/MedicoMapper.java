package pe.uni.software.medical_appointments.application.mappers;

import pe.uni.software.medical_appointments.application.dtos.medico.response.GetMedicoResponse;
import pe.uni.software.medical_appointments.domain.entities.Medico;

public class MedicoMapper {

    public static GetMedicoResponse toDto(Medico medico) {
        return GetMedicoResponse.builder()
                .idMedico(medico.getIdPersona())
                .nombre(medico.getPersona().getNombres() + " " + medico.getPersona().getApellidos())
                .descripcion(medico.getDescripcion())
                .build();
    }
}
