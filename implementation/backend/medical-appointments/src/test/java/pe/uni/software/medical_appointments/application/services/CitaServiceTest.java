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
import pe.uni.software.medical_appointments.application.dtos.cita.response.GetCitaResponse;
import pe.uni.software.medical_appointments.domain.entities.AsignacionBloque;
import pe.uni.software.medical_appointments.domain.entities.BloqueHorario;
import pe.uni.software.medical_appointments.domain.entities.Cita;
import pe.uni.software.medical_appointments.domain.entities.Consultorio;
import pe.uni.software.medical_appointments.domain.entities.Especialidad;
import pe.uni.software.medical_appointments.domain.entities.Medico;
import pe.uni.software.medical_appointments.domain.entities.Paciente;
import pe.uni.software.medical_appointments.domain.entities.Persona;
import pe.uni.software.medical_appointments.domain.entities.PropuestaDisponibilidad;
import pe.uni.software.medical_appointments.domain.entities.Rol;
import pe.uni.software.medical_appointments.domain.entities.Secretaria;
import pe.uni.software.medical_appointments.domain.entities.Usuario;
import pe.uni.software.medical_appointments.domain.enums.AccionCita;
import pe.uni.software.medical_appointments.domain.enums.EstadoCita;
import pe.uni.software.medical_appointments.exception.BadRequestException;
import pe.uni.software.medical_appointments.exception.ForbiddenException;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.infraestructure.repositories.AsignacionBloqueRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.CitaRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.MedicoRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.PacienteRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.SecretariaRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.UsuarioRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
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
    private MedicoRepository medicoRepository;

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
    private Usuario usuarioMedico;
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
        usuarioMedico = Usuario.builder()
                .id(UUID.randomUUID()).correo(CORREO).rol(rolMedico).build();

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

    // ========================================================================
    // Helper: construir Cita con el grafo completo para CitaMapper.mapCitaResponse
    // ========================================================================

    private Medico buildMedicoConGrafico(UUID idPersona) {
        Persona personaMedico = Persona.builder()
                .id(idPersona)
                .dni("87654321")
                .nombres("Carlos")
                .apellidos("Mendoza")
                .build();
        Especialidad especialidad = Especialidad.builder()
                .id(1)
                .nombres("Cardiología")
                .build();
        return Medico.builder()
                .idPersona(idPersona)
                .persona(personaMedico)
                .especialidad(especialidad)
                .codigo("M-00001")
                .colegiaturaCmp("123456")
                .build();
    }

    private Cita buildCitaConGraficoCompleto(UUID idCita, Medico medico, AsignacionBloque bloque) {
        Persona personaPaciente = Persona.builder()
                .id(UUID.randomUUID())
                .dni("12345678")
                .nombres("Luis")
                .apellidos("Núñez")
                .build();
        Paciente paciente = Paciente.builder()
                .idPersona(personaPaciente.getId())
                .persona(personaPaciente)
                .build();
        return Cita.builder()
                .id(idCita)
                .paciente(paciente)
                .asignacionBloque(bloque)
                .codigo("CT-00001")
                .estado(EstadoCita.PROGRAMADO.toString())
                .fechaCreacion(LocalDateTime.now())
                .registradaPor("PACIENTE")
                .build();
    }

    private AsignacionBloque buildAsignacionConGrafico(Medico medico) {
        BloqueHorario bloqueHorario = BloqueHorario.builder()
                .id(1)
                .horaInicio(LocalTime.of(8, 0))
                .horaFin(LocalTime.of(9, 0))
                .build();
        Consultorio consultorio = Consultorio.builder()
                .id(1)
                .codigo("CON-001")
                .build();
        PropuestaDisponibilidad propuesta = PropuestaDisponibilidad.builder()
                .id(1)
                .medico(medico)
                .build();
        return AsignacionBloque.builder()
                .id(100)
                .bloqueHorario(bloqueHorario)
                .consultorio(consultorio)
                .propuestaDisponibilidad(propuesta)
                .fecha(LocalDate.of(2026, 7, 10))
                .disponible(true)
                .build();
    }

    // ========================================================================
    // PRUEBAS PARA getMedicoAgendaByFecha
    // ========================================================================

    @Test
    void getMedicoAgendaByFecha_CS17_happyPath_debeRetornarListaDeCitas() {
        UUID medicoId = UUID.randomUUID();
        Medico medico = buildMedicoConGrafico(medicoId);
        AsignacionBloque bloque = buildAsignacionConGrafico(medico);
        UUID citaId = UUID.randomUUID();
        Cita cita = buildCitaConGraficoCompleto(citaId, medico, bloque);
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioMedico));
        when(medicoRepository.findByPersonaUsuarioId(usuarioMedico.getId())).thenReturn(Optional.of(medico));
        when(citaRepository.findCitasByMedicoAndFechaAndEstado(medicoId, LocalDate.of(2026, 7, 10)))
                .thenReturn(List.of(cita));

        var resultado = citaService.getMedicoAgendaByFecha(LocalDate.of(2026, 7, 10));

        assertEquals(1, resultado.size());
        assertEquals(citaId, resultado.get(0).getIdCita());
        assertEquals("CT-00001", resultado.get(0).getCodigoCita());
    }

    @Test
    void getMedicoAgendaByFecha_CS18_rolInvalido_debeLanzarBadRequestException() {
        Usuario usuarioPacienteRol = Usuario.builder()
                .id(UUID.randomUUID()).correo(CORREO).rol(rolPaciente).build();
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioPacienteRol));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> citaService.getMedicoAgendaByFecha(LocalDate.of(2026, 7, 10)));
        assertTrue(ex.getMessage().contains("no tiene permisos"));
    }

    @Test
    void getMedicoAgendaByFecha_CS19_medicoNoEncontrado_debeLanzarNotFoundException() {
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioMedico));
        when(medicoRepository.findByPersonaUsuarioId(usuarioMedico.getId())).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> citaService.getMedicoAgendaByFecha(LocalDate.of(2026, 7, 10)));
        assertTrue(ex.getMessage().contains("perfil de médico"));
    }

    @Test
    void getMedicoAgendaByFecha_CS20_sinCitas_debeRetornarListaVacia() {
        UUID medicoId = UUID.randomUUID();
        Medico medico = buildMedicoConGrafico(medicoId);
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioMedico));
        when(medicoRepository.findByPersonaUsuarioId(usuarioMedico.getId())).thenReturn(Optional.of(medico));
        when(citaRepository.findCitasByMedicoAndFechaAndEstado(medicoId, LocalDate.of(2026, 7, 10)))
                .thenReturn(List.of());

        var resultado = citaService.getMedicoAgendaByFecha(LocalDate.of(2026, 7, 10));

        assertTrue(resultado.isEmpty());
    }

    // ========================================================================
    // PRUEBAS PARA listarProximasCitasPaciente
    // ========================================================================

    @Test
    void listarProximasCitasPaciente_CS21_happyPath_debeRetornarLista() {
        UUID medicoId = UUID.randomUUID();
        Medico medico = buildMedicoConGrafico(medicoId);
        AsignacionBloque bloque = buildAsignacionConGrafico(medico);
        UUID pacienteId = UUID.randomUUID();
        Persona personaPac = Persona.builder().id(pacienteId).dni("12345678").nombres("Luis").apellidos("Núñez").build();
        Paciente paciente = Paciente.builder().idPersona(pacienteId).persona(personaPac).build();
        bloque.setPropuestaDisponibilidad(PropuestaDisponibilidad.builder().id(1).medico(medico).build());
        bloque.setConsultorio(Consultorio.builder().id(1).codigo("CON-001").build());
        bloque.setBloqueHorario(BloqueHorario.builder().id(1).horaInicio(LocalTime.of(8, 0)).horaFin(LocalTime.of(9, 0)).build());
        Cita cita = Cita.builder()
                .id(UUID.randomUUID())
                .paciente(paciente)
                .asignacionBloque(bloque)
                .codigo("CT-00001")
                .estado(EstadoCita.PROGRAMADO.toString())
                .fechaCreacion(LocalDateTime.now())
                .registradaPor("PACIENTE")
                .build();
        when(citaRepository.findProximasCitasByPaciente(pacienteId, LocalDate.now()))
                .thenReturn(List.of(cita));

        var resultado = citaService.listarProximasCitasPaciente(pacienteId);

        assertEquals(1, resultado.size());
        assertEquals("CT-00001", resultado.get(0).getCodigoCita());
    }

    @Test
    void listarProximasCitasPaciente_CS22_sinCitas_debeRetornarListaVacia() {
        UUID pacienteId = UUID.randomUUID();
        when(citaRepository.findProximasCitasByPaciente(pacienteId, LocalDate.now()))
                .thenReturn(List.of());

        var resultado = citaService.listarProximasCitasPaciente(pacienteId);

        assertTrue(resultado.isEmpty());
    }

    // ========================================================================
    // PRUEBAS PARA obtenerHistorialCitasPaciente
    // ========================================================================

    @Test
    void obtenerHistorialCitasPaciente_CS23_happyPath_debeRetornarPage() {
        UUID medicoId = UUID.randomUUID();
        Medico medico = buildMedicoConGrafico(medicoId);
        AsignacionBloque bloque = buildAsignacionConGrafico(medico);
        UUID pacienteId = UUID.randomUUID();
        Persona personaPac = Persona.builder().id(pacienteId).dni("12345678").nombres("Luis").apellidos("Núñez").build();
        Paciente paciente = Paciente.builder().idPersona(pacienteId).persona(personaPac).build();
        Cita cita = Cita.builder()
                .id(UUID.randomUUID())
                .paciente(paciente)
                .asignacionBloque(bloque)
                .codigo("CT-00001")
                .estado(EstadoCita.PROGRAMADO.toString())
                .fechaCreacion(LocalDateTime.now())
                .registradaPor("PACIENTE")
                .build();
        Page<Cita> page = new PageImpl<>(List.of(cita));
        when(citaRepository.findHistorialCitasByPaciente(eq(pacienteId), eq(LocalDate.now()), any(PageRequest.class)))
                .thenReturn(page);

        Page<GetCitaResponse> resultado = citaService.obtenerHistorialCitasPaciente(pacienteId, 0);

        assertEquals(1, resultado.getTotalElements());
        assertEquals("CT-00001", resultado.getContent().get(0).getCodigoCita());
    }

    @Test
    void obtenerHistorialCitasPaciente_CS24_sinCitas_debeRetornarPageVacio() {
        UUID pacienteId = UUID.randomUUID();
        Page<Cita> pageVacia = new PageImpl<>(List.of());
        when(citaRepository.findHistorialCitasByPaciente(eq(pacienteId), eq(LocalDate.now()), any(PageRequest.class)))
                .thenReturn(pageVacia);

        Page<GetCitaResponse> resultado = citaService.obtenerHistorialCitasPaciente(pacienteId, 0);

        assertTrue(resultado.isEmpty());
    }

    // ========================================================================
    // PRUEBAS PARA obtenerAgendaGeneralSecretaria
    // ========================================================================

    @Test
    void obtenerAgendaGeneralSecretaria_CS25_happyPath_debeRetornarPage() {
        UUID medicoId = UUID.randomUUID();
        Medico medico = buildMedicoConGrafico(medicoId);
        AsignacionBloque bloque = buildAsignacionConGrafico(medico);
        UUID pacienteId = UUID.randomUUID();
        Persona personaPac = Persona.builder().id(pacienteId).dni("12345678").nombres("Luis").apellidos("Núñez").build();
        Paciente paciente = Paciente.builder().idPersona(pacienteId).persona(personaPac).build();
        Cita cita = Cita.builder()
                .id(UUID.randomUUID())
                .paciente(paciente)
                .asignacionBloque(bloque)
                .codigo("CT-00001")
                .estado(EstadoCita.PROGRAMADO.toString())
                .fechaCreacion(LocalDateTime.now())
                .registradaPor("PACIENTE")
                .build();
        Page<Cita> page = new PageImpl<>(List.of(cita));
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioSecretaria));
        when(citaRepository.findCitasForSecretaria(eq(LocalDate.now()), eq(false), eq(""), any(PageRequest.class)))
                .thenReturn(page);

        Page<GetCitaResponse> resultado = citaService.obtenerAgendaGeneralSecretaria(false, "", 0);

        assertEquals(1, resultado.getTotalElements());
        assertEquals("CT-00001", resultado.getContent().get(0).getCodigoCita());
    }

    @Test
    void obtenerAgendaGeneralSecretaria_CS26_rolInvalido_debeLanzarForbiddenException() {
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.of(usuarioPaciente));

        ForbiddenException ex = assertThrows(ForbiddenException.class,
                () -> citaService.obtenerAgendaGeneralSecretaria(false, "", 0));
        assertTrue(ex.getMessage().contains("no tiene permisos"));
    }

    @Test
    void obtenerAgendaGeneralSecretaria_CS27_usuarioNoEncontrado_debeLanzarNotFoundException() {
        when(usuarioRepository.findByCorreoWithRoles(CORREO)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> citaService.obtenerAgendaGeneralSecretaria(false, "", 0));
        assertTrue(ex.getMessage().contains("No se encontró usuario"));
    }
}
