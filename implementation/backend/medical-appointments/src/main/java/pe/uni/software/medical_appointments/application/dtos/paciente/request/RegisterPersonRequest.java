package pe.uni.software.medical_appointments.application.dtos.paciente.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterPersonRequest {
  @NotBlank(message = "Número de DNI obligatorio")
  private String dni;
  @NotBlank(message = "Ingreso de nombres obligatorio")
  private String nombres;
  @NotBlank(message = "Ingreso de apellidos obligatorio")
  private String apellidos;
  @NotBlank(message = "Número de teléfono obligatorio")
  @Pattern(
          regexp = "^(?:\\+?51)?9[0-9]{8}$",
          message = "El teléfono debe ser un celular peruano válido de 9 dígitos (ej: 912345678) y puede incluir el prefijo +51"
  )
  private String telefono;
}
