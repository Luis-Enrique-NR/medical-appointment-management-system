package pe.uni.software.medical_appointments.application.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.uni.software.medical_appointments.application.dtos.medico.response.GetHorariosResponse;
import pe.uni.software.medical_appointments.application.dtos.medico.response.GetMedicoResponse;
import pe.uni.software.medical_appointments.application.mappers.HorarioMapper;
import pe.uni.software.medical_appointments.application.mappers.MedicoMapper;
import pe.uni.software.medical_appointments.infraestructure.repositories.AsignacionBloqueRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicoService {

    private final AsignacionBloqueRepository asignacionBloqueRepository;

    public List<GetMedicoResponse> listarMedicosDisponiblesPorEspecialidad(Integer idEspecialidad) {
        return asignacionBloqueRepository.findAvailableMedicosByEspecialidad(idEspecialidad).stream()
                .map(MedicoMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<GetHorariosResponse> listarHorariosDisponiblesPorMedico(UUID idMedico) {
        return asignacionBloqueRepository.findAvailableHorariosByMedico(idMedico).stream()
                .map(HorarioMapper::toDto)
                .collect(Collectors.toList());
    }
}
