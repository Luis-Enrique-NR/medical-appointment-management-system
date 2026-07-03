package pe.uni.software.medical_appointments.infraestructure.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.request.PropuestaDisponibilidadRequest;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.request.UpdatePropuestaRequest;
import pe.uni.software.medical_appointments.application.dtos.disponibilidad.response.PropuestaDisponibilidadResponse;
import pe.uni.software.medical_appointments.application.services.DisponibilidadService;
import pe.uni.software.medical_appointments.util.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/v1/disponibilidad")
@RequiredArgsConstructor
@Validated
@Tag(name = "Disponibilidad y Horarios", description = "Endpoints para la gestión de horarios de disponibilidad")
public class DisponibilidadController {

  private final DisponibilidadService disponibilidadService;

  @Operation(
          summary = "Registro de propuesta de disponibilidad",
          description = "Registra una nueva propuesta de disponibilidad horaria en el sistema para un médico especialista"
  )
  @PostMapping("/propuesta")
  @PreAuthorize("hasRole('MEDICO ESPECIALISTA')")
  public ResponseEntity<ApiResponse<Void>> registerProposal(
          @Valid @RequestBody PropuestaDisponibilidadRequest request
  ) {
    disponibilidadService.registerAvailabilityIntention(request);

    return ResponseEntity.ok(new ApiResponse<>("Registro exitoso", "200", null));
  }

  @Operation(
          summary = "Listado de propuestas de disponibilidad pendientes",
          description = "Obtiene una lista de todas las propuestas de disponibilidad horaria enviadas por los médicos " +
                  "que se encuentran en estado PENDIENTE, para su revisión por la secretaría administrativa."
  )
  @GetMapping("/pendientes")
  @PreAuthorize("hasRole('SECRETARIA ADMINISTRATIVA')")
  public ResponseEntity<ApiResponse<List<PropuestaDisponibilidadResponse>>> listPendingProposals(
          @RequestParam("idEspecialidad") Integer idEspecialidad
  ) {
    List<PropuestaDisponibilidadResponse> propuestas = disponibilidadService.listPendingProposals(idEspecialidad);

    return ResponseEntity.ok(new ApiResponse<>("Consulta exitosa", "200", propuestas));
  }

  @Operation(
          summary = "Evaluación y asignación de consultorios a propuestas de disponibilidad",
          description = "Procesa de forma masiva las decisiones de aprobación o rechazo para bloques horarios específicos"
  )
  @PutMapping("/actualizar")
  @PreAuthorize("hasRole('SECRETARIA ADMINISTRATIVA')")
  public ResponseEntity<ApiResponse<Void>> updateProposals(
          @Valid @RequestBody List<UpdatePropuestaRequest> requests
  ) {
    disponibilidadService.updateProposals(requests);

    return ResponseEntity.ok(new ApiResponse<>("Actualización exitosa", "200", null));
  }
}
