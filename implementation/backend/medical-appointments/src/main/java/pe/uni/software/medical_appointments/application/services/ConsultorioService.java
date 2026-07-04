package pe.uni.software.medical_appointments.application.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.uni.software.medical_appointments.application.dtos.consultorio.response.GetCantidadConsultorioResponse;
import pe.uni.software.medical_appointments.infraestructure.repositories.ConsultorioRepository;

@Service
@RequiredArgsConstructor
public class ConsultorioService {

    private final ConsultorioRepository consultorioRepository;

    public GetCantidadConsultorioResponse getCantidadConsultorio(Integer idEspecialidad) {
        Long cantidad = consultorioRepository.countByEspecialidadId(idEspecialidad);
        return GetCantidadConsultorioResponse.builder()
                .idEspecialidad(idEspecialidad)
                .cantidad(cantidad)
                .build();
    }
}
