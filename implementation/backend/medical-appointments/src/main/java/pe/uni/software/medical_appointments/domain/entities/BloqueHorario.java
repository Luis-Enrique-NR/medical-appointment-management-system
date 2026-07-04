package pe.uni.software.medical_appointments.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Entity
@Table(name = "bloque_horario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloqueHorario {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Integer id;

  @Column(name = "hora_inicio", nullable = false)
  private LocalTime horaInicio;

  @Column(name = "hora_fin", nullable = false)
  private LocalTime horaFin;

}