package pe.uni.software.medical_appointments.application.mappers;

import pe.uni.software.medical_appointments.domain.entities.AsignacionBloque;
import pe.uni.software.medical_appointments.domain.entities.Cita;
import pe.uni.software.medical_appointments.domain.entities.Paciente;
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
}
