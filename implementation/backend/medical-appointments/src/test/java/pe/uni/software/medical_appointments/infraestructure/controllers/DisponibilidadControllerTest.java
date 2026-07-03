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
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.request.PropuestaDisponibilidadRequest;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.request.RangoDisponibilidadRequest;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.request.UpdatePropuestaRequest;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.response.BloqueDisponibilidadResponse;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.response.PropuestaDisponibilidadResponse;
import pe.uni.software.medical_appointments.application.services.DisponibilidadService;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.service.JwtService;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DisponibilidadController.class)
@Import(DisponibilidadControllerTest.TestSecurityConfig.class)
class DisponibilidadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DisponibilidadService disponibilidadService;

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

    private PropuestaDisponibilidadRequest buildValidRequest() {
        PropuestaDisponibilidadRequest request = new PropuestaDisponibilidadRequest();
        RangoDisponibilidadRequest rango = new RangoDisponibilidadRequest();
        rango.setDia(LocalDate.of(2026, 7, 15));
        rango.setHoraInicio(LocalTime.of(8, 0));
        rango.setHoraFin(LocalTime.of(12, 0));
        request.setRangosDisponibilidad(List.of(rango));
        return request;
    }

    // ========================================================================
    // FLUJO PRINCIPAL
    // ========================================================================

    @Test
    @WithMockUser(roles = {"MEDICO ESPECIALISTA"})
    void registerProposal_whenDatosValidosYRoleMedicoEspecialista_debeRetornar200() throws Exception {
        PropuestaDisponibilidadRequest request = buildValidRequest();
        doNothing().when(disponibilidadService).registerAvailabilityIntention(any(PropuestaDisponibilidadRequest.class));

        mockMvc.perform(post("/api/v1/disponibilidad/propuesta")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registro exitoso"))
                .andExpect(jsonPath("$.codigo").value("200"));
    }

    // ========================================================================
    // AUTORIZACIÓN
    // ========================================================================

    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void registerProposal_whenRolePaciente_debeRetornar403() throws Exception {
        PropuestaDisponibilidadRequest request = buildValidRequest();

        mockMvc.perform(post("/api/v1/disponibilidad/propuesta")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = {"MEDICO"})
    void registerProposal_whenRoleMedico_debeRetornar403() throws Exception {
        PropuestaDisponibilidadRequest request = buildValidRequest();

        mockMvc.perform(post("/api/v1/disponibilidad/propuesta")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    // ========================================================================
    // VALIDACIÓN DE ENTRADA (@Valid en @RequestBody)
    // ========================================================================

    @Test
    @WithMockUser(roles = {"MEDICO ESPECIALISTA"})
    void registerProposal_whenRangosNull_debeRetornar400() throws Exception {
        PropuestaDisponibilidadRequest request = new PropuestaDisponibilidadRequest();

        mockMvc.perform(post("/api/v1/disponibilidad/propuesta")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ========================================================================
    // EXCEPCIONES DEL SERVICIO
    // ========================================================================

    @Test
    @WithMockUser(roles = {"MEDICO ESPECIALISTA"})
    void registerProposal_whenServiceLanzaNotFoundException_debeRetornar404() throws Exception {
        PropuestaDisponibilidadRequest request = buildValidRequest();
        doThrow(new NotFoundException("No se ha encontrado un perfil médico con el usuario activo"))
                .when(disponibilidadService).registerAvailabilityIntention(any(PropuestaDisponibilidadRequest.class));

        mockMvc.perform(post("/api/v1/disponibilidad/propuesta")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"MEDICO ESPECIALISTA"})
    void registerProposal_whenServiceLanzaIllegalArgumentException_debeRetornar500() throws Exception {
        PropuestaDisponibilidadRequest request = buildValidRequest();
        doThrow(new IllegalArgumentException("El rango 08:00 - 08:30 no es válido"))
                .when(disponibilidadService).registerAvailabilityIntention(any(PropuestaDisponibilidadRequest.class));

        mockMvc.perform(post("/api/v1/disponibilidad/propuesta")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = {"MEDICO ESPECIALISTA"})
    void registerProposal_whenServiceLanzaIllegalStateException_debeRetornar500() throws Exception {
        PropuestaDisponibilidadRequest request = buildValidRequest();
        doThrow(new IllegalStateException("No hay consultorios habilitados actualmente"))
                .when(disponibilidadService).registerAvailabilityIntention(any(PropuestaDisponibilidadRequest.class));

        mockMvc.perform(post("/api/v1/disponibilidad/propuesta")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    // ========================================================================
    // GET /pendientes
    // ========================================================================

    @Test
    @WithMockUser(roles = {"SECRETARIA ADMINISTRATIVA"})
    void listPendingProposals_whenRoleSecretaria_debeRetornar200() throws Exception {
        BloqueDisponibilidadResponse bloque = BloqueDisponibilidadResponse.builder()
                .idBloque(1).fecha(LocalDate.of(2026, 7, 15))
                .horaInicio(LocalTime.of(8, 0)).horaFin(LocalTime.of(8, 30)).build();
        PropuestaDisponibilidadResponse propuesta = PropuestaDisponibilidadResponse.builder()
                .medico("Juan Perez").bloquesHorario(List.of(bloque)).build();

        when(disponibilidadService.listPendingProposals()).thenReturn(List.of(propuesta));

        mockMvc.perform(get("/api/v1/disponibilidad/pendientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Consulta exitosa"))
                .andExpect(jsonPath("$.codigo").value("200"))
                .andExpect(jsonPath("$.data[0].medico").value("Juan Perez"))
                .andExpect(jsonPath("$.data[0].bloquesHorario[0].idBloque").value(1));
    }

    @Test
    @WithMockUser(roles = {"MEDICO ESPECIALISTA"})
    void listPendingProposals_whenRoleMedico_debeRetornar403() throws Exception {
        mockMvc.perform(get("/api/v1/disponibilidad/pendientes"))
                .andExpect(status().isForbidden());
    }

    @Test
    void listPendingProposals_whenSinAuth_debeRetornar403() throws Exception {
        mockMvc.perform(get("/api/v1/disponibilidad/pendientes"))
                .andExpect(status().isForbidden());
    }

    // ========================================================================
    // PUT /actualizar
    // ========================================================================

    @Test
    @WithMockUser(roles = {"SECRETARIA ADMINISTRATIVA"})
    void updateProposals_whenRoleSecretariaYBodyValido_debeRetornar200() throws Exception {
        UpdatePropuestaRequest req = new UpdatePropuestaRequest();
        req.setIdAsignacion(1);
        req.setAprobado(true);
        doNothing().when(disponibilidadService).updateProposals(any());

        mockMvc.perform(put("/api/v1/disponibilidad/actualizar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(req))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Actualización exitosa"))
                .andExpect(jsonPath("$.codigo").value("200"));
    }

    @Test
    @WithMockUser(roles = {"MEDICO ESPECIALISTA"})
    void updateProposals_whenRoleMedico_debeRetornar403() throws Exception {
        mockMvc.perform(put("/api/v1/disponibilidad/actualizar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of())))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateProposals_whenSinAuth_debeRetornar403() throws Exception {
        mockMvc.perform(put("/api/v1/disponibilidad/actualizar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of())))
                .andExpect(status().isForbidden());
    }
}
