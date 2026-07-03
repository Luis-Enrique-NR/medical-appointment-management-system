package pe.uni.software.medical_appointments.domain.enums;

public enum RolUsuario {
  PACIENTE,
  SECRETARIA_ADMINISTRATIVA,
  MEDICO_ESPECIALISTA,
  ADMINISTRADOR;

  @Override
  public String toString() {
    return this.name().replace("_", " ");
  }
}