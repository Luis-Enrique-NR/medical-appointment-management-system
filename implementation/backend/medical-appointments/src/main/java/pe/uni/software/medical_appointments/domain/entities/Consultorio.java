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

@Entity
@Table(name = "consultorios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultorio {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_especialidad", referencedColumnName = "id", nullable = false)
  private Especialidad especialidad;

  @Column(length = 10, nullable = false, unique = true)
  private String codigo;

  @Column(nullable = false)
  private Integer numero;

  @Column(nullable = false)
  private Boolean habilitado;

}