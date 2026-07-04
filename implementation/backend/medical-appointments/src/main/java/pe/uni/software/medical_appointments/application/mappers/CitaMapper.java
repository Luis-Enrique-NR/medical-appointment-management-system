package pe.uni.software.medical_appointments.application.mappers;

import pe.uni.software.medical_appointments.application.dtos.cita.response.GetCitaResponse;
import pe.uni.software.medical_appointments.domain.entities.AsignacionBloque;
import pe.uni.software.medical_appointments.domain.entities.Cita;
import pe.uni.software.medical_appointments.domain.entities.Paciente;
import pe.uni.software.medical_appointments.domain.entities.Persona;
import pe.uni.software.medical_appointments.domain.entities.Secretaria;
import pe.uni.software.medical_appointments.domain.enums.EstadoCita;

import java.time.LocalDateTime;

public class CitaMapper {

  public static Cita buildCita(Paciente paciente, Secretaria secretaria, AsignacionBloque bloque, String codigo,
                               EstadoCita estadoCita, String registradaPor) {
    return Cita.builder()
            .paciente(paciente)
            .secretaria(secretaria)
            .asignacionBloque(bloque)
            .codigo(codigo)
            .estado(estadoCita.toString())
            .fechaCreacion(LocalDateTime.now())
            .registradaPor(registradaPor)
            .build();
  }

  public static GetCitaResponse mapCitaResponse(Cita cita) {
    return GetCitaResponse.builder()
            .idPaciente(cita.getPaciente().getIdPersona())
            .dniPaciente(cita.getPaciente().getPersona().getDni())
            .paciente(cita.getPaciente().getPersona().getNombres()
                    + " " +
                    cita.getPaciente().getPersona().getApellidos())
            .idAsignacionBloque(cita.getAsignacionBloque().getId())
            .idCita(cita.getId())
            .codigoCita(cita.getCodigo())
            .estadoCita(cita.getEstado())
            .fecha(cita.getAsignacionBloque().getFecha())
            .hora(cita.getAsignacionBloque().getBloqueHorario().getHoraInicio())
            .fechaCreacion(cita.getFechaCreacion())
            .codigoConsultorio(cita.getAsignacionBloque().getConsultorio().getCodigo())
            .medico(cita.getAsignacionBloque().getPropuestaDisponibilidad().getMedico().getPersona().getNombres()
                    + " " +
                    cita.getAsignacionBloque().getPropuestaDisponibilidad().getMedico().getPersona().getApellidos())
            .especialidad(cita.getAsignacionBloque().getPropuestaDisponibilidad().getMedico().getEspecialidad().getNombres())
            .build();
  }
}
