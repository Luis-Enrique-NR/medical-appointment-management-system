package pe.uni.software.medical_appointments.application.services;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import pe.uni.software.medical_appointments.application.dtos.paciente.request.RegisterPersonRequest;
import pe.uni.software.medical_appointments.domain.entities.Persona;
import pe.uni.software.medical_appointments.domain.entities.Rol;
import pe.uni.software.medical_appointments.domain.entities.Usuario;
import pe.uni.software.medical_appointments.exception.ConflictException;
import pe.uni.software.medical_appointments.exception.ForbiddenException;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.infraestructure.repositories.PersonaRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.UsuarioRepository;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PersonaServiceTest {

    @Mock
    private PersonaRepository personaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private PersonaService personaService;

    private RegisterPersonRequest validRequest;
    private static final String CORREO_AUTENTICADO = "usuario@test.com";

    @BeforeEach
    void setUp() {
        validRequest = new RegisterPersonRequest();
        validRequest.setDni("12345678");
        validRequest.setNombres("Luis");
        validRequest.setApellidos("Núñez");
        validRequest.setTelefono("912345678");

        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn(CORREO_AUTENTICADO);
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private Usuario buildUsuarioConRol(String nombreRol) {
        Rol rol = Rol.builder()
                .id(1)
                .nombre(nombreRol)
                .build();
        return Usuario.builder()
                .id(UUID.randomUUID())
                .correo(CORREO_AUTENTICADO)
                .passwordHash("hash")
                .rol(rol)
                .habilitado(true)
                .build();
    }

    @Test
    void registerPerson_whenPacienteConDniUnicoYSinPerfilPrevio_debeRegistrarExitosamente() {
        Usuario usuarioPaciente = buildUsuarioConRol("PACIENTE");

        when(usuarioRepository.findByCorreoWithRoles(CORREO_AUTENTICADO))
                .thenReturn(Optional.of(usuarioPaciente));
        when(personaRepository.existsByDni(validRequest.getDni())).thenReturn(false);
        when(personaRepository.existsByUsuario(usuarioPaciente.getId())).thenReturn(false);
        Persona personaGuardada = Persona.builder()
                .id(UUID.randomUUID())
                .usuario(usuarioPaciente)
                .dni(validRequest.getDni())
                .nombres(validRequest.getNombres())
                .apellidos(validRequest.getApellidos())
                .telefono(validRequest.getTelefono())
                .build();
        when(personaRepository.save(any(Persona.class))).thenReturn(personaGuardada);

        Persona resultado = personaService.registerPerson(validRequest);

        assertNotNull(resultado);
        assertEquals("12345678", resultado.getDni());
        assertEquals(usuarioPaciente, resultado.getUsuario());
        assertEquals("Luis", resultado.getNombres());
        assertEquals("Núñez", resultado.getApellidos());
        verify(personaRepository).save(any(Persona.class));
    }

    @Test
    void registerPerson_whenPacienteConDniDuplicado_debeLanzarConflictException() {
        Usuario usuarioPaciente = buildUsuarioConRol("PACIENTE");

        when(usuarioRepository.findByCorreoWithRoles(CORREO_AUTENTICADO))
                .thenReturn(Optional.of(usuarioPaciente));
        when(personaRepository.existsByDni(validRequest.getDni())).thenReturn(true);

        ConflictException exception = assertThrows(ConflictException.class,
                () -> personaService.registerPerson(validRequest));

        assertTrue(exception.getMessage().contains("Ya existe una persona registrada con el DNI"));
        verify(personaRepository, never()).save(any());
    }

    @Test
    void registerPerson_whenPacienteYaTienePerfil_debeLanzarConflictException() {
        Usuario usuarioPaciente = buildUsuarioConRol("PACIENTE");

        when(usuarioRepository.findByCorreoWithRoles(CORREO_AUTENTICADO))
                .thenReturn(Optional.of(usuarioPaciente));
        when(personaRepository.existsByDni(validRequest.getDni())).thenReturn(false);
        when(personaRepository.existsByUsuario(usuarioPaciente.getId())).thenReturn(true);

        ConflictException exception = assertThrows(ConflictException.class,
                () -> personaService.registerPerson(validRequest));

        assertTrue(exception.getMessage().contains("Usted ya tiene un perfil de persona registrado."));
        verify(personaRepository, never()).save(any());
    }

    @Test
    void registerPerson_whenSecretariaConDniUnico_debeRegistrarSinVinculacion() {
        Usuario usuarioSecretaria = buildUsuarioConRol("SECRETARIA ADMINISTRATIVA");

        when(usuarioRepository.findByCorreoWithRoles(CORREO_AUTENTICADO))
                .thenReturn(Optional.of(usuarioSecretaria));
        when(personaRepository.existsByDni(validRequest.getDni())).thenReturn(false);
        Persona personaGuardada = Persona.builder()
                .id(UUID.randomUUID())
                .usuario(null)
                .dni(validRequest.getDni())
                .nombres(validRequest.getNombres())
                .apellidos(validRequest.getApellidos())
                .telefono(validRequest.getTelefono())
                .build();
        when(personaRepository.save(any(Persona.class))).thenReturn(personaGuardada);

        Persona resultado = personaService.registerPerson(validRequest);

        assertNotNull(resultado);
        assertEquals("12345678", resultado.getDni());
        assertNull(resultado.getUsuario());
        verify(personaRepository).save(any(Persona.class));
    }

    @Test
    void registerPerson_whenSecretariaConDniDuplicado_debeLanzarConflictException() {
        Usuario usuarioSecretaria = buildUsuarioConRol("SECRETARIA ADMINISTRATIVA");

        when(usuarioRepository.findByCorreoWithRoles(CORREO_AUTENTICADO))
                .thenReturn(Optional.of(usuarioSecretaria));
        when(personaRepository.existsByDni(validRequest.getDni())).thenReturn(true);

        ConflictException exception = assertThrows(ConflictException.class,
                () -> personaService.registerPerson(validRequest));

        assertTrue(exception.getMessage().contains("No se puede registrar"));
        verify(personaRepository, never()).save(any());
    }

    @Test
    void registerPerson_whenRolNoAutorizado_debeLanzarForbiddenException() {
        Usuario usuarioMedico = buildUsuarioConRol("MEDICO");

        when(usuarioRepository.findByCorreoWithRoles(CORREO_AUTENTICADO))
                .thenReturn(Optional.of(usuarioMedico));

        ForbiddenException exception = assertThrows(ForbiddenException.class,
                () -> personaService.registerPerson(validRequest));

        assertTrue(exception.getMessage().contains("No tienes permisos para registrar personas."));
        verify(personaRepository, never()).save(any());
    }

    @Test
    void registerPerson_whenUsuarioNoEncontrado_debeLanzarNotFoundException() {
        when(usuarioRepository.findByCorreoWithRoles(CORREO_AUTENTICADO))
                .thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> personaService.registerPerson(validRequest));

        assertTrue(exception.getMessage().contains("No se encontró usuario con correo"));
        verify(personaRepository, never()).save(any());
    }

    @Test
    void getByDni_whenPersonaExiste_debeRetornarPersona() {
        Persona persona = Persona.builder()
                .id(UUID.randomUUID())
                .dni("12345678")
                .nombres("Luis")
                .apellidos("Núñez")
                .telefono("912345678")
                .build();
        when(personaRepository.findByDni("12345678")).thenReturn(Optional.of(persona));

        Persona resultado = personaService.getByDni("12345678");

        assertNotNull(resultado);
        assertEquals("12345678", resultado.getDni());
        assertEquals("Luis", resultado.getNombres());
    }

    @Test
    void getByDni_whenPersonaNoExiste_debeLanzarNotFoundException() {
        when(personaRepository.findByDni("12345678")).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                () -> personaService.getByDni("12345678"));

        assertTrue(exception.getMessage().contains("No se encontró persona con dni"));
    }
}
