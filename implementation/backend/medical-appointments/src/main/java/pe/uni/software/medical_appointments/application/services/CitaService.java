package pe.uni.software.medical_appointments.application.services;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.uni.software.medical_appointments.application.dtos.cita.request.RegisterCitaRequest;
import pe.uni.software.medical_appointments.application.dtos.cita.request.UpdateCitaRequest;
import pe.uni.software.medical_appointments.application.dtos.cita.response.GetCitaResponse;
import pe.uni.software.medical_appointments.application.mappers.CitaMapper;
import pe.uni.software.medical_appointments.domain.entities.AsignacionBloque;
import pe.uni.software.medical_appointments.domain.entities.Cita;
import pe.uni.software.medical_appointments.domain.entities.Medico;
import pe.uni.software.medical_appointments.domain.entities.Paciente;
import pe.uni.software.medical_appointments.domain.entities.Secretaria;
import pe.uni.software.medical_appointments.domain.entities.Usuario;
import pe.uni.software.medical_appointments.domain.enums.AccionCita;
import pe.uni.software.medical_appointments.domain.enums.EstadoCita;
import pe.uni.software.medical_appointments.domain.enums.RolUsuario;
import pe.uni.software.medical_appointments.exception.BadRequestException;
import pe.uni.software.medical_appointments.exception.ForbiddenException;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.infraestructure.repositories.AsignacionBloqueRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.CitaRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.MedicoRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.PacienteRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.SecretariaRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.UsuarioRepository;
import pe.uni.software.medical_appointments.util.CodeGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CitaService {

  private final UsuarioRepository usuarioRepository;
  private final AsignacionBloqueRepository asignacionBloqueRepository;
  private final PacienteRepository pacienteRepository;
  private final SecretariaRepository secretariaRepository;
  private final MedicoRepository medicoRepository;
  private final CitaRepository citaRepository;

  @Transactional
  public void registerAppointment(RegisterCitaRequest request) {
    // 1. Obtener la sesión y el rol del usuario actual
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String correo = auth.getName();

    Usuario usuarioAutenticado = usuarioRepository.findByCorreoWithRoles(correo)
            .orElseThrow(() -> new NotFoundException("No se encontró usuario con correo: " + correo));

    // Asumiendo que getNombre() devuelve "PACIENTE" o "SECRETARIA" (o "ROLE_PACIENTE", etc.)
    String nombreRol = usuarioAutenticado.getRol().getNombre().toUpperCase();

    // 2. Obtener y validar el bloque horario (Global para todos)
    AsignacionBloque bloque = asignacionBloqueRepository.findById(request.getIdAsignacionBloque())
            .orElseThrow(() -> new NotFoundException("No se encontró el bloque horario con ID: " + request.getIdAsignacionBloque()));

    if (Boolean.FALSE.equals(bloque.getDisponible())) {
      throw new BadRequestException("El bloque horario seleccionado ya no se encuentra disponible");
    }

    // 3. Variables para armar la entidad Cita
    Paciente paciente;
    Secretaria secretaria = null;
    String registradaPor;

    // 4. Bifurcación de lógica según el Rol
    if (nombreRol.contains(RolUsuario.PACIENTE.toString())) {

      // Buscar paciente asociado al usuario autenticado (Usuario 1-1 Persona 1-1 Paciente)
      paciente = pacienteRepository.findByUsuarioId(usuarioAutenticado.getId())
              .orElseThrow(() -> new NotFoundException("No se encontró el perfil de paciente para el usuario actual"));
      registradaPor = RolUsuario.PACIENTE.toString();

    } else if (nombreRol.contains(RolUsuario.SECRETARIA_ADMINISTRATIVA.toString())) {

      // Validar que el DTO traiga el ID del paciente
      if (request.getIdPaciente() == null) {
        throw new BadRequestException("El ID del paciente es obligatorio cuando el registro lo realiza una secretaria");
      }

      // Buscar paciente por el ID proveído en el DTO
      paciente = pacienteRepository.findById(request.getIdPaciente())
              .orElseThrow(() -> new NotFoundException("No se encontró el paciente indicado"));

      // Buscar secretaria asociada al usuario autenticado
      secretaria = secretariaRepository.findByUsuarioId(usuarioAutenticado.getId())
              .orElseThrow(() -> new NotFoundException("No se encontró el perfil de secretaria para el usuario actual"));

      registradaPor = "SECRETARIA"; //RolUsuario.SECRETARIA_ADMINISTRATIVA.toString();

    } else {
      throw new IllegalStateException("El rol actual (" + nombreRol + ") no tiene permisos para registrar citas.");
    }

    // 5. Actualizar estado del bloque a ocupado
    bloque.setDisponible(false);

    String codigo;
    int intentos = 0;
    do {
      if (intentos++ > 10) {
        throw new IllegalStateException("No se pudo generar un código único tras 10 intentos.");
      }
      codigo = CodeGenerator.generarCodigo("CT");
    } while (citaRepository.existsByCodigo(codigo));

    // 6. Armar y guardar la Cita
    citaRepository.save(CitaMapper.buildCita(paciente, secretaria, bloque, codigo, EstadoCita.PROGRAMADO, registradaPor));
  }

  @Transactional
  public void updateAppointment(UpdateCitaRequest request) {

    // 1. Buscar la cita directamente por su ID (Cambio según el nuevo DTO)
    Cita citaActual = citaRepository.findById(request.getIdCita())
            .orElseThrow(() -> new NotFoundException("No se encontró una cita con el ID proporcionado"));

    // 2. Liberar el bloque horario actual para que vuelva a estar disponible
    AsignacionBloque bloqueActual = citaActual.getAsignacionBloque();
    bloqueActual.setDisponible(true);

    // 3. Bifurcación según la acción solicitada
    if (request.getAccion() == AccionCita.CANCELAR) {

      // Actualizar datos de la cita a CANCELADO
      citaActual.setEstado(EstadoCita.CANCELADO.toString());
      citaActual.setFechaActualizacion(LocalDateTime.now());
      citaActual.setMotivoActualizacion(request.getMotivoActualizacion());

    } else if (request.getAccion() == AccionCita.REPROGRAMAR) {

      // Validar que venga el nuevo bloque en el request
      if (request.getIdAsignacionBloqueNuevo() == null) {
        throw new BadRequestException("El ID del nuevo bloque horario es obligatorio para reprogramar");
      }

      // Actualizar datos de la cita antigua a REPROGRAMADO
      citaActual.setEstado(EstadoCita.REPROGRAMADO.toString());
      citaActual.setFechaActualizacion(LocalDateTime.now());
      citaActual.setMotivoActualizacion(request.getMotivoActualizacion());

      // Preparar el DTO para registrar la nueva cita
      RegisterCitaRequest registerRequest = new RegisterCitaRequest();

      UUID idPaciente = (request.getIdPaciente() != null)
              ? request.getIdPaciente()
              : citaActual.getPaciente().getIdPersona();

      registerRequest.setIdPaciente(idPaciente);
      registerRequest.setIdAsignacionBloque(request.getIdAsignacionBloqueNuevo());

      // Llamar al método existente para registrar la nueva cita
      this.registerAppointment(registerRequest);

    } else {
      throw new BadRequestException("Acción no válida: " + request.getAccion());
    }
  }

  public List<GetCitaResponse> getMedicoAgendaByFecha(LocalDate fecha){
    // 1. Obtener la sesión y el rol del usuario actual (debe ser un médico)
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String correo = auth.getName();

    // 2. Obtener el usuario para validar el rol
    Usuario usuarioAutenticado = usuarioRepository.findByCorreoWithRoles(correo)
            .orElseThrow(() -> new NotFoundException("No se encontró usuario con correo: " + correo));

    String nombreRol = usuarioAutenticado.getRol().getNombre().toUpperCase();

    if (!nombreRol.contains(RolUsuario.MEDICO_ESPECIALISTA.toString())) {
      throw new BadRequestException("El rol actual (" + nombreRol + ") no tiene permisos para ver la agenda médica.");
    }

    // 3. Buscar al Médico directamente a través del ID del Usuario (Evitamos el NullPointerException)
    Medico medico = medicoRepository.findByPersonaUsuarioId(usuarioAutenticado.getId())
            .orElseThrow(() -> new NotFoundException("No se encontró el perfil de médico para el usuario actual"));

    // 4. Usar el repositorio para buscar las citas programadas
    List<Cita> citas = citaRepository.findCitasByMedicoAndFechaAndEstado(medico.getIdPersona(), fecha);

    // 5. Mapear las entidades a DTOs de respuesta
    return citas.stream()
            .map(CitaMapper::mapCitaResponse)
            .collect(Collectors.toList());
  }

  public List<GetCitaResponse> listarProximasCitasPaciente(UUID idPaciente) {
      List<Cita> citas = citaRepository.findProximasCitasByPaciente(idPaciente, LocalDate.now());
      return citas.stream()
              .map(CitaMapper::mapCitaResponse)
              .collect(Collectors.toList());
  }

  public Page<GetCitaResponse> obtenerHistorialCitasPaciente(UUID idPaciente, int page) {
      Pageable pageable = PageRequest.of(page, 10, Sort.by("asignacionBloque.fecha").descending().and(Sort.by("asignacionBloque.bloqueHorario.horaInicio").descending()));
      Page<Cita> citas = citaRepository.findHistorialCitasByPaciente(idPaciente, LocalDate.now(), pageable);
      return citas.map(CitaMapper::mapCitaResponse);
  }

  public Page<GetCitaResponse> obtenerAgendaGeneralSecretaria(boolean soloHoy, String search, int page) {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      String correo = auth.getName();

      Usuario usuarioAutenticado = usuarioRepository.findByCorreoWithRoles(correo)
              .orElseThrow(() -> new NotFoundException("No se encontró usuario con correo: " + correo));

      String nombreRol = usuarioAutenticado.getRol().getNombre().toUpperCase();

      if (!nombreRol.contains(RolUsuario.SECRETARIA_ADMINISTRATIVA.toString())) {
          throw new ForbiddenException("El rol actual (" + nombreRol + ") no tiene permisos para acceder a este recurso.");
      }

      Pageable pageable = PageRequest.of(page, 10, Sort.by("asignacionBloque.fecha").ascending().and(Sort.by("asignacionBloque.bloqueHorario.horaInicio").ascending()));

      LocalDate fechaInicio = LocalDate.now();
      Page<Cita> citasPage = citaRepository.findCitasForSecretaria(fechaInicio, soloHoy, search, pageable);

      return citasPage.map(CitaMapper::mapCitaResponse);
  }
}
