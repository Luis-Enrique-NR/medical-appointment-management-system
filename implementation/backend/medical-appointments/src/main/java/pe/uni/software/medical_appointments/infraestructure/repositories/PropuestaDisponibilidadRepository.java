package pe.uni.software.medical_appointments.infraestructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.uni.software.medical_appointments.domain.entities.PropuestaDisponibilidad;

@Repository
public interface PropuestaDisponibilidadRepository extends JpaRepository<PropuestaDisponibilidad, Integer> {
}
