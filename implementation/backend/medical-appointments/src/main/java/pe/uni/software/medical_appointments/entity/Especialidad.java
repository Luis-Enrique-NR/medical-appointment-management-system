package pe.uni.software.medical_appointments.entity;

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

@Entity
@Table(name = "especialidades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Especialidad {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Integer id;

  @Column(length = 10, nullable = false, unique = true)
  private String codigo;

  @Column(length = 30, nullable = false)
  private String nombres;

  @Column(length = 100)
  private String descripcion;

  @Column(nullable = false)
  private Boolean activa;
}
