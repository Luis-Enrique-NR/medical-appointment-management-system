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
import pe.uni.software.medical_appointments.domain.entities.AsignacionBloque;
import pe.uni.software.medical_appointments.domain.entities.BloqueHorario;
import pe.uni.software.medical_appointments.domain.entities.Consultorio;
import pe.uni.software.medical_appointments.domain.entities.Especialidad;
import pe.uni.software.medical_appointments.domain.entities.Medico;
import pe.uni.software.medical_appointments.domain.entities.PropuestaDisponibilidad;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.infraestructure.repositories.BloqueHorarioRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.ConsultorioRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.MedicoRepository;
import pe.uni.software.medical_appointments.infraestructure.repositories.PropuestaDisponibilidadRepository;

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
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("medico@test.com");
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

    // ========================================================================
    // PRUEBAS DE CAJA BLANCA — 10 rutas independientes (V(G) = 10)
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
        when(consultorioRepository.findHabilitadosPorEspecialidad(especialidadMock))
                .thenReturn(List.of(consultorioMock));

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
        when(consultorioRepository.findHabilitadosPorEspecialidad(especialidadMock))
                .thenReturn(List.of(consultorioMock));

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
        when(consultorioRepository.findHabilitadosPorEspecialidad(especialidadMock))
                .thenReturn(List.of(consultorioMock));

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
        when(consultorioRepository.findHabilitadosPorEspecialidad(especialidadMock))
                .thenReturn(List.of(consultorioMock));

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "09:00"),
                buildRango(DAY, "10:00", "11:00")
        ));

        assertDoesNotThrow(() -> disponibilidadService.registerAvailabilityIntention(request));
        verify(bloqueHorarioRepository, times(2)).getByRange(any(), any());
        verify(propuestaDisponibilidadRepository).save(any());
    }

    // P9: Sin consultorios habilitados para la especialidad
    @Test
    void cajaBlanca_P9_sinConsultoriosHabilitados_shouldThrowIllegalStateException() {
        when(medicoRepository.getByCorreo(anyString())).thenReturn(Optional.of(medicoMock));
        when(bloqueHorarioRepository.getByRange(any(), any())).thenReturn(bloquesCompletos08_12);
        when(consultorioRepository.findHabilitadosPorEspecialidad(especialidadMock))
                .thenReturn(Collections.emptyList());

        PropuestaDisponibilidadRequest request = buildRequest(List.of(
                buildRango(DAY, "08:00", "12:00")
        ));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> disponibilidadService.registerAvailabilityIntention(request));
        assertTrue(ex.getMessage().contains("No hay consultorios habilitados"));
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
        when(consultorioRepository.findHabilitadosPorEspecialidad(especialidadMock))
                .thenReturn(List.of(consultorioMock));

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
        when(consultorioRepository.findHabilitadosPorEspecialidad(especialidadMock))
                .thenReturn(List.of(consultorioMock));

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
        when(consultorioRepository.findHabilitadosPorEspecialidad(especialidadMock))
                .thenReturn(List.of(consultorioMock));

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
        when(consultorioRepository.findHabilitadosPorEspecialidad(especialidadMock))
                .thenReturn(List.of(consultorioMock));

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
            assertEquals(consultorioMock, ab.getConsultorio());
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
        when(consultorioRepository.findHabilitadosPorEspecialidad(especialidadMock))
                .thenReturn(List.of(consultorioMock));

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
}
