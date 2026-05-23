package pe.uni.software.medical_appointments.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import pe.uni.software.medical_appointments.util.ApiResponse;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

  private final ObjectMapper objectMapper;

  @Override
  public void commence(HttpServletRequest request,
                       HttpServletResponse response,
                       AuthenticationException authException) throws IOException, ServletException {

    // 1. Definimos el estado (401 porque es falta de credenciales)
    int status = HttpServletResponse.SC_UNAUTHORIZED;

    response.setStatus(status);
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setCharacterEncoding("UTF-8");

    // 2. Usamos tu ApiResponse con códigos HTTP como strings
    // message: Lo que ve el usuario
    // codigo: El código HTTP (401, 500, etc)
    // data: El detalle técnico o la ruta (tú eliges)
    ApiResponse<String> errorResponse = new ApiResponse<>(
            "No cuenta con una sesión válida para acceder a este recurso",
            String.valueOf(status), // "401"
            authException.getMessage() // Guardamos el error técnico en data
    );

    // 3. Escribir el JSON
    response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
  }
}
