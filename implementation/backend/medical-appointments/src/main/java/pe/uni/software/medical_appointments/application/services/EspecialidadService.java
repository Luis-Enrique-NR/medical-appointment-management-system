package pe.uni.software.medical_appointments.application.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.uni.software.medical_appointments.application.dtos.especialidad.response.GetEspecialidadResponse;
import pe.uni.software.medical_appointments.application.mappers.EspecialidadMapper;
import pe.uni.software.medical_appointments.infraestructure.repositories.EspecialidadRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EspecialidadService {

    private final EspecialidadRepository especialidadRepository;

    public List<GetEspecialidadResponse> listarEspecialidadesActivas() {
        return especialidadRepository.findAllByActivaTrue().stream()
                .map(EspecialidadMapper::toDto)
                .collect(Collectors.toList());
    }
}
