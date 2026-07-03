package pe.uni.software.medical_appointments.application.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.uni.software.medical_appointments.application.dtos.paciente.request.RegisterPersonRequest;
import pe.uni.software.medical_appointments.application.dtos.paciente.response.GetPatientResponse;
import pe.uni.software.medical_appointments.application.mappers.PacienteMapper;
import pe.uni.software.medical_appointments.domain.entities.Paciente;
import pe.uni.software.medical_appointments.domain.entities.Persona;
import pe.uni.software.medical_appointments.exception.NotFoundException;
import pe.uni.software.medical_appointments.infraestructure.repositories.PacienteRepository;
import pe.uni.software.medical_appointments.util.CodeGenerator;

@Service
@RequiredArgsConstructor
public class PacienteService {

  private final PacienteRepository pacienteRepository;

  private final PersonaService personaService;

  @Transactional
  public GetPatientResponse registerPatient(RegisterPersonRequest request) {
    Persona persona = personaService.registerPerson(request);

    String codigo;
    int intentos = 0;
    do {
      if (intentos++ > 10) {
        throw new IllegalStateException("No se pudo generar un código único tras 10 intentos.");
      }
      codigo = CodeGenerator.generarCodigo("P");
    } while (pacienteRepository.existsByCodigo(codigo));

    Paciente nuevoPaciente = pacienteRepository.save(PacienteMapper.buildPaciente(persona, codigo));

    return PacienteMapper.mapPatient(persona, nuevoPaciente);
  }

  public GetPatientResponse getByDni(String dni) {
    Persona persona = personaService.getByDni(dni);

    Paciente paciente = pacienteRepository.findById(persona.getId())
            .orElseThrow(() -> new NotFoundException("No se encontró paciente con el dni: " + dni));

    return PacienteMapper.mapPatient(persona, paciente);
  }
}
