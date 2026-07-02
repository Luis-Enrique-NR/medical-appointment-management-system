package pe.uni.software.medical_appointments.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "personas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Persona {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  public UUID id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_usuario", referencedColumnName = "id", unique = true)
  private Usuario usuario;

  @Column(length = 8, nullable = false, unique = true)
  private String dni;

  @Column(length = 30, nullable = false)
  private String nombres;

  @Column(length = 30, nullable = false)
  private String apellidos;

  @Column(length = 9)
  private String telefono;

}