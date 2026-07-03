package pe.uni.software.medical_appointments.infraestructure.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
import pe.uni.software.medical_appointments.application.dtos.cita.request.RegisterCitaRequest;
import pe.uni.software.medical_appointments.application.dtos.cita.request.UpdateCitaRequest;
import pe.uni.software.medical_appointments.application.services.CitaService;
import pe.uni.software.medical_appointments.domain.enums.AccionCita;
import pe.uni.software.medical_appointments.exception.BadRequestException;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.service.JwtService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CitaController.class)
@Import(CitaControllerTest.TestSecurityConfig.class)
class CitaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CitaService citaService;

    @MockitoBean
    private JwtService jwtService;

    @TestConfiguration
    @EnableMethodSecurity
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
                    .csrf(csrf -> csrf.disable())
                    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }

        @Bean
        public ObjectMapper objectMapper() {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            return mapper;
        }
    }

    private RegisterCitaRequest buildValidRequest() {
        RegisterCitaRequest request = new RegisterCitaRequest();
        request.setIdAsignacionBloque(100);
        return request;
    }

    // CC1: Role PACIENTE → 200
    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void registrarCita_whenRolePaciente_debeRetornar200() throws Exception {
        RegisterCitaRequest request = buildValidRequest();
        doNothing().when(citaService).registerAppointment(any(RegisterCitaRequest.class));

        mockMvc.perform(post("/api/v1/cita")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registro exitoso"))
                .andExpect(jsonPath("$.codigo").value("200"));
    }

    // CC2: Role SECRETARIA ADMINISTRATIVA → 200
    @Test
    @WithMockUser(roles = {"SECRETARIA ADMINISTRATIVA"})
    void registrarCita_whenRoleSecretaria_debeRetornar200() throws Exception {
        RegisterCitaRequest request = buildValidRequest();
        doNothing().when(citaService).registerAppointment(any(RegisterCitaRequest.class));

        mockMvc.perform(post("/api/v1/cita")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registro exitoso"))
                .andExpect(jsonPath("$.codigo").value("200"));
    }

    // CC3: Role incorrecto → 403
    @Test
    @WithMockUser(roles = {"MEDICO ESPECIALISTA"})
    void registrarCita_whenRoleMedico_debeRetornar403() throws Exception {
        RegisterCitaRequest request = buildValidRequest();

        mockMvc.perform(post("/api/v1/cita")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    // CC4: Sin auth → 403
    @Test
    void registrarCita_whenSinAuth_debeRetornar403() throws Exception {
        RegisterCitaRequest request = buildValidRequest();

        mockMvc.perform(post("/api/v1/cita")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    // CC5: Body inválido (idAsignacionBloque null) → 400
    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void registrarCita_whenIdAsignacionBloqueNull_debeRetornar400() throws Exception {
        RegisterCitaRequest request = new RegisterCitaRequest();

        mockMvc.perform(post("/api/v1/cita")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // CC6: Service lanza NotFoundException → 404
    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void registrarCita_whenNotFoundException_debeRetornar404() throws Exception {
        RegisterCitaRequest request = buildValidRequest();
        doThrow(new NotFoundException("No se encontró el bloque horario"))
                .when(citaService).registerAppointment(any(RegisterCitaRequest.class));

        mockMvc.perform(post("/api/v1/cita")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    // CC7: Service lanza BadRequestException → 400
    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void registrarCita_whenBadRequestException_debeRetornar400() throws Exception {
        RegisterCitaRequest request = buildValidRequest();
        doThrow(new BadRequestException("El bloque horario ya no está disponible"))
                .when(citaService).registerAppointment(any(RegisterCitaRequest.class));

        mockMvc.perform(post("/api/v1/cita")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // CC8: Service lanza IllegalStateException → 500
    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void registrarCita_whenIllegalStateException_debeRetornar500() throws Exception {
        RegisterCitaRequest request = buildValidRequest();
        doThrow(new IllegalStateException("No se pudo generar un código único"))
                .when(citaService).registerAppointment(any(RegisterCitaRequest.class));

        mockMvc.perform(post("/api/v1/cita")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    // ========================================================================
    // PUT /api/v1/cita — actualizarCita
    // ========================================================================

    private UpdateCitaRequest buildUpdateRequest() {
        UpdateCitaRequest request = new UpdateCitaRequest();
        request.setIdAsignacionBloqueActual(100);
        request.setIdAsignacionBloqueNuevo(200);
        request.setAccion(AccionCita.REPROGRAMAR);
        request.setMotivoActualizacion("Cambio de horario");
        return request;
    }

    // CC9: Role PACIENTE → 200
    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void actualizarCita_whenRolePaciente_debeRetornar200() throws Exception {
        UpdateCitaRequest request = buildUpdateRequest();
        doNothing().when(citaService).updateAppointment(any(UpdateCitaRequest.class));

        mockMvc.perform(put("/api/v1/cita")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Actualización exitosa"))
                .andExpect(jsonPath("$.codigo").value("200"));
    }

    // CC10: Role SECRETARIA ADMINISTRATIVA → 200
    @Test
    @WithMockUser(roles = {"SECRETARIA ADMINISTRATIVA"})
    void actualizarCita_whenRoleSecretaria_debeRetornar200() throws Exception {
        UpdateCitaRequest request = buildUpdateRequest();
        doNothing().when(citaService).updateAppointment(any(UpdateCitaRequest.class));

        mockMvc.perform(put("/api/v1/cita")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Actualización exitosa"))
                .andExpect(jsonPath("$.codigo").value("200"));
    }

    // CC11: Body inválido (accion null) → 400
    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void actualizarCita_whenAccionNull_debeRetornar400() throws Exception {
        UpdateCitaRequest request = new UpdateCitaRequest();
        request.setIdAsignacionBloqueActual(100);

        mockMvc.perform(put("/api/v1/cita")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // CC12: Role incorrecto (MEDICO ESPECIALISTA) → 403
    @Test
    @WithMockUser(roles = {"MEDICO ESPECIALISTA"})
    void actualizarCita_whenRoleMedico_debeRetornar403() throws Exception {
        UpdateCitaRequest request = buildUpdateRequest();

        mockMvc.perform(put("/api/v1/cita")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
