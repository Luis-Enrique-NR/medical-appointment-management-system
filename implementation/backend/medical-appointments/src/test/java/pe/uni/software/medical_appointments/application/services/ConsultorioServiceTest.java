package pe.uni.software.medical_appointments.application.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.uni.software.medical_appointments.application.dtos.consultorio.response.GetCantidadConsultorioResponse;
import pe.uni.software.medical_appointments.infraestructure.repositories.ConsultorioRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConsultorioServiceTest {

    @Mock
    private ConsultorioRepository consultorioRepository;

    @InjectMocks
    private ConsultorioService consultorioService;

    @Test
    void getCantidadConsultorio_whenHayConsultorios_debeRetornarCantidad() {
        when(consultorioRepository.countByEspecialidadId(1)).thenReturn(5L);

        GetCantidadConsultorioResponse response = consultorioService.getCantidadConsultorio(1);

        assertEquals(1, response.getIdEspecialidad());
        assertEquals(5L, response.getCantidad());
        verify(consultorioRepository).countByEspecialidadId(1);
    }

    @Test
    void getCantidadConsultorio_whenNoHayConsultorios_debeRetornarCero() {
        when(consultorioRepository.countByEspecialidadId(999)).thenReturn(0L);

        GetCantidadConsultorioResponse response = consultorioService.getCantidadConsultorio(999);

        assertEquals(999, response.getIdEspecialidad());
        assertEquals(0L, response.getCantidad());
        verify(consultorioRepository).countByEspecialidadId(999);
    }
}
