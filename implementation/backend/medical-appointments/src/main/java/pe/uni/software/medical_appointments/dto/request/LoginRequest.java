package pe.uni.software.medical_appointments.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
  @NotBlank(message = "Correo obligatorio")
  @Email(message = "Formato de correo inválido")
  private String correo;
  @NotBlank(message = "Contraseña obligatoria")
  private String password;
}
