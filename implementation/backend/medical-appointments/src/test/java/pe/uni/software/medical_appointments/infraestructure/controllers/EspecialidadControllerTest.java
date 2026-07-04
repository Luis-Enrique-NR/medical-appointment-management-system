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
import pe.uni.software.medical_appointments.application.dtos.consultorio.response.GetCantidadConsultorioResponse;
import pe.uni.software.medical_appointments.application.dtos.especialidad.response.GetEspecialidadResponse;
import pe.uni.software.medical_appointments.application.dtos.medico.response.GetMedicoResponse;
import pe.uni.software.medical_appointments.application.services.ConsultorioService;
import pe.uni.software.medical_appointments.application.services.EspecialidadService;
import pe.uni.software.medical_appointments.application.services.MedicoService;
import pe.uni.software.medical_appointments.service.JwtService;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EspecialidadController.class)
@Import(EspecialidadControllerTest.TestSecurityConfig.class)
class EspecialidadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EspecialidadService especialidadService;

    @MockitoBean
    private MedicoService medicoService;

    @MockitoBean
    private ConsultorioService consultorioService;

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

    // --- GET /api/v1/especialidades ---

    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void listarEspecialidades_whenRolePaciente_debeRetornar200() throws Exception {
        List<GetEspecialidadResponse> mockList = List.of(
                GetEspecialidadResponse.builder().idEspecialidad(1).nombre("Cardiología").descripcion("Cardiología general").build()
        );
        when(especialidadService.listarEspecialidadesActivas()).thenReturn(mockList);

        mockMvc.perform(get("/api/v1/especialidades")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].idEspecialidad").value(1))
                .andExpect(jsonPath("$.data[0].nombre").value("Cardiología"));
    }

    @Test
    @WithMockUser(roles = {"SECRETARIA ADMINISTRATIVA"})
    void listarEspecialidades_whenRoleSecretaria_debeRetornar200() throws Exception {
        when(especialidadService.listarEspecialidadesActivas()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/especialidades")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = {"ADMINISTRADOR"})
    void listarEspecialidades_whenRoleAdmin_debeRetornar200() throws Exception {
        when(especialidadService.listarEspecialidadesActivas()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/especialidades")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = {"MEDICO"})
    void listarEspecialidades_whenRoleMedico_debeRetornar200() throws Exception {
        when(especialidadService.listarEspecialidadesActivas()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/especialidades")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void listarEspecialidades_whenSinAuth_debeRetornar403() throws Exception {
        mockMvc.perform(get("/api/v1/especialidades")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    // --- GET /api/v1/especialidades/{idEspecialidad}/medicos ---

    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void listarMedicosPorEspecialidad_whenRolePaciente_debeRetornar200() throws Exception {
        List<GetMedicoResponse> mockList = List.of(
                GetMedicoResponse.builder().idMedico(UUID.randomUUID()).nombre("Carlos Mendoza").descripcion("Cardiólogo").build()
        );
        when(medicoService.listarMedicosDisponiblesPorEspecialidad(1)).thenReturn(mockList);

        mockMvc.perform(get("/api/v1/especialidades/{idEspecialidad}/medicos", 1)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].nombre").value("Carlos Mendoza"));
    }

    @Test
    @WithMockUser(roles = {"SECRETARIA ADMINISTRATIVA"})
    void listarMedicosPorEspecialidad_whenRoleSecretaria_debeRetornar200() throws Exception {
        when(medicoService.listarMedicosDisponiblesPorEspecialidad(1)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/especialidades/{idEspecialidad}/medicos", 1)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    @WithMockUser(roles = {"MEDICO"})
    void listarMedicosPorEspecialidad_whenRoleNoAutorizado_debeRetornar403() throws Exception {
        mockMvc.perform(get("/api/v1/especialidades/{idEspecialidad}/medicos", 1)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void listarMedicosPorEspecialidad_whenSinAuth_debeRetornar403() throws Exception {
        mockMvc.perform(get("/api/v1/especialidades/{idEspecialidad}/medicos", 1)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    // --- GET /api/v1/especialidades/{idEspecialidad}/consultorios/cantidad ---

    @Test
    @WithMockUser(roles = {"SECRETARIA ADMINISTRATIVA"})
    void getCantidadConsultorio_whenRoleSecretaria_debeRetornar200() throws Exception {
        GetCantidadConsultorioResponse mockResponse = GetCantidadConsultorioResponse.builder()
                .idEspecialidad(1)
                .cantidad(5L)
                .build();
        when(consultorioService.getCantidadConsultorio(1)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/v1/especialidades/{idEspecialidad}/consultorios/cantidad", 1)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.idEspecialidad").value(1))
                .andExpect(jsonPath("$.data.cantidad").value(5));
    }

    @Test
    @WithMockUser(roles = {"PACIENTE"})
    void getCantidadConsultorio_whenRoleNoAutorizado_debeRetornar403() throws Exception {
        mockMvc.perform(get("/api/v1/especialidades/{idEspecialidad}/consultorios/cantidad", 1)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void getCantidadConsultorio_whenSinAuth_debeRetornar403() throws Exception {
        mockMvc.perform(get("/api/v1/especialidades/{idEspecialidad}/consultorios/cantidad", 1)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
