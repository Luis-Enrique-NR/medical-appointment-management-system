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

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "citas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cita {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  public UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_paciente", referencedColumnName = "id_persona", nullable = false)
  private Paciente paciente;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_secretaria", referencedColumnName = "id_persona")
  private Secretaria secretaria;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "asignacion_bloques_id", referencedColumnName = "id", nullable = false)
  private AsignacionBloque asignacionBloque;

  @Column(length = 10, nullable = false, unique = true)
  private String codigo;

  @Column(length = 20, nullable = false)
  private String estado;

  @Column(name = "fecha_creacion", nullable = false, updatable = false)
  private LocalDateTime fechaCreacion;

  @Column(name = "fecha_actualizacion")
  private LocalDateTime fechaActualizacion;

  @Column(name = "hora_atencion")
  private LocalTime horaAtencion;

  @Column(name = "registrada_por", length = 13, nullable = false)
  private String registradaPor;

  @Column(name = "motivo_actualizacion", length = 150)
  private String motivoActualizacion;

}