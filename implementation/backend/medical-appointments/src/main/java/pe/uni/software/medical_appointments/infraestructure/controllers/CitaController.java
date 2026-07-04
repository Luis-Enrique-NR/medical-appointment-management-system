package pe.uni.software.medical_appointments.infraestructure.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.uni.software.medical_appointments.application.dtos.cita.request.RegisterCitaRequest;
import pe.uni.software.medical_appointments.application.dtos.cita.request.UpdateCitaRequest;
import pe.uni.software.medical_appointments.application.dtos.cita.response.GetCitaResponse;
import pe.uni.software.medical_appointments.application.services.CitaService;
import pe.uni.software.medical_appointments.domain.entities.Usuario;
import pe.uni.software.medical_appointments.util.ApiResponse;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/citas")
@RequiredArgsConstructor
@Tag(name = "Citas", description = "Endpoints para el registro y seguimiento de citas")
public class CitaController {

  private final CitaService citaService;

  // ==========================================
  // 1. ENDPOINTS DE LA SECRETARIA
  // ==========================================

  @Operation(summary = "Obtener agenda general para secretaría", description = "Devuelve una vista paginada y filtrable de todas las citas del sistema.")
  @GetMapping("/secretaria")
  @PreAuthorize("hasRole('SECRETARIA ADMINISTRATIVA')")
  public ResponseEntity<ApiResponse<Page<GetCitaResponse>>> getSecretariaAgenda(
          @RequestParam(defaultValue = "false") boolean soloHoy,
          @RequestParam(required = false) String search,
          @RequestParam(defaultValue = "0") int page
  ) {
    Page<GetCitaResponse> citas = citaService.obtenerAgendaGeneralSecretaria(soloHoy, search, page);
    return ResponseEntity.ok(new ApiResponse<>("Consulta exitosa", "200", citas));
  }

  // ==========================================
  // 2. ENDPOINTS DEL PACIENTE (Contexto 'me')
  // ==========================================

  @Operation(summary = "Obtener citas próximas del paciente", description = "Devuelve las futuras citas agendadas del paciente autenticado.")
  @GetMapping("/me/proximas")
  @PreAuthorize("hasRole('PACIENTE')")
  public ResponseEntity<ApiResponse<List<GetCitaResponse>>> getMisCitasProximas(Authentication authentication) {
    Usuario usuario = (Usuario) authentication.getPrincipal();
    List<GetCitaResponse> citas = citaService.listarProximasCitasPaciente(usuario.getPersona().getId());
    return ResponseEntity.ok(new ApiResponse<>("Consulta exitosa", "200", citas));
  }

  @Operation(summary = "Obtener historial de citas del paciente", description = "Devuelve el historial paginado de citas pasadas del paciente autenticado.")
  @GetMapping("/me/historial")
  @PreAuthorize("hasRole('PACIENTE')")
  public ResponseEntity<ApiResponse<Page<GetCitaResponse>>> getMisCitasHistorial(
          Authentication authentication,
          @RequestParam(defaultValue = "0") int page
  ) {
    Usuario usuario = (Usuario) authentication.getPrincipal();
    Page<GetCitaResponse> historial = citaService.obtenerHistorialCitasPaciente(usuario.getPersona().getId(), page);
    return ResponseEntity.ok(new ApiResponse<>("Consulta exitosa", "200", historial));
  }

  // ==========================================
  // 3. ENDPOINTS DEL MÉDICO (Contexto 'agenda')
  // ==========================================

  @Operation(summary = "Obtener la agenda del día del médico", description = "Devuelve las citas programadas para el médico autenticado en una fecha específica.")
  @GetMapping("/agenda")
  @PreAuthorize("hasRole('MEDICO ESPECIALISTA')")
  public ResponseEntity<ApiResponse<List<GetCitaResponse>>> getMiAgenda(
          @RequestParam @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate fecha
  ) {
    List<GetCitaResponse> agenda = citaService.getMedicoAgendaByFecha(fecha);
    return ResponseEntity.ok(new ApiResponse<>("Consulta exitosa", "200", agenda));
  }

  // ==========================================
  // POST Y PUT
  // ==========================================

  @Operation(
          summary = "Registrar una nueva cita médica",
          description = "Reserva un bloque horario para un paciente."
  )
  @PostMapping
  @PreAuthorize("hasAnyRole('PACIENTE', 'SECRETARIA ADMINISTRATIVA')")
  public ResponseEntity<ApiResponse<Void>> registrarCita(
          @Valid @RequestBody RegisterCitaRequest request
  ) {
    citaService.registerAppointment(request);
    return ResponseEntity.ok(new ApiResponse<>("Registro exitoso", "201", null));
  }

  @Operation(
          summary = "Actualizar o reprogramar cita médica",
          description = "Permite cancelar o reprogramar una cita existente."
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
