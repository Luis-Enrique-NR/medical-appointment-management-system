package pe.uni.software.medical_appointments.application.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.uni.software.medical_appointments.application.dtos.medico.response.GetHorariosResponse;
import pe.uni.software.medical_appointments.application.dtos.medico.response.GetMedicoResponse;
import pe.uni.software.medical_appointments.domain.entities.*;
import pe.uni.software.medical_appointments.infraestructure.repositories.AsignacionBloqueRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicoServiceTest {

    @Mock
    private AsignacionBloqueRepository asignacionBloqueRepository;

    @InjectMocks
    private MedicoService medicoService;

    private Medico mockMedico;
    private AsignacionBloque mockAsignacion;

    @BeforeEach
    void setUp() {
        Persona persona = Persona.builder()
                .id(UUID.randomUUID())
                .dni("12345678")
                .nombres("Carlos Alejandro")
                .apellidos("Mendoza Prado")
                .build();

        Especialidad especialidad = Especialidad.builder()
                .id(1)
                .codigo("ESP001")
                .nombres("Cardiología")
                .activa(true)
                .build();

        mockMedico = Medico.builder()
                .idPersona(persona.getId())
                .persona(persona)
                .especialidad(especialidad)
                .codigo("M-00001")
                .colegiaturaCmp("123456")
                .descripcion("Cardiólogo especialista")
                .build();

        BloqueHorario bloqueHorario = BloqueHorario.builder()
                .id(1)
                .horaInicio(LocalTime.of(8, 0))
                .horaFin(LocalTime.of(9, 0))
                .build();

        mockAsignacion = AsignacionBloque.builder()
                .id(100)
                .bloqueHorario(bloqueHorario)
                .fecha(LocalDate.of(2026, 7, 10))
                .disponible(true)
                .build();
    }

    @Test
    void listarMedicosDisponiblesPorEspecialidad_whenHayMedicos_debeRetornarLista() {
        when(asignacionBloqueRepository.findAvailableMedicosByEspecialidad(1))
                .thenReturn(List.of(mockMedico));

        List<GetMedicoResponse> response = medicoService.listarMedicosDisponiblesPorEspecialidad(1);

        assertEquals(1, response.size());
        assertEquals(mockMedico.getIdPersona(), response.get(0).getIdMedico());
        assertEquals("Carlos Alejandro Mendoza Prado", response.get(0).getNombre());
        assertEquals("Cardiólogo especialista", response.get(0).getDescripcion());
        verify(asignacionBloqueRepository).findAvailableMedicosByEspecialidad(1);
    }

    @Test
    void listarMedicosDisponiblesPorEspecialidad_whenNoHayMedicos_debeRetornarListaVacia() {
        when(asignacionBloqueRepository.findAvailableMedicosByEspecialidad(999))
                .thenReturn(Collections.emptyList());

        List<GetMedicoResponse> response = medicoService.listarMedicosDisponiblesPorEspecialidad(999);

        assertTrue(response.isEmpty());
    }

    @Test
    void listarHorariosDisponiblesPorMedico_whenHayHorarios_debeRetornarLista() {
        UUID medicoId = mockMedico.getIdPersona();
        when(asignacionBloqueRepository.findAvailableHorariosByMedico(medicoId))
                .thenReturn(List.of(mockAsignacion));

        List<GetHorariosResponse> response = medicoService.listarHorariosDisponiblesPorMedico(medicoId);

        assertEquals(1, response.size());
        assertNotNull(response.get(0).getIdAsignacionBloque());
        assertEquals(Integer.valueOf(100), response.get(0).getIdAsignacionBloque());
        assertEquals(LocalDate.of(2026, 7, 10), response.get(0).getFecha());
        assertEquals(LocalTime.of(8, 0), response.get(0).getHoraInicio());
        assertEquals(LocalTime.of(9, 0), response.get(0).getHoraFin());
        verify(asignacionBloqueRepository).findAvailableHorariosByMedico(medicoId);
    }

    @Test
    void listarHorariosDisponiblesPorMedico_whenNoHayHorarios_debeRetornarListaVacia() {
        UUID medicoId = UUID.randomUUID();
        when(asignacionBloqueRepository.findAvailableHorariosByMedico(medicoId))
                .thenReturn(Collections.emptyList());

        List<GetHorariosResponse> response = medicoService.listarHorariosDisponiblesPorMedico(medicoId);

        assertTrue(response.isEmpty());
    }
}
