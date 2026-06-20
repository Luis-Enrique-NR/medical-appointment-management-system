package pe.uni.software.medical_appointments.entity;

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
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario implements UserDetails {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  public UUID id;

  @Column(name = "password_hash", length = 255, nullable = false)
  private String passwordHash;

  @Column(length = 35, nullable = false, unique = true)
  private String correo;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_rol", referencedColumnName = "id", nullable = false)
  private Rol rol;

  @Column(nullable = false)
  private Boolean habilitado;

  @Column(name = "intentos_fallidos")
  private Integer intentosFallidos;

  @Column(name = "ultimo_acceso")
  private LocalDateTime ultimoAcceso;

  @Column(name = "fecha_creacion", updatable = false)
  private LocalDateTime fechaCreacion;

  @Column(name = "fecha_actualizacion")
  private LocalDateTime fechaActualizacion;

  // MÉTODOS OBLIGATORIOS DE USERDETAILS

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + this.getRol().getNombre()));
  }

  @Override
  public @Nullable String getPassword() {
    return this.getPasswordHash();
  }

  @Override
  public String getUsername() {
    return this.getCorreo();
  }

  @Override
  public boolean isAccountNonExpired() {
    return UserDetails.super.isAccountNonExpired();
  }

  @Override
  public boolean isAccountNonLocked() {
    return UserDetails.super.isAccountNonLocked();
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return UserDetails.super.isCredentialsNonExpired();
  }

  @Override
  public boolean isEnabled() {
    return this.getHabilitado();
  }
}
