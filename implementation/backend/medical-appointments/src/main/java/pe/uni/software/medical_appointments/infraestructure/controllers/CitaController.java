package pe.uni.software.medical_appointments.infraestructure.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.uni.software.medical_appointments.application.dtos.cita.request.RegisterCitaRequest;
import pe.uni.software.medical_appointments.application.dtos.cita.request.UpdateCitaRequest;
import pe.uni.software.medical_appointments.application.services.CitaService;
import pe.uni.software.medical_appointments.util.ApiResponse;

@RestController
@RequestMapping("/api/v1/cita")
@RequiredArgsConstructor
@Tag(name = "Citas médicas", description = "Endpoints para el registro y seguimiento de citas")
public class CitaController {

  private final CitaService citaService;

  @Operation(
          summary = "Registrar una nueva cita médica",
          description = "Reserva un bloque horario disponible para un paciente (autodetectado si es Paciente o especificado en el cuerpo de la petición si es Secretaria Administrativa)."
  )
  @PostMapping
  @PreAuthorize("hasAnyRole('PACIENTE', 'SECRETARIA ADMINISTRATIVA')")
  public ResponseEntity<ApiResponse<Void>> registrarCita(
          @Valid @RequestBody RegisterCitaRequest request
  ) {
    citaService.registerAppointment(request);
    return ResponseEntity.ok(new ApiResponse<>("Registro exitoso", "200", null));
  }

  @Operation(
          summary = "Actualizar estado o reprogramar cita médica",
          description = "Permite cancelar una cita o reprogramarla hacia un nuevo bloque horario (liberando automáticamente el bloque anterior)"
  )
  @PutMapping
  @PreAuthorize("hasAnyRole('PACIENTE', 'SECRETARIA ADMINISTRATIVA')")
  public ResponseEntity<ApiResponse<Void>> actualizarCita(
          @Valid @RequestBody UpdateCitaRequest request
  ) {
    citaService.updateAppointment(request);
    return ResponseEntity.ok(new ApiResponse<>("Actualización exitosa", "200", null));
  }
}
