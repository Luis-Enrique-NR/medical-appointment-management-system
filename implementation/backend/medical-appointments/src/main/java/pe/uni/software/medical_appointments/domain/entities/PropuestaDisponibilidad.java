package pe.uni.software.medical_appointments.domain.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "propuestas_disponibilidad")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropuestaDisponibilidad {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "medico_id", referencedColumnName = "id_persona", nullable = false)
  private Medico medico;

  @Column(length = 15, nullable = false)
  private String estado;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "secretaria_id", referencedColumnName = "id_persona")
  private Secretaria secretaria;

  @Column(name = "fecha_envio", nullable = false, updatable = false)
  private LocalDateTime fechaEnvio;

  @Column(name = "fecha_resolucion")
  private LocalDateTime fechaResolucion;

  @OneToMany(mappedBy = "propuestaDisponibilidad", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default // Necesario si usas @Builder en la clase para que inicialice la lista
  private List<AsignacionBloque> asignaciones = new ArrayList<>();

}