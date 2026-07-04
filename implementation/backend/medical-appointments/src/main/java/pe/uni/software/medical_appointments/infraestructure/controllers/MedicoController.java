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
import pe.uni.software.medical_appointments.application.dtos.medico.response.GetHorariosResponse;
import pe.uni.software.medical_appointments.application.services.MedicoService;
import pe.uni.software.medical_appointments.util.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/medicos")
@RequiredArgsConstructor
@Tag(name = "Médicos", description = "Endpoints para consultas sobre médicos")
public class MedicoController {

    private final MedicoService medicoService;

    @Operation(summary = "Listar horarios disponibles de un médico", description = "Devuelve los horarios disponibles de un médico específico.")
    @GetMapping("/{idMedico}/horarios")
    @PreAuthorize("hasAnyRole('PACIENTE', 'SECRETARIA ADMINISTRATIVA')")
    public ResponseEntity<ApiResponse<List<GetHorariosResponse>>> listarHorariosDisponiblesPorMedico(@PathVariable UUID idMedico) {
        List<GetHorariosResponse> horarios = medicoService.listarHorariosDisponiblesPorMedico(idMedico);
        return ResponseEntity.ok(new ApiResponse<>("Consulta exitosa", "200", horarios));
    }
}
