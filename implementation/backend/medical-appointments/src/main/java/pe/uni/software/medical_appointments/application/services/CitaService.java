package pe.uni.software.medical_appointments.application.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.uni.software.medical_appointments.application.dtos.cita.request.RegisterCitaRequest;
import pe.uni.software.medical_appointments.application.dtos.cita.request.UpdateCitaRequest;
import pe.uni.software.medical_appointments.application.mappers.CitaMapper;
import pe.uni.software.medical_appointments.domain.entities.AsignacionBloque;
import pe.uni.software.medical_appointments.domain.entities.Cita;
import pe.uni.software.medical_appointments.domain.entities.Paciente;
import pe.uni.software.medical_appointments.domain.entities.Secretaria;
import pe.uni.software.medical_appointments.domain.entities.Usuario;
import pe.uni.software.medical_appointments.domain.enums.AccionCita;
import pe.uni.software.medical_appointments.domain.enums.EstadoCita;
import pe.uni.software.medical_appointments.domain.enums.RolUsuario;
import pe.uni.software.medical_appointments.exception.BadRequestException;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.infraestructure.repositories.AsignacionBloqueRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.CitaRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.PacienteRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.SecretariaRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.UsuarioRepository;
import pe.uni.software.medical_appointments.util.CodeGenerator;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CitaService {

  private final UsuarioRepository usuarioRepository;
  private final AsignacionBloqueRepository asignacionBloqueRepository;
  private final PacienteRepository pacienteRepository;
  private final SecretariaRepository secretariaRepository;
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

    // 1. Buscar la cita actual usando el id del bloque asignado.
    Cita citaActual = citaRepository.findByAsignacionBloqueId(request.getIdAsignacionBloqueActual())
            .orElseThrow(() -> new NotFoundException("No se encontró una cita asociada al bloque actual"));

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
        throw new IllegalArgumentException("El ID del nuevo bloque horario es obligatorio para reprogramar");
      }

      // Actualizar datos de la cita antigua a REPROGRAMADO
      citaActual.setEstado(EstadoCita.REPROGRAMADO.toString());
      citaActual.setFechaActualizacion(LocalDateTime.now());
      citaActual.setMotivoActualizacion(request.getMotivoActualizacion());

      // Preparar el DTO para registrar la nueva cita
      RegisterCitaRequest registerRequest = new RegisterCitaRequest();
      // Reutilizamos el idPaciente (si lo envían) o se inferirá dentro de registerAppointment
      registerRequest.setIdPaciente(request.getIdPaciente());
      registerRequest.setIdAsignacionBloque(request.getIdAsignacionBloqueNuevo());

      // Llamar al método existente para registrar la nueva cita
      this.registerAppointment(registerRequest);

    } else {
      throw new BadRequestException("Acción no válida: " + request.getAccion());
    }
  }

  
}
