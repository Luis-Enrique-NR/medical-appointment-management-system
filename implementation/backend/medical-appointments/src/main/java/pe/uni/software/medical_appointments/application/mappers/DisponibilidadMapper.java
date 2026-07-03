package pe.uni.software.medical_appointments.application.mappers;

import pe.uni.software.medical_appointments.application.dtos.disponibilidad.request.PropuestaDisponibilidadRequest;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.response.BloqueDisponibilidadResponse;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.response.PropuestaDisponibilidadResponse;
import pe.uni.software.medical_appointments.domain.entities.AsignacionBloque;
import pe.uni.software.medical_appointments.domain.entities.BloqueHorario;
import pe.uni.software.medical_appointments.domain.entities.Consultorio;
import pe.uni.software.medical_appointments.domain.entities.Medico;
import pe.uni.software.medical_appointments.domain.entities.PropuestaDisponibilidad;
import pe.uni.software.medical_appointments.domain.enums.EstadoPropuesta;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class DisponibilidadMapper {

  public static PropuestaDisponibilidad buildPropuesta(PropuestaDisponibilidadRequest request, Medico medico) {
    return PropuestaDisponibilidad.builder()
            .medico(medico)
            .estado(EstadoPropuesta.PENDIENTE.name())
            .fechaEnvio(LocalDateTime.now())
            .build();
  }

  public static AsignacionBloque buildAsignacionBloque(BloqueHorario bloqueHorario,
                                                       PropuestaDisponibilidad propuestaDisponibilidad,
                                                       LocalDate fechaAtencion) {
    return AsignacionBloque.builder()
            .bloqueHorario(bloqueHorario)
            .propuestaDisponibilidad(propuestaDisponibilidad)
            .fecha(fechaAtencion)
            .disponible(false)
            .build();
  }

  public static BloqueDisponibilidadResponse mapBloqueResponse(AsignacionBloque asignacion) {
    return BloqueDisponibilidadResponse.builder()
            .idBloque(asignacion.getId())
            .fecha(asignacion.getFecha())
            .horaInicio(asignacion.getBloqueHorario().getHoraInicio())
            .horaFin(asignacion.getBloqueHorario().getHoraFin())
            .build();
  }

  public static PropuestaDisponibilidadResponse mapPropuesta(PropuestaDisponibilidad propuesta,
                                                             List<BloqueDisponibilidadResponse> bloquesDTO) {
    return PropuestaDisponibilidadResponse.builder()
            .medico(propuesta.getMedico().getPersona().getNombres() + " " + propuesta.getMedico().getPersona().getApellidos())
            .bloquesHorario(bloquesDTO)
            .build();
  }
}
