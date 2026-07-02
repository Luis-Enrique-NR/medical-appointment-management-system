package pe.uni.software.medical_appointments.infraestructure.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.uni.software.medical_appointments.application.dtos.paciente.request.RegisterPersonRequest;
import pe.uni.software.medical_appointments.application.dtos.paciente.response.GetPatientResponse;
import pe.uni.software.medical_appointments.application.services.PacienteService;

import pe.uni.software.medical_appointments.exception.ConflictException;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.service.JwtService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PacienteController.class)
@Import(PacienteControllerTest.TestSecurityConfig.class)
class PacienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PacienteService pacienteService;

    @MockitoBean
    private JwtService jwtService; // Mock para evitar que el contexto falle

    @TestConfiguration
    @EnableMethodSecurity // Habilita el escaneo de @PreAuthorize
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
                    .csrf(csrf -> csrf.disable()) // Deshabilitar CSRF para los tests
                    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()); // Permitir todo en el filtro, la seguridad se delega a @PreAuthorize
            return http.build();
        }

        @Bean
        public ObjectMapper objectMapper() {
            return new ObjectMapper();
        }
    }

    private RegisterPersonRequest buildValidRequest() {
        RegisterPersonRequest request = new RegisterPersonRequest();
        request.setNombres("Nombres Validos");
        request.setApellidos("Apellidos Validos");
        request.setDni("12345678");
        request.setTelefono("987654321");
        return request;
    }

    // POST /api/v1/paciente

    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void registerPatient_whenDatosValidosYRolePaciente_debeRetornar200() throws Exception {
        // Arrange
        RegisterPersonRequest request = buildValidRequest();
        doNothing().when(pacienteService).registerPatient(any(RegisterPersonRequest.class));

        // Act & Assert
        mockMvc.perform(post("/api/v1/paciente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registro exitoso"))
                .andExpect(jsonPath("$.codigo").value("200"));
    }

    @Test
    @WithMockUser(roles = {"SECRETARIA ADMINISTRATIVA"})
    void registerPatient_whenDatosValidosYRoleSecretaria_debeRetornar200() throws Exception {
        // Arrange
        RegisterPersonRequest request = buildValidRequest();
        doNothing().when(pacienteService).registerPatient(any(RegisterPersonRequest.class));

        // Act & Assert
        mockMvc.perform(post("/api/v1/paciente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registro exitoso"))
                .andExpect(jsonPath("$.codigo").value("200"));
    }

    @Test
    @WithMockUser(roles = {"MEDICO"})
    void registerPatient_whenRoleNoAutorizado_debeRetornar403() throws Exception {
        // Arrange
        RegisterPersonRequest request = buildValidRequest();

        // Act & Assert
        mockMvc.perform(post("/api/v1/paciente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void registerPatient_whenTelefonoInvalido_debeRetornar400() throws Exception {
        // Arrange
        RegisterPersonRequest request = new RegisterPersonRequest();
        request.setNombres("Nombres");
        request.setApellidos("Apellidos");
        request.setDni("12345678");
        request.setTelefono("123"); // Telefono invalido

        // Act & Assert
        mockMvc.perform(post("/api/v1/paciente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void registerPatient_whenDniVacio_debeRetornar400() throws Exception {
        // Arrange
        RegisterPersonRequest request = new RegisterPersonRequest();
        request.setNombres("Nombres");
        request.setApellidos("Apellidos");
        request.setDni(""); // DNI vacio
        request.setTelefono("987654321");

        // Act & Assert
        mockMvc.perform(post("/api/v1/paciente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void registerPatient_whenNombresVacios_debeRetornar400() throws Exception {
        // Arrange
        RegisterPersonRequest request = new RegisterPersonRequest();
        request.setNombres(""); // Nombres vacios
        request.setApellidos("Apellidos");
        request.setDni("12345678");
        request.setTelefono("987654321");

        // Act & Assert
        mockMvc.perform(post("/api/v1/paciente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void registerPatient_whenServiceLanzaConflictException_debeRetornar409() throws Exception {
        // Arrange
        RegisterPersonRequest request = buildValidRequest();
        doThrow(new ConflictException("El paciente ya existe")).when(pacienteService).registerPatient(any(RegisterPersonRequest.class));

        // Act & Assert
        mockMvc.perform(post("/api/v1/paciente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    // GET /api/v1/paciente/dni/{dni}

    @Test
    @WithMockUser(roles = {"SECRETARIA ADMINISTRATIVA"})
    void getByDni_whenPacienteExiste_debeRetornar200() throws Exception {
        // Arrange
        String dni = "12345678";

        // Construimos la respuesta usando el Builder de tu clase real
        GetPatientResponse mockResponse = GetPatientResponse.builder()
                .dni(dni)
                .nombres("Carlos Alejandro")
                .apellidos("Mendoza Prado")
                .telefono("999888777")
                .build();

        when(pacienteService.getByDni(dni)).thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(get("/api/v1/paciente/dni/{dni}", dni)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Consulta exitosa"))
                .andExpect(jsonPath("$.codigo").value("200"))
                .andExpect(jsonPath("$.data.dni").value(dni))
                .andExpect(jsonPath("$.data.nombres").value("Carlos Alejandro"))
                .andExpect(jsonPath("$.data.apellidos").value("Mendoza Prado"))
                .andExpect(jsonPath("$.data.telefono").value("999888777"));
    }

    @Test
    @WithMockUser(roles = {"SECRETARIA ADMINISTRATIVA"})
    void getByDni_whenPacienteNoExiste_debeRetornar404() throws Exception {
        // Arrange
        String dni = "87654321";
        when(pacienteService.getByDni(anyString())).thenThrow(new NotFoundException("Paciente no encontrado"));

        // Act & Assert
        mockMvc.perform(get("/api/v1/paciente/dni/{dni}", dni))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void getByDni_whenRoleNoAutorizado_debeRetornar403() throws Exception {
        // Arrange
        String dni = "12345678";

        // Act & Assert
        mockMvc.perform(get("/api/v1/paciente/dni/{dni}", dni))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = {"SECRETARIA ADMINISTRATIVA"})
    void getByDni_whenDniInvalido7Digitos_debeRetornar400() throws Exception {
        // Arrange
        String dni = "1234567"; // DNI invalido

        // Act & Assert
        mockMvc.perform(get("/api/v1/paciente/dni/{dni}", dni))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = {"SECRETARIA ADMINISTRATIVA"})
    void getByDni_whenDniInvalidoConLetras_debeRetornar400() throws Exception {
        // Arrange
        String dni = "1234567a"; // DNI invalido

        // Act & Assert
        mockMvc.perform(get("/api/v1/paciente/dni/{dni}", dni))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = {"SECRETARIA ADMINISTRATIVA"})
    void getByDni_whenDniVacio_debeRetornar400() throws Exception {
        // Arrange
        String dni = " "; // DNI vacio

        // Act & Assert
        mockMvc.perform(get("/api/v1/paciente/dni/{dni}", dni))
                .andExpect(status().isBadRequest());
    }
}
