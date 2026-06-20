package pe.uni.software.medical_appointments.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cita")
@RequiredArgsConstructor
@Tag(name = "Citas médicas", description = "Endpoints para el registro y seguimiento de citas")
public class CitaController {

  @PostMapping("/registrar")
  @PreAuthorize("hasAnyRole('PACIENTE', 'SECRETARIA ADMINISTRATIVA')")
  public ResponseEntity<String> registrarCita() {
    return ResponseEntity.ok("Cita registrada");
  }
}
