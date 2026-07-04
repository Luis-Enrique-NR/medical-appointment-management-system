package pe.uni.software.medical_appointments.application.services;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.request.PropuestaDisponibilidadRequest;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.request.RangoDisponibilidadRequest;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.request.UpdatePropuestaRequest;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.response.BloqueDisponibilidadResponse;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.response.PropuestaDisponibilidadResponse;
import pe.uni.software.medical_appointments.domain.entities.AsignacionBloque;
import pe.uni.software.medical_appointments.domain.entities.BloqueHorario;
import pe.uni.software.medical_appointments.domain.entities.Consultorio;
import pe.uni.software.medical_appointments.domain.entities.Especialidad;
import pe.uni.software.medical_appointments.domain.entities.Medico;
import pe.uni.software.medical_appointments.domain.entities.Persona;
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

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DisponibilidadServiceTest {

    @Mock
    private BloqueHorarioRepository bloqueHorarioRepository;

    @Mock
    private MedicoRepository medicoRepository;

    @Mock
    private PropuestaDisponibilidadRepository propuestaDisponibilidadRepository;

    @Mock
    private ConsultorioRepository consultorioRepository;

    @Mock
    private AsignacionBloqueRepository asignacionBloqueRepository;

    @Mock
    private SecretariaRepository secretariaRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private DisponibilidadService disponibilidadService;

    private static final LocalDate DAY = LocalDate.of(2026, 7, 15);
    private static final LocalDate DAY2 = LocalDate.of(2026, 7, 16);

    private Medico medicoMock;
    private Especialidad especialidadMock;
    private Consultorio consultorioMock;
    private List<BloqueHorario> bloquesCompletos08_12;
    private List<BloqueHorario> bloques08_09;
    private List<BloqueHorario> bloques10_11;

    @BeforeEach
    void setUp() {
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn("medico@test.com");
        SecurityContextHolder.setContext(securityContext);

        especialidadMock = Especialidad.builder()
                .id(1).codigo("ESP001").nombres("Ginecología").activa(true).build();

        consultorioMock = Consultorio.builder()
                .id(1).codigo("CONS001").numero(101)
                .especialidad(especialidadMock).habilitado(true).build();

        medicoMock = Medico.builder()
                .idPersona(UUID.randomUUID())
                .codigo("MED001")
                .especialidad(especialidadMock)
                .colegiaturaCmp("123456")
                .build();

        bloquesCompletos08_12 = new ArrayList<>();
        for (int hour = 8; hour < 12; hour++) {
            bloquesCompletos08_12.add(BloqueHorario.builder()
                    .id(hour * 2).horaInicio(LocalTime.of(hour, 0)).horaFin(LocalTime.of(hour, 30)).build());
            bloquesCompletos08_12.add(BloqueHorario.builder()
                    .id(hour * 2 + 1).horaInicio(LocalTime.of(hour, 30)).horaFin(LocalTime.of(hour + 1, 0)).build());
        }

        bloques08_09 = bloquesCompletos08_12.subList(0, 2);
        bloques10_11 = bloquesCompletos08_12.subList(4, 6);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private static RangoDisponibilidadRequest buildRango(LocalDate dia, String inicio, String fin) {
        RangoDisponibilidadRequest rango = new RangoDisponibilidadRequest();
        rango.setDia(dia);
        rango.setHoraInicio(LocalTime.parse(inicio));
        rango.setHoraFin(LocalTime.parse(fin));
        return rango;
    }

    private static PropuestaDisponibilidadRequest buildRequest(List<RangoDisponibilidadRequest> rangos) {
        PropuestaDisponibilidadRequest request = new PropuestaDisponibilidadRequest();
        request.setRangosDisponibilidad(rangos);
        return request;
    }

    private static UpdatePropuestaRequest buildUpdateRequest(Integer id, boolean aprobado) {
        UpdatePropuestaRequest r = new UpdatePropuestaRequest();
        r.setIdAsignacion(id);
        r.setAprobado(aprobado);
        return r;
    }

    // ========================================================================
    // PRUEBAS DE CAJA BLANCA — 9 rutas independientes (V(G) = 9)
    // ========================================================================

    // P1: Medico no encontrado por correo
    @Test
    void cajaBlanca_P1_medicoNotFound_shouldThrowNotFoundException() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.empty());

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "12:00")
        ));

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> disponibilidadService.registerAvailabilityIntention(request));
        assertTrue(ex.getMessage().contains("No se ha encontrado un perfil médico"));
        verifyNoInteractions(bloqueHorarioRepository, consultorioRepository, propuestaDisponibilidadRepository);
    }

    // P2: Hora inicio posterior o igual a hora fin
    @Test
    void cajaBlanca_P2_horaInicioAfterHoraFin_shouldThrowIllegalArgumentException() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "12:00", "08:00")
        ));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> disponibilidadService.registerAvailabilityIntention(request));
        assertTrue(ex.getMessage().contains("La hora de inicio"));
    }

    // P3: Minutos no válidos (no :00 ni :30)
    @Test
    void cajaBlanca_P3_minutosInvalidos_shouldThrowIllegalArgumentException() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:15", "10:00")
        ));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> disponibilidadService.registerAvailabilityIntention(request));
        assertTrue(ex.getMessage().contains(":00") || ex.getMessage().contains(":30"));
    }

    // P4: Duración menor o igual a 30 min
    @Test
    void cajaBlanca_P4_duracion30Minutos_shouldThrowIllegalArgumentException() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "08:30")
        ));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> disponibilidadService.registerAvailabilityIntention(request));
        assertTrue(ex.getMessage().contains("30 minutos"));
    }

    // P5: Solape de horarios en la misma fecha
    @Test
    void cajaBlanca_P5_solapeMismaFecha_shouldThrowIllegalArgumentException() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "12:00"),
                buildRango(DAY, "10:00", "14:00")
        ));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> disponibilidadService.registerAvailabilityIntention(request));
        assertTrue(ex.getMessage().contains("solape"));
    }

    // P6: Lista vacía de rangos → salta fusión y getByRange
    @Test
    void cajaBlanca_P6_rangosVacios_shouldSucceedSinGetByRange() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));

        PropuestaDisponibilidadRequest request = buildRequest(Collections.emptyList());

        assertDoesNotThrow(() -> disponibilidadService.registerAvailabilityIntention(request));
        verify(bloqueHorarioRepository, never()).getByRange(any(), any());
        verify(propuestaDisponibilidadRepository).save(any());
    }

    // P7=T, P8=T: Fusion con extension — rangos en DIFERENTES fechas con horarios solapados
    @Test
    void cajaBlanca_P7T_P8T_fusionConExtension_shouldCallGetByRangeUnaVez() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));
        when(bloqueHorarioRepository.getByRange(any(), any())).thenReturn(bloquesCompletos08_12);

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "10:00"),
                buildRango(DAY2, "09:00", "11:00")
        ));

        assertDoesNotThrow(() -> disponibilidadService.registerAvailabilityIntention(request));
        verify(bloqueHorarioRepository).getByRange(LocalTime.of(8, 0), LocalTime.of(11, 0));
        verify(propuestaDisponibilidadRepository).save(any());
    }

    // P7=T, P8=F: Fusion sin extension — rangos consecutivos (08:00-09:00 y 09:00-10:00)
    @Test
    void cajaBlanca_P7T_P8F_fusionConsecutivos_shouldCallGetByRangeUnaVez() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));
        when(bloqueHorarioRepository.getByRange(any(), any())).thenReturn(bloquesCompletos08_12);

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "09:00"),
                buildRango(DAY, "09:00", "10:00")
        ));

        assertDoesNotThrow(() -> disponibilidadService.registerAvailabilityIntention(request));
        verify(bloqueHorarioRepository).getByRange(LocalTime.of(8, 0), LocalTime.of(10, 0));
        verify(propuestaDisponibilidadRepository).save(any());
    }

    // P7=F: Sin fusion — intervalos separados (08:00-09:00 y 10:00-11:00)
    @Test
    void cajaBlanca_P7F_intervalosSeparados_shouldCallGetByRangeDosVeces() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));
        when(bloqueHorarioRepository.getByRange(any(), any()))
                .thenReturn(bloques08_09)
                .thenReturn(bloques10_11);

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "09:00"),
                buildRango(DAY, "10:00", "11:00")
        ));

        assertDoesNotThrow(() -> disponibilidadService.registerAvailabilityIntention(request));
        verify(bloqueHorarioRepository, times(2)).getByRange(any(), any());
        verify(propuestaDisponibilidadRepository).save(any());
    }

    // ========================================================================
    // PRUEBAS DE CAJA NEGRA — Partición de Equivalencia y Valor de Frontera
    // ========================================================================

    @Test
    void cajaNegra_horaFinConMinutosInvalidos_shouldThrowIllegalArgumentException() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "10:45")
        ));

        assertThrows(IllegalArgumentException.class,
                () -> disponibilidadService.registerAvailabilityIntention(request));
    }

    @Test
    void cajaNegra_duracion29Minutos_shouldThrowIllegalArgumentException() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "08:29")
        ));

        assertThrows(IllegalArgumentException.class,
                () -> disponibilidadService.registerAvailabilityIntention(request));
    }

    @Test
    void cajaNegra_duracion31Minutos_shouldThrowIllegalArgumentException() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));

        // 08:31 no es minuto válido → falla por P3 antes que por P4
        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "08:31")
        ));

        assertThrows(IllegalArgumentException.class,
                () -> disponibilidadService.registerAvailabilityIntention(request));
    }

    @Test
    void cajaNegra_unSoloRangoValido_shouldSucceed() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));
        when(bloqueHorarioRepository.getByRange(any(), any())).thenReturn(bloquesCompletos08_12);

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "12:00")
        ));

        assertDoesNotThrow(() -> disponibilidadService.registerAvailabilityIntention(request));
        verify(propuestaDisponibilidadRepository).save(any());
    }

    // ========================================================================
    // PRUEBAS DE FLUJO DE NEGOCIO
    // ========================================================================

    @Test
    void flujoNegocio_principal_dosDiasSinSolape_shouldSucceed() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));
        when(bloqueHorarioRepository.getByRange(any(), any())).thenReturn(bloquesCompletos08_12);

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "12:00"),
                buildRango(DAY2, "14:00", "17:00")
        ));

        assertDoesNotThrow(() -> disponibilidadService.registerAvailabilityIntention(request));
        verify(propuestaDisponibilidadRepository).save(any());
    }

    @Test
    void flujoNegocio_alterno_fusionDiferentesFechas_shouldOptimizarGetByRange() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));
        when(bloqueHorarioRepository.getByRange(any(), any())).thenReturn(bloquesCompletos08_12);

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "10:00"),
                buildRango(DAY2, "09:00", "11:00")
        ));

        assertDoesNotThrow(() -> disponibilidadService.registerAvailabilityIntention(request));
        verify(bloqueHorarioRepository, times(1)).getByRange(any(), any());
        verify(propuestaDisponibilidadRepository).save(any());
    }

    // ========================================================================
    // PRUEBAS DE REGRESIÓN
    // ========================================================================

    @Test
    void regresion_solapeConOrdenInverso_shouldThrowIllegalArgumentException() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "10:00", "14:00"),
                buildRango(DAY, "08:00", "12:00")
        ));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> disponibilidadService.registerAvailabilityIntention(request));
        assertTrue(ex.getMessage().contains("solape"));
    }

    @Test
    void regresion_propuestaGuardadaConAsignacionesCorrectas() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));
        when(bloqueHorarioRepository.getByRange(any(), any())).thenReturn(bloquesCompletos08_12);

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "10:00")
        ));

        disponibilidadService.registerAvailabilityIntention(request);

        ArgumentCaptor<PropuestaDisponibilidad> captor = ArgumentCaptor.forClass(PropuestaDisponibilidad.class);
        verify(propuestaDisponibilidadRepository).save(captor.capture());
        PropuestaDisponibilidad saved = captor.getValue();

        assertNotNull(saved);
        assertEquals(medicoMock, saved.getMedico());
        assertEquals("PENDIENTE", saved.getEstado());
        assertNotNull(saved.getFechaEnvio());
        assertNotNull(saved.getAsignaciones());
        assertEquals(4, saved.getAsignaciones().size()); // 08:00-10:00 → 4 bloques de 30 min

        // Verificar que todas las asignaciones tengan los datos correctos
        for (AsignacionBloque ab : saved.getAsignaciones()) {
            assertNull(ab.getConsultorio());
            assertEquals(DAY, ab.getFecha());
            assertFalse(ab.getDisponible());
            assertNotNull(ab.getBloqueHorario());
            assertSame(saved, ab.getPropuestaDisponibilidad());
        }
    }

    @Test
    void regresion_noDebeHaberEfectoSecundarioEntreLlamados() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));
        when(bloqueHorarioRepository.getByRange(any(), any())).thenReturn(bloquesCompletos08_12);

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "12:00")
        ));

        disponibilidadService.registerAvailabilityIntention(request);
        disponibilidadService.registerAvailabilityIntention(request);

        verify(propuestaDisponibilidadRepository, times(2)).save(any());
    }

    @Test
    void regresion_rangoExactamente30Minutos_debeFallar() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "08:30")
        ));

        assertThrows(IllegalArgumentException.class,
                () -> disponibilidadService.registerAvailabilityIntention(request));
    }

    // ========================================================================
    // PRUEBAS PARA validarHorario() — Caja blanca directa (V(G) = 3)
    // ========================================================================

    // VH1: horaInicio < horaFin, ambos :00 → no exception
    @Test
    void validarHorario_VH1_horaValidaPunto_shouldSucceed() {
        RangoDisponibilidadRequest rango = buildRango(DAY, "08:00", "10:00");
        assertDoesNotThrow(() -> disponibilidadService.validarHorario(rango));
    }

    // VH2: horaInicio < horaFin, ambos :30 → no exception
    @Test
    void validarHorario_VH2_horaValidaMedia_shouldSucceed() {
        RangoDisponibilidadRequest rango = buildRango(DAY, "08:30", "10:30");
        assertDoesNotThrow(() -> disponibilidadService.validarHorario(rango));
    }

    // VH3: horaInicio > horaFin → IllegalArgumentException
    @Test
    void validarHorario_VH3_inicioMayorQueFin_shouldThrow() {
        RangoDisponibilidadRequest rango = buildRango(DAY, "12:00", "08:00");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> disponibilidadService.validarHorario(rango));
        assertTrue(ex.getMessage().contains("inicio"));
    }

    // VH4: horaInicio == horaFin → IllegalArgumentException
    @Test
    void validarHorario_VH4_inicioIgualFin_shouldThrow() {
        RangoDisponibilidadRequest rango = buildRango(DAY, "08:00", "08:00");
        assertThrows(IllegalArgumentException.class,
                () -> disponibilidadService.validarHorario(rango));
    }

    // VH5: horaInicio con minutos no válidos (:15) → IllegalArgumentException
    @Test
    void validarHorario_VH5_minutosInicioInvalidos_shouldThrow() {
        RangoDisponibilidadRequest rango = buildRango(DAY, "08:15", "10:00");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> disponibilidadService.validarHorario(rango));
        assertTrue(ex.getMessage().contains(":00") || ex.getMessage().contains(":30"));
    }

    // VH6: horaFin con minutos no válidos (:45) → IllegalArgumentException
    @Test
    void validarHorario_VH6_minutosFinInvalidos_shouldThrow() {
        RangoDisponibilidadRequest rango = buildRango(DAY, "08:00", "10:45");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> disponibilidadService.validarHorario(rango));
        assertTrue(ex.getMessage().contains(":00") || ex.getMessage().contains(":30"));
    }

    // ========================================================================
    // PRUEBAS PARA listPendingProposals() — Caja blanca (V(G) = 1)
    // ========================================================================

    @Test
    void listPendingProposals_LP1_sinPropuestas_shouldReturnEmptyList() {
        when(propuestaDisponibilidadRepository.findByEstadoAndEspecialidadWithDetails(
                EstadoPropuesta.PENDIENTE.name(), 1))
                .thenReturn(List.of());

        List<PropuestaDisponibilidadResponse> result = disponibilidadService.listPendingProposals(1);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void listPendingProposals_LP2_unaPropuestaDosBloques_shouldMapCorrectamente() {
        Persona personaMock = Persona.builder()
                .nombres("Juan").apellidos("Perez").build();
        medicoMock.setPersona(personaMock);

        BloqueHorario bh1 = BloqueHorario.builder()
                .id(1).horaInicio(LocalTime.of(8, 0)).horaFin(LocalTime.of(8, 30)).build();
        BloqueHorario bh2 = BloqueHorario.builder()
                .id(2).horaInicio(LocalTime.of(8, 30)).horaFin(LocalTime.of(9, 0)).build();

        AsignacionBloque ab1 = AsignacionBloque.builder()
                .id(100).fecha(DAY).bloqueHorario(bh1).disponible(false).build();
        AsignacionBloque ab2 = AsignacionBloque.builder()
                .id(101).fecha(DAY).bloqueHorario(bh2).disponible(false).build();

        PropuestaDisponibilidad propuesta = PropuestaDisponibilidad.builder()
                .id(1).medico(medicoMock).estado(EstadoPropuesta.PENDIENTE.name())
                .asignaciones(List.of(ab1, ab2))
                .build();

        when(propuestaDisponibilidadRepository.findByEstadoAndEspecialidadWithDetails(
                EstadoPropuesta.PENDIENTE.name(), 1))
                .thenReturn(List.of(propuesta));

        List<PropuestaDisponibilidadResponse> result = disponibilidadService.listPendingProposals(1);

        assertNotNull(result);
        assertEquals(1, result.size());
        PropuestaDisponibilidadResponse dto = result.get(0);
        assertEquals("Juan Perez", dto.getMedico());
        assertNotNull(dto.getBloquesHorario());
        assertEquals(2, dto.getBloquesHorario().size());
        assertEquals(Integer.valueOf(100), dto.getBloquesHorario().get(0).getIdBloque());
        assertEquals(DAY, dto.getBloquesHorario().get(0).getFecha());
        assertEquals(LocalTime.of(8, 0), dto.getBloquesHorario().get(0).getHoraInicio());
        assertEquals(LocalTime.of(8, 30), dto.getBloquesHorario().get(0).getHoraFin());
        assertEquals(Integer.valueOf(101), dto.getBloquesHorario().get(1).getIdBloque());
        assertEquals(LocalTime.of(8, 30), dto.getBloquesHorario().get(1).getHoraInicio());
    }

    @Test
    void listPendingProposals_LP3_multiplesPropuestas_shouldMapTodas() {
        Persona persona1 = Persona.builder().nombres("Ana").apellidos("Lopez").build();
        Persona persona2 = Persona.builder().nombres("Luis").apellidos("Garcia").build();

        Medico medico1 = Medico.builder().idPersona(UUID.randomUUID()).persona(persona1).build();
        Medico medico2 = Medico.builder().idPersona(UUID.randomUUID()).persona(persona2).build();

        BloqueHorario bh = BloqueHorario.builder()
                .id(1).horaInicio(LocalTime.of(8, 0)).horaFin(LocalTime.of(8, 30)).build();
        AsignacionBloque ab = AsignacionBloque.builder()
                .id(200).fecha(DAY).bloqueHorario(bh).disponible(false).build();

        PropuestaDisponibilidad p1 = PropuestaDisponibilidad.builder()
                .id(1).medico(medico1).estado(EstadoPropuesta.PENDIENTE.name())
                .asignaciones(List.of(ab)).build();
        PropuestaDisponibilidad p2 = PropuestaDisponibilidad.builder()
                .id(2).medico(medico2).estado(EstadoPropuesta.PENDIENTE.name())
                .asignaciones(List.of(ab)).build();

        when(propuestaDisponibilidadRepository.findByEstadoAndEspecialidadWithDetails(
                EstadoPropuesta.PENDIENTE.name(), 1))
                .thenReturn(List.of(p1, p2));

        List<PropuestaDisponibilidadResponse> result = disponibilidadService.listPendingProposals(1);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Ana Lopez", result.get(0).getMedico());
        assertEquals("Luis Garcia", result.get(1).getMedico());
    }

    // ========================================================================
    // PRUEBAS PARA updateProposals() — Caja blanca (V(G) = 6)
    // ========================================================================

    private AsignacionBloque buildAsignacion(int id, Integer bloqueId, LocalTime hInicio, LocalTime hFin,
                                              PropuestaDisponibilidad propuesta, LocalDate fecha) {
        BloqueHorario bh = BloqueHorario.builder()
                .id(bloqueId).horaInicio(hInicio).horaFin(hFin).build();
        return AsignacionBloque.builder()
                .id(id).fecha(fecha).bloqueHorario(bh).disponible(false)
                .propuestaDisponibilidad(propuesta).consultorio(null).build();
    }

    @Test
    void updateProposals_UP1_secretariaNoEncontrada_shouldThrowRuntimeException() {
        when(secretariaRepository.getByCorreo(anyString())).thenReturn(Optional.empty());

        List<UpdatePropuestaRequest> requests = List.of(buildUpdateRequest(1, true));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> disponibilidadService.updateProposals(requests));
        assertTrue(ex.getMessage().contains("secretaria"));
    }

    @Test
    void updateProposals_UP2_requestsVacio_shouldReturnSinLlamarRepos() {
        when(secretariaRepository.getByCorreo(anyString())).thenReturn(Optional.of(mock(Secretaria.class)));

        disponibilidadService.updateProposals(List.of());

        verify(asignacionBloqueRepository, never()).findByIdsWithDetails(any());
    }

    @Test
    void updateProposals_UP3_unaAprobada_shouldSetConsultorioYEstadoAprobado() {
        Persona personaMock = Persona.builder().nombres("Ana").apellidos("Lopez").build();
        Secretaria secretariaMock = Secretaria.builder().idPersona(UUID.randomUUID()).persona(personaMock).build();
        when(secretariaRepository.getByCorreo(anyString())).thenReturn(Optional.of(secretariaMock));

        PropuestaDisponibilidad propuesta = PropuestaDisponibilidad.builder()
                .id(1).medico(medicoMock).estado(EstadoPropuesta.PENDIENTE.name()).build();
        AsignacionBloque ab = buildAsignacion(10, 1, LocalTime.of(8, 0), LocalTime.of(8, 30), propuesta, DAY);
        propuesta.setAsignaciones(List.of(ab));

        when(asignacionBloqueRepository.findByIdsWithDetails(any())).thenReturn(List.of(ab));
        when(consultorioRepository.findAllHabilitadosWithEspecialidad()).thenReturn(List.of(consultorioMock));

        disponibilidadService.updateProposals(List.of(buildUpdateRequest(10, true)));

        assertEquals(consultorioMock, ab.getConsultorio());
        assertTrue(ab.getDisponible());
        assertEquals(EstadoPropuesta.APROBADO.name(), propuesta.getEstado());
        assertNotNull(propuesta.getFechaResolucion());
        assertEquals(secretariaMock, propuesta.getSecretaria());
    }

    @Test
    void updateProposals_UP4_unaRechazada_shouldSetConsultorioNullYEstadoRechazado() {
        when(secretariaRepository.getByCorreo(anyString())).thenReturn(Optional.of(mock(Secretaria.class)));

        PropuestaDisponibilidad propuesta = PropuestaDisponibilidad.builder()
                .id(2).medico(medicoMock).estado(EstadoPropuesta.PENDIENTE.name()).build();
        AsignacionBloque ab = buildAsignacion(20, 1, LocalTime.of(8, 0), LocalTime.of(8, 30), propuesta, DAY);
        propuesta.setAsignaciones(List.of(ab));

        when(asignacionBloqueRepository.findByIdsWithDetails(any())).thenReturn(List.of(ab));

        disponibilidadService.updateProposals(List.of(buildUpdateRequest(20, false)));

        assertNull(ab.getConsultorio());
        assertFalse(ab.getDisponible());
        assertEquals(EstadoPropuesta.RECHAZADO.name(), propuesta.getEstado());
    }

    @Test
    void updateProposals_UP5_mixtas_shouldSetEstadoObservado() {
        when(secretariaRepository.getByCorreo(anyString())).thenReturn(Optional.of(mock(Secretaria.class)));

        PropuestaDisponibilidad propuesta = PropuestaDisponibilidad.builder()
                .id(3).medico(medicoMock).estado(EstadoPropuesta.PENDIENTE.name()).build();
        AsignacionBloque ab1 = buildAsignacion(31, 1, LocalTime.of(8, 0), LocalTime.of(8, 30), propuesta, DAY);
        AsignacionBloque ab2 = buildAsignacion(32, 2, LocalTime.of(8, 30), LocalTime.of(9, 0), propuesta, DAY);
        propuesta.setAsignaciones(List.of(ab1, ab2));

        when(asignacionBloqueRepository.findByIdsWithDetails(any())).thenReturn(List.of(ab1, ab2));
        when(consultorioRepository.findAllHabilitadosWithEspecialidad()).thenReturn(List.of(consultorioMock));

        disponibilidadService.updateProposals(List.of(
                buildUpdateRequest(31, true),
                buildUpdateRequest(32, false)
        ));

        assertEquals(consultorioMock, ab1.getConsultorio());
        assertTrue(ab1.getDisponible());
        assertNull(ab2.getConsultorio());
        assertFalse(ab2.getDisponible());
        assertEquals(EstadoPropuesta.OBSERVADO.name(), propuesta.getEstado());
    }

    @Test
    void updateProposals_UP6_capacidadExcedida_shouldThrowRuntimeException() {
        when(secretariaRepository.getByCorreo(anyString())).thenReturn(Optional.of(mock(Secretaria.class)));

        // Misma fecha, mismo bloqueHorario, misma especialidad → misma key
        PropuestaDisponibilidad propuesta = PropuestaDisponibilidad.builder()
                .id(4).medico(medicoMock).estado(EstadoPropuesta.PENDIENTE.name()).build();
        AsignacionBloque ab1 = buildAsignacion(41, 1, LocalTime.of(8, 0), LocalTime.of(8, 30), propuesta, DAY);
        AsignacionBloque ab2 = buildAsignacion(42, 1, LocalTime.of(8, 0), LocalTime.of(8, 30), propuesta, DAY);
        propuesta.setAsignaciones(List.of(ab1, ab2));

        when(asignacionBloqueRepository.findByIdsWithDetails(any())).thenReturn(List.of(ab1, ab2));
        // Solo 1 consultorio para 2 asignaciones en la misma key
        when(consultorioRepository.findAllHabilitadosWithEspecialidad()).thenReturn(List.of(consultorioMock));

        List<UpdatePropuestaRequest> requests = List.of(
                buildUpdateRequest(41, true),
                buildUpdateRequest(42, true)
        );

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> disponibilidadService.updateProposals(requests));
        assertTrue(ex.getMessage().contains("Capacidad excedida"));
    }
}
