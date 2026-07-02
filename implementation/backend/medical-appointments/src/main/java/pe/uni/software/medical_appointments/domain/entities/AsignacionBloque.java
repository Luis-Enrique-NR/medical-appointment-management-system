package pe.uni.software.medical_appointments.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "asignacion_bloques")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsignacionBloque {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "bloque_id", referencedColumnName = "id", nullable = false)
  private BloqueHorario bloqueHorario;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "propuesta_id", referencedColumnName = "id", nullable = false)
  private PropuestaDisponibilidad propuestaDisponibilidad;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "consultorio_id", referencedColumnName = "id")
  private Consultorio consultorio;

  @Column(nullable = false)
  private LocalDate fecha;

  @Column(nullable = false)
  private Boolean disponible;

}