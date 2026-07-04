package pe.uni.software.medical_appointments.infraestructure.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.uni.software.medical_appointments.application.dtos.consultorio.response.GetCantidadConsultorioResponse;
import pe.uni.software.medical_appointments.application.dtos.especialidad.response.GetEspecialidadResponse;
import pe.uni.software.medical_appointments.application.dtos.medico.response.GetMedicoResponse;
import pe.uni.software.medical_appointments.application.services.ConsultorioService;
import pe.uni.software.medical_appointments.application.services.EspecialidadService;
import pe.uni.software.medical_appointments.application.services.MedicoService;
import pe.uni.software.medical_appointments.util.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/v1/especialidades")
@RequiredArgsConstructor
@Tag(name = "Especialidades", description = "Endpoints para consultas sobre especialidades médicas")
public class EspecialidadController {

    private final EspecialidadService especialidadService;
    private final MedicoService medicoService;
    private final ConsultorioService consultorioService;

    @Operation(summary = "Listar todas las especialidades activas", description = "Devuelve una lista de todas las especialidades médicas activas.")
    @GetMapping
    @PreAuthorize("hasAnyRole('PACIENTE', 'SECRETARIA ADMINISTRATIVA', 'ADMINISTRADOR', 'MEDICO')")
    public ResponseEntity<ApiResponse<List<GetEspecialidadResponse>>> listarEspecialidadesActivas() {
        List<GetEspecialidadResponse> especialidades = especialidadService.listarEspecialidadesActivas();
        return ResponseEntity.ok(new ApiResponse<>("Consulta exitosa", "200", especialidades));
    }

    @Operation(summary = "Listar médicos disponibles por especialidad", description = "Devuelve los médicos que tienen horarios disponibles para una especialidad específica.")
    @GetMapping("/{idEspecialidad}/medicos")
    @PreAuthorize("hasAnyRole('PACIENTE', 'SECRETARIA ADMINISTRATIVA')")
    public ResponseEntity<ApiResponse<List<GetMedicoResponse>>> listarMedicosDisponiblesPorEspecialidad(@PathVariable Integer idEspecialidad) {
        List<GetMedicoResponse> medicos = medicoService.listarMedicosDisponiblesPorEspecialidad(idEspecialidad);
        return ResponseEntity.ok(new ApiResponse<>("Consulta exitosa", "200", medicos));
    }

    @Operation(summary = "Obtener cantidad de consultorios por especialidad", description = "Devuelve el número de consultorios habilitados para una especialidad específica.")
    @GetMapping("/{idEspecialidad}/consultorios/cantidad")
    @PreAuthorize("hasRole('SECRETARIA ADMINISTRATIVA')")
    public ResponseEntity<ApiResponse<GetCantidadConsultorioResponse>> getCantidadConsultorio(@PathVariable Integer idEspecialidad) {
        GetCantidadConsultorioResponse response = consultorioService.getCantidadConsultorio(idEspecialidad);
        return ResponseEntity.ok(new ApiResponse<>("Consulta exitosa", "200", response));
    }
}
