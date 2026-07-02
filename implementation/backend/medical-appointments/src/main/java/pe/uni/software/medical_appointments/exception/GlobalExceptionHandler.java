package pe.uni.software.medical_appointments.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pe.uni.software.medical_appointments.util.ApiResponse;

import java.nio.file.AccessDeniedException;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

  // 1. Excepciones de negocio
  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ApiResponse<Object>> handleBusiness(BusinessException e) {
    ApiResponse<Object> response = new ApiResponse<>(
            e.getMessage(),
            String.valueOf(e.getHttpStatus().value()),
            null
    );
    return ResponseEntity.status(e.getHttpStatus()).body(response);
  }

  // 2. Errores de autenticación (Login incorrecto, token inválido)
  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ApiResponse<Object>> handleAuthentication(AuthenticationException e) {
    ApiResponse<Object> response = new ApiResponse<>(
            "Credenciales inválidas o sesión expirada.",
            "401", // Unauthorized
            e.getMessage() // Detalle exacto para el Dev
    );
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
  }

  // 3. Errores de Autorización
  @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
  public ResponseEntity<ApiResponse<Object>> handleAccessDenied(Exception e) {
    ApiResponse<Object> response = new ApiResponse<>(
            "No tienes los permisos necesarios para acceder a este recurso.",
            "403",
            e.getMessage()
    );
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
  }

  // 4. Errores de Validación (@RequestBody)
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException e) {
    Map<String, String> errores = new HashMap<>();
    e.getBindingResult().getFieldErrors().forEach(err ->
            errores.put(err.getField(), err.getDefaultMessage())
    );

    ApiResponse<Object> response = new ApiResponse<>(
            "Los datos enviados no cumplen con las validaciones requeridas.",
            "400",
            errores
    );
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
  }

  // 5. Errores de Validación (@PathVariable, @RequestParam)
  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(ConstraintViolationException e) {
    String errores = e.getConstraintViolations().stream()
            .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
            .collect(Collectors.joining(", "));

    ApiResponse<Object> response = new ApiResponse<>(
            "Error de validación en los parámetros de la URL.",
            "400",
            errores
    );
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
  }

  // 6. Errores de Base de Datos / Restricciones SQL
  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ApiResponse<Object>> handleDataIntegrity(DataIntegrityViolationException e) {
    String detalle = e.getRootCause() != null ? e.getRootCause().getMessage() : e.getMessage();
    ApiResponse<Object> response = new ApiResponse<>(
            "Error de persistencia: Violación de restricciones en la base de datos.",
            "409", // Conflict
            detalle
    );
    return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
  }

  // 7. Red de seguridad absoluta
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Object>> handleAll(Exception e) {
    ApiResponse<Object> response = new ApiResponse<>(
            "Ocurrió un error interno en el servidor.",
            "500",
            e.getMessage()
    );
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
  }
}
