package pe.uni.software.medical_appointments.application.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.uni.software.medical_appointments.application.dtos.paciente.request.RegisterPersonRequest;
import pe.uni.software.medical_appointments.application.dtos.paciente.response.GetPatientResponse;
import pe.uni.software.medical_appointments.domain.entities.Paciente;
import pe.uni.software.medical_appointments.domain.entities.Persona;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.infraestructure.repositories.PacienteRepository;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PacienteServiceTest {

    @Mock
    private PacienteRepository pacienteRepository;

    @Mock
    private PersonaService personaService;

    @InjectMocks
    private PacienteService pacienteService;

    private RegisterPersonRequest validRequest;
    private Persona mockPersona;

    @BeforeEach
    void setUp() {
        validRequest = new RegisterPersonRequest();
        validRequest.setDni("12345678");
        validRequest.setNombres("Luis");
        validRequest.setApellidos("Núñez");
        validRequest.setTelefono("912345678");

        mockPersona = Persona.builder()
                .id(UUID.randomUUID())
                .dni(validRequest.getDni())
                .nombres(validRequest.getNombres())
                .apellidos(validRequest.getApellidos())
                .telefono(validRequest.getTelefono())
                .build();
    }

    @Test
    void registerPatient_whenDatosValidos_debeGuardarYRetornarResponseConIdPaciente() {
        when(personaService.registerPerson(validRequest)).thenReturn(mockPersona);
        when(pacienteRepository.existsByCodigo(anyString())).thenReturn(false);

            Paciente pacienteGuardado = Paciente.builder()
                .idPersona(mockPersona.getId())
                .persona(mockPersona)
                .codigo("P-00001")
                .build();
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(pacienteGuardado);

        GetPatientResponse response = pacienteService.registerPatient(validRequest);

        assertNotNull(response);
        assertEquals(mockPersona.getId(), response.getIdPaciente());
        assertEquals(validRequest.getDni(), response.getDni());
        assertEquals(validRequest.getNombres(), response.getNombres());
        assertEquals(validRequest.getApellidos(), response.getApellidos());
        assertEquals(validRequest.getTelefono(), response.getTelefono());
        verify(pacienteRepository).save(any(Paciente.class));
    }

    @Test
    void registerPatient_whenCodigoDuplicado10Intentos_debeLanzarIllegalStateException() {
        when(personaService.registerPerson(validRequest)).thenReturn(mockPersona);
        when(pacienteRepository.existsByCodigo(anyString())).thenReturn(true);

        assertThrows(IllegalStateException.class,
                () -> pacienteService.registerPatient(validRequest));

        verify(pacienteRepository, never()).save(any(Paciente.class));
    }

    @Test
    void getByDni_whenPacienteExiste_debeRetornarResponse() {
        when(personaService.getByDni(validRequest.getDni())).thenReturn(mockPersona);

        Paciente paciente = Paciente.builder()
                .idPersona(mockPersona.getId())
                .persona(mockPersona)
                .codigo("P-00001")
                .build();
        when(pacienteRepository.findById(mockPersona.getId())).thenReturn(Optional.of(paciente));

        GetPatientResponse response = pacienteService.getByDni(validRequest.getDni());

        assertNotNull(response);
        assertEquals(mockPersona.getId(), response.getIdPaciente());
        assertEquals(validRequest.getDni(), response.getDni());
        assertEquals(validRequest.getNombres(), response.getNombres());
        assertEquals(validRequest.getApellidos(), response.getApellidos());
    }

    @Test
    void getByDni_whenPacienteNoExiste_debeLanzarNotFoundException() {
        when(personaService.getByDni(validRequest.getDni())).thenReturn(mockPersona);
        when(pacienteRepository.findById(mockPersona.getId())).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                () -> pacienteService.getByDni(validRequest.getDni()));
    }
}
