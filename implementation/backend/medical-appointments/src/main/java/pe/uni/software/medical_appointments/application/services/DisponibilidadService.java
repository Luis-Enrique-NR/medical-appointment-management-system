package pe.uni.software.medical_appointments.application.services;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.request.PropuestaDisponibilidadRequest;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.request.RangoDisponibilidadRequest;
import pe.uni.software.medical_appointments.application.mappers.DisponibilidadMapper;
import pe.uni.software.medical_appointments.domain.entities.AsignacionBloque;
import pe.uni.software.medical_appointments.domain.entities.BloqueHorario;
import pe.uni.software.medical_appointments.domain.entities.Consultorio;
import pe.uni.software.medical_appointments.domain.entities.Medico;
import pe.uni.software.medical_appointments.domain.entities.PropuestaDisponibilidad;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.infraestructure.repositories.BloqueHorarioRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.ConsultorioRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.MedicoRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.PropuestaDisponibilidadRepository;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DisponibilidadService {

  private final BloqueHorarioRepository bloqueHorarioRepository;
  private final MedicoRepository medicoRepository;
  private final PropuestaDisponibilidadRepository propuestaDisponibilidadRepository;
  private final ConsultorioRepository consultorioRepository;

  @Transactional
  public void registerAvailabilityIntention(PropuestaDisponibilidadRequest request) {
    // 1. Obtener el correo del usuario autenticado
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String correo = auth.getName();

    // 2. Buscar el médico que está ingresando su horario (Usa el JOIN FETCH para evitar N+1)
    Medico medico = medicoRepository.getByCorreo(correo)
            .orElseThrow(() -> new NotFoundException("No se ha encontrado un perfil médico con el usuario activo"));

    List<RangoDisponibilidadRequest> rangos = request.getRangosDisponibilidad();

    // 3. Verificación de la lista de rangos horarios y duración mínima (> 30 min)
    for (RangoDisponibilidadRequest rango : rangos) {
      // Utilizar validarHorario
      validarHorario(rango);

      // Verificar que cada rango sea de más de 30 min
      long duracionMinutos = Duration.between(rango.getHoraInicio(), rango.getHoraFin()).toMinutes();
      if (duracionMinutos <= 30) {
        throw new IllegalArgumentException(String.format(
                "El rango %s - %s no es válido. Debe ser estrictamente mayor a 30 minutos.",
                rango.getHoraInicio(), rango.getHoraFin()
        ));
      }
    }

    // 4. Evitar solapes de horarios en una misma fecha
    Map<LocalDate, List<RangoDisponibilidadRequest>> rangosPorFecha = rangos.stream()
            .collect(Collectors.groupingBy(RangoDisponibilidadRequest::getDia));

    for (Map.Entry<LocalDate, List<RangoDisponibilidadRequest>> entry : rangosPorFecha.entrySet()) {
      List<RangoDisponibilidadRequest> rangosDeFecha = entry.getValue();

      // Ordenamos por hora de inicio para comparar secuencialmente
      rangosDeFecha.sort(Comparator.comparing(RangoDisponibilidadRequest::getHoraInicio));

      for (int i = 0; i < rangosDeFecha.size() - 1; i++) {
        RangoDisponibilidadRequest actual = rangosDeFecha.get(i);
        RangoDisponibilidadRequest siguiente = rangosDeFecha.get(i + 1);

        // Si la hora de inicio del siguiente es antes de que termine el actual, hay solape
        if (siguiente.getHoraInicio().isBefore(actual.getHoraFin())) {
          throw new IllegalArgumentException(String.format(
                  "Existe un solape de horarios el día %s entre los rangos [%s - %s] y [%s - %s]",
                  entry.getKey(), actual.getHoraInicio(), actual.getHoraFin(), siguiente.getHoraInicio(), siguiente.getHoraFin()
          ));
        }
      }
    }

    // 5. IDEA DE LÓGICA PASO 1 y 2: Optimizar búsquedas uniendo horas (independientemente de la fecha)
    List<TimeInterval> intervalosParaBuscar = rangos.stream()
            .map(r -> new TimeInterval(r.getHoraInicio(), r.getHoraFin()))
            .sorted(Comparator.comparing(TimeInterval::getStart))
            .toList();

    List<TimeInterval> intervalosFusionados = new ArrayList<>();
    if (!intervalosParaBuscar.isEmpty()) {
      TimeInterval actual = intervalosParaBuscar.getFirst();
      for (int i = 1; i < intervalosParaBuscar.size(); i++) {
        TimeInterval siguiente = intervalosParaBuscar.get(i);
        // Si se cruzan o son consecutivos tocándose, se fusionan
        if (!siguiente.getStart().isAfter(actual.getEnd())) {
          if (siguiente.getEnd().isAfter(actual.getEnd())) {
            actual.setEnd(siguiente.getEnd());
          }
        } else {
          intervalosFusionados.add(actual);
          actual = siguiente;
        }
      }
      intervalosFusionados.add(actual);
    }

    // Llamar a getByRange de forma optimizada reuniendo todos los bloques necesarios
    Set<BloqueHorario> bloquesEncontrados = new HashSet<>();
    for (TimeInterval intervalo : intervalosFusionados) {
      List<BloqueHorario> bloques = bloqueHorarioRepository.getByRange(intervalo.getStart(), intervalo.getEnd());
      bloquesEncontrados.addAll(bloques);
    }

    // 6. Construir la entidad PropuestaDisponibilidad con el mapper
    PropuestaDisponibilidad propuesta = DisponibilidadMapper.buildPropuesta(request, medico);
    List<AsignacionBloque> asignaciones = new ArrayList<>();

    // 6.1. Conseguir un consultorio habilitado para la especialidad del médico
    Consultorio consultorioAsignado = consultorioRepository
            .findHabilitadosPorEspecialidad(medico.getEspecialidad())
            .stream()
            .findFirst() // Tomamos el primero que responda la BD
            .orElseThrow(() -> new IllegalStateException(String.format(
                    "No hay consultorios habilitados actualmente para la especialidad: %s",
                    medico.getEspecialidad().getNombres()
            )));

    // 7. Dividir los rangos del request en los bloques de 30 min correspondientes
    for (RangoDisponibilidadRequest rango : rangos) {
      // Filtramos de nuestro Set optimizado solo los bloques de 30 min que caen dentro de este rango específico
      List<BloqueHorario> bloquesDelRango = bloquesEncontrados.stream()
              .filter(b -> !b.getHoraInicio().isBefore(rango.getHoraInicio()) && !b.getHoraFin().isAfter(rango.getHoraFin()))
              .toList();

      for (BloqueHorario bh : bloquesDelRango) {
        // Construimos la asignación pasando null en consultorio temporalmente
        AsignacionBloque asignacion = DisponibilidadMapper.buildAsignacionBloque(bh, propuesta, consultorioAsignado, rango.getDia());
        asignaciones.add(asignacion);
      }
    }

    // Vinculamos las asignaciones a la propuesta (asumiendo la relación bidireccional @OneToMany)
    propuesta.setAsignaciones(asignaciones);

    // 8. Guardamos en la base de datos (debido al CascadeType.ALL se guardarán las asignaciones automáticamente)
    propuestaDisponibilidadRepository.save(propuesta);
  }

  // Herramientas

  public void validarHorario(RangoDisponibilidadRequest request) {
    // 1. Validar que la hora de inicio sea anterior a la hora de fin
    if (!request.getHoraInicio().isBefore(request.getHoraFin())) {
      throw new IllegalArgumentException(String.format(
              "La hora de inicio (%s) debe ser anterior a la hora de fin (%s)",
              request.getHoraInicio(), request.getHoraFin()
      ));
    }

    // 2. Validar los bloques en punto o media hora
    if (!esMinutoValido(request.getHoraInicio()) || !esMinutoValido(request.getHoraFin())) {
      throw new IllegalArgumentException("Los horarios solo pueden ser en punto (:00) o media hora (:30)");
    }
  }

  private boolean esMinutoValido(LocalTime hora) {
    int minutos = hora.getMinute();
    return minutos == 0 || minutos == 30;
  }

  @Data
  @AllArgsConstructor
  private static class TimeInterval {
    private LocalTime start;
    private LocalTime end;
  }
}
