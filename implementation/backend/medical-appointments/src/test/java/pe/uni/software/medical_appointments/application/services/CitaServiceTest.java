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
import pe.uni.software.medical_appointments.application.dtos.cita.request.RegisterCitaRequest;
import pe.uni.software.medical_appointments.application.dtos.cita.request.UpdateCitaRequest;
import pe.uni.software.medical_appointments.domain.entities.AsignacionBloque;
import pe.uni.software.medical_appointments.domain.entities.Cita;
import pe.uni.software.medical_appointments.domain.entities.Paciente;
import pe.uni.software.medical_appointments.domain.entities.Rol;
import pe.uni.software.medical_appointments.domain.entities.Secretaria;
import pe.uni.software.medical_appointments.domain.entities.Usuario;
import pe.uni.software.medical_appointments.domain.enums.AccionCita;
import pe.uni.software.medical_appointments.domain.enums.EstadoCita;
import pe.uni.software.medical_appointments.exception.BadRequestException;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.infraestructure.repositories.AsignacionBloqueRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.CitaRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.PacienteRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.SecretariaRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.UsuarioRepository;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CitaServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AsignacionBloqueRepository asignacionBloqueRepository;

    @Mock
    private PacienteRepository pacienteRepository;

    @Mock
    private SecretariaRepository secretariaRepository;

    @Mock
    private CitaRepository citaRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CitaService citaService;

    private static final String CORREO = "user@test.com";

    private Rol rolPaciente;
    private Rol rolSecretaria;
    private Rol rolMedico;
    private Usuario usuarioPaciente;
    private Usuario usuarioSecretaria;
    private AsignacionBloque bloqueDisponible;
    private AsignacionBloque bloqueNoDisponible;
    private AsignacionBloque bloqueDisponibleNuevo;
    private Paciente pacienteMock;
    private Secretaria secretariaMock;

    @BeforeEach
    void setUp() {
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn(CORREO);
        SecurityContextHolder.setContext(securityContext);

        rolPaciente = Rol.builder().id(1).nombre("PACIENTE").build();
        rolSecretaria = Rol.builder().id(2).nombre("SECRETARIA ADMINISTRATIVA").build();
        rolMedico = Rol.builder().id(3).nombre("MEDICO ESPECIALISTA").build();

        usuarioPaciente = Usuario.builder()
                .id(UUID.randomUUID()).correo(CORREO).rol(rolPaciente).build();
        usuarioSecretaria = Usuario.builder()
                .id(UUID.randomUUID()).correo(CORREO).rol(rolSecretaria).build();

        bloqueDisponible = AsignacionBloque.builder()
                .id(100).disponible(true).build();
        bloqueNoDisponible = AsignacionBloque.builder()
                .id(101).disponible(false).build();
        bloqueDisponibleNuevo = AsignacionBloque.builder()
                .id(200).disponible(true).build();

        pacienteMock = Paciente.builder()
                .idPersona(UUID.randomUUID()).build();
        secretariaMock = Secretaria.builder()
                .idPersona(UUID.randomUUID()).build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private RegisterCitaRequest buildRequest(Integer idAsignacionBloque, UUID idPaciente) {
        RegisterCitaRequest r = new RegisterCitaRequest();
        r.setIdAsignacionBloque(idAsignacionBloque);
        r.setIdPaciente(idPaciente);
        return r;
    }

    // CS1: Usuario no encontrado
    @Test
    void registerAppointment_CS1_usuarioNoEncontrado_shouldThrowNotFoundException() {
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.empty());
        RegisterCitaRequest request = buildRequest(100, null);

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> citaService.registerAppointment(request));
        assertTrue(ex.getMessage().contains("No se encontró usuario"));
    }

    // CS2: Bloque no encontrado
    @Test
    void registerAppointment_CS2_bloqueNoEncontrado_shouldThrowNotFoundException() {
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioPaciente));
        when(asignacionBloqueRepository.findById(100)).thenReturn(Optional.empty());
        RegisterCitaRequest request = buildRequest(100, null);

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> citaService.registerAppointment(request));
        assertTrue(ex.getMessage().contains("No se encontró el bloque horario"));
    }

    // CS3: Bloque no disponible
    @Test
    void registerAppointment_CS3_bloqueNoDisponible_shouldThrowBadRequestException() {
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioPaciente));
        when(asignacionBloqueRepository.findById(101)).thenReturn(Optional.of(bloqueNoDisponible));
        RegisterCitaRequest request = buildRequest(101, null);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> citaService.registerAppointment(request));
        assertTrue(ex.getMessage().contains("disponible"));
    }

    // CS4: Role PACIENTE, paciente no encontrado
    @Test
    void registerAppointment_CS4_pacienteNoEncontrado_shouldThrowNotFoundException() {
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioPaciente));
        when(asignacionBloqueRepository.findById(100)).thenReturn(Optional.of(bloqueDisponible));
        when(pacienteRepository.findByUsuarioId(usuarioPaciente.getId())).thenReturn(Optional.empty());
        RegisterCitaRequest request = buildRequest(100, null);

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> citaService.registerAppointment(request));
        assertTrue(ex.getMessage().contains("perfil de paciente"));
    }

    // CS5: Role PACIENTE, flujo feliz
    @Test
    void registerAppointment_CS5_pacienteHappyPath_shouldSaveCita() {
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioPaciente));
        when(asignacionBloqueRepository.findById(100)).thenReturn(Optional.of(bloqueDisponible));
        when(pacienteRepository.findByUsuarioId(usuarioPaciente.getId())).thenReturn(Optional.of(pacienteMock));
        when(citaRepository.existsByCodigo(anyString())).thenReturn(false);

        RegisterCitaRequest request = buildRequest(100, null);

        citaService.registerAppointment(request);

        assertFalse(bloqueDisponible.getDisponible());
        verify(citaRepository).save(any());
    }

    // CS6: Role SECRETARIA, idPaciente null
    @Test
    void registerAppointment_CS6_secretariaIdPacienteNull_shouldThrowBadRequestException() {
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioSecretaria));
        when(asignacionBloqueRepository.findById(100)).thenReturn(Optional.of(bloqueDisponible));
        RegisterCitaRequest request = buildRequest(100, null);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> citaService.registerAppointment(request));
        assertTrue(ex.getMessage().contains("ID del paciente es obligatorio"));
    }

    // CS7: Role SECRETARIA, paciente no encontrado
    @Test
    void registerAppointment_CS7_secretariaPacienteNoEncontrado_shouldThrowNotFoundException() {
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioSecretaria));
        when(asignacionBloqueRepository.findById(100)).thenReturn(Optional.of(bloqueDisponible));
        UUID idPac = UUID.randomUUID();
        when(pacienteRepository.findById(idPac)).thenReturn(Optional.empty());
        RegisterCitaRequest request = buildRequest(100, idPac);

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> citaService.registerAppointment(request));
        assertTrue(ex.getMessage().contains("No se encontró el paciente"));
    }

    // CS8: Role SECRETARIA, secretaria no encontrada
    @Test
    void registerAppointment_CS8_secretariaNoEncontrada_shouldThrowNotFoundException() {
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioSecretaria));
        when(asignacionBloqueRepository.findById(100)).thenReturn(Optional.of(bloqueDisponible));
        UUID idPac = UUID.randomUUID();
        when(pacienteRepository.findById(idPac)).thenReturn(Optional.of(pacienteMock));
        when(secretariaRepository.findByUsuarioId(usuarioSecretaria.getId())).thenReturn(Optional.empty());
        RegisterCitaRequest request = buildRequest(100, idPac);

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> citaService.registerAppointment(request));
        assertTrue(ex.getMessage().contains("perfil de secretaria"));
    }

    // CS9: Role SECRETARIA, flujo feliz
    @Test
    void registerAppointment_CS9_secretariaHappyPath_shouldSaveCita() {
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioSecretaria));
        when(asignacionBloqueRepository.findById(100)).thenReturn(Optional.of(bloqueDisponible));
        UUID idPac = UUID.randomUUID();
        when(pacienteRepository.findById(idPac)).thenReturn(Optional.of(pacienteMock));
        when(secretariaRepository.findByUsuarioId(usuarioSecretaria.getId())).thenReturn(Optional.of(secretariaMock));
        when(citaRepository.existsByCodigo(anyString())).thenReturn(false);
        RegisterCitaRequest request = buildRequest(100, idPac);

        citaService.registerAppointment(request);

        assertFalse(bloqueDisponible.getDisponible());
        verify(citaRepository).save(any());
    }

    // CS10: Rol inválido
    @Test
    void registerAppointment_CS10_rolInvalido_shouldThrowIllegalStateException() {
        Usuario usuarioMedico = Usuario.builder()
                .id(UUID.randomUUID()).correo(CORREO).rol(rolMedico).build();
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioMedico));
        when(asignacionBloqueRepository.findById(100)).thenReturn(Optional.of(bloqueDisponible));
        RegisterCitaRequest request = buildRequest(100, null);

        assertThrows(IllegalStateException.class,
                () -> citaService.registerAppointment(request));
    }

    // CS11: Código duplicado tras 10 intentos
    @Test
    void registerAppointment_CS11_codigoDuplicado10Intentos_shouldThrowIllegalStateException() {
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioPaciente));
        when(asignacionBloqueRepository.findById(100)).thenReturn(Optional.of(bloqueDisponible));
        when(pacienteRepository.findByUsuarioId(usuarioPaciente.getId())).thenReturn(Optional.of(pacienteMock));
        when(citaRepository.existsByCodigo(anyString())).thenReturn(true);
        RegisterCitaRequest request = buildRequest(100, null);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> citaService.registerAppointment(request));
        assertTrue(ex.getMessage().contains("10 intentos"));
    }

    // ========================================================================
    // PRUEBAS PARA updateAppointment() — Caja blanca (V(G) = 5)
    // ========================================================================

    private UpdateCitaRequest buildUpdateRequest(UUID idCita, Integer idNuevo,
                                                  AccionCita accion, String motivo) {
        UpdateCitaRequest r = new UpdateCitaRequest();
        r.setIdCita(idCita);
        r.setIdAsignacionBloqueNuevo(idNuevo);
        r.setAccion(accion);
        r.setMotivoActualizacion(motivo);
        return r;
    }

    // CS12: Cita no encontrada por idCita
    @Test
    void updateAppointment_CS12_citaNoEncontrada_shouldThrowNotFoundException() {
        UUID citaId = UUID.randomUUID();
        when(citaRepository.findById(citaId)).thenReturn(Optional.empty());
        UpdateCitaRequest request = buildUpdateRequest(citaId, null, AccionCita.CANCELAR, null);

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> citaService.updateAppointment(request));
        assertTrue(ex.getMessage().contains("No se encontró una cita"));
    }

    // CS13: Acción = CANCELAR, flujo feliz
    @Test
    void updateAppointment_CS13_cancelar_shouldLiberarBloqueYActualizarEstado() {
        UUID citaId = UUID.randomUUID();
        Cita cita = Cita.builder()
                .asignacionBloque(bloqueDisponible)
                .estado(EstadoCita.PROGRAMADO.toString()).build();
        when(citaRepository.findById(citaId)).thenReturn(Optional.of(cita));
        UpdateCitaRequest request = buildUpdateRequest(citaId, null, AccionCita.CANCELAR, "Motivo de cancelación");

        citaService.updateAppointment(request);

        assertTrue(bloqueDisponible.getDisponible());
        assertEquals(EstadoCita.CANCELADO.toString(), cita.getEstado());
        assertNotNull(cita.getFechaActualizacion());
        assertEquals("Motivo de cancelación", cita.getMotivoActualizacion());
    }

    // CS14: Acción = REPROGRAMAR, sin nuevo bloque → BadRequestException
    @Test
    void updateAppointment_CS14_reprogramarSinNuevoBloque_shouldThrowBadRequestException() {
        UUID citaId = UUID.randomUUID();
        Cita cita = Cita.builder()
                .asignacionBloque(bloqueDisponible)
                .estado(EstadoCita.PROGRAMADO.toString()).build();
        when(citaRepository.findById(citaId)).thenReturn(Optional.of(cita));
        UpdateCitaRequest request = buildUpdateRequest(citaId, null, AccionCita.REPROGRAMAR, "Reprogramar");

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> citaService.updateAppointment(request));
        assertTrue(ex.getMessage().contains("ID del nuevo bloque horario"));
    }

    // CS15: Acción = REPROGRAMAR, flujo feliz (inner registerAppointment con role PACIENTE)
    @Test
    void updateAppointment_CS15_reprogramarHappyPath_shouldReprogramarYRegistrarNueva() {
        UUID citaId = UUID.randomUUID();
        Cita cita = Cita.builder()
                .asignacionBloque(bloqueDisponible)
                .estado(EstadoCita.PROGRAMADO.toString())
                .paciente(pacienteMock).build();
        when(citaRepository.findById(citaId)).thenReturn(Optional.of(cita));

        // Stubs para el inner registerAppointment (role PACIENTE)
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioPaciente));
        when(asignacionBloqueRepository.findById(200)).thenReturn(Optional.of(bloqueDisponibleNuevo));
        when(pacienteRepository.findByUsuarioId(usuarioPaciente.getId())).thenReturn(Optional.of(pacienteMock));
        when(citaRepository.existsByCodigo(anyString())).thenReturn(false);

        UpdateCitaRequest request = buildUpdateRequest(citaId, 200, AccionCita.REPROGRAMAR, "Reprogramar");

        citaService.updateAppointment(request);

        // Verificar cita vieja
        assertTrue(bloqueDisponible.getDisponible());
        assertEquals(EstadoCita.REPROGRAMADO.toString(), cita.getEstado());
        assertNotNull(cita.getFechaActualizacion());
        assertEquals("Reprogramar", cita.getMotivoActualizacion());

        // Verificar que se registró la nueva cita
        verify(citaRepository, times(1)).save(any());
    }

    // CS16: Acción inválida
    @Test
    void updateAppointment_CS16_accionInvalida_shouldThrowBadRequestException() {
        UUID citaId = UUID.randomUUID();
        Cita cita = Cita.builder()
                .asignacionBloque(bloqueDisponible)
                .estado(EstadoCita.PROGRAMADO.toString()).build();
        when(citaRepository.findById(citaId)).thenReturn(Optional.of(cita));
        UpdateCitaRequest request = buildUpdateRequest(citaId, null, null, null);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> citaService.updateAppointment(request));
        assertTrue(ex.getMessage().contains("Acción no válida"));
    }
}
