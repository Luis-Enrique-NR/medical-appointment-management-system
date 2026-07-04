package pe.uni.software.medical_appointments.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medicos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medico {

  @Id
  @Column(name = "id_persona")
  private UUID idPersona;

  @OneToOne(fetch = FetchType.LAZY)
  @MapsId
  @JoinColumn(name = "id_persona")
  private Persona persona;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_especialidad", referencedColumnName = "id", nullable = false)
  private Especialidad especialidad;

  @Column(length = 10, nullable = false, unique = true)
  private String codigo;

  @Column(name = "colegiatura_cmp", length = 6, nullable = false, unique = true)
  private String colegiaturaCmp;

  @Column(length = 255)
  private String descripcion;

  @Column(name = "fecha_registro", nullable = false, updatable = false)
  private LocalDateTime fechaRegistro;

  @Column(name = "fecha_actualizacion")
  private LocalDateTime fechaActualizacion;

}