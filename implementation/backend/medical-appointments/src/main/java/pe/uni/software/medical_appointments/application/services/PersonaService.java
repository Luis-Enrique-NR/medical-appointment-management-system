package pe.uni.software.medical_appointments.application.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.uni.software.medical_appointments.application.dtos.paciente.request.RegisterPersonRequest;
import pe.uni.software.medical_appointments.application.mappers.PersonaMapper;
import pe.uni.software.medical_appointments.domain.entities.Persona;
import pe.uni.software.medical_appointments.domain.entities.Usuario;
import pe.uni.software.medical_appointments.exception.ConflictException;
import pe.uni.software.medical_appointments.exception.ForbiddenException;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.infraestructure.repositories.PersonaRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.UsuarioRepository;

@Service
@RequiredArgsConstructor
public class PersonaService {

  private final PersonaRepository personaRepository;
  private final UsuarioRepository usuarioRepository;

  @Transactional
  public Persona registerPerson(RegisterPersonRequest request) {
    // 1. Obtener el correo del usuario autenticado
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String correo = auth.getName();

    // 2. Buscar el usuario que está operando (Secretaria o Paciente)
    Usuario usuarioAutenticado = usuarioRepository.findByCorreoWithRoles(correo)
            .orElseThrow(() -> new NotFoundException("No se encontró usuario con correo: " + correo));

    // 3. Obtener el rol directamente
    String nombreRol = usuarioAutenticado.getRol().getNombre();

    // Variable que contendrá el usuario (o null si es registrado por la secretaria)
    Usuario usuarioAsociado = null;

    // 4. Lógica de negocio condicional
    if ("PACIENTE".equalsIgnoreCase(nombreRol)) {
      // VALIDACIÓN PACIENTE: 1 Persona - 1 Usuario - 1 DNI
      if (personaRepository.existsByDni(request.getDni())) {
        throw new ConflictException("Ya existe una persona registrada con el DNI " + request.getDni());
      }

      if (personaRepository.existsByUsuario(usuarioAutenticado.getId())) {
        throw new ConflictException("Usted ya tiene un perfil de persona registrado.");
      }

      // El paciente se vincula a sí mismo obligatoriamente
      usuarioAsociado = usuarioAutenticado;

    } else if ("SECRETARIA ADMINISTRATIVA".equalsIgnoreCase(nombreRol)) {
      // VALIDACIÓN SECRETARIA: Solo evita DNI duplicado, no se asocia a ningún usuario
      if (personaRepository.existsByDni(request.getDni())) {
        throw new ConflictException("No se puede registrar: Ya existe una persona con el DNI " + request.getDni());
      }

      // 'usuarioAsociado' se queda en null tal como lo inicializamos
      usuarioAsociado = null;

    } else {
      throw new ForbiddenException("No tienes permisos para registrar personas.");
    }

    // 5. Registrar persona (pasando el usuario correcto o null)
    return personaRepository.save(PersonaMapper.buildPersona(request, usuarioAsociado));
  }

  public Persona getByDni(String dni) {
    return personaRepository.findByDni(dni)
            .orElseThrow(() -> new NotFoundException("No se encontró persona con dni: "+dni));
  }
}
