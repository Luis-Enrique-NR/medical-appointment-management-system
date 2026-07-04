package pe.uni.software.medical_appointments.infraestructure.controllers;

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
import pe.uni.software.medical_appointments.application.dtos.medico.response.GetHorariosResponse;
import pe.uni.software.medical_appointments.application.services.MedicoService;
import pe.uni.software.medical_appointments.service.JwtService;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MedicoController.class)
@Import(MedicoControllerTest.TestSecurityConfig.class)
class MedicoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MedicoService medicoService;

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
    }

    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void listarHorarios_whenRolePaciente_debeRetornar200() throws Exception {
        UUID medicoId = UUID.randomUUID();
        List<GetHorariosResponse> mockHorarios = List.of(
                GetHorariosResponse.builder().idAsignacionBloque(100).fecha(LocalDate.of(2026, 7, 10)).horaInicio(LocalTime.of(8, 0)).horaFin(LocalTime.of(9, 0)).build()
        );
        when(medicoService.listarHorariosDisponiblesPorMedico(medicoId)).thenReturn(mockHorarios);

        mockMvc.perform(get("/api/v1/medicos/{idMedico}/horarios", medicoId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Consulta exitosa"))
                .andExpect(jsonPath("$.codigo").value("200"))
                .andExpect(jsonPath("$.data[0].idAsignacionBloque").value(100))
                .andExpect(jsonPath("$.data[0].fecha").value("2026-07-10"))
                .andExpect(jsonPath("$.data[0].horaInicio").value("08:00:00"))
                .andExpect(jsonPath("$.data[0].horaFin").value("09:00:00"));
    }

    @Test
    @WithMockUser(roles = {"SECRETARIA ADMINISTRATIVA"})
    void listarHorarios_whenRoleSecretaria_debeRetornar200() throws Exception {
        UUID medicoId = UUID.randomUUID();
        when(medicoService.listarHorariosDisponiblesPorMedico(medicoId)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/medicos/{idMedico}/horarios", medicoId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    @WithMockUser(roles = {"MEDICO"})
    void listarHorarios_whenRoleNoAutorizado_debeRetornar403() throws Exception {
        UUID medicoId = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/medicos/{idMedico}/horarios", medicoId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void listarHorarios_whenSinAuth_debeRetornar403() throws Exception {
        UUID medicoId = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/medicos/{idMedico}/horarios", medicoId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
