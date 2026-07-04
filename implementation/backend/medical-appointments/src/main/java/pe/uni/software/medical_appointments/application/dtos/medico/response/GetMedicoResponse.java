package pe.uni.software.medical_appointments.application.dtos.medico.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetMedicoResponse {
    private UUID idMedico;
    private String nombre;
    private String descripcion;
}
