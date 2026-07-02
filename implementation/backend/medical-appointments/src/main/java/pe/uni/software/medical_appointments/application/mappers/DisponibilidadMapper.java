package pe.uni.software.medical_appointments.application.mappers;

import pe.uni.software.medical_appointments.application.dtos.disponibilidad.request.PropuestaDisponibilidadRequest;
import pe.uni.software.medical_appointments.domain.entities.AsignacionBloque;
import pe.uni.software.medical_appointments.domain.entities.BloqueHorario;
import pe.uni.software.medical_appointments.domain.entities.Consultorio;
import pe.uni.software.medical_appointments.domain.entities.Medico;
import pe.uni.software.medical_appointments.domain.entities.PropuestaDisponibilidad;
import pe.uni.software.medical_appointments.domain.enums.EstadoPropuesta;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
                                                       Consultorio consultorio, LocalDate fechaAtencion) {
    return AsignacionBloque.builder()
            .bloqueHorario(bloqueHorario)
            .propuestaDisponibilidad(propuestaDisponibilidad)
            .consultorio(consultorio)
            .fecha(fechaAtencion)
            .disponible(false)
            .build();
  }
}
