package pe.uni.software.medical_appointments.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterUserPatientRequest {
  @NotBlank(message = "Correo obligatorio")
  @Email(message = "Formato de correo inválido")
  public String correo;
  @NotBlank(message = "Contraseña obligatoria")
  @Size(min = 8, message = "Mínimo 8 caracteres")
  public String password;
}