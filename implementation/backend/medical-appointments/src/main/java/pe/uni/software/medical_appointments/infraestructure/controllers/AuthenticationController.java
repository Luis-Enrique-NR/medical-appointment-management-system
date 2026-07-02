package pe.uni.software.medical_appointments.infraestructure.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.uni.software.medical_appointments.application.dtos.auth.request.LoginRequest;
import pe.uni.software.medical_appointments.application.dtos.auth.request.RegisterEmployeeRequest;
import pe.uni.software.medical_appointments.application.dtos.auth.request.RegisterUserPatientRequest;
import pe.uni.software.medical_appointments.application.dtos.auth.request.UpdatePasswordRequest;
import pe.uni.software.medical_appointments.application.dtos.auth.response.AuthResponse;
import pe.uni.software.medical_appointments.application.dtos.auth.response.NewUserResponse;
import pe.uni.software.medical_appointments.application.services.AuthenticationService;
import pe.uni.software.medical_appointments.util.ApiResponse;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints para el registro, login y cambio de contraseña")
public class AuthenticationController {
  private final AuthenticationService authenticationService;

  @Operation(summary = "Iniciar sesión", description = "Validar credenciales y retorna un JWT")
  @PostMapping("/pub/login")
  public ResponseEntity<ApiResponse<AuthResponse>> login(
          @Valid @RequestBody LoginRequest request
  ) {
    AuthResponse response = authenticationService.login(request);

    return ResponseEntity.ok(new ApiResponse<>("Login exitoso", "200", response));
  }

  @Operation(summary = "Registro de usuario (paciente)",
          description = "Crear una cuenta activa de cliente con un JWT válido")
  @PostMapping("/pub/register")
  public ResponseEntity<ApiResponse<NewUserResponse>> registerUserPatient(
          @Valid @RequestBody RegisterUserPatientRequest request
  ) {
    NewUserResponse response = authenticationService.registerUserPatient(request);

    return ResponseEntity.ok(new ApiResponse<>("Registro exitoso", "200", response));
  }

  @Operation(summary = "Cambio de contraseña", description = "Actualizar las credenciales del usuario")
  @PatchMapping("/password")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<AuthResponse>> updatePassword (
          @Valid @RequestBody UpdatePasswordRequest request
  ) {
    authenticationService.updatePassword(request);
    return ResponseEntity.ok(new ApiResponse<>("Contraseña actualizada. Su sesión actual expirará pronto.", "200", null));
  }

  @Operation(summary = "Registro de usuario (empleado)",
          description = "Crear una cuenta activa de cliente con un JWT válido")
  @PostMapping("/register/employee")
  @PreAuthorize("hasRole('ADMINISTRADOR')")
  public ResponseEntity<ApiResponse<Void>> registerEmployee(
          @Valid @RequestBody RegisterEmployeeRequest request
  ) {
    authenticationService.registerEmployee(request);

    return ResponseEntity.ok(new ApiResponse<>("Registro exitoso", "200", null));
  }
}
