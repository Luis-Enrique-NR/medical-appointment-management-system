package pe.uni.software.medical_appointments.infraestructure.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.uni.software.medical_appointments.application.dtos.paciente.request.RegisterPersonRequest;
import pe.uni.software.medical_appointments.application.dtos.paciente.response.GetPatientResponse;
import pe.uni.software.medical_appointments.application.dtos.persona.response.GetPersonResponse;
import pe.uni.software.medical_appointments.application.services.PacienteService;
import pe.uni.software.medical_appointments.util.ApiResponse;

@RestController
@RequestMapping("/api/v1/paciente")
@RequiredArgsConstructor
@Validated
@Tag(name = "Paciente", description = "Endpoints para el registro y gestión de pacientes")
public class PacienteController {

  private final PacienteService pacienteService;

  @Operation(
          summary = "Registro de datos de paciente",
          description = "Registra un nuevo paciente en el sistema, vinculando su información personal y asignándole un código único"
  )
  @PostMapping
  @PreAuthorize("hasAnyRole('PACIENTE', 'SECRETARIA ADMINISTRATIVA')")
  public ResponseEntity<ApiResponse<Void>> registerPatient(
          @Valid @RequestBody RegisterPersonRequest request
  ) {
    pacienteService.registerPatient(request);

    return ResponseEntity.ok(new ApiResponse<>("Registro exitoso", "200", null));
  }

  @Operation(
          summary = "Registro de datos de paciente",
          description = "Registra un nuevo paciente en el sistema, vinculando su información personal y asignándole un código único"
  )
  @GetMapping("/dni/{dni}")
  @PreAuthorize("hasRole('SECRETARIA ADMINISTRATIVA')")
  public ResponseEntity<ApiResponse<GetPatientResponse>> getByDni(
          @PathVariable
          @NotBlank(message = "El DNI no puede estar vacío")
          @Pattern(regexp = "^\\d{8}$", message = "El DNI debe tener exactamente 8 dígitos numéricos")
          String dni
  ) {
    GetPatientResponse response = pacienteService.getByDni(dni);

    return ResponseEntity.ok(new ApiResponse<>("Consulta exitosa", "200", response));
  }
}
