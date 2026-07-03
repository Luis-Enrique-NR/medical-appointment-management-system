package pe.uni.software.medical_appointments.application.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.uni.software.medical_appointments.application.dtos.especialidad.response.GetEspecialidadResponse;
import pe.uni.software.medical_appointments.domain.entities.Especialidad;
import pe.uni.software.medical_appointments.infraestructure.repositories.EspecialidadRepository;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EspecialidadServiceTest {

    @Mock
    private EspecialidadRepository especialidadRepository;

    @InjectMocks
    private EspecialidadService especialidadService;

    @Test
    void listarEspecialidadesActivas_whenHayEspecialidades_debeRetornarLista() {
        List<Especialidad> especialidades = List.of(
                Especialidad.builder().id(1).codigo("ESP001").nombres("Cardiología").descripcion("Cardiología general").activa(true).build(),
                Especialidad.builder().id(2).codigo("ESP002").nombres("Pediatría").descripcion("Atención pediátrica").activa(true).build()
        );
        when(especialidadRepository.findAllByActivaTrue()).thenReturn(especialidades);

        List<GetEspecialidadResponse> response = especialidadService.listarEspecialidadesActivas();

        assertEquals(2, response.size());
        assertEquals(1, response.get(0).getIdEspecialidad());
        assertEquals("Cardiología", response.get(0).getNombre());
        assertEquals("Cardiología general", response.get(0).getDescripcion());
        assertEquals(2, response.get(1).getIdEspecialidad());
        assertEquals("Pediatría", response.get(1).getNombre());
        verify(especialidadRepository).findAllByActivaTrue();
    }

    @Test
    void listarEspecialidadesActivas_whenNoHayEspecialidades_debeRetornarListaVacia() {
        when(especialidadRepository.findAllByActivaTrue()).thenReturn(Collections.emptyList());

        List<GetEspecialidadResponse> response = especialidadService.listarEspecialidadesActivas();

        assertTrue(response.isEmpty());
    }
}
