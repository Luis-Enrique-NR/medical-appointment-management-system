package pe.uni.software.medical_appointments.application.dtos.auth.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NewUserResponse {
  private String correo;
  private Boolean habilitado;
  private String token;
}