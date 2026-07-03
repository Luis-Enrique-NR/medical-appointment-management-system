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
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.request.UpdatePropuestaRequest;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.response.BloqueDisponibilidadResponse;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.response.PropuestaDisponibilidadResponse;
import pe.uni.software.medical_appointments.application.mappers.DisponibilidadMapper;
import pe.uni.software.medical_appointments.domain.entities.AsignacionBloque;
import pe.uni.software.medical_appointments.domain.entities.BloqueHorario;
import pe.uni.software.medical_appointments.domain.entities.Consultorio;
import pe.uni.software.medical_appointments.domain.entities.Medico;
import pe.uni.software.medical_appointments.domain.entities.PropuestaDisponibilidad;
import pe.uni.software.medical_appointments.domain.entities.Secretaria;
import pe.uni.software.medical_appointments.domain.enums.EstadoPropuesta;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.infraestructure.repositories.AsignacionBloqueRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.BloqueHorarioRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.ConsultorioRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.MedicoRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.PropuestaDisponibilidadRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.SecretariaRepository;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DisponibilidadService {

  private final BloqueHorarioRepository bloqueHorarioRepository;
  private final MedicoRepository medicoRepository;
  private final PropuestaDisponibilidadRepository propuestaDisponibilidadRepository;
  private final AsignacionBloqueRepository asignacionBloqueRepository;
  private final SecretariaRepository secretariaRepository;
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

    // 7. Dividir los rangos del request en los bloques de 30 min correspondientes
    for (RangoDisponibilidadRequest rango : rangos) {
      // Filtramos de nuestro Set optimizado solo los bloques de 30 min que caen dentro de este rango específico
      List<BloqueHorario> bloquesDelRango = bloquesEncontrados.stream()
              .filter(b -> !b.getHoraInicio().isBefore(rango.getHoraInicio()) && !b.getHoraFin().isAfter(rango.getHoraFin()))
              .toList();

      for (BloqueHorario bh : bloquesDelRango) {
        // Construimos la asignación pasando null en consultorio temporalmente
        AsignacionBloque asignacion = DisponibilidadMapper.buildAsignacionBloque(bh, propuesta, rango.getDia());
        asignaciones.add(asignacion);
      }
    }

    // Vinculamos las asignaciones a la propuesta (asumiendo la relación bidireccional @OneToMany)
    propuesta.setAsignaciones(asignaciones);

    // 8. Guardamos en la base de datos (debido al CascadeType.ALL se guardarán las asignaciones automáticamente)
    propuestaDisponibilidadRepository.save(propuesta);
  }

  public List<PropuestaDisponibilidadResponse> listPendingProposals() {

    // 1. Obtener la lista de Propuestas con todas sus relaciones cargadas
    List<PropuestaDisponibilidad> propuestas = propuestaDisponibilidadRepository.findByEstadoWithDetails(EstadoPropuesta.PENDIENTE.name());

    // 2. Organizar y mapear en DTOs
    return propuestas.stream().map(propuesta -> {

      // Mapear los bloques internos
      List<BloqueDisponibilidadResponse> bloquesDTO = propuesta.getAsignaciones().stream()
              .map(DisponibilidadMapper::mapBloqueResponse)
              .toList();

      // Mapear la propuesta principal
      return DisponibilidadMapper.mapPropuesta(propuesta, bloquesDTO);

    }).toList();
  }

  @Transactional
  public void updateProposals(List<UpdatePropuestaRequest> requests) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String correo = auth.getName();

    // 1. Obtener la secretaria (Corregido el mensaje de error)
    Secretaria secretaria = secretariaRepository.getByCorreo(correo)
            .orElseThrow(() -> new RuntimeException("No se ha encontrado un perfil de secretaria con el usuario activo"));

    if (requests == null || requests.isEmpty()) {
      return;
    }

    // Convertir el request a un Map para búsqueda rápida (IdAsignacion -> Aprobado)
    Map<Integer, Boolean> requestMap = requests.stream()
            .collect(Collectors.toMap(UpdatePropuestaRequest::getIdAsignacion, UpdatePropuestaRequest::getAprobado));

    // 2. Extraer los datos masivamente (FASE 1)
    List<Integer> asignacionIds = new ArrayList<>(requestMap.keySet());
    List<AsignacionBloque> asignaciones = asignacionBloqueRepository.findByIdsWithDetails(asignacionIds);

    List<Consultorio> consultorios = consultorioRepository.findAllHabilitadosWithEspecialidad();

    // Agrupar consultorios por ID de Especialidad
    Map<Integer, List<Consultorio>> consultoriosPorEspecialidad = consultorios.stream()
            .collect(Collectors.groupingBy(c -> c.getEspecialidad().getId()));

    // 3. Estructura para llevar el control de capacidad (FASE 2)
    // Llave: "Fecha_IdBloque_IdEspecialidad" -> Valor: Cola de Consultorios disponibles
    Map<String, Queue<Consultorio>> controlDisponibilidad = new HashMap<>();

    // Set para guardar las propuestas únicas que estamos modificando
    Set<PropuestaDisponibilidad> propuestasModificadas = new HashSet<>();

    // 4. Asignación de Consultorios (FASE 3)
    for (AsignacionBloque asignacion : asignaciones) {
      Boolean aprobado = requestMap.get(asignacion.getId());
      asignacion.setDisponible(aprobado);

      if (aprobado) {
        // Generar llave única de tiempo y especialidad
        String key = asignacion.getFecha().toString() + "_"
                + asignacion.getBloqueHorario().getId() + "_"
                + asignacion.getPropuestaDisponibilidad().getMedico().getEspecialidad().getId();

        // Si es la primera vez que evaluamos esta llave, cargar los consultorios disponibles
        controlDisponibilidad.computeIfAbsent(key, k -> {
          Integer idEspecialidad = asignacion.getPropuestaDisponibilidad().getMedico().getEspecialidad().getId();
          List<Consultorio> consultoriosEspecialidad = consultoriosPorEspecialidad.getOrDefault(idEspecialidad, new ArrayList<>());
          return new LinkedList<>(consultoriosEspecialidad); // LinkedList funciona como Cola
        });

        // Extraer un consultorio de la cola
        Queue<Consultorio> consultoriosDisponibles = controlDisponibilidad.get(key);
        Consultorio consultorioAsignado = consultoriosDisponibles.poll();

        // Si la cola está vacía, no hay consultorios suficientes
        if (consultorioAsignado == null) {
          throw new RuntimeException("Capacidad excedida: No hay consultorios suficientes para la especialidad "
                  + asignacion.getPropuestaDisponibilidad().getMedico().getEspecialidad().getNombres()
                  + " el " + asignacion.getFecha()
                  + " a las " + asignacion.getBloqueHorario().getHoraInicio());
        }

        asignacion.setConsultorio(consultorioAsignado);
      } else {
        // Si es rechazado, nos aseguramos de que no tenga consultorio
        asignacion.setConsultorio(null);
      }

      // Agregar la propuesta al Set para actualizar su cabecera después
      propuestasModificadas.add(asignacion.getPropuestaDisponibilidad());
    }

    // 5. Resolución de la Propuesta Padre (FASE 4)
    for (PropuestaDisponibilidad propuesta : propuestasModificadas) {

      long aprobadas = propuesta.getAsignaciones().stream()
              .filter(a -> Boolean.TRUE.equals(a.getDisponible()))
              .count();

      long rechazadas = propuesta.getAsignaciones().stream()
              .filter(a -> Boolean.FALSE.equals(a.getDisponible()))
              .count();

      long totales = propuesta.getAsignaciones().size();

      // Determinar el estado general
      if (aprobadas == totales) {
        propuesta.setEstado(EstadoPropuesta.APROBADO.name());
      } else if (rechazadas == totales) {
        propuesta.setEstado(EstadoPropuesta.RECHAZADO.name());
      } else {
        propuesta.setEstado(EstadoPropuesta.OBSERVADO.name());
      }

      // Metadatos de auditoría
      propuesta.setSecretaria(secretaria);
      propuesta.setFechaResolucion(LocalDateTime.now());
    }

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
