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

@Entity
@Table(name = "notificaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificacion {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "persona_id", referencedColumnName = "id", nullable = false)
  private Persona persona;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "cita_id", referencedColumnName = "id")
  private Cita cita;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "propuesta_id", referencedColumnName = "id")
  private PropuestaDisponibilidad propuestaDisponibilidad;

  @Column(name = "tipo_evento", length = 18, nullable = false)
  private String tipoEvento;

  @Column(length = 100, nullable = false)
  private String asunto;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String contenido;

  @Column(name = "estado_envio", length = 9, nullable = false)
  private String estadoEnvio;

  @Column(name = "fecha_generacion", nullable = false, updatable = false)
  private LocalDateTime fechaGeneracion;

  @Column(name = "fecha_envio")
  private LocalDateTime fechaEnvio;

}